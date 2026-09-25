const tabBar = document.getElementById('tabBar');
const sekmeler = document.querySelectorAll('.sekme');
const normalize = value => (value || '').toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, ' ');

function goster(id) {
  document.querySelectorAll('nav .tab').forEach(t => t.classList.toggle('aktif', t.dataset.sekme === id));
  sekmeler.forEach(s => s.classList.toggle('aktif', s.id === id));
}

tabBar.addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  const id = btn.dataset.sekme;
  if (location.hash.slice(1) !== id) location.hash = id;
  else goster(id);
});
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id && document.getElementById(id)) goster(id);
});
const ilkSekme = location.hash.slice(1);
if (ilkSekme && document.getElementById(ilkSekme)) goster(ilkSekme);

const lejant = document.getElementById('lejant');
if (lejant) {
  const kartlar = [...document.querySelectorAll('#olaylar .z-item')];
  const eserVar = z => !!z.querySelector('.z-kitap');
  lejant.addEventListener('click', e => {
    const chip = e.target.closest('span[data-kat]');
    if (!chip) return;
    const kat = chip.dataset.kat;
    const zaten = chip.classList.contains('aktif');
    lejant.querySelectorAll('span[data-kat]').forEach(s => s.classList.remove('aktif'));
    if (kat === 'tumu' || zaten) {
      kartlar.forEach(k => k.classList.remove('gizli'));
      lejant.querySelector('[data-kat="tumu"]').classList.add('aktif');
      return;
    }
    chip.classList.add('aktif');
    kartlar.forEach(k => {
      const uygun = kat === 'c-ilim' ? (k.classList.contains('c-ilim') || k.classList.contains('c-tasavvuf')) : kat === 'c-eser' ? (k.classList.contains('c-eser') || eserVar(k)) : k.classList.contains(kat);
      k.classList.toggle('gizli', !uygun);
    });
  });
}

document.querySelectorAll('#olaylar .z-kitap').forEach(k => {
  const n = k.querySelectorAll('a.kitap-link').length;
  const bas = k.querySelector('.kitap-bas');
  if (n > 1 && bas) bas.textContent += ' (' + n + ')';
});
const eserlerSec = document.getElementById('eserler');
if (eserlerSec) {
  document.querySelectorAll('#eserler .detay-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#eserler .detay-btn').forEach(b => b.classList.toggle('aktif', b === btn));
    eserlerSec.classList.toggle('kapali', btn.dataset.durum === 'kapali');
  }));
}

const blgUst = document.getElementById('blgUst');
const blgPop = document.getElementById('blgPop');
const blgBaslik = document.getElementById('blgBaslik');
const blgTur = document.getElementById('blgTur');
const blgTarih = document.getElementById('blgTarih');
const blgGrup = document.getElementById('blgGrup');
const blgOnemli = document.getElementById('blgOnemli');
const blgMetin = document.getElementById('blgMetin');
const blgDetay = document.getElementById('blgDetay');
const satirTarih = document.getElementById('satirTarih');
const satirGrup = document.getElementById('satirGrup');
const satirOnemli = document.getElementById('satirOnemli');
const satirMetin = document.getElementById('satirMetin');
const satirDetay = document.getElementById('satirDetay');

function oncekiGrup(kart) {
  let node = kart.parentElement;
  while (node) {
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (sibling.classList.contains('grup')) return sibling.querySelector('.g-yazi')?.textContent.trim() || '';
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
  }
  return '';
}
function kapat() {
  blgUst.classList.add('hidden');
  blgPop.classList.add('hidden');
}
function ac(kart) {
  const h4 = kart.querySelector('h4');
  if (!h4) return;
  blgBaslik.innerHTML = h4.innerHTML;
  const zItem = kart.closest('.z-item');
  const tarih = kart.querySelector('.kopya') || kart.querySelector('.lokal') || (zItem && zItem.querySelector('.z-tarih'));
  const tur = kart.dataset.tur || '';
  const detay = kart.dataset.detay || '';
  const onemli = kart.dataset.onemli || '';
  const grup = zItem ? (kart.querySelector('.z-kat')?.textContent.trim() || '') : oncekiGrup(kart);
  if (tur) { blgTur.textContent = tur; blgTur.classList.remove('hidden'); } else blgTur.classList.add('hidden');
  if (tarih?.textContent.trim()) { blgTarih.textContent = tarih.textContent.trim(); satirTarih.classList.remove('hidden'); } else satirTarih.classList.add('hidden');
  if (grup) { blgGrup.textContent = grup; satirGrup.classList.remove('hidden'); } else satirGrup.classList.add('hidden');
  if (onemli) { blgOnemli.textContent = onemli; satirOnemli.classList.remove('hidden'); } else satirOnemli.classList.add('hidden');
  const metin = kart.querySelector('.not, p');
  if (metin?.textContent.trim()) { blgMetin.textContent = metin.textContent.trim(); satirMetin.classList.remove('hidden'); } else satirMetin.classList.add('hidden');
  if (detay) { blgDetay.textContent = detay; satirDetay.classList.remove('hidden'); } else satirDetay.classList.add('hidden');
  blgUst.classList.remove('hidden');
  blgPop.classList.remove('hidden');
}
function kartBul(selector, ad) {
  const n = normalize(ad);
  return [...document.querySelectorAll(selector)].find(k => {
    const h4 = k.querySelector('h4');
    const value = normalize(h4?.textContent || '');
    return value === n || value.startsWith(n) || value.includes(n);
  });
}
document.querySelectorAll('a.kitap-link').forEach(a => a.addEventListener('click', e => {
  e.stopPropagation();
  const k = kartBul('#eserler .kart', a.dataset.ad);
  if (k) ac(k);
}));
document.querySelectorAll('a.ad-link').forEach(a => a.addEventListener('click', e => {
  e.stopPropagation();
  const k = kartBul('#kisiler .kart', a.dataset.ad);
  if (k) ac(k);
}));
document.querySelectorAll('.z-kart[data-derin], .kart.blg').forEach(k => k.addEventListener('click', e => {
  if (!e.target.closest('a')) ac(k);
}));
document.getElementById('blgKapat').addEventListener('click', kapat);
blgUst.addEventListener('click', kapat);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !blgPop.classList.contains('hidden')) kapat(); });

const SUNUM_AYAR = { saniyeHarf: 0.053, enAz: 4, enCok: 22, basBekleme: 1000, sonBekleme: 2000, gecis: 2000 };
const snEl = document.getElementById('sunum');
if (snEl) {
  const snSlayt = document.getElementById('snSlayt');
  const snSahne = document.getElementById('snSahne');
  const snDolgu = document.getElementById('snDolgu');
  const snSayac = document.getElementById('snSayac');
  const snSure = document.getElementById('snSure');
  const snGeri = document.getElementById('snGeri');
  const snIleri = document.getElementById('snIleri');
  const snHizKutu = document.getElementById('snHiz');
  const snHizDugme = document.getElementById('snHizDugme');
  const snHizListe = document.getElementById('snHizListe');
  const snDuraklat = document.getElementById('snDuraklat');
  const snOto = document.getElementById('snOto');
  const snKapat = document.getElementById('snKapat');
  const harfSay = el => ((el.textContent || '').match(/[\p{L}\p{N}]/gu) || []).length;
  const kelimeSure = harf => Math.min(SUNUM_AYAR.enCok, Math.max(SUNUM_AYAR.enAz, Math.round(harf * SUNUM_AYAR.saniyeHarf)));
  const sozSure = el => kelimeSure(harfSay(el));
  const sozSlayt = k => {
    const el = document.createElement('div');
    el.className = 'z-item c-tasavvuf';
    el.innerHTML = '<div class="z-kart k-tasavvuf"><div class="z-icerik"><div class="z-bas"><h4></h4><span class="z-kat">💬 Söz</span></div><p></p></div><div class="z-konum"></div></div>';
    el.querySelector('h4').textContent = (k.querySelector('h4')?.textContent || 'Söz').trim();
    el.querySelector('p').textContent = (k.querySelector('.not')?.textContent || '').trim();
    el.querySelector('.z-konum').textContent = (k.querySelector('.kopya')?.textContent || 'Söz').trim();
    return el;
  };
  const slaytlar = [...document.querySelectorAll('#olaylar .z-item')].map(z => {
    const el = z.cloneNode(true);
    el.removeAttribute('id');
    el.removeAttribute('data-derin');
    el.querySelector('.detay-d')?.remove();
    const harf = harfSay(z);
    return { el, harf, sure: kelimeSure(harf) };
  });
  document.querySelectorAll('#sozler .kart').forEach(k => {
    const el = sozSlayt(k);
    slaytlar.push({ el, harf: harfSay(el), sure: sozSure(el) });
  });
  let idx = 0, durak = false, kalan = 0, bitti = 0, raf = null, hiz = 1, oto = true, aktif = null, bittiMi = false;
  let kelimeler = [], toplamHarf = 0, gectiIdx = -1, siraIdx = -1;
  const okuma = () => slaytlar[idx].sure * 1000 / hiz;
  const bekleme = () => SUNUM_AYAR.basBekleme / hiz;
  const sonBekleme = () => SUNUM_AYAR.sonBekleme / hiz;
  const toplam = () => okuma() + bekleme() + sonBekleme();
  function yazi() { snSayac.textContent = (idx + 1) + ' / ' + slaytlar.length; snSure.textContent = '~' + Math.round(toplam() / 1000) + ' sn · ' + slaytlar[idx].harf + ' harf'; }
  function otoYazi() {
    snOto.textContent = oto ? '⏭ Otomatik' : '⏭ Etkileşimli';
    snOto.classList.toggle('aktif', oto);
    snOto.setAttribute('aria-pressed', String(oto));
    snOto.title = oto ? 'Geçişler otomatik — tıklayınca etkileşimliye döner' : 'Geçişler sizin kontrolünüzde — tıklayınca otomatik olur';
  }
  function kelimeDoldur(kapsayici) {
    const liste = [];
    kapsayici.querySelectorAll('h4, p, .z-kitap').forEach(blok => {
      const dugumler = [];
      const yuru = dugum => {
        dugum.childNodes.forEach(c => {
          if (c.nodeType === 3) dugumler.push(c);
          else if (c.nodeType === 1 && !c.classList.contains('kitap-bas')) yuru(c);
        });
      };
      yuru(blok);
      dugumler.forEach(t => {
        const parca = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { parca.appendChild(document.createTextNode(p)); return; }
          const span = document.createElement('span');
          span.className = 'sn-kelime';
          span.textContent = p;
          parca.appendChild(span);
          liste.push({ el: span, son: 0 });
        });
        t.parentNode.replaceChild(parca, t);
      });
    });
    let harfToplam = 0;
    liste.forEach(k => { harfToplam += harfSay(k.el); k.son = harfToplam; });
    return { kelimeler: liste, toplam: harfToplam };
  }
  function isaretle() {
    if (!kelimeler.length) return;
    const gecen = toplam() - kalan - bekleme();
    const oran = gecen <= 0 ? 0 : Math.min(1, gecen / okuma());
    const hedef = oran * toplamHarf;
    let g = 0;
    while (g < kelimeler.length && kelimeler[g].son <= hedef) g++;
    const gecti = Math.min(g, kelimeler.length);
    if (gecti !== gectiIdx) {
      for (let i = 0; i < gecti; i++) kelimeler[i].el.classList.add('sn-gecti');
      for (let i = gecti; i < kelimeler.length; i++) kelimeler[i].el.classList.remove('sn-gecti');
      gectiIdx = gecti;
    }
    const sira = (gecen > 0 && gecti < kelimeler.length) ? gecti : -1;
    if (sira !== siraIdx) {
      if (siraIdx >= 0) kelimeler[siraIdx].el.classList.remove('sn-sira');
      if (sira >= 0) kelimeler[sira].el.classList.add('sn-sira');
      siraIdx = sira;
    }
  }
  function olc() { if (!aktif) return; aktif.style.transform = ''; const max = snSahne.clientHeight - 18; const ratio = max > 0 && aktif.scrollHeight > max ? Math.max(.55, max / aktif.scrollHeight) : 1; aktif.style.transform = ratio < 1 ? 'scale(' + ratio.toFixed(3) + ')' : ''; }
  function ciz() {
    const eski = aktif;
    const yari = SUNUM_AYAR.gecis / 2;
    const ic = document.createElement('div');
    ic.className = 'sn-ic';
    ic.style.opacity = '0';
    ic.appendChild(slaytlar[idx].el.cloneNode(true));
    if (eski) {
      eski.classList.add('sn-cikis');
      eski.style.opacity = '0';
      snSahne.classList.remove('sn-karanlik');
      void snSahne.offsetWidth;
      snSahne.classList.add('sn-karanlik');
      setTimeout(() => { if (eski.parentNode) eski.remove(); }, yari + 80);
      setTimeout(() => {
        if (aktif !== ic) return;
        snSahne.classList.remove('sn-karanlik');
        ic.style.opacity = '1';
      }, yari);
    }
    snSlayt.appendChild(ic);
    aktif = ic;
    const k = kelimeDoldur(ic);
    kelimeler = k.kelimeler;
    toplamHarf = k.toplam;
    gectiIdx = -1;
    siraIdx = -1;
    bittiMi = false;
    yazi();
    snGeri.disabled = idx === 0;
    snIleri.disabled = idx === slaytlar.length - 1;
    kalan = toplam();
    bitti = performance.now() + kalan;
    snDolgu.style.width = '0%';
    olc();
    if (!eski) requestAnimationFrame(() => { if (ic.style.opacity === '0') ic.style.opacity = '1'; });
  }
  function dongu() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      kalan = Math.max(0, bitti - performance.now());
      snDolgu.style.width = (Math.max(0, Math.min(1, 1 - kalan / toplam())) * 100).toFixed(2) + '%';
      isaretle();
      if (kalan <= 0) {
        if (!oto) { bittiMi = true; dur(); return; }
        if (idx >= slaytlar.length - 1) { dur(); return; }
        idx++;
        ciz();
      }
      dongu();
    });
  }
  function dur() { if (durak) return; durak = true; kalan = Math.max(0, bitti - performance.now()); if (raf) cancelAnimationFrame(raf); raf = null; snDuraklat.textContent = '▶ Devam'; snDuraklat.classList.add('aktif'); }
  function devam() { if (!durak) return; durak = false; snDuraklat.textContent = '⏸ Duraklat'; snDuraklat.classList.remove('aktif'); if (kalan <= 0) kalan = toplam(); bitti = performance.now() + kalan; dongu(); }
  function git(ileri) { if (ileri ? idx >= slaytlar.length - 1 : idx === 0) return; idx += ileri ? 1 : -1; durak = false; snDuraklat.textContent = '⏸ Duraklat'; snDuraklat.classList.remove('aktif'); if (raf) cancelAnimationFrame(raf); ciz(); dongu(); }
  function acSunum(bas) { idx = Math.max(0, Math.min(slaytlar.length - 1, bas || 0)); durak = false; bittiMi = false; aktif = null; snSlayt.innerHTML = ''; snHizListe.hidden = true; snHizDugme.setAttribute('aria-expanded', 'false'); otoYazi(); snEl.hidden = false; document.body.style.overflow = 'hidden'; ciz(); dongu(); const fs = snEl.requestFullscreen || snEl.webkitRequestFullscreen; if (fs) try { const p = fs.call(snEl); if (p?.catch) p.catch(() => {}); } catch (e) {} }
  function kapatSunum() { snEl.hidden = true; snHizListe.hidden = true; snHizDugme.setAttribute('aria-expanded', 'false'); durak = false; bittiMi = false; idx = 0; aktif = null; kelimeler = []; gectiIdx = -1; siraIdx = -1; snSlayt.innerHTML = ''; snDolgu.style.width = '0%'; if (raf) cancelAnimationFrame(raf); raf = null; document.body.style.overflow = ''; const cik = document.exitFullscreen || document.webkitExitFullscreen; if (cik && (document.fullscreenElement || document.webkitFullscreenElement)) try { cik.call(document); } catch (e) {} }
  document.getElementById('sunumAc').addEventListener('click', () => acSunum(0));
  snKapat.addEventListener('click', kapatSunum);
  snGeri.addEventListener('click', () => git(false));
  snIleri.addEventListener('click', () => git(true));
  snDuraklat.addEventListener('click', () => { if (bittiMi) git(true); else if (durak) devam(); else dur(); });
  snOto.addEventListener('click', () => { oto = !oto; otoYazi(); });
  snHizDugme.addEventListener('click', e => { e.stopPropagation(); const acik = snHizListe.hidden; snHizListe.hidden = !acik; snHizDugme.setAttribute('aria-expanded', String(acik)); });
  snHizKutu.addEventListener('click', e => {
    const b = e.target.closest('.sn-hiz-btn[data-hiz]');
    if (!b) return;
    const yeni = parseFloat(b.dataset.hiz);
    snHizListe.hidden = true;
    snHizDugme.setAttribute('aria-expanded', 'false');
    snHizDugme.textContent = b.textContent + ' ▾';
    snHizListe.querySelectorAll('.sn-hiz-btn').forEach(x => x.classList.toggle('aktif', x === b));
    if (!yeni || yeni === hiz) return;
    kalan *= hiz / yeni;
    hiz = yeni;
    yazi();
    bitti = performance.now() + kalan;
    if (!durak) dongu();
  });
  document.addEventListener('click', e => { if (!snHizListe.hidden && !snHizKutu.contains(e.target)) { snHizListe.hidden = true; snHizDugme.setAttribute('aria-expanded', 'false'); } });
  document.querySelectorAll('#olaylar .z-item').forEach((z, i) => {
    const hedef = z.querySelector('.z-kart') || z;
    const baslik = z.querySelector('h4');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'z-sunum-btn';
    b.title = 'Sunumdan buradan başla';
    b.setAttribute('aria-label', 'Sunum: ' + (baslik ? baslik.textContent.trim() : (i + 1) + '. olay') + ' olayından başla');
    b.textContent = '▶';
    b.addEventListener('click', e => { e.stopPropagation(); acSunum(i); });
    hedef.appendChild(b);
  });
  snSahne.addEventListener('click', e => { if (e.target === snSahne) git(true); });
  window.addEventListener('resize', olc);
  document.addEventListener('keydown', e => {
    if (snEl.hidden) return;
    if (e.key === 'Escape') { if (!snHizListe.hidden) { snHizListe.hidden = true; snHizDugme.setAttribute('aria-expanded', 'false'); } else kapatSunum(); }
    else if (e.key === 'ArrowRight') git(true);
    else if (e.key === 'ArrowLeft') git(false);
    else if (e.key === ' ') { e.preventDefault(); if (bittiMi) git(true); else if (durak) devam(); else dur(); }
  });
}
