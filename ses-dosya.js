/* Önceden üretilmiş ses okuma (Edge TTS / Azure AhmetNeural).
   Web Speech'ten bağımsız çalışır; ses dosyası yoksa hiçbir şey göstermez.
   Kullanım: <script src="../ses-dosya.js" data-ses="ali-sir-nevai"></script> */
(function () {
  const betik = document.currentScript;
  const ad = betik && betik.dataset.ses;
  if (!ad) return;
  const kok = (betik.dataset.sesKok || '../ses/') + ad;
  const zamanlar = document.querySelectorAll('#olaylar .zaman .z-item');
  const zamanKutusu = document.querySelector('#olaylar .zaman');
  if (!zamanKutusu || !zamanlar.length) return;

  const duzle = s => (s || '').toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]+/gu, '');
  const ss = sn => {
    const t = Math.max(0, Math.floor(sn || 0));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  };
  const el = (etiket, sinif, metin) => {
    const d = document.createElement(etiket);
    if (sinif) d.className = sinif;
    if (metin !== undefined) d.textContent = metin;
    return d;
  };

  fetch(kok + '.zaman.json')
    .then(r => (r.ok ? r.json() : Promise.reject(new Error('zaman yok'))))
    .then(z => kur(z))
    .catch(() => {});

  function kur(z) {
    const kelimeler = z.kelimeler || [];
    const bloklar = z.bloklar || [];
    if (!kelimeler.length || !bloklar.length) return;

    /* ---- Kelimeleri DOM'a bağla ---- */
    const hedef = new Array(kelimeler.length).fill(null);
    let eslesen = 0, toplam = 0, kacirilan = [];

    function bagla() {
      eslesen = 0; toplam = 0; kacirilan = [];
      hedef.fill(null);
      const ogeler = document.querySelectorAll('#olaylar .zaman .z-item');
      ogeler.forEach((item, i) => {
      const bas = bloklar[i] ? bloklar[i].bas : 0;
      const son = i + 1 < bloklar.length ? bloklar[i + 1].bas : Infinity;
      const h4 = item.querySelector('.z-bas h4');
      const p = item.querySelector('.z-icerik > p');
      const domWords = [...spanla(h4), ...spanla(p)];
      if (!domWords.length) return;
      const aw = [];
      for (let k = 0; k < kelimeler.length; k++) {
        const w = kelimeler[k];
        if (w.b < bas - 0.02) continue;
        if (w.b >= son) break;
        aw.push(k);
      }
      /* Edge kelimeyi tirnak/tireden bolerse tek DOM kelimesi birkac ses
         kelimesine denk gelir; ses parcalarini birlestirip DOM ile karsilastir. */
      let ai = 0, birikme = '';
      domWords.forEach(dom => {
        const dk = duzle(dom.textContent);
        if (!dk) return;
        toplam++;
        const ilk = ai;
        let guard = 0;
        while (birikme.length < dk.length && ai < aw.length && guard++ < 10) birikme += duzle(kelimeler[aw[ai++]].t);
        if (birikme.startsWith(dk)) {
          for (let q = ilk; q < ai; q++) hedef[aw[q]] = dom;
          eslesen++;
          birikme = birikme.slice(dk.length);
        } else {
          birikme = '';
          if (kacirilan.length < 12) kacirilan.push(dom.textContent);
        }
      });
      });
    }
    bagla();
    /* Başka bir betik olaylar bölümünü yeniden kurarsa (DOM değişirse)
       kelime bağlarını tazele; aksi halde vurgu boş kalır. */
    let yenidenBagla = null;
    new MutationObserver(() => {
      if (document.querySelector('#olaylar .saman')) return;
      clearTimeout(yenidenBagla);
      yenidenBagla = setTimeout(() => {
        if (!document.querySelectorAll('#olaylar .zaman .sds-k').length) bagla();
      }, 60);
    }).observe(zamanKutusu.parentNode, { childList: true, subtree: true });

    /* Metni kelimelere bölüp <span class="sds-k"> sarar.
       Kutu içinde çocuk eleman varsa (örn. <span class="adis">| doğum yeri</span>)
       o çocuklar korunur, yalnızca metin düğümleri sarmalanır. */
    function spanla(kutu) {
      if (!kutu) return [];
      const liste = [];
      const dugumler = [...kutu.childNodes];
      /* Her metin düğümünü kelimelere böl, span'a sar. */
      dugumler.forEach(d => {
        if (d.nodeType !== 3) return;                 // elemanlara dokunma
        const parcalar = (d.textContent || '').split(/(\s+)/);
        const parca = document.createDocumentFragment();
        parcalar.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { parca.appendChild(document.createTextNode(p)); return; }
          const s = el('span', 'sds-k', p);
          parca.appendChild(s);
          liste.push(s);
        });
        d.parentNode.replaceChild(parca, d);
      });
      return liste;
    }

    /* ---- Oynatıcı ---- */
    const ses = el('audio');
    ses.preload = 'metadata';
    ses.src = kok + '.mp3';
    const bar = el('div', 'sds-bar');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Sesli okuma');

    const dugme = el('button', 'sds-dugme');
    dugme.type = 'button';
    dugme.setAttribute('aria-label', 'Sesi başlat');
    dugme.textContent = '▶';

    const adYazi = el('span', 'sds-ad', 'Tüm zaman çizelgesi');
    const sar = el('input', 'sds-sar');
    sar.type = 'range';
    sar.min = '0';
    sar.step = '0.05';
    sar.max = String(z.toplamSure || 0);
    sar.value = '0';
    sar.setAttribute('aria-label', 'Ses konumu');

    const sureYazi = el('span', 'sds-sure', '0:00 / ' + ss(z.toplamSure));

    /* Hız seçimi: açılır liste (play düğmesinin solunda durur) */
    const HIZ_DEGERLERI = [0.75, 1, 1.25, 1.5, 2];
    const hizSecenek = el('button', 'sds-hiz-btn', '1×');
    hizSecenek.type = 'button';
    hizSecenek.setAttribute('aria-haspopup', 'true');
    hizSecenek.setAttribute('aria-expanded', 'false');
    hizSecenek.title = 'Ses hızı';
    const hizListe = el('div', 'sds-hiz-liste');
    hizListe.hidden = true;
    hizListe.setAttribute('role', 'group');
    hizListe.setAttribute('aria-label', 'Ses hızı');
    const hizKutu = el('div', 'sds-hiz');
    hizKutu.append(hizSecenek, hizListe);
    HIZ_DEGERLERI.forEach(h => {
      const b = el('button', 'sds-hiz-btn' + (h === 1 ? ' aktif' : ''), h + '×');
      b.type = 'button';
      b.addEventListener('click', ev => {
        ev.stopPropagation();
        ses.playbackRate = h;
        try { ses.preservesPitch = true; } catch (e) {}
        hizSecenek.textContent = h + '×';
        hizListe.querySelectorAll('.sds-hiz-btn').forEach(x => x.classList.toggle('aktif', x === b));
        hizListe.hidden = true;
        hizSecenek.setAttribute('aria-expanded', 'false');
        try { localStorage.setItem('biyografi-ses-hiz', String(h)); } catch (err) {}
      });
      hizListe.appendChild(b);
    });
    hizSecenek.addEventListener('click', ev => {
      ev.stopPropagation();
      hizListe.hidden = !hizListe.hidden;
      hizSecenek.setAttribute('aria-expanded', String(!hizListe.hidden));
    });
    document.addEventListener('click', () => {
      if (!hizListe.hidden) { hizListe.hidden = true; hizSecenek.setAttribute('aria-expanded', 'false'); }
    });
    /* Kayıtlı hız tercihini hatırla. */
    try {
      const kayitli = Number(localStorage.getItem('biyografi-ses-hiz'));
      if (HIZ_DEGERLERI.includes(kayitli)) {
        ses.playbackRate = kayitli;
        hizSecenek.textContent = kayitli + '×';
        const isabet = hizListe.querySelector('.sds-hiz-btn.aktif');
        if (isabet) isabet.classList.remove('aktif');
        const dogru = [...hizListe.children].find(x => x.textContent === kayitli + '×');
        if (dogru) dogru.classList.add('aktif');
      }
    } catch (e) {}

    /* Sıra: ad · kaydırma · süre · hız · play (play en sağda) */
    bar.append(adYazi, sar, sureYazi, hizKutu, dugme);
    // Çubuk lejantın ÜSTÜNE, başlığın altına gelsin: lejant çizelgeyi süzsün diye yapışmasın.
    const lejantEl = document.getElementById('lejant');
    if (lejantEl && lejantEl.parentNode === zamanKutusu.parentNode) {
      zamanKutusu.parentNode.insertBefore(bar, lejantEl);
    } else {
      zamanKutusu.parentNode.insertBefore(bar, zamanKutusu);
    }
    bar.appendChild(ses);

    /* ---- Her bloğa dinle düğmesi ---- */
    const blokDugmeleri = [];
    zamanlar.forEach((item, i) => {
      const bas = bloklar[i] ? bloklar[i].bas : 0;
      const baslikEl = item.querySelector('.z-bas h4');
      const b = el('button', 'sds-blok-oku', '🔊');
      b.type = 'button';
      b.setAttribute('aria-label', (baslikEl ? baslikEl.textContent : 'Bölüm') + ' bölümünü dinle');
      b.title = b.getAttribute('aria-label');
      b.addEventListener('click', ev => {
        ev.stopPropagation();
        git(bas, true);
      });
      const hedefKap = item.querySelector('.z-kart') || item;
      hedefKap.appendChild(b);
      blokDugmeleri.push(b);
    });

    /* ---- Oynatma ---- */
    let aktifKelime = -1, aktifBlok = -1, raf = null, sonPozisyon = -1;

    /* Ekran uykuya girmesin: yazı okunurken ekran açık kalsın.
       Sunum modundaki snKilitAl ile aynı davranış. */
    let sdsKilit = null;
    async function sdsKilitAl() {
      if (!('wakeLock' in navigator) || document.hidden) return;
      if (sdsKilit && !sdsKilit.released) return;
      try { sdsKilit = await navigator.wakeLock.request('screen'); } catch (err) {}
    }
    function sdsKilitBirak() {
      if (!sdsKilit) return;
      try { sdsKilit.release(); } catch (err) {}
      sdsKilit = null;
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !ses.paused) sdsKilitAl();
    });

    function oynat() {
      const p = ses.play();
      if (p && p.catch) p.catch(() => {});
      dugme.textContent = '⏸';
      dugme.setAttribute('aria-label', 'Sesi duraklat');
      bar.classList.add('sds-oynuyor');
      sdsKilitAl();
      dongu();
    }
    function duraklat() {
      ses.pause();
      dugme.textContent = '▶';
      dugme.setAttribute('aria-label', 'Sesi başlat');
      bar.classList.remove('sds-oynuyor');
      sdsKilitBirak();
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
    function git(sn, calistir) {
      ses.currentTime = Math.max(0, Math.min(sn, (z.toplamSure || 0) - 0.05));
      vurgula(true);
      if (calistir && ses.paused) oynat();
    }

    dugme.addEventListener('click', () => (ses.paused ? oynat() : duraklat()));
    sar.addEventListener('input', () => {
      const sn = Number(sar.value);
      ses.currentTime = sn;
      vurgula(true);
    });
    ses.addEventListener('ended', () => {
      duraklat();
      adYazi.textContent = 'Tüm zaman çizelgesi';
      vurgula(true);
    });
    ses.addEventListener('error', () => {
      bar.classList.add('sds-hata');
      adYazi.textContent = 'Ses dosyası açılamadı';
    });

    /* Web Speech açılırsa kendi sesini durdur */
    document.addEventListener('click', e => {
      if (e.target.closest && e.target.closest('.sn-ses-btn') && !ses.paused) duraklat();
    }, true);
    window.addEventListener('pagehide', duraklat);

    /* Kullanıcı sayfayı elle kaydırırsa takibi kısa süre bırak, sonra geri gel. */
    let takipBekle = 0;
    ['wheel', 'touchmove', 'keydown'].forEach(tur => {
      window.addEventListener(tur, () => { takipBekle = performance.now() + 4000; }, { passive: true });
    });

    /* Vurgulanan kelime ekranda görünmüyorsa sayfayı yumuşakça kaydır.
       Alt sınır sabit ses çubuğunun üstünde kalır. */
    function takipEt(el) {
      if (!el || !el.isConnected) return;
      if (performance.now() < takipBekle) return;   // kullanıcı elle kaydırıyorsa dokunma
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      const barYuk = bar.getBoundingClientRect().height || 0;
      const ustPay = 110;   // başlık + yapışkan üst öğeler
      const altPay = barYuk + 24;
      if (r.top >= ustPay && r.bottom <= window.innerHeight - altPay) return;
      const hedefY = window.scrollY + r.top - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, hedefY), behavior: 'smooth' });
    }

    function vurgula(zorla) {
      const t = ses.currentTime;
      if (!zorla) {
        if (Math.abs(t - sonPozisyon) >= 0.03) { sonPozisyon = t; }
        else {
          // Kelime degisimi tam bu aralikta olursa (30 ms'lik atlamada birakilmasin)
          // guncellemeyi erteleme; simdi bir sonraki kelimenin baslangicina bak.
          const s = kelimeler[aktifKelime + 1];
          if (!s || s.b > t + 0.04) return;
          sonPozisyon = t;
        }
      } else sonPozisyon = t;
      if (document.activeElement !== sar) sar.value = String(t);
      sureYazi.textContent = ss(t) + ' / ' + ss(z.toplamSure);

      /* aktif kelime: bir sonraki kelime baslayana kadar onceki vurgu kalir
         (kelimeler arasi sessizlikte titreme olmasin) */
      let lo = 0, hi = kelimeler.length - 1, bul = -1;
      while (lo <= hi) {
        const orta = (lo + hi) >> 1;
        if (kelimeler[orta].b <= t) { bul = orta; lo = orta + 1; } else hi = orta - 1;
      }
      if (bul !== aktifKelime) {
        const yeni = bul >= 0 ? hedef[bul] : null;
        if (yeni) {
          const eski = aktifKelime >= 0 ? hedef[aktifKelime] : null;
          if (eski && eski !== yeni) eski.classList.remove('sds-k-aktif');
          yeni.classList.add('sds-k-aktif');
          takipEt(yeni);
        }
        aktifKelime = bul;
      }

      /* aktif blok */
      let bi = 0;
      for (let i = 0; i < bloklar.length; i++) if (t >= bloklar[i].bas - 0.05) bi = i;
      if (bi !== aktifBlok) {
        if (aktifBlok >= 0 && zamanlar[aktifBlok]) zamanlar[aktifBlok].classList.remove('sds-blok-aktif');
        if (zamanlar[bi]) zamanlar[bi].classList.add('sds-blok-aktif');
        aktifBlok = bi;
        const b = zamanlar[bi];
        if (b && !b.classList.contains('gizli')) takipEt(b);
      }
      const y = zamanlar[bi] ? zamanlar[bi].querySelector('.z-bas h4') : null;
      adYazi.textContent = y ? y.textContent : 'Tüm zaman çizelgesi';
    }

    function dongu() {
      vurgula(false);
      if (!ses.paused && !ses.ended) raf = requestAnimationFrame(dongu);
    }

    vurgula(true);
    window.SesDosya = { ses, z, hedef, eslesen, toplam, kacirilan, git, oynat, duraklat };

    /* ---- Sunum görünümüyle köprü ----
       Hazır kayıt varsa sunumun "Sesli okuma" düğmesi bu kaydı kullanır:
       oynarken oynayan bloğun slaydına otomatik geçer. */
    const snEl = document.getElementById('sunum');
    if (snEl) {
      const snSes = snEl.querySelector('.sn-ses-btn');
      if (snSes) {
        const blokIndeks = t => {
          let bi = 0;
          for (let i = 0; i < bloklar.length; i++) if (t >= bloklar[i].bas - 0.05) bi = i;
          return bi;
        };
        const sunumAPI = window.SunumDuzenle || null;
        let rafSunum = null;
        const izle = () => {
          const t = ses.currentTime;
          if (sunumAPI && typeof sunumAPI.gitNo === 'function') {
            sunumAPI.gitNo(Math.min(blokIndeks(t), (bloklar.length || 1) - 1));
          }
          if (!ses.paused && !ses.ended) rafSunum = requestAnimationFrame(izle);
        };
        snSes.addEventListener('click', ev => {
          ev.stopPropagation();
          if (ses.paused || ses.ended) {
            if (ses.ended) ses.currentTime = 0;
            ses.play().then(() => {
              snSes.classList.add('aktif');
              snSes.textContent = '⏸ Sesli okuma';
              snSes.title = 'Hazır kaydı duraklat';
              sdsKilitAl();
              if (!rafSunum) rafSunum = requestAnimationFrame(izle);
            }).catch(() => {});
          } else {
            duraklat();
            if (rafSunum) { cancelAnimationFrame(rafSunum); rafSunum = null; }
            snSes.classList.remove('aktif');
            snSes.textContent = '🔊 Sesli okuma';
            snSes.title = 'Hazır kaydı oynat';
          }
        }, true);
        ses.addEventListener('ended', () => {
          if (rafSunum) { cancelAnimationFrame(rafSunum); rafSunum = null; }
          snSes.classList.remove('aktif');
          snSes.textContent = '🔊 Sesli okuma';
          snSes.title = 'Hazır kaydı oynat';
        });
      }
    }
  }
})();
