/* v2 duzenleyici: GitHub token ile sayfa bloklarini duzenleme ve JSON kaydetme */
(function () {
  'use strict';

  var DEPO = 'selimhanc/biyografi';
  var DAL_KAYDET = 'main';
  var DAL_OKU = ['main', 'v2'];
  var GH_API = 'https://api.github.com';
  var GH_RAW = 'https://raw.githubusercontent.com/' + DEPO + '/';
  var TOKEN_ANAHTAR = 'dz_token';

  var MEZ_SVG = '<svg class="mez" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 1.8c-3.1 0-5.6 2.5-5.6 5.6V17h11.2V7.4c0-3.1-2.5-5.6-5.6-5.6zM6.4 18.2h11.2c.6 0 1 .4 1 1v1.6c0 .6-.4 1-1 1H6.4c-.6 0-1-.4-1-1v-1.6c0-.6.4-1 1-1zM9.6 8.4h4.8v1.7H9.6zM9.6 11.6h4.8v1.7H9.6z"/></svg>';

  var ETIKET = [
    { ad: 'Doğum', ikon: '🌙', sinif: 'dogum' },
    { ad: 'İlim', ikon: '🕌', sinif: 'ilim' },
    { ad: 'Eser', ikon: '📖', sinif: 'eser' },
    { ad: 'Siyaset', ikon: '👑', sinif: 'saray' },
    { ad: 'Tasavvuf', ikon: '📿', sinif: 'tasavvuf' },
    { ad: 'Seyahat', ikon: '🧭', sinif: 'sefer' },
    { ad: 'Esaret', ikon: '⛓', sinif: 'esaret' },
    { ad: 'Ayrılış', ikon: '🕊️', sinif: 'kayip' },
    { ad: 'Vefat', ikon: MEZ_SVG, sinif: 'vefat' }
  ];

  var duzenli = function (s) { return (s || '').replace(/\s+/g, ' ').trim(); };
  var slug = function () {
    var parca = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    if (parca.length && parca[parca.length - 1].indexOf('.') >= 0) parca.pop();
    return parca.length ? parca[parca.length - 1] : 'index';
  };
  var SLUG = slug();

  var SEKME = ['olaylar', 'sehirler', 'kisiler', 'eserler', 'sozler'];
  var duzenlenebilir = 'h4,h3,p,.lokal,.kopya,.not,.z-konum,.z-yas,.z-tarih,.z-kat,.rozet,.detay-d,.z-kitap,h1,.adis';

  /* ---------------- durum ---------------- */
  var kirli = false, mod = false, token = '', sunumZaman = null, TEMEL = null;

  /* ---------------- kucuk araclar ---------------- */
  function el(tag, ozellik, cocuk) {
    var d = document.createElement(tag);
    if (ozellik) Object.keys(ozellik).forEach(function (k) {
      if (k === 'class') d.className = ozellik[k];
      else if (k === 'html') d.innerHTML = ozellik[k];
      else if (k === 'text') d.textContent = ozellik[k];
      else if (k.slice(0, 2) === 'on') d.addEventListener(k.slice(2).toLowerCase(), ozellik[k]);
      else d.setAttribute(k, ozellik[k]);
    });
    (cocuk || []).forEach(function (c) { if (c) d.appendChild(c); });
    return d;
  }
  var $ = function (s, kok) { return (kok || document).querySelector(s); };
  var $$ = function (s, kok) { return Array.prototype.slice.call((kok || document).querySelectorAll(s)); };
  var kacir = function (s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };

  /* ---------------- bildirim ---------------- */
  var bildirimKutu = null;
  function bildir(metin, tur, eylem) {
    if (!bildirimKutu) {
      bildirimKutu = el('div', { class: 'dz-bildirim' });
      document.body.appendChild(bildirimKutu);
    }
    var kutu = el('div', { class: 'dz-uyari ' + (tur || '') }, [el('span', { text: metin })]);
    if (eylem) {
      var d = el('button', { class: 'dz-eylem', type: 'button', text: eylem.metin });
      d.addEventListener('click', eylem.tikla);
      kutu.appendChild(d);
    }
    bildirimKutu.appendChild(kutu);
    setTimeout(function () {
      kutu.style.transition = 'opacity .3s';
      kutu.style.opacity = '0';
      setTimeout(function () { kutu.remove(); }, 320);
    }, tur === 'hata' ? 7000 : (eylem ? 12000 : 3200));
  }

  /* ---------------- pencere ---------------- */
  function pencere(icerik) {
    var perde = el('div', { class: 'dz-perde' });
    var kutu = el('div', { class: 'dz-kutu' }, [icerik]);
    perde.appendChild(kutu);
    perde.addEventListener('mousedown', function (e) { if (e.target === perde) perde.remove(); });
    var esc = function (e) { if (e.key === 'Escape') { perde.remove(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
    document.body.appendChild(perde);
    return perde;
  }

  /* ---------------- token ---------------- */
  function tokenOku() {
    try { return sessionStorage.getItem(TOKEN_ANAHTAR) || ''; } catch (e) { return ''; }
  }
  function tokenYaz(t) {
    token = t || '';
    try { t ? sessionStorage.setItem(TOKEN_ANAHTAR, t) : sessionStorage.removeItem(TOKEN_ANAHTAR); } catch (e) {}
  }
  function gh(ur, secenek) {
    var o = secenek || {};
    o.headers = Object.assign({ Accept: 'application/vnd.github+json' }, o.headers || {});
    if (token) o.headers.Authorization = 'Bearer ' + token;
    return fetch(ur, o);
  }
  function tokenDogrula(t) {
    return gh(GH_API + '/repos/' + DEPO, { headers: { Authorization: 'Bearer ' + t } })
      .then(function (yanit) {
        if (!yanit.ok) throw new Error(yanit.status === 401 ? 'Token geçersiz veya süresi dolmuş.' : 'Token doğrulanamadı (HTTP ' + yanit.status + ').');
        return yanit.json();
      })
      .then(function (bilgi) {
        var yetki = bilgi.permissions || {};
        var yazma = yetki.push === true || yetki.admin === true || yetki.maintain === true;
        if (!yazma) {
          return gh(GH_API + '/repos/' + DEPO + '/contents/veri', { headers: { Authorization: 'Bearer ' + t } })
            .then(function (r) { if (!r.ok) throw new Error('Token bu depoya yazma yetkisine sahip değil.'); return bilgi; });
        }
        return bilgi;
      });
  }
  function tokenPenceresi() {
    var giris = el('input', { type: 'password', autocomplete: 'off', placeholder: 'github_pat_…' });
    var durum = el('div', { class: 'dz-durum' });
    var onay = el('button', { class: 'ana', text: 'Doğrula ve düzenle' });
    var kutu = el('div', {}, [
      el('h2', { text: 'Düzenleme için GitHub token' }),
      el('p', { class: 'aciklama', text: 'Değişiklikler doğrudan bu deponun ' + DAL_KAYDET + ' branch’ine yazılır. Token yalnız bu sekmede tutulur, sayfa kapandığında silinir.' }),
      el('label', { text: 'Fine-grained personal access token' }),
      giris,
      el('p', { class: 'dz-ipucu', html: 'Token’ı <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">GitHub ayarlarından</a> oluşturun: Contents → <b>Read and write</b> (yalnız bu depo).' }),
      durum
    ]);
    var sira = el('div', { class: 'dz-sira' }, [
      el('button', { text: 'Vazgeç', onclick: function () { perde.remove(); } }), onay
    ]);
    kutu.appendChild(sira);
    var perde = pencere(kutu);
    giris.focus();

    function gonder() {
      var t = giris.value.trim();
      if (!t) { durum.className = 'dz-durum hata'; durum.textContent = 'Token giriniz.'; return; }
      onay.disabled = true; giris.disabled = true;
      durum.className = 'dz-durum'; durum.textContent = 'Doğrulanıyor…';
      tokenDogrula(t).then(function () {
        tokenYaz(t);
        perde.remove();
        modAc();
        bildir('Düzenleme modu açıldı — değişikliklerinizi yapabilirsiniz.', 'bilgi');
      }).catch(function (h) {
        onay.disabled = false; giris.disabled = false;
        giris.value = ''; giris.focus();
        durum.className = 'dz-durum hata'; durum.textContent = h.message || 'Doğrulanamadı.';
      });
    }
    onay.addEventListener('click', gonder);
    giris.addEventListener('keydown', function (e) { if (e.key === 'Enter') gonder(); });
  }

  /* ---------------- sunum senkronu ---------------- */
  function sunumYenile() {
    clearTimeout(sunumZaman);
    sunumZaman = setTimeout(function () {
      try { if (window.SunumDuzenle && window.SunumDuzenle.yenile) window.SunumDuzenle.yenile(); } catch (e) {}
    }, 350);
  }
  function kirliIsaretle() {
    if (kirli) return;
    kirli = true;
    var d = $('#dzKaydet');
    if (d) d.classList.add('kirli');
  }

  /* ---------------- etiket eslestirme ---------------- */
  function etiketMetni(etiket) {
    return etiket.sinif === 'vefat' ? MEZ_SVG + ' Vefat' : etiket.ikon + ' ' + etiket.ad;
  }
  function etiketBul(metin) {
    var duz = duzenli(metin);
    var karsilastir = function (e) { return e.sinif === 'vefat' ? 'Vefat' : e.ad; };
    var bulundu = ETIKET.filter(function (e) { return karsilastir(e) === duz; })[0];
    if (bulundu) return bulundu;
    var kok = duz.split(' ').pop();
    return ETIKET.filter(function (e) { return karsilastir(e).toLocaleLowerCase('tr') === kok.toLocaleLowerCase('tr'); })[0] || null;
  }
  var SINIFLAR = ['dogum', 'ilim', 'eser', 'saray', 'tasavvuf', 'sefer', 'esaret', 'kayip', 'vefat', 'kilim'];
  function sinifTemizle(kapsayici, onek) {
    SINIFLAR.forEach(function (s) { kapsayici.classList.remove(onek + s); });
  }
  function sinifDegistir(kapsayici, etiket) {
    if (!etiket) return;
    sinifTemizle(kapsayici, 'k-');
    sinifTemizle(kapsayici, 'c-');
    if (kapsayici.classList.contains('z-item')) kapsayici.classList.add('c-' + etiket.sinif);
    kapsayici.classList.add('k-' + etiket.sinif);
    var kart = kapsayici.querySelector('.z-kart');
    if (kart && kart !== kapsayici) { sinifTemizle(kart, 'k-'); kart.classList.add('k-' + etiket.sinif); }
    var zitem = kapsayici.closest ? kapsayici.closest('.z-item') : null;
    if (zitem && zitem !== kapsayici) { sinifTemizle(zitem, 'c-'); zitem.classList.add('c-' + etiket.sinif); }
  }

  /* ---------------- duzenlenebilir alanlar ---------------- */
  function alanlariIsaretle(kapsayici) {
    $$('[contenteditable]', kapsayici).forEach(function (a) { a.removeAttribute('contenteditable'); });
    $$('.dz-ekle', kapsayici).forEach(function (b) { b.remove(); });
    $$(duzenlenebilir, kapsayici).forEach(function (a) {
      if (a.closest('#sunum')) return;
      if (a.closest('#kapi')) return;
      a.setAttribute('contenteditable', 'plaintext-only');
      if (a.setAttribute('contenteditable', 'plaintext-only') !== 'plaintext-only') a.setAttribute('contenteditable', 'true');
      a.setAttribute('spellcheck', 'false');
    });
  }
  function yapistirTemizle() {
    document.addEventListener('paste', function (e) {
      var a = e.target;
      if (!a || !a.closest || !a.closest('[contenteditable]')) return;
      e.preventDefault();
      var metin = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
      document.execCommand('insertText', false, metin.replace(/\s+/g, ' '));
    });
  }

  /* ---------------- blok ekleme ---------------- */
  function kaplar() {
    var liste = [];
    var zaman = $('#olaylar .zaman');
    if (zaman) liste.push({ kap: zaman, tip: 'olay' });
    SEKME.forEach(function (s) {
      if (s === 'olaylar') return;
      $$('#' + s + ' .kartlar').forEach(function (k) { liste.push({ kap: k, tip: 'kart' }); });
    });
    return liste;
  }
  function ekleDugmeleri() {
    if (!mod) return;
    kaplar().forEach(function (k) {
      var bloklar = $$('.z-item, .kart.blg', k.kap);
      bloklar.forEach(function (b) {
        var d = el('button', { class: 'dz-ekle gorunur', type: 'button', text: '+ Blok ekle' });
        d.addEventListener('click', function (e) { e.stopPropagation(); eklePenceresi(k.tip, b, k.kap); });
        b.parentNode.insertBefore(d, b.nextSibling);
      });
      var son = el('button', { class: 'dz-ekle gorunur', type: 'button', text: '+ Blok ekle' });
      son.addEventListener('click', function (e) { e.stopPropagation(); eklePenceresi(k.tip, null, k.kap); });
      k.kap.appendChild(son);
      $$('.kart.blg', k.kap).forEach(function (kart) { detayDugmesi(kart); });
    });
  }
  /* Detayli bilgi iceren kartlara, kart tiklamasi yerine calisan dugme */
  function detayDugmesi(kart) {
    if (kart.querySelector(':scope > .dz-detay')) return;
    var veriVar = kart.dataset && (kart.dataset.tur || kart.dataset.onemli || kart.dataset.detay || kart.dataset.derin);
    if (!veriVar) return;
    if (typeof window.KartPopAc !== 'function') return;
    var d = el('button', { class: 'dz-detay', type: 'button', text: 'ⓘ Detaylı bilgi' });
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      try { window.KartPopAc(kart); } catch (h) { bildir('Detay açılamadı.', 'hata'); }
    });
    var not = kart.querySelector('.not');
    if (not) not.parentNode.insertBefore(d, not.nextSibling);
    else kart.appendChild(d);
  }
  function detayDugmeleri() {
    $$('.z-kart[data-derin], .z-kart[data-detay], .kart.blg[data-tur], .kart.blg[data-onemli], .kart.blg[data-detay]').forEach(function (k) {
      detayDugmesi(k);
    });
  }
  /* Blok kosesinde silme dugmesi — yalnizca duzenleme modunda gorunur */
  function blokDugmeleri() {
    if (!mod) return;
    $$('.z-kart, .kart.blg').forEach(function (kart) {
      if (kart.closest('#sunum')) return;
      if (kart.querySelector(':scope > .dz-sil')) return;
      var d = el('button', { class: 'dz-sil', type: 'button', title: 'Bloğu sil', 'aria-label': 'Bloğu sil', text: '\u2715' });
      d.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); silPenceresi(kart); });
      kart.appendChild(d);
    });
  }
  function silPenceresi(kart) {
    var h4 = $('h4', kart);
    var ad = h4 ? duzenli(h4.textContent) : '';
    var kutu = el('div', {}, [
      el('h2', { text: 'Bloğu sil' }),
      el('p', { class: 'aciklama', text: '“' + (ad || 'Bu blok') + '” silinecek. Kaydetmezseniz değişiklik kaydedilmez; Vazgeç derseniz hiçbir şey değişmez.' })
    ]);
    var evet = el('button', { class: 'ana tehlike', text: 'Evet, sil' });
    var vazgec = el('button', { text: 'Vazgeç' });
    kutu.appendChild(el('div', { class: 'dz-sira' }, [vazgec, evet]));
    var perde = pencere(kutu);
    vazgec.addEventListener('click', function () { perde.remove(); });
    evet.addEventListener('click', function () {
      var blok = kart.closest('.z-item') || kart;
      perde.remove();
      blok.remove();
      alanlariIsaretle(document);
      ekleDugmeleri();
      detayDugmeleri();
      blokDugmeleri();
      siraYenile();
      sunumYenile();
      kirliIsaretle();
    });
  }
  function eklePenceresi(tip, hedef, kap) {
    var secim = el('select', {});
    ETIKET.forEach(function (e) {
      secim.appendChild(el('option', { value: e.sinif, html: (e.sinif === 'vefat' ? MEZ_SVG + ' Vefat' : e.ikon + ' ' + e.ad) }));
    });
    secim.value = 'ilim';
    var onizleme = el('div', { class: 'dz-etiket-onizleme' });
    var baslik = el('input', { type: 'text', placeholder: 'Blok başlığı' });
    var aciklama = el('textarea', { placeholder: 'Kısa açıklama' });
    var tarih = el('input', { type: 'text', placeholder: 'M. 1200 · H. 600' });
    var konum = el('input', { type: 'text', placeholder: 'Gazne' });

    function onizlemeCiz() {
      onizleme.innerHTML = '';
      ETIKET.forEach(function (e) {
        var b = el('button', { type: 'button', class: e.sinif === secim.value ? 'secili' : '', html: e.sinif === 'vefat' ? MEZ_SVG + ' Vefat' : e.ikon + ' ' + e.ad });
        b.addEventListener('click', function () { secim.value = e.sinif; onizlemeCiz(); });
        onizleme.appendChild(b);
      });
    }
    secim.addEventListener('change', onizlemeCiz);
    onizlemeCiz();

    var kutu = el('div', {}, [
      el('h2', { text: tip === 'olay' ? 'Yeni olay ekle' : 'Yeni kart ekle' }),
      el('p', { class: 'aciklama', text: 'Etiketi seçin; blok rengi etikete göre otomatik uygulanır.' }),
      el('label', { text: 'Etiket' }), secim, onizleme,
      el('label', { text: 'Başlık' }), baslik,
      el('label', { text: 'Açıklama' }), aciklama
    ]);
    if (tip === 'olay') {
      kutu.appendChild(el('label', { text: 'Tarih' }));
      kutu.appendChild(tarih);
      kutu.appendChild(el('label', { text: 'Konum' }));
      kutu.appendChild(konum);
    }
    var ekle = el('button', { class: 'ana', text: 'Ekle' });
    kutu.appendChild(el('div', { class: 'dz-sira' }, [el('button', { text: 'Vazgeç', onclick: function () { perde.remove(); } }), ekle]));
    var perde = pencere(kutu);
    baslik.focus();

    ekle.addEventListener('click', function () {
      var e = ETIKET.filter(function (x) { return x.sinif === secim.value; })[0] || ETIKET[1];
      var b = tip === 'olay' ? olayBlogu(e) : kartBlogu(e, tip === 'kart' ? sonrakiSira(kap || (hedef && hedef.parentNode)) : null);
      if (hedef) hedef.parentNode.insertBefore(b, hedef.nextSibling);
      else if (kap) {
        var digerleri = $$('.dz-ekle', kap);
        var sonDugme = digerleri[digerleri.length - 1];
        if (sonDugme) sonDugme.parentNode.insertBefore(b, sonDugme);
        else kap.appendChild(b);
      }
      var d = $('h4', b); if (d) d.textContent = baslik.value.trim() || 'Yeni başlık';
      var p = $('.z-icerik > p', b) || $('.not', b); if (p) p.textContent = aciklama.value.trim();
      if (tip === 'olay') {
        var t = $('.z-tarih', b); if (t) t.textContent = tarih.value.trim() || 'Tarih';
        var k = $('.z-konum', b); if (k) k.textContent = konum.value.trim();
      }
      perde.remove();
      alanlariIsaretle(document);
      ekleDugmeleri();
      detayDugmeleri();
      blokDugmeleri();
      siraYenile();
      sunumYenile();
      kirliIsaretle();
      d = $('h4', b); if (d) { d.focus(); }
    });
  }
  function olayBlogu(etiket, sinif) {
    var s = sinif || etiket.sinif;
    var z = el('div', { class: 'z-item c-' + s });
    var bilgi = el('div', { class: 'z-bilgi' }, [
      el('span', { class: 'z-yas' }), el('span', { class: 'z-tarih', text: 'Tarih' })
    ]);
    var kart = el('div', { class: 'z-kart k-' + s });
    var icerik = el('div', { class: 'z-icerik' });
    icerik.appendChild(el('div', { class: 'z-bas' }, [
      el('h4', { text: 'Yeni başlık' }), el('span', { class: 'z-kat', html: etiketMetni(etiket) })
    ]));
    icerik.appendChild(el('p', { text: '' }));
    kart.appendChild(icerik);
    kart.appendChild(el('div', { class: 'z-konum' }));
    z.appendChild(bilgi); z.appendChild(kart);
    return z;
  }
  function kartBlogu(etiket, sira, sinif) {
    var k = el('div', { class: 'kart blg k-' + (sinif || etiket.sinif) });
    if (sira !== null && sira !== undefined) {
      k.appendChild(el('div', { class: 'ust' }, [el('span', { class: 'sira', text: String(sira) })]));
    }
    k.appendChild(el('h4', { text: 'Yeni başlık' }));
    k.appendChild(el('div', { class: 'not' }));
    return k;
  }
  /* Yeni kart eklendiginde numaralandirilmis gruplar icin sonraki numarayi kullanir */
  function sonrakiSira(kap) {
    if (!kap) return null;
    var kartlar = $$('.kart.blg', kap);
    var ilk = null;
    kartlar.forEach(function (k) { if (ilk === null && $('.ust .sira', k)) ilk = mezcutSayi($('.ust .sira', k)); });
    if (ilk === null) return null;
    var enBuyuk = ilk;
    kartlar.forEach(function (k) { var s = $('.ust .sira', k); if (s) enBuyuk = Math.max(enBuyuk, mezcutSayi(s)); });
    return enBuyuk + 1;
  }
  /* Yazarın verdiği numaraları korur: grup ilk numarasından devam eder,
     numarasız kartlara sıra numarası verilmez. */
  function siraYenile() {
    $$('.kartlar').forEach(function (kap) {
      var kartlar = $$('.kart.blg', kap);
      var baslangic = null;
      kartlar.forEach(function (k) {
        if (baslangic !== null) return;
        var s = $('.ust .sira', k);
        if (s && duzenli(s.textContent)) baslangic = duzenli(s.textContent);
      });
      // hic numara yoksa ya da numara harfliyse (H1, H2) dokunma
      if (baslangic === null) return;
      var ilk = parseInt(baslangic, 10);
      if (isNaN(ilk) || String(ilk) !== baslangic) return;
      var n = ilk - 1;
      kartlar.forEach(function (k) {
        var s = $('.ust .sira', k);
        if (s) s.textContent = String(++n);
      });
    });
  }
  function mezcutSayi(s) {
    var n = parseInt(s.textContent, 10);
    return isNaN(n) ? 0 : n;
  }

  /* ---------------- JSON serilestirme ---------------- */
  function h4Veri(h4) {
    if (!h4) return { baslik: '' };
    var adis = h4.querySelector('span.adis');
    var d = { baslik: duzenli(h4.textContent) };
    if (adis) {
      // ayirici bosluklar yazarin yazdigi gibi korunur (bazi kartlarda "|" yoktur)
      var ham = h4.childNodes[0] ? h4.childNodes[0].textContent : h4.textContent;
      d.baslik = ham.replace(/[\r\n\t]+/g, ' ');
      d.adis = adis.textContent.replace(/[\r\n\t]+/g, ' ');
    }
    return d;
  }
  /* Sayfa basligi ve bolum/kart disinda kalan serbest metinler.
     Her alan icin bir CSS yolu saklanir; ic ice ogeler (orn. h3 > span.adis)
     birbirini ezmeden ayri ayri yazilir. */
  function dogrudanOku(a) {
    var s = '';
    for (var i = 0; i < a.childNodes.length; i++) if (a.childNodes[i].nodeType === 3) s += a.childNodes[i].textContent;
    return s.replace(/[\r\n\t]+/g, ' ');
  }
  function dogrudanYaz(a, deger) {
    var cocuklar = a.childNodes;
    for (var i = cocuklar.length - 1; i >= 0; i--) if (cocuklar[i].nodeType === 3) a.removeChild(cocuklar[i]);
    var ilk = null;
    for (var j = 0; j < a.childNodes.length; j++) if (a.childNodes[j].nodeType === 1) { ilk = a.childNodes[j]; break; }
    a.insertBefore(document.createTextNode(deger), ilk);
  }
  /* Sayfa basligi <br> ile satirlara bolunup ic ice <span> icerebilir;
     her satir ham HTML olarak saklanir ki duzen birebir korunsun. */
  function baslikSatir(h1) {
    var sat = [''];
    for (var i = 0; i < h1.childNodes.length; i++) {
      var n = h1.childNodes[i];
      if (n.nodeType === 3) sat[sat.length - 1] += n.textContent;
      else if (n.nodeName === 'BR') sat.push('');
      else if (n.nodeType === 1) sat[sat.length - 1] += n.outerHTML;
    }
    return sat.map(function (s) { return s.replace(/[\r\n\t]+/g, ' ').replace(/^\s+|\s+$/g, ''); });
  }
  var GUVENLI_ETIKET = ['BR', 'B', 'I', 'EM', 'STRONG', 'U', 'SMALL', 'SUP', 'SUB', 'SPAN'];
  function guvenliHtml(s) {
    var d = document.createElement('div');
    d.innerHTML = String(s);
    (function temizle(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) return;
        if (c.nodeType !== 1 || GUVENLI_ETIKET.indexOf(c.nodeName) < 0) { c.remove(); return; }
        [].slice.call(c.attributes).forEach(function (a) {
          if (a.name === 'class') return;
          if (a.name === 'style' && !/url|expression|javascript/i.test(a.value)) return;
          c.removeAttribute(a.name);
        });
        temizle(c);
      });
    })(d);
    return d.innerHTML;
  }
  function metinYolu(a) {    var y = [];
    while (a && a.nodeType === 1 && a !== document.body) {
      var s = a.tagName.toLowerCase();
      if (a.id) { y.unshift(s + '#' + a.id); break; }
      if (a.className) s += '.' + a.className.trim().split(/\s+/).join('.');
      var k = 1, e = a;
      while ((e = e.previousElementSibling) && e.tagName === a.tagName) k++;
      y.unshift(s + ':nth-of-type(' + k + ')');
      a = a.parentElement;
    }
    return y.join('>');
  }
  var SERBEST_ALAN = 'h2,.alis,header h3,main .baslik > p,main .kart > .sira,main .kart h3,main .kart h3 > .adis,main .kart > .not';
  function serbestMetinleriEkle(veri) {
    var liste = [];
    $$(SERBEST_ALAN, document).forEach(function (a) {
      if (a.closest('#sunum') || a.closest('#kapi')) return;
      if (a.closest('section.sekme')) return;   // bunlar bolum/kart olarak zaten saklaniyor
      liste.push(a);
    });
    if (liste.length) veri.metin = liste.map(function (a) { return { yol: metinYolu(a), deger: dogrudanOku(a) }; });
  }
  function serbestMetinleriUygula(v) {
    (v.metin || []).forEach(function (m) {
      var a = null;
      try { a = document.querySelector(m.yol); } catch (e) { a = null; }
      if (a) dogrudanYaz(a, m.deger);
    });
  }
  function serilestir() {
    var veri = { surum: 1, slug: SLUG, ust: {}, bolumler: [], olaylar: [], kartlar: {} };
    var rozet = $('.rozet'), ad = $('header h1'), alt = $('.alt');
    if (rozet) veri.ust.rozet = duzenli(rozet.textContent);
    if (ad) veri.ust.adSatir = baslikSatir(ad);
    if (ad) veri.ust.ad = (veri.ust.adSatir || []).map(function (s) { return s.replace(/<[^>]*>/g, ''); }).join(' ');
    if (alt) veri.ust.alt = duzenli(alt.textContent);

    $$('#olaylar .zaman .z-item').forEach(function (z) {
      var bilgi = z.querySelector('.z-bilgi');
      var h = $('h4', z), p = $('.z-icerik > p', z), konum = $('.z-konum', z);
      var kat = $('.z-kat', z);
      var t = bilgi && bilgi.querySelector('.z-tarih');
      var hy = bilgi && bilgi.querySelector('.h');
      var detay = z.querySelector('.detay-d'), kitap = z.querySelector('.z-kitap');
      var o = {
        tur: (z.className.match(/\bc-([a-z-]+)\b/) || [, (z.querySelector('.z-kart') || { className: '' }).className.match(/\bk-([a-z-]+)\b/)?.[1] || 'ilim'])[1],
        yas: bilgi && bilgi.querySelector('.z-yas') ? duzenli(bilgi.querySelector('.z-yas').textContent) : '',
        tarih: t ? duzenli(hy ? t.childNodes[0].textContent : t.textContent) : '',
        h: hy ? duzenli(hy.textContent) : '',
        baslik: h ? duzenli(h.textContent) : '',
        tag: kat ? duzenli(kat.textContent) : '',
        aciklama: p ? duzenli(p.textContent) : '',
        konum: konum ? duzenli(konum.textContent) : ''
      };
      if (detay) o.detay = detay.innerHTML;
      if (kitap) o.kitap = kitap.innerHTML;
      veriOzellik($('.z-kart', z) || z, o);
      veri.olaylar.push(o);
    });

    SEKME.forEach(function (s) {
      if (s === 'olaylar') return;
      var bolum = $('#' + s);
      if (!bolum) return;
      // bolum basligi (h2 + alt aciklama) — duzenlenebilir oldugu icin saklanir
      var bas = $('.baslik', bolum);
      if (bas) {
        var h2 = $('h2', bas), aciklama = $('p', bas);
        if (h2 || aciklama) veri.bolumler.push({ id: s, h2: h2 ? duzenli(h2.textContent) : '', aciklama: aciklama ? duzenli(aciklama.textContent) : '' });
      }
      // gruplar: .grup basligi + .kartlar
      var gruplar = [], acik = null;
      Array.prototype.forEach.call(bolum.children, function (c) {
        if (c.classList.contains('grup')) {
          acik = { baslik: duzenli(($('.g-yazi', c) || {}).textContent || ''), ikon: duzenli(($('.g-ikon', c) || {}).textContent || ''), adet: $('.adet', c) ? duzenli($('.adet', c).textContent) : '', kartlar: [] };
          gruplar.push(acik);
        } else if (c.classList.contains('kartlar')) {
          if (!acik) { acik = { baslik: '', ikon: '', adet: '', kartlar: [] }; gruplar.push(acik); }
          $$('.kart.blg', c).forEach(function (k) { acik.kartlar.push(kartVeri(k)); });
        }
      });
      veri.kartlar[s] = gruplar;
    });
    serbestMetinleriEkle(veri);
    return veri;
  }
  function kartVeri(k) {
    var h = h4Veri($('h4', k));
    var o = {
      tur: (k.className.match(/\bk-([a-z-]+)\b/) || [, 'ilim'])[1],
      sira: ($('.ust .sira', k) || {}).textContent ? duzenli($('.ust .sira', k).textContent) : '',
      baslik: h.baslik,
      aciklama: duzenli(($('.not', k) || {}).textContent || '')
    };
    if (h.adis) o.adis = h.adis;
    var ek = $('.lokal', k); if (ek) o.lokal = duzenli(ek.textContent);
    var kopya = $('.kopya', k); if (kopya) o.kopya = duzenli(kopya.textContent);
    // popup'in kullandigi veri ozellikleri korunur
    veriOzellik(k, o);
    return o;
  }
  var VERI_OZELLIK = ['tur', 'derin', 'onemli', 'detay'];
  function veriOzellik(el, o) {
    VERI_OZELLIK.forEach(function (a) {
      var d = el.getAttribute('data-' + a);
      if (d) o['d_' + a] = d;
    });
  }
  function veriOzellikUygula(el, o) {
    VERI_OZELLIK.forEach(function (a) {
      if (o['d_' + a]) el.setAttribute('data-' + a, o['d_' + a]);
    });
  }

  /* ---------------- JSON uygulama ---------------- */
  function uygula(v) {
    if (!v) return;
    if (v.ust) {
      var rozet = $('.rozet'), ad = $('header h1'), alt = $('.alt');
      if (rozet && v.ust.rozet) rozet.textContent = v.ust.rozet;
      if (ad && v.ust.ad) ad.innerHTML = (Array.isArray(v.ust.adSatir) ? v.ust.adSatir : [v.ust.ad]).map(guvenliHtml).join('<br>');
      if (alt && v.ust.alt) alt.innerHTML = '<b>' + kacir(v.ust.alt.split('·')[0].trim()) + '</b>' + (v.ust.alt.indexOf('·') >= 0 ? ' · ' + kacir(v.ust.alt.split('·').slice(1).join('·').trim()) : '');
    }
    var zaman = $('#olaylar .zaman');
    if (zaman && Array.isArray(v.olaylar) && v.olaylar.length) {
      zaman.innerHTML = '';
      v.olaylar.forEach(function (o) {
        var e = ETIKET.filter(function (x) { return x.sinif === o.tur; })[0] || ETIKET[1];
        var sinif = o.tur || e.sinif;
        var z = olayBlogu(e, sinif);
        if (o.yas) $('.z-yas', z).textContent = o.yas;
        var t = $('.z-tarih', z);
        t.innerHTML = kacir(o.tarih || '') + (o.h ? ' <span class="h">' + kacir(o.h) + '</span>' : '');
        if (o.tag) {
          // yazarin etiket metni aynen korunur; yalnizca mezar ikonu SVG olarak cizilir
          var kat = $('.z-kat', z);
          kat.innerHTML = sinif === 'vefat' ? etiketMetni(ETIKET[8]) : kacir(o.tag);
        }
        $('h4', z).textContent = o.baslik || '';
        $('.z-icerik > p', z).textContent = o.aciklama || '';
        $('.z-konum', z).textContent = o.konum || '';
        if (o.detay) { $('.z-icerik', z).appendChild(el('span', { class: 'detay-d', html: o.detay })); }
        if (o.kitap) { $('.z-icerik', z).appendChild(el('div', { class: 'z-kitap', html: o.kitap })); }
        veriOzellikUygula($('.z-kart', z), o);
        zaman.appendChild(z);
      });
    }
    if (v.bolumler) {
      v.bolumler.forEach(function (b) {        var bolum = b && b.id ? $('#' + b.id) : null;
        if (!bolum) return;
        var bas = $('.baslik', bolum);
        if (!bas) return;
        var h2 = $('h2', bas), aciklama = $('p', bas);
        if (h2 && b.h2) h2.textContent = b.h2;
        if (aciklama && b.aciklama) aciklama.textContent = b.aciklama;
      });
    }
    if (v.kartlar) {
      SEKME.forEach(function (s) {
        if (s === 'olaylar' || !Array.isArray(v.kartlar[s])) return;
        var bolum = $('#' + s);
        if (!bolum) return;
        $$('.grup', bolum).forEach(function (g) { g.remove(); });
        $$('.kartlar', bolum).forEach(function (g) { g.remove(); });
        v.kartlar[s].forEach(function (grup) {
          var kartlar = Array.isArray(grup) ? { kartlar: grup } : grup;
          if (!kartlar || !Array.isArray(kartlar.kartlar)) return;
          if (kartlar.baslik) {
            var g = el('div', { class: 'grup' }, [el('span', { class: 'g-ikon', text: kartlar.ikon || '' }), el('span', { class: 'g-yazi', text: kartlar.baslik })]);
            if (kartlar.adet) g.appendChild(el('span', { class: 'adet', text: kartlar.adet }));
            g.appendChild(el('div', { class: 'cizgi' }));
            bolum.appendChild(g);
          }
          var kap = el('div', { class: 'kartlar' });
          kartlar.kartlar.forEach(function (o) {
            var e = ETIKET.filter(function (x) { return x.sinif === o.tur; })[0] || ETIKET[1];
            var k = kartBlogu(e, o.sira ? o.sira : null, o.tur);
            var h = $('h4', k);
            h.textContent = o.baslik || '';
            if (o.adis) h.appendChild(el('span', { class: 'adis', text: o.adis }));
            if (o.lokal) k.insertBefore(el('div', { class: 'lokal', text: o.lokal }), $('.not', k));
            if (o.kopya) k.insertBefore(el('div', { class: 'kopya', text: o.kopya }), $('.not', k));
            $('.not', k).textContent = o.aciklama || '';
            veriOzellikUygula(k, o);
            kap.appendChild(k);
          });
          bolum.appendChild(kap);
        });
      });
    }
    siraYenile();
    serbestMetinleriUygula(v);
    sunumYenile();
    if (mod) { alanlariIsaretle(document); ekleDugmeleri(); detayDugmeleri(); blokDugmeleri(); }
  }

  /* ---------------- GitHub kaydetme ---------------- */
  function dosyaYolu() { return 'veri/' + SLUG + '.json'; }
  /* Sunucuda kayitli yama (yoksa null) */
  function mevcutYama() {
    return gh(GH_API + '/repos/' + DEPO + '/contents/' + dosyaYolu() + '?ref=' + encodeURIComponent(DAL_KAYDET), { headers: { Accept: 'application/vnd.github.raw' } })
      .then(function (r) {
        if (!r.ok) return null;
        return r.json().then(function (v) { return v && v.surum ? v : null; }).catch(function () { return null; });
      })
      .catch(function () { return null; });
  }
  function mevcutSha(ur, dal) {
    return gh(ur + '?ref=' + encodeURIComponent(dal)).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('SHA alınamadı (HTTP ' + r.status + ').');
      return r.json();
    });
  }
  function yazGitHub(dal, icerik, sha, geriKalan) {
    var govde = {
      message: 'veri: ' + SLUG + ' sayfasini guncelle',
      content: btoa(unescape(encodeURIComponent(icerik))),
      branch: dal
    };
    if (sha) govde.sha = sha;
    return gh(GH_API + '/repos/' + DEPO + '/contents/' + dosyaYolu(), { method: 'PUT', body: JSON.stringify(govde) })
      .then(function (r) {
        /* 409 = sunucudaki sha degismis, yeniden denenir.
           422 = dogrulama hatasi; tekrar denemek anlamsiz, GitHub'in
           mesaji oldugu gibi gosterilir. */
        if (r.status === 409) {
          if (geriKalan <= 0) {
            return r.json().catch(function () { return {}; }).then(function (h) {
              throw new Error('Sunucudaki dosya değişmiş. Lütfen tekrar deneyin.' + (h && h.message ? ' GitHub: ' + h.message : ''));
            });
          }
          return mevcutSha(GH_API + '/repos/' + DEPO + '/contents/' + dosyaYolu(), dal)
            .then(function (y) { return yazGitHub(dal, icerik, y ? y.sha : null, geriKalan - 1); });
        }
        if (!r.ok) {
          return r.json().catch(function () { return {}; }).then(function (h) {
            var n = (h && h.message) || ('HTTP ' + r.status);
            throw new Error(r.status === 422 ? 'Sunucu kaydı reddetti: ' + n : 'Kayıt başarısız: ' + n);
          });
        }
        return r.json();
      });
  }
  /* ---------------- yama (yalnizca degisiklikler) ---------------- */
  function esit(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function farkNesne(temel, yeni) {
    var f = {};
    Object.keys(yeni || {}).forEach(function (k) {
      if (esit(temel ? temel[k] : undefined, yeni[k])) return;
      f[k] = yeni[k];
    });
    return f;
  }
  /* Liste farki: uzunluk ayniysa yalnizca degisen ogeler yazilir (null = degismedi),
     uzunluk degistiyse liste tamamen yazilir (silme de bu yolla kaydedilir). */
  function farkListe(temel, yeni) {
    if (!Array.isArray(yeni)) return undefined;
    if (!Array.isArray(temel) || temel.length !== yeni.length) return yeni;
    var f = yeni.map(function (o, i) { return esit(temel[i], o) ? null : o; });
    return f.some(function (x) { return x !== null; }) ? f : undefined;
  }
  function farkGrup(temel, yeni) {
    if (!Array.isArray(yeni)) return undefined;
    if (!Array.isArray(temel) || temel.length !== yeni.length) return yeni;
    var f = yeni.map(function (g, i) {
      var t = temel[i] || {};
      var y = { baslik: g.baslik, ikon: g.ikon, adet: g.adet, kartlar: farkListe(t.kartlar, g.kartlar) };
      if (esit(t.baslik, y.baslik) && esit(t.ikon, y.ikon) && esit(t.adet, y.adet) && !y.kartlar) return null;
      if (y.kartlar === undefined) delete y.kartlar;
      return y;
    });
    return f.some(function (x) { return x !== null; }) ? f : undefined;
  }
  function farkVeri(temel, yeni) {
    var f = { surum: 2, slug: SLUG };
    var ust = farkNesne(temel.ust, yeni.ust);
    if (Object.keys(ust).length) f.ust = ust;
    var bolum = (yeni.bolumler || []).filter(function (b) {
      var t = (temel.bolumler || []).filter(function (x) { return x.id === b.id; })[0];
      return !t || t.h2 !== b.h2 || t.aciklama !== b.aciklama;
    });
    if (bolum.length) f.bolumler = bolum;
    var olay = farkListe(temel.olaylar, yeni.olaylar);
    if (olay) f.olaylar = olay;
    Object.keys(yeni.kartlar || {}).forEach(function (s) {
      var g = farkGrup((temel.kartlar || {})[s], yeni.kartlar[s]);
      if (g) { f.kartlar = f.kartlar || {}; f.kartlar[s] = g; }
    });
    var tm = (yeni.metin || []).filter(function (m) {
      var t = (temel.metin || []).filter(function (x) { return x.yol === m.yol; })[0];
      return !t || t.deger !== m.deger;
    });
    if (tm.length) f.metin = tm;
    return f;
  }
  /* Yama + taban birlestirme: HTML tabani uzerine yama uygulanir */
  function birlestir(temel, yama) {
    var v = JSON.parse(JSON.stringify(temel));
    if (!yama) return v;
    if (yama.ust) Object.keys(yama.ust).forEach(function (k) { v.ust[k] = yama.ust[k]; });
    if (Array.isArray(yama.bolumler)) yama.bolumler.forEach(function (b) {
      var t = (v.bolumler || []).filter(function (x) { return x.id === b.id; })[0];
      if (!t) v.bolumler = (v.bolumler || []).concat([b]);
      else { if (b.h2 !== undefined) t.h2 = b.h2; if (b.aciklama !== undefined) t.aciklama = b.aciklama; }
    });
    if (Array.isArray(yama.olaylar)) {
      v.olaylar = yama.olaylar.length === v.olaylar.length
        ? yama.olaylar.map(function (o, i) { return o === null ? v.olaylar[i] : o; })
        : yama.olaylar;
    }
    if (yama.kartlar) Object.keys(yama.kartlar).forEach(function (s) {
      var yamaGruplar = yama.kartlar[s];
      if (!Array.isArray(yamaGruplar)) return;
      var tabanGruplar = v.kartlar[s] || [];
      if (yamaGruplar.length !== tabanGruplar.length) { v.kartlar[s] = yamaGruplar; return; }
      v.kartlar[s] = yamaGruplar.map(function (g, i) {
        if (g === null) return tabanGruplar[i];
        var t = tabanGruplar[i] || { baslik: '', ikon: '', adet: '', kartlar: [] };
        var c = { baslik: g.baslik !== undefined ? g.baslik : t.baslik, ikon: g.ikon !== undefined ? g.ikon : t.ikon, adet: g.adet !== undefined ? g.adet : t.adet, kartlar: t.kartlar || [] };
        if (Array.isArray(g.kartlar)) {
          c.kartlar = g.kartlar.length === (t.kartlar || []).length
            ? g.kartlar.map(function (o, j) { return o === null ? t.kartlar[j] : o; })
            : g.kartlar;
        }
        return c;
      });
    });
    // serbest metin yamasi: yola gore birlestirilir
    if (Array.isArray(yama.metin)) {
      var m = {};
      (v.metin || []).forEach(function (x) { m[x.yol] = x; });
      yama.metin.forEach(function (x) { m[x.yol] = x; });
      v.metin = Object.keys(m).map(function (k) { return m[k]; });
    }
    return v;
  }

  /* Kaydedilmis yama ile yeni yamayi birlestirir: sunucudaki baska
     duzenlemeler korunur, yalnizca ayni alanlarin uzerine yazilir. */
  function yamaBirlestir(eski, yeni) {
    if (!eski) return yeni;
    if (!yeni) return eski;
    var b = JSON.parse(JSON.stringify(eski));
    b.slug = yeni.slug;
    if (yeni.ust) b.ust = Object.assign({}, b.ust || {}, yeni.ust);
    if (yeni.bolumler) b.bolumler = (b.bolumler || []).map(function (x) {
      var y = yeni.bolumler.filter(function (z) { return z.id === x.id; })[0];
      return y ? { id: x.id, h2: y.h2, aciklama: y.aciklama } : x;
    }).concat(yeni.bolumler.filter(function (y) {
      return !(b.bolumler || []).some(function (x) { return x.id === y.id; });
    }));
    if (yeni.olaylar) b.olaylar = yeni.olaylar;
    if (yeni.metin) {
      var m = {};
      (b.metin || []).forEach(function (x) { m[x.yol] = x; });
      yeni.metin.forEach(function (x) { m[x.yol] = x; });
      b.metin = Object.keys(m).map(function (k) { return m[k]; });
    }
    if (yeni.kartlar) {
      b.kartlar = b.kartlar || {};
      Object.keys(yeni.kartlar).forEach(function (s) {
        var y = yeni.kartlar[s], e = b.kartlar[s];
        if (!Array.isArray(e)) { b.kartlar[s] = y; return; }
        if (y.length !== e.length) { b.kartlar[s] = y; return; }
        b.kartlar[s] = y.map(function (g, i) {
          if (g === null) return e[i];
          if (!g) return e[i];
          var t = e[i] || { baslik: '', ikon: '', adet: '', kartlar: [] };
          var c = { baslik: g.baslik !== undefined ? g.baslik : t.baslik, ikon: g.ikon !== undefined ? g.ikon : t.ikon, adet: g.adet !== undefined ? g.adet : t.adet };
          if (Array.isArray(g.kartlar)) {
            c.kartlar = g.kartlar.length === (t.kartlar || []).length
              ? g.kartlar.map(function (o, j) { return o === null ? t.kartlar[j] : o; })
              : g.kartlar;
          } else c.kartlar = t.kartlar;
          return c;
        });
      });
    }
    return b;
  }

  /* ---------------- JSON kaydetme ---------------- */
  function kaydetPenceresi() {
    /* Karsilastirma tabani ham HTML degil, sunucudaki yamanin uygulanmis
       hali olmali. Aksi halde yama icinden eklenip sonra silinen bir blok
       HTML tabanina dondugu icin fark bos kaliyor ve silme "degisiklik
       bulunamadi" diye reddediliyor. */
    var yuklenen = window.Duzenle && window.Duzenle.veri ? window.Duzenle.veri : null;
    var yama = farkVeri(yuklenen || TEMEL, serilestir());
    var sayi = (yama.olaylar || []).filter(Boolean).length;
    if (yama.ust) sayi += Object.keys(yama.ust).length;
    if (yama.bolumler) sayi += yama.bolumler.length;
    if (yama.metin) sayi += yama.metin.length;
    Object.keys(yama.kartlar || {}).forEach(function (s) {
      (yama.kartlar[s] || []).forEach(function (g) {
        if (!g) return;
        if (Array.isArray(g)) g.forEach(function (x) { if (x) sayi++; });
        else if (Array.isArray(g.kartlar)) sayi += g.kartlar.filter(Boolean).length;
      });
    });
    var baslik = sayi ? sayi + ' değişiklik kaydedilecek.' : 'Değişiklik bulunamadı.';
    var durum = el('div', { class: 'dz-durum' });
    var kutu = el('div', {}, [
      el('h2', { text: 'Değişiklikleri kaydet' }),
      el('p', { class: 'aciklama', text: baslik + ' Yalnızca değişen alanlar yazılır. Dosya: veri/' + SLUG + '.json → branch: ' + DAL_KAYDET + '.' }),
      durum
    ]);
    var onay = el('button', { class: 'ana tehlike', text: 'Evet, kaydet' });
    var iptal = el('button', { text: 'Vazgeç' });
    kutu.appendChild(el('div', { class: 'dz-sira' }, [iptal, onay]));
    var perde = pencere(kutu);
    iptal.addEventListener('click', function () { perde.remove(); });
    onay.addEventListener('click', function () {
      onay.disabled = true; iptal.disabled = true;
      durum.className = 'dz-durum'; durum.textContent = 'Kaydediliyor…';
      var yol = GH_API + '/repos/' + DEPO + '/contents/' + dosyaYolu();
      var sonIcerik = null;
      var gonder = function (deneme) {
        // once sunucudaki yamayi oku, yeni yamayi onun uzerine birlestir
        return mevcutYama().then(function (sunucuYama) {
          var icerik = JSON.stringify(yamaBirlestir(sunucuYama, yama), null, 2);
          sonIcerik = icerik;
          return mevcutSha(yol, DAL_KAYDET).then(function (y) {
            return yazGitHub(DAL_KAYDET, icerik, y ? y.sha : null, deneme);
          });
        });
      };
      gonder(3).then(function () {
        kirli = false;
        /* Kaydedilen yama artik taban; sonraki kaydetmeler buna gore fark alir */
        try {
          window.Duzenle.yama = JSON.parse(sonIcerik);
          window.Duzenle.veri = birlestir(TEMEL, window.Duzenle.yama);
        } catch (e) {}
        var d = $('#dzKaydet'); if (d) d.classList.remove('kirli');
        durum.className = 'dz-durum iyi';
        durum.textContent = 'Kaydedildi: veri/' + SLUG + '.json → ' + DAL_KAYDET + '. Yayın 1-2 dakika içinde görünecek.';
        onay.disabled = true;
        try { sessionStorage.setItem('dz_bekleyen', SLUG); } catch (e) {}
        setTimeout(function () { perde.remove(); }, 1400);
        bildir('Kaydedildi: veri/' + SLUG + '.json → ' + DAL_KAYDET + ' branch. Yayın 1-2 dakika içinde.', 'iyi', {
          metin: 'Sayfayı yenile',
          tikla: function () { location.reload(); }
        });
      }).catch(function (h) {
        onay.disabled = false; iptal.disabled = false;
        durum.className = 'dz-durum hata'; durum.textContent = h.message || 'Kaydedilemedi.';
      });
    });
  }

  /* ---------------- mod ac/kapa ---------------- */
  function modAc() {
    mod = true;
    document.body.classList.add('dz-mod');
    var d = $('#dzAc'); if (d) d.classList.add('aktif');
    alanlariIsaretle(document);
    ekleDugmeleri();
    detayDugmeleri();
    blokDugmeleri();
    var k = $('#dzKaydet'); if (k) k.classList.remove('dz-gizli');
  }
  function modKapa() {
    mod = false;
    document.body.classList.remove('dz-mod');
    var d = $('#dzAc'); if (d) d.classList.remove('aktif');
    $$('[contenteditable]').forEach(function (a) { a.removeAttribute('contenteditable'); });
    $$('.dz-ekle').forEach(function (b) { b.remove(); });
    $$('.dz-detay').forEach(function (b) { b.remove(); });
    $$('.dz-sil').forEach(function (b) { b.remove(); });
    var k = $('#dzKaydet'); if (k) k.classList.add('dz-gizli');
  }

  /* ---------------- arayuz ---------------- */
  function arayuz() {
    var ac = el('button', { class: 'dz-ac', id: 'dzAc', type: 'button', title: 'Sayfayı düzenle', 'aria-label': 'Sayfayı düzenle', text: '✎' });
    var kaydet = el('button', { class: 'dz-kaydet dz-gizli', id: 'dzKaydet', type: 'button' }, [
      el('span', { class: 'dz-nokta' }), el('span', { text: 'Kaydet' })
    ]);
    ac.addEventListener('click', function () {
      if (mod) { modKapa(); return; }
      if (tokenOku()) {
        tokenDogrula(tokenOku()).then(function () { tokenYaz(tokenOku()); modAc(); bildir('Düzenleme modu açıldı.', 'bilgi'); })
          .catch(function () { tokenYaz(''); tokenPenceresi(); });
      } else tokenPenceresi();
    });
    kaydet.addEventListener('click', function () { kaydetPenceresi(); });
    document.body.appendChild(ac);
    document.body.appendChild(kaydet);
  }

  /* ---------------- girdi olaylari ---------------- */
  function olaylar() {
    yapistirTemizle();
    document.addEventListener('input', function (e) {
      var a = e.target;
      if (!a.closest || !a.closest('[contenteditable]')) return;
      if (!mod) return;
      if (a.classList.contains('z-kat')) {
        var e2 = etiketBul(a.textContent);
        var kap = a.closest('.z-item, .kart.blg, .z-kart');
        if (e2 && kap) sinifDegistir(kap, e2);
      }
      if (a.classList.contains('z-tarih') && !a.querySelector('.h')) {
        a.textContent = duzenli(a.textContent);
      }
      kirliIsaretle();
      sunumYenile();
    }, true);
    // mevcut kart acma davranisini durdur
    document.addEventListener('click', function (e) {
      if (!mod) return;
      var k = e.target.closest && e.target.closest('.kart.blg');
      if (k && !e.target.closest('[contenteditable]') && !e.target.closest('.dz-ekle')) e.preventDefault();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (!mod) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); kaydetPenceresi(); }
    });
  }

  /* ---------------- JSON yukleme ---------------- */
  function yamaUygula(yama, dal) {
    // surum 1 = tam veri, surum 2 = yama (HTML tabani uzerine)
    var veri = yama.surum >= 2 ? birlestir(TEMEL, yama) : yama;
    uygula(veri);
    window.Duzenle.veri = veri;
    window.Duzenle.yama = yama;
    window.Duzenle.temel = function () { return TEMEL; };
    bildir('Sayfa verisi yüklendi: ' + dal, 'bilgi');
  }
  /* Kaydedilen dosya GitHub Pages derlendikten sonra gorunur; sayfa
     hemen yenilenirse 404 alinir. Bu durumda kisa surede tekrar dener. */
  function bekleyenKayitVar() { return sessionStorage.getItem('dz_bekleyen') === SLUG; }
  function bekleyenTemizle() { sessionStorage.removeItem('dz_bekleyen'); }
  function bekleyenBekle() {
    var kalan = 24;   // ~2 dakika, 5 saniyede bir
    bildir('Kaydınız yayınlanıyor, sayfa kendiliğinden yenilenecek…', 'bilgi');
    (function dene() {
      if (kalan-- <= 0) { bekleyenTemizle(); bildir('Yayın hâlâ hazır değil. Sayfayı birazdan yenileyin.', 'hata'); return; }
      fetch(GH_RAW + DAL_OKU[0] + '/' + dosyaYolu() + '?t=' + Date.now())
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (yama) {
          if (yama && yama.surum) { bekleyenTemizle(); yamaUygula(yama, DAL_OKU[0] + ' (yeni kayıt)'); return; }
          setTimeout(dene, 5000);
        })
        .catch(function () { setTimeout(dene, 5000); });
    })();
  }
  function jsonYukle() {
    var i = 0;
    function dene() {
      if (i >= DAL_OKU.length) {
        if (bekleyenKayitVar()) bekleyenBekle();
        return;
      }
      var dal = DAL_OKU[i++];
      fetch(GH_RAW + dal + '/' + dosyaYolu() + '?t=' + Date.now())
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (yama) {
          if (!yama || !yama.surum) return dene();
          bekleyenTemizle();
          yamaUygula(yama, dal);
        })
        .catch(function () { dene(); });
    }
    dene();
  }

  /* ---------------- baslat ---------------- */
  function baslat() {
    // HTML tabani: yama bu tabanin uzerine hesaplanir
    TEMEL = serilestir();
    arayuz();
    olaylar();
    tokenYaz(tokenOku());
    jsonYukle();
  }

  window.Duzenle = {
    serilestir: serilestir, uygula: uygula, modAc: modAc, modKapa: modKapa,
    ekleDugmeleri: ekleDugmeleri, kirli: function () { return kirli; },
    farkVeri: farkVeri, birlestir: birlestir, temel: function () { return TEMEL; },
    slug: SLUG, dal: DAL_KAYDET, etiket: ETIKET, veri: null, yama: null
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baslat);
  else baslat();
})();
