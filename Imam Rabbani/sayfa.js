  const tabBar = document.getElementById('tabBar');
  const sekmeler = document.querySelectorAll('.sekme');

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

  /* Olaylar — lejant çipleriyle filtre */
  const lejant = document.getElementById('lejant');
  if (lejant) {
    const zamanKartlari = [...document.querySelectorAll('#olaylar .z-item')];
    const eseriVar = z => z.querySelector('.z-kitap') !== null;
    lejant.addEventListener('click', e => {
      const chip = e.target.closest('span[data-kat]');
      if (!chip) return;
      const kat = chip.dataset.kat;
      const zatenAktif = chip.classList.contains('aktif');
      lejant.querySelectorAll('span[data-kat]').forEach(s => s.classList.remove('aktif'));
      if (kat === 'tumu' || zatenAktif) {
        zamanKartlari.forEach(z => z.classList.remove('gizli'));
        lejant.querySelector('span[data-kat="tumu"]').classList.add('aktif');
        return;
      }
      chip.classList.add('aktif');
      zamanKartlari.forEach(z => {
        const uygun = kat === 'c-ilim' ? (z.classList.contains('c-ilim') || z.classList.contains('c-tasavvuf'))
                   : kat === 'c-eser' ? (z.classList.contains('c-eser') || eseriVar(z))
                   : z.classList.contains(kat);
        z.classList.toggle('gizli', !uygun);
      });
    });
  }

  /* Olaylar — Kitaplar başlığına adet */
  document.querySelectorAll('#olaylar .z-kitap').forEach(k => {
    const n = k.querySelectorAll('a.kitap-link').length;
    if (n > 1) {
      const bas = k.querySelector('.kitap-bas');
      if (bas) bas.textContent = bas.textContent + ' (' + n + ')';
    }
  });

  /* Eserler — detay göster/gizle */
  const eserlerSec = document.getElementById('eserler');
  if (eserlerSec) {
    document.querySelectorAll('#eserler .detay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#eserler .detay-btn').forEach(b => b.classList.toggle('aktif', b === btn));
        eserlerSec.classList.toggle('kapali', btn.dataset.durum === 'kapali');
      });
    });
  }

  /* Kişiler ve Eserler — adlar link gibi, tıklayınca bilgi kutusu */
  const blgUst = document.getElementById('blgUst');
  const blgPop = document.getElementById('blgPop');
  const blgBaslik = document.getElementById('blgBaslik');
  const blgTur = document.getElementById('blgTur');
  const blgTarih = document.getElementById('blgTarih');
  const blgGrup = document.getElementById('blgGrup');
  const blgOnemli = document.getElementById('blgOnemli');
  const blgMetin = document.getElementById('blgMetin');
  const blgDetay = document.getElementById('blgDetay');
  const satirTur = blgTur;
  const satirTarih = document.getElementById('satirTarih');
  const satirGrup = document.getElementById('satirGrup');
  const satirOnemli = document.getElementById('satirOnemli');
  const satirMetin = document.getElementById('satirMetin');
  const satirDetay = document.getElementById('satirDetay');

  const ESER_TUR = {
    'İs̱bâtü\'n-nübüvve': 'Arapça · Kelâm / Nübüvvet Savunması',
    'Teʾyîd-i Ehli\'s-sünne': 'Farsça · Reddiye (Şîa)',
    'Mektûbât': 'Farsça · Mecmûa (536 mektup)',
    'Mükâşefât-ı Ġaybiyye': 'Farsça · Tasavvuf',
    'Ḥavâşî ve Taʿlîḳāt ber Şerḥ-i Rubâʿiyyât-ı Ḫâce Bâḳī-Billâh': 'Haşiye · Şerh',
    'Maʿârif-i Ledünniyye': 'Arapça · Tasavvuf',
    'Mebdeʾ ü Meʿâd': 'Farsça · Tasavvuf / Âşık-nâme',
    'Risâle-i Tehlîliyye': 'Farsça · Risâle (kelime-i tevhîd)'
  };

  const ESER_ONEMLI = {
    'İs̱bâtü\'n-nübüvve': 'Agra döneminde kaleme aldığı ilk eseri; Ekber\'in "Dîn-i İlâhî" senkretizmine ve peygamberliği inkâra varan cereyanlara karşı nübüvvetin gerekliliğini savunur.',
    'Teʾyîd-i Ehli\'s-sünne': 'Redd-i Revâfıż adıyla da bilinir; Şîa\'ya reddiye. Şâh İsmâʿîl-i Sâfî\'nin Şîa\'yı hâkim kılmaya çalıştığı dönemde İran\'dan sünnî bölgelere (Anadolu ve Mâverâünnehir) yayılan Şîa akımına karşı yazıldı.',
    'Mektûbât': 'Üç cilt, 536 mektup; I. cilt 1616/1025, II. cilt 1619/1028, III. cilt ölümünden sonra derlendi. En meşhur eseridir; kalem ehli ile halkın feyz bulduğu bir dini-ilmî mecmuadır.',
    'Mükâşefât-ı Ġaybiyye': 'Karaçi 1965/1384.',
    'Ḥavâşî ve Taʿlîḳāt ber Şerḥ-i Rubâʿiyyât-ı Ḫâce Bâḳī-Billâh': 'Şeyhi Bâkī-Billâh\'ın rubâîlerinin şerhi üzerine haşiye ve taʿlîkat; Karaçi 1966/1386.',
    'Maʿârif-i Ledünniyye': 'Rabbânî ilimler; vahdet-i vücûd-tevhid ilişkisini ele alır. Karaçi 1968/1388.',
    'Mebdeʾ ü Meʿâd': 'Âşık-nâme adıyla da bilinir; sülûk ve seyrüseferin başlangıç ve sonuçlarını anlatır. Karaçi 1983/1403.',
    'Risâle-i Tehlîliyye': 'Kelime-i tevhîdin içerdiği mânalara dair risâle. Karaçi 1983/1403.'
  };

  const DERIN_METIN = {
    'dogum': 'İmâm-ı Rabbânî, 1564 (971) yılında Aşûrâ gününde Hindistan\'ın Serhend beldesinde doğdu; Hâşiʻ kelimesi ebced hesabıyla bu tarihi gösterir. İsmi Ahmed, babasının ismi Abdülehad, dedesinin ismi Zeynelâbidîn\'dir. Lâkabı Bedrüddîn, künyesi Ebu\'l-Berekât\'tır. Nesli 28. batında Hazret-i Ömer\'e (r.a.) ulaşır.',
    'imam-rabbani': 'Muhammed Bâkîbillâh Hazretleri kendisine "İmâm-ı Rabbânî" ismini vermişlerdir ve daha çok "İmâm-ı Rabbânî" ismiyle bilinir. Hicrî ikinci bin yılın müceddidi (yenileyicisi) olmasından dolayı "Müceddid-i Elf-i Sânî" denilmiştir ki bu vasıfla ilk defa, Hindistan ulemâsından Abdülhakîm Siyalkûtî Hazretleri tavsîf etmiştir. Ahkâm-ı İslâmiyye ve tasavvufu birleştirmesinden dolayı da birleştirici mânâsında "Sıla" ismi verilmiştir. Hazret-i Ömer\'in (r.a.) neslinden geldiği için "Fârûkî" diye anılmış, Serhend şehrinden olduğu için de oraya nisbetle "Serhendî" denilmiştir. Hanefî mezhebindendir.',
    'vahdet': 'İlk başta tamamen bağlı olduğu vahdet-i vücûd anlayışını aşarak zılliyyet (varlığın Hak\'a nisbeti itibariyle gölge oluşu) ve nihayet abdiyet (kulluk) makamına geçti; vahdet-i şühûd\'un, hakîkatin daha isabetli bir ifadesi olduğunu savundu. Buna göre Hak ile kul arasında zât bakımından bir birlik değil, bir tecellî ve nisbet münasebeti vardır. Bu anlayışı sıddîkıyyet mertebesi ve "müceddid-i elf-i sânî" vasfıyla birleştirdi. Tarikatı şeriatin hizmetçisi saydı; nübüvvetin velâyetten üstün olduğunu ve silsilesinin Hazret-i Ebû Bekir\'e (r.a.) dayandığını vurguladı. Hicrî II. binyılın başında, Ebû Dâvûd\'un "her yüz yıl başında bir müceddid gelir" hadisi mânâsında müceddid görüşünü geliştirdi.',
    'esaret': 'Bâbürlü Hükümdarı Cihangir, mânevî makamının yüksekliğine ve sülûk esnasında ilk üç halifeyi (Hazret-i Ebû Bekir, Hazret-i Ömer, Hazret-i Osman) geride bıraktığına dair iddiaları dolayısıyla onu 1619 (1028) yılında sorgulanmak üzere Agra\'ya çağırttı; tatmin olmayınca Gevâliyâr (Gwalior) kalesinde hapsettirdi. Yaklaşık bir yıl sonra serbest bırakıldı; bu hâlini, kahr sıfatının tecellîsini tamamlayan celâl sıfatının tecellîsi olarak yorumladı. Daha sonra sultanın sarayında İslâm\'ın prensiplerinden "bir kıl kadar bile" ayrılmadan sohbetlerde bulundu.',
    'vefat': 'İmâm-ı Rabbânî Hazretleri 1624 (28 Safer 1034) tarihinde 63 yaşında oldukları halde Serhend\'de âhirete irtihâl ettiler. Kabr-i şerifleri, bugün Hindistan hududları içerisinde olan Pencap eyaletine bağlı Serhend\'dedir.',
    'isbatun-nubuvve': 'Agra yıllarında kaleme aldığı ilk eseri; Bâbürlü hükümdarı Ekber Şah\'ın "Dîn-i İlâhî" adlı senkretik telakkisine karşı, kendisince peygamberliğin gerekliliğini şüpheye düşüren akılcı felsefî cereyana (Ebü\'l-Fazl\'ın yaklaşımı gibi) nübüvvetin lüzumunu Arapça olarak savunur.',
    'teyid': 'Teʾyîd-i Ehli\'s-sünne (Redd-i Revâfıż) adlı reddiyesini, Şâh İsmâʿîl-i Sâfî\'nin İmâmiyye\'yi hâkim kıldığı dönemde İran\'dan sünnî bölgelere (Anadolu ve Mâverâünnehir) yayılan Şîa akımına karşı yazdı; dört halifenin fazileti ve sünnî telakkiler savunulur.',
    'mektubat': 'Mektûbât, üç cilt hâlinde 536 mektubu toplar; I. cilt 1616 (1025), II. cilt 1619 (1028) yılında derlendi, III. cilt ölümünden sonra tamamlandı. Temelini, şeyhi Bâkī-Billâh ile yaptığı yazışmalar (26 mektup) oluşturur. Müridlerin istifadeleri için istiğrak hâlindeyken kaleme alınan bu yazışmalar, kalem ehli ile halkın feyz bulduğu bir dinî-ilmî mecmuadır.',
    'maarif': 'Rabbânî ilimlere dairdir; başta vahdet-i vücûd ile tevhid münasebeti olmak üzere hakîkat ehli için gerekli mânevî meseleleri ele alır.'
  };

  function eserBilgi(kart) {
    const h4 = kart.querySelector('h4');
    const ad = h4 ? h4.textContent.trim().toLowerCase().replace(/\s+/g, ' ') : '';
    let tur = '', onemli = '';
    for (const [k, v] of Object.entries(ESER_TUR)) {
      if (ad === k.toLowerCase().replace(/\s+/g, ' ') || ad.startsWith(k.toLowerCase().replace(/\s+/g, ' '))) { tur = v; break; }
    }
    for (const [k, v] of Object.entries(ESER_ONEMLI)) {
      if (ad === k.toLowerCase().replace(/\s+/g, ' ') || ad.startsWith(k.toLowerCase().replace(/\s+/g, ' '))) { onemli = v; break; }
    }
    return { tur, onemli };
  }

  function blgKapat() {
    blgUst.classList.add('hidden');
    blgPop.classList.add('hidden');
  }

  function blgAc(kart) {
    const h4 = kart.querySelector('h4');
    if (!h4) return;
    blgBaslik.innerHTML = h4.innerHTML;
    const bilgi = eserBilgi(kart);
    const zItem = kart.closest('.z-item');
    const zTarih = zItem ? zItem.querySelector('.z-tarih') : null;
    const kop = kart.querySelector('.kopya') || zTarih;
    if (bilgi.tur) { blgTur.textContent = bilgi.tur; blgTur.classList.remove('hidden'); }
    else blgTur.classList.add('hidden');
    if (kop && kop.textContent.trim()) { blgTarih.textContent = kop.textContent.trim(); satirTarih.classList.remove('hidden'); }
    else satirTarih.classList.add('hidden');
    const sec = kart.closest('section');
    let grup = '';
    if (sec) {
      sec.querySelectorAll('.grup .g-yazi').forEach(g => {
        if (kart.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING) grup = g.textContent.trim();
      });
    }
    if (!grup && sec && sec.id === 'olaylar') {
      const kat = kart.querySelector('.z-bas .z-kat');
      if (kat) grup = kat.textContent.trim();
    }
    if (grup && !bilgi.tur) { blgGrup.textContent = grup; satirGrup.classList.remove('hidden'); }
    else satirGrup.classList.add('hidden');
    if (bilgi.onemli) { blgOnemli.textContent = bilgi.onemli; satirOnemli.classList.remove('hidden'); }
    else satirOnemli.classList.add('hidden');
    const nt = kart.querySelector('.not, p');
    if (nt && nt.textContent.trim()) { blgMetin.textContent = nt.textContent.trim(); satirMetin.classList.remove('hidden'); }
    else satirMetin.classList.add('hidden');
    const dk = kart.dataset.derin;
    if (dk && DERIN_METIN[dk]) { blgDetay.textContent = DERIN_METIN[dk]; satirDetay.classList.remove('hidden'); }
    else satirDetay.classList.add('hidden');
    blgUst.classList.remove('hidden');
    blgPop.classList.remove('hidden');
  }

  const eserKartlari = [...document.querySelectorAll('#eserler .kart')].map(k => {
    const h4 = k.querySelector('h4');
    return { el: k, ad: h4 ? h4.textContent.trim().toLowerCase().replace(/\s+/g, ' ') : '' };
  });
  function eserBul(ad) {
    const n = ad.trim().toLowerCase().replace(/\s+/g, ' ');
    return eserKartlari.find(e => e.ad === n || e.ad.startsWith(n)) || null;
  }

  const kisiKartlari = [...document.querySelectorAll('#kisiler .kart')].map(k => {
    const h4 = k.querySelector('h4');
    const adis = h4 ? h4.querySelector('.adis') : null;
    return {
      el: k,
      ad: h4 ? h4.textContent.trim().toLowerCase().replace(/\s+/g, ' ') : '',
      adis: adis ? adis.textContent.trim().replace(/^\|\s*/, '').toLowerCase().replace(/\s+/g, ' ') : ''
    };
  });
  function kisiBul(ad) {
    const n = ad.trim().toLowerCase().replace(/\s+/g, ' ');
    return kisiKartlari.find(k => k.adis && k.adis === n) ||
           kisiKartlari.find(k => k.ad === n) ||
           kisiKartlari.find(k => k.ad.includes(n)) || null;
  }

  document.querySelectorAll('a.kitap-link').forEach(a => {
    a.addEventListener('click', e => {
      e.stopPropagation();
      const k = eserBul(a.dataset.ad);
      if (k) blgAc(k.el);
    });
  });
  document.querySelectorAll('a.ad-link').forEach(a => {
    a.addEventListener('click', e => {
      e.stopPropagation();
      const k = kisiBul(a.dataset.ad);
      if (k) blgAc(k.el);
    });
  });
  document.querySelectorAll('.z-kart[data-derin], .kart.blg').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      blgAc(el);
    });
  });
  document.getElementById('blgKapat').addEventListener('click', blgKapat);
  blgUst.addEventListener('click', blgKapat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') blgKapat(); });
  const SUNUM_AYAR = { saniyeHarf: 0.053, enAz: 4, enCok: 22, basBekleme: 1000, sonBekleme: 2000, gecis: 2000 };

  const snEl = document.getElementById('sunum');
  if (snEl) {
    const snSlayt = document.getElementById('snSlayt');
    const snSahne = document.getElementById('snSahne'); const snZeta = document.getElementById('snZeta'); if (snZeta) { const snH1 = document.querySelector('header h1'); if (snH1) snZeta.innerHTML = snH1.innerHTML; }
    const snDolgu = document.getElementById('snDolgu');
    const snSayac = document.getElementById('snSayac');
    const snSure  = document.getElementById('snSure');
    const snGeri  = document.getElementById('snGeri');
    const snIleri = document.getElementById('snIleri');
    const snHizKutu = document.getElementById('snHiz');
    const snHizDugme = document.getElementById('snHizDugme');
    const snHizListe = document.getElementById('snHizListe');
    const snDuraklatBtn = document.getElementById('snDuraklat');
    const snOtoBtn = document.getElementById('snOto');
    const snKapat = document.getElementById('snKapat');

    const harfSay = el => ((el.textContent || '').match(/[\p{L}\p{N}]/gu) || []).length;

    const slaytlar = [...document.querySelectorAll('#olaylar .z-item')].map(z => {
      const kopya = z.cloneNode(true);
      kopya.removeAttribute('id');
      kopya.removeAttribute('data-derin');
      const dd = kopya.querySelector('.detay-d');
      if (dd) dd.remove();
      const sb = kopya.querySelector('.z-sunum-btn');
      if (sb) sb.remove();
      return { harf: harfSay(z), sure: 0, el: kopya };
    });

    slaytlar.forEach(s => {
      s.sure = Math.min(SUNUM_AYAR.enCok, Math.max(SUNUM_AYAR.enAz, Math.round(s.harf * SUNUM_AYAR.saniyeHarf)));
    });

    const sozSure = el => Math.min(SUNUM_AYAR.enCok, Math.max(SUNUM_AYAR.enAz, Math.round(harfSay(el) * SUNUM_AYAR.saniyeHarf)));
    const sozSlayt = k => {
      const el = document.createElement('div');
      el.className = 'z-item c-tasavvuf';
      el.innerHTML = '<div class="z-kart k-tasavvuf"><div class="z-icerik"><div class="z-bas"><h4></h4><span class="z-kat">💬 Söz</span></div><p></p></div><div class="z-konum"></div></div>';
      el.querySelector('h4').textContent = (k.querySelector('h4')?.textContent || 'Söz').trim();
      el.querySelector('p').textContent = (k.querySelector('.not')?.textContent || '').trim();
      el.querySelector('.z-konum').textContent = (k.querySelector('.kopya')?.textContent || 'Söz').trim();
      return el;
    };
    document.querySelectorAll('#sozler .kart').forEach(k => {
      const el = sozSlayt(k);
      slaytlar.push({ harf: harfSay(el), sure: sozSure(el), el });
    });

    let snIdx = 0, snDurakMi = false, snBitti = 0, snRaf = null, snKalan = 0, snHiz = 1;
    let snKelimeler = [], snToplamHarf = 0, snGectiIdx = -1, snSiraIdx = -1;
    let snOto = true, snBittiMi = false, snAktifEl = null;

    const snOkuma = () => slaytlar[snIdx].sure * 1000 / snHiz;
    const snBekleme = () => SUNUM_AYAR.basBekleme / snHiz;
    const snSonBekleme = () => SUNUM_AYAR.sonBekleme / snHiz;
    const snToplam = () => snOkuma() + snBekleme() + snSonBekleme();

    function snKelimeDoldur(kapsayici) {
      const kelimeler = [];
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
            kelimeler.push({ el: span, son: 0 });
          });
          t.parentNode.replaceChild(parca, t);
        });
      });
      let toplam = 0;
      kelimeler.forEach(k => { toplam += harfSay(k.el); k.son = toplam; });
      return { kelimeler, toplam };
    }

    function snIsaretle() {
      if (!snKelimeler.length) return;
      const gecen = snToplam() - snKalan - snBekleme();
      const oran = gecen <= 0 ? 0 : Math.min(1, gecen / snOkuma());
      const hedef = oran * snToplamHarf;
      let g = 0;
      while (g < snKelimeler.length && snKelimeler[g].son <= hedef) g++;
      const gecti = Math.min(g, snKelimeler.length);
      if (gecti !== snGectiIdx) {
        for (let i = 0; i < gecti; i++) snKelimeler[i].el.classList.add('sn-gecti');
        for (let i = gecti; i < snKelimeler.length; i++) snKelimeler[i].el.classList.remove('sn-gecti');
        snGectiIdx = gecti;
      }
      const sira = (gecen > 0 && gecti < snKelimeler.length) ? gecti : -1;
      if (sira !== snSiraIdx) {
        if (snSiraIdx >= 0) snKelimeler[snSiraIdx].el.classList.remove('sn-sira');
        if (sira >= 0) snKelimeler[sira].el.classList.add('sn-sira');
        snSiraIdx = sira;
      }
    }

    function snYazi() {
      if (snSayac) snSayac.textContent =(snIdx + 1) + ' / ' + slaytlar.length;
      snSure.textContent = '~' + Math.round(snToplam() / 1000) + ' sn · ' + slaytlar[snIdx].harf + ' harf';
    }

    function snOtoYazi() {
      snOtoBtn.textContent = snOto ? '⏭ Otomatik' : '⏭ Etkileşimli';
      snOtoBtn.classList.toggle('aktif', snOto);
      snOtoBtn.setAttribute('aria-pressed', String(snOto));
      snOtoBtn.title = snOto
        ? 'Geçişler otomatik — tıklayınca etkileşimliye döner'
        : 'Geçişler sizin kontrolünüzde — tıklayınca otomatik olur';
    }

    function snOlc() {
      const ic = snAktifEl;
      if (!ic) return;
      ic.style.transform = '';
      const st = getComputedStyle(snSahne); const hc = snSahne.clientHeight - (parseFloat(st.paddingTop) || 0) - (parseFloat(st.paddingBottom) || 0); const zh = snZeta ? snZeta.offsetHeight : 0; const ust = hc - zh * 2 - 26;
      const yuk = ic.scrollHeight;
      const olcek = (yuk > ust && ust > 0) ? Math.max(0.55, ust / yuk) : 1;
      ic.style.transform = olcek < 1 ? 'scale(' + olcek.toFixed(3) + ')' : ''; if (snZeta) snZeta.style.top = Math.max(0, Math.round((hc - ic.scrollHeight * olcek) / 2 - zh - 14)) + 'px';
    }

    function snCiz() {
      const eski = snAktifEl;
      const yari = SUNUM_AYAR.gecis / 2;
      const ic = document.createElement('div');
      ic.className = 'sn-ic';
      ic.style.opacity = '0';
      ic.appendChild(slaytlar[snIdx].el.cloneNode(true));
      if (eski) {
        eski.classList.add('sn-cikis');
        eski.style.opacity = '0';
        snSahne.classList.remove('sn-karanlik');
        void snSahne.offsetWidth;
        snSahne.classList.add('sn-karanlik');
        setTimeout(() => { if (eski.parentNode) eski.remove(); }, yari + 80);
        setTimeout(() => {
          if (snAktifEl !== ic) return;
          snSahne.classList.remove('sn-karanlik');
          ic.style.opacity = '1';
        }, yari);
      }
      snSlayt.appendChild(ic);
      snAktifEl = ic;
      const k = snKelimeDoldur(ic);
      snKelimeler = k.kelimeler;
      snToplamHarf = k.toplam;
      snGectiIdx = -1;
      snSiraIdx = -1;
      snBittiMi = false;
      snYazi();
      snGeri.disabled = snIdx === 0;
      snIleri.disabled = snIdx === slaytlar.length - 1;
      snKalan = snToplam();
      snBitti = performance.now() + snKalan;
      snDolgu.style.width = '0%';
      snOlc();
      if (!eski) requestAnimationFrame(() => { if (ic.style.opacity === '0') ic.style.opacity = '1'; });
    }

    function snDongu() {
      if (snRaf) cancelAnimationFrame(snRaf);
      snRaf = requestAnimationFrame(() => {
        snKalan = Math.max(0, snBitti - performance.now());
        const oran = Math.max(0, Math.min(1, 1 - snKalan / snToplam()));
        snDolgu.style.width = (oran * 100).toFixed(2) + '%';
        snIsaretle();
        if (snKalan <= 0) {
          if (!snOto) { snBittiMi = true; snDur(); return; }
          if (snIdx >= slaytlar.length - 1) { snDur(); return; }
          snIdx = snIdx + 1;
          snCiz();
        }
        snDongu();
      });
    }

    function snDur() {
      if (snDurakMi) return;
      snDurakMi = true;
      snKalan = Math.max(0, snBitti - performance.now());
      if (snRaf) cancelAnimationFrame(snRaf);
      snRaf = null;
      snDuraklatBtn.textContent = '▶ Devam';
      snDuraklatBtn.classList.add('aktif');
    }

    function snDevam() {
      if (!snDurakMi) return;
      snDurakMi = false;
      snDuraklatBtn.textContent = '⏸ Duraklat';
      snDuraklatBtn.classList.remove('aktif');
      if (snKalan <= 0) snKalan = snToplam();
      snBitti = performance.now() + snKalan;
      snDongu();
    }

    function snBaslat() {
      snDurakMi = false;
      snDuraklatBtn.textContent = '⏸ Duraklat';
      snDuraklatBtn.classList.remove('aktif');
      if (snRaf) cancelAnimationFrame(snRaf);
      snRaf = null;
    }

    function snGit(ileri) {
      if (ileri) {
        if (snIdx >= slaytlar.length - 1) return;
        snIdx = snIdx + 1;
      } else {
        if (snIdx === 0) return;
        snIdx = snIdx - 1;
      }
      snBaslat();
      snCiz();
      snDongu();
    }

    /* ekran uyku kilidi: sunum surerken ekran kararmasin */
    let snKilit = null;
    async function snKilitAl() {
      if (!('wakeLock' in navigator) || document.hidden) return;
      if (snKilit && !snKilit.released) return;
      try { snKilit = await navigator.wakeLock.request('screen'); } catch (err) {}
    }
    function snKilitBirak() {
      if (!snKilit) return;
      try { snKilit.release(); } catch (err) {}
      snKilit = null;
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !snEl.hidden) snKilitAl(); });
    ['pointerdown', 'keydown', 'touchend'].forEach(t => document.addEventListener(t, () => { if (!snEl.hidden) snKilitAl(); }, { passive: true }));

    function snAc(baslangic) {
    snKilitAl();
      snIdx = Math.max(0, Math.min(slaytlar.length - 1, baslangic || 0));
      snDurakMi = false;
      snBittiMi = false;
      snAktifEl = null;
      snSlayt.innerHTML = '';
      snDuraklatBtn.textContent = '⏸ Duraklat';
      snDuraklatBtn.classList.remove('aktif');
      snOtoYazi();
      snDuraklatBtn.classList.remove('aktif');
      snEl.hidden = false;
      document.body.style.overflow = 'hidden';
      snCiz();
      snDongu();
      const fs = snEl.requestFullscreen || snEl.webkitRequestFullscreen;
      if (fs) { try { const p = fs.call(snEl); if (p && p.catch) p.catch(() => {}); } catch (err) {} }
    }

    function snKapa() {
    snKilitBirak();
      snEl.hidden = true;
      snHizListe.hidden = true;
      snHizDugme.setAttribute('aria-expanded', 'false');
      snDurakMi = false;
      snBittiMi = false;
      snIdx = 0;
      snAktifEl = null;
      snSlayt.innerHTML = '';
      snDuraklatBtn.textContent = '⏸ Duraklat';
      snDuraklatBtn.classList.remove('aktif');
      if (snRaf) cancelAnimationFrame(snRaf);
      snRaf = null;
      snDolgu.style.width = '0%';
      document.body.style.overflow = '';
      const cik = document.exitFullscreen || document.webkitExitFullscreen;
      if (cik && (document.fullscreenElement || document.webkitFullscreenElement)) {
        try { cik.call(document); } catch (err) {}
      }
    }

    document.getElementById('sunumAc').addEventListener('click', () => snAc(0));
    snHizDugme.addEventListener('click', e => {
      e.stopPropagation();
      const acik = snHizListe.hidden;
      snHizListe.hidden = !acik;
      snHizDugme.setAttribute('aria-expanded', String(acik));
    });
    snHizKutu.addEventListener('click', e => {
      const b = e.target.closest('.sn-hiz-btn[data-hiz]');
      if (!b) return;
      const yeni = parseFloat(b.dataset.hiz);
      snHizListe.hidden = true;
      snHizDugme.setAttribute('aria-expanded', 'false');
      snHizDugme.textContent = b.textContent + ' ▾';
      if (!yeni || yeni === snHiz) return;
      snKalan = snKalan * (snHiz / yeni);
      snHiz = yeni;
      snHizListe.querySelectorAll('.sn-hiz-btn').forEach(x => x.classList.toggle('aktif', x === b));
      snYazi();
      snBitti = performance.now() + snKalan;
      if (!snDurakMi) snDongu();
    });
    document.addEventListener('click', e => {
      if (snHizListe.hidden) return;
      if (!snHizKutu.contains(e.target)) {
        snHizListe.hidden = true;
        snHizDugme.setAttribute('aria-expanded', 'false');
      }
    });
    document.querySelectorAll('#olaylar .z-item').forEach((z, i) => {
      const hedef = z.querySelector('.z-kart') || z;
      const baslik = z.querySelector('h4');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'z-sunum-btn';
      b.title = 'Sunumdan buradan başla';
      b.setAttribute('aria-label', 'Sunum: ' + (baslik ? baslik.textContent.trim() : (i + 1) + '. olay') + ' olayından başla');
      b.textContent = '▶';
      b.addEventListener('click', e => { e.stopPropagation(); snAc(i); });
      hedef.appendChild(b);
    });
    snKapat.addEventListener('click', snKapa);
    snGeri.addEventListener('click', () => snGit(false));
    snIleri.addEventListener('click', () => snGit(true));
    snDuraklatBtn.addEventListener('click', () => {
      if (snBittiMi) { snGit(true); return; }
      snDurakMi ? snDevam() : snDur();
    });
    snOtoBtn.addEventListener('click', () => {
      snOto = !snOto;
      snOtoYazi();
    });
    snSahne.addEventListener('click', e => {
      if (e.target !== snSahne && !e.target.closest('#snZeta')) return;
      const r = snSahne.getBoundingClientRect();
      snGit(e.clientX - r.left < r.width / 2 ? false : true);
    });
    window.addEventListener('resize', snOlc);
    document.addEventListener('keydown', e => {
      if (snEl.hidden) return;
      if (e.key === 'Escape') { if (!snHizListe.hidden) { snHizListe.hidden = true; snHizDugme.setAttribute('aria-expanded', 'false'); } else snKapa(); }
      else if (e.key === 'ArrowRight') snGit(true);
      else if (e.key === 'ArrowLeft') snGit(false);
      else if (e.key === ' ') { e.preventDefault(); if (snBittiMi) snGit(true); else snDurakMi ? snDevam() : snDur(); }
    });
  }
