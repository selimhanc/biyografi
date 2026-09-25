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
    'İḥyâʾü ʿulûmi\'d-dîn': 'Arapça · İhyâ / Tasavvuf',
    'Kimyâ-yı Saʿâdet': 'Farsça · Tasavvuf',
    'Bidâyetü\'l-hidâye': 'Arapça · Dinî Rehber',
    'Minhâcü\'l-ʿâbidîn': 'Arapça · Tasavvuf',
    'Eyyühe\'l-veled': 'Farsça · Nasihat',
    'Tehâfütü\'l-felâsife': 'Arapça · Felsefe Eleştirisi',
    'Maḳāṣıdü\'l-felâsife': 'Arapça · Felsefe Tanıtımı',
    'Miʿyârü\'l-ʿilm': 'Arapça · Mantık',
    'Mîzânü\'l-ʿamel': 'Arapça · Ahlâk / Amel',
    'el-Müstaṣfâ min ʿilmi\'l-uṣûl': 'Arapça · Usûl-i Fıkıh',
    'el-İḳtiṣâd fi\'l-iʿtiḳād': 'Arapça · Kelâm',
    'İlcâmü\'l-ʿavâm ʿan ʿilmi\'l-kelâm': 'Arapça · Kelâm',
    'er-Risâletü\'l-ḳudsiyye': 'Arapça · Akāid',
    'el-Vecîz fî fürûʿi\'l-meẕheb': 'Arapça · Fıkıh (Şâfiî)',
    'el-Menḫûl': 'Arapça · Usûl-i Fıkıh',
    'el-Münḳıẕ min eḍ-ḍalâl': 'Arapça · İlmî Otobiyografi',
    'el-Müstaẓhirî': 'Arapça · Reddiye (Bâtınîlik)',
    'el-Ḳısṭâsü\'l-müstaḳīm': 'Arapça · Reddiye / Kur\'an'
  };

  const ESER_ONEMLI = {
    'İḥyâʾü ʿulûmi\'d-dîn': 'Baş eseridir; ibâdât, muâmelât, mühlikât ve münecciyât dört ana bölüm (40 kitap) hâlinde, din ilimlerinin ihyâsını ve toplumun dinî-ahlâkî yönden ıslahını hedefler. İnzivâ döneminde (y. 1096–1102/489–495) telif edildi.',
    'Kimyâ-yı Saʿâdet': 'İḥyâ\'nın Farsça muhtasarı; dünya ve âhiret saadetinin (saadet kimyâsının) yollarını gösterir.',
    'Bidâyetü\'l-hidâye': 'Hidayetin başlangıcı; günlük ibadet ve ahlâkın pratik yolunu öğreten rehber.',
    'Minhâcü\'l-ʿâbidîn': 'Son teliflerdendir; âbidin yolunu, nefsin çıkardığı engelleri aşmayı esas alır.',
    'Eyyühe\'l-veled': 'Kendisine müracaat eden bir talebeye hitaben yazılmış nasihat risâlesi.',
    'Tehâfütü\'l-felâsife': 'Meşşâî felsefesine yönelik eleştiri; âlemin ezelîliği, Allah\'ın cüz\'iyyâtı bilmemesi ve bedenle haşrin inkârı olmak üzere üç meselede filozofları tekfir eder.',
    'Maḳāṣıdü\'l-felâsife': 'Filozofların maksatları; felsefî bilginin tarafsız tanıtımı. Latinceye "Logica et Philosophia Algazelis Arabis" (1506) adıyla çevrildi.',
    'Miʿyârü\'l-ʿilm': 'İlmin ölçüsü; mantığı din ilimlerinin hizmetine sokar.',
    'Mîzânü\'l-ʿamel': 'Amelin tartısı; ahlâk ve kalp terbiyesi. "Şüphe gerçeğe ulaşmanın tek yoludur" sözünü içerir.',
    'el-Müstaṣfâ min ʿilmi\'l-uṣûl': 'Usûl-i fıkıhta son sözü; kaynakları özlü bir düzene kavuşturur, müteahhirîn usûlünün temel metinlerindendir.',
    'el-İḳtiṣâd fi\'l-iʿtiḳād': 'İtikadda orta yol; mutedil kelâm diliyle inancı temellendirir.',
    'İlcâmü\'l-ʿavâm ʿan ʿilmi\'l-kelâm': 'Halkı kelâm ilmiyle uğraşmaktan uzak tutmayı amaçlar; kelâmın ehliyetli kimselere mahsus olduğunu vurgular.',
    'er-Risâletü\'l-ḳudsiyye': 'Kudüs halkı için yazılan akāid risâlesi; İḥyâ\'nın bir bölümünü teşkil eder.',
    'el-Vecîz fî fürûʿi\'l-meẕheb': 'Şâfiî fıkhının muhtasarı; Basît–Vasît–Vecîz üçlüsünün en kısası.',
    'el-Menḫûl': 'Usûl-i fıkıhtaki ilk tecrübesi; Cüveynî\'nin "Beni sağken mezara gömdün" diyerek övdüğü gençlik eseri.',
    'el-Münḳıẕ min eḍ-ḍalâl': 'Hakikati arayışının hikâyesi; kelâm, felsefe, Bâtınîlik ve tasavvuf değerlendirmesiyle şüphe krizini ve yönelişini anlatır.',
    'el-Müstaẓhirî': 'Bâtınîliğe karşı ilk reddiye (Feḍâʾiḥü\'l-Bâṭıniyye); Peygamber\'in yanılmazlığı ilkesini savunur; eser adı halife Müstaẓhir-Billâh\'a izâfedir.',
    'el-Ḳısṭâsü\'l-müstaḳīm': 'Bâtınî iddialarına karşı hakikatin Kur\'an\'a dayanan ölçülerini gösterir.'
  };

  const DERIN_METIN = {
    'dogum': 'Gazzâlî, 1058 (450) yılında İran\'ın Horasan bölgesinde, yetiştirdiği âlimler ve devlet adamlarıyla tanınan Tûs\'ta (bugünkü Meşhed) dünyaya geldi. 1059 (451) doğum kaydı itimada şayan görülmez. Hüccetülislâm, Zeynüddin gibi lakaplarla anılır; künyesi Ebû Hâmid\'dir; bir oğlunun olup olmadığı bilinmemektedir. Batı skolastiğinde Abuhamet ve Algazel diye tanındı. Doğduğu kasabaya nisbetle Tûsî de denilir, fakat onun adını bile unutturacak derecede meşhur olan nisbesi Gazzâlî (Gazâlî) dir. Bu iki nisbeden hangisinin doğru olduğu tartışılmıştır: Zehebî\'nin naklettiği anekdota göre kendisi "İnsanlar beni çift \'z\' ile (Gazzâlî diye) anıyorlar; halbuki ben Gazâle denilen bir köydenim" demiştir. Çoğunluğa göre ise babasının mesleğine (gazzâl: yün eğirici, iplikçi) nisbetle Gazzâlî diye anılmıştır. Fars asıllı olduğu sanılır; babası Tûs\'ta iplikçi dükkânında el emeği ürünü satarak geçimini sağlayan, zühd ve tasavvufa eğilimli Muhammed idi.',
    'tus': 'Tûs, Horasan bölgesinde yetiştirdiği âlimler ve devlet adamlarıyla tanınan, bugünkü Meşhed\'in bulunduğu şehirdir. Gazzâlî\'nin 1058 (450) doğum ve 1111 (505) vefat yeridir. 1073\'te (465) fıkıh dersleriyle ilk ileri öğrenimi burada başladı; 1109\'da (503) Tûs\'a dönen Gazzâlî evinin yanına fukaha için bir medrese, sûfiyye için de bir hankah yaptırdı. Vefatında ünlü şair Firdevsî\'nin mezarının yakınına defnedildi. Bugün halk arasında Hârûniyye adıyla anılan, çini ve alçı tezyinatı harap olmakla birlikte tuğladan âbidevî bir eser hâlinde ayakta duran yapının bahçesindeki kabir, onun mezarı olarak gösterilir; Yâkūt el-Hamevî ve İbn Battûta gibi müelliflerce ziyaret edilen bu yapının Gazzâlî\'nin türbesi olması kuvvetle muhtemeldir ki Sultan Sencer\'in Merv\'deki türbesiyle aynı planda olması ve Selçuklu mimari özellikleri taşıması bunu destekler.',
    'bagdat': 'Nizâmülmülk, Temmuz 1091\'de (Cemâziyelevvel 484) Gazzâlî\'yi Bağdat Nizâmiye Medresesi müderrisliğine tayin etti. Dört yıl süren bu dönem kitap telifi bakımından en verimli devresidir; içlerinde Hanbelî âlimlerinden Ebü\'l-Vefâ İbn Akīl ve Ebü\'l-Hattâb el-Kelvezânî\'nin de bulunduğu 300\'e yakın öğrenciye ders verdi. Burada iki yıl Meşşâî-İşrâkī felsefeyi, bir yıl da felsefe hakkında edindiği bilgileri gözden geçirdi; ardından Bâtınîlik incelemelerine koyuldu. Taʿlîḳa ve el-Menḫûl dışında en az yirmi beş eserini Nizâmiye\'den ayrılmadan önce yazmıştır.',
    'tehafut': 'Bağdat\'ta yaklaşık iki yıl süren incelemeler sayesinde, tenkit etmeyi düşündüğü Meşşâî-İşrâkī felsefeyi derinden kavradı; bir yıl da yeni bilgileri gözden geçirdi ve filozofların doğru ve yanlış görüşlerini şüpheye yer bırakmayacak şekilde tesbit etti. Maḳāṣıdü\'l-felâsife\'de filozofların maksatlarını tarafsızca tanıttıktan sonra Tehâfütü\'l-felâsife\'de eleştirdi. Yirmi meseleden üçünde filozofları küfürle itham etti: âlemin ezelîliği (kıdem-i Âlem), Allah\'ın cüz\'iyyâtı (tikel olayları) bilmemesi ve bedenle haşrin inkârı. Bu eser, İbn Rüşd\'ün Tehâfütü\'t-tehâfüt\'üyle başlayan "tehâfütler tartışması"nı başlatarak İslâm düşünce tarihinde kalıcı iz bıraktı.',
    'batini': 'Bâtınîliğe yönelik incelemelerinde bir düşünceyi yeterince tanıyıp tarafsız bilgi vermeden eleştirmenin ilim anlayışıyla bağdaşmadığı kanaatiyle önce hareketin ilkelerini anlattı; bu yöntemi bazılarınca eleştirildi. Bâtınîlik\'teki imamın yanılmazlığı yerine Peygamber\'in yanılmazlığı ilkesini savundu; Eş\'arî\'nin Mu\'tezile\'yi kendi metotlarıyla yıkması gibi Bâtınîler\'e karşı aynı tenkit yöntemiyle mücadele etti ve onların düşmanlığını kazandı. İlk reddiyesi el-Müstaẓhirî (Feḍâʾiḥü\'l-Bâṭıniyye) idi.',
    'kriz': 'Dört araştırma halkasının (kelâm, felsefe, Bâtınîlik, tasavvuf) sonucu onu kelimenin tam anlamıyla bir fikrî bunalıma sürükledi. Bağdat Nizâmiye\'nin büyük müderrisinin görünüşte başarılı hayatı gün geçtikçe şüphelerle altüst oluyordu; şüpheciliğin tabiatında olduğunu kendisi belirtir. Sadece bilgi problemleri değil, ahlâkî bakımdan da kendini sorguluyor; makam ve şöhret arzusunun niyetine karıştığını farkediyordu. Ününü ve mevkini terketmeye râzı olmayan nefsiyle altı ay mücadele etti; şüphe krizi giderek psikolojik depresyonlara, iştahsızlık ve hazımsızlık gibi fizyolojik rahatsızlıklara yol açtı. Tabiplerin ilâçlı tedavisi sonuç vermeyince hastalığın psikolojik sebeplerden kaynaklandığına hükmetti. Gazzâlî, iki ay kadar süren ve "hastalık ve safsata" diye nitelediği bu krizden "Allah\'ın kalbine attığı bir nurla" kurtulduğunu söyler.',
    'azil': 'Bağdat\'la bütün ilişkilerini kesme kararı, gönlünün makam, mal, evlât ve dostlardan ayrılmaya râzı olmasıyla kesinleşti. Halifenin ve dostlarının gerçek niyetini öğrenmemesi için Mekke\'ye gideceğini açıkladı; medresedeki mevkisini kardeşi Ahmed el-Gazzâlî\'ye bırakarak Kasım 1095\'te (Zilkade 488) ayrıldı. Sonraki araştırmalarda Bağdat\'ı terketmesine siyasî sebepler de ileri sürülmüştür (Berkyaruk ile ihtilâf, Bâtınî suikast endişesi vb.). Bununla birlikte özellikle tasavvufî hâl ve şartlar içinde on yılı aşkın yaşamayı sürdürmesi, ayrılışın asıl sebebinin el-Münḳıẕ\'da belirttiği epistemolojik ve ahlâkî şüphe olduğunu gösterir; Mâcid Fahrî gibi yazarlar zamanın karışık siyasî durumunun da bir ölçüde rol oynadığını kabul eder.',
    'inziva': 'Gazzâlî, on bir yıl sürdüğünü belirttiği halvet döneminde "saymakla bitirilemeyecek durumları" keşfettiğini söyler. Bu dönemin kronolojisi kaynaklarda farklıdır: Sübkî\'ye göre 1095\'te (488) hac, 1096\'da (489) Dımaşk, Kudüs, tekrar Dımaşk; İbnü\'l-Esîr\'e göre 488\'de Şam, Kudüs, 489\'da hac. Yaygın kabul gören kurguya göre 488 yılının son bir iki ayı ile 489 ve 490\'ın ilk aylarını Suriye-Filistin\'de geçirdi (Emeviyye Camii\'nde riyâzet ve mücâhede; Kudüs\'te inzivâ ve er-Risâletü\'l-ḳudsiyye), ardından Hicaz\'a gidip hac farîzasını yerine getirdi, sonra Bağdat\'a döndü. Ebû Bekir İbnü\'l-Arabî, Mayıs-Haziran 1097\'de (Cemâziyelâhir 490) onunla karşılaştı. Haçlılar\'ın Kudüs\'ü işgal ettiği 1099\'da (492) Horasan\'ın çeşitli şehirlerinde bulunuyordu.',
    'ihya': 'Baş eseri İḥyâʾü ʿulûmi\'d-dîn, inzivâ döneminde (y. 1096–1102/489–495) kaleme alındı. İsim, üslup ve muhtevası bütünüyle dikkate alındığında, İslâm insanı ve toplumunun içine düştüğü dinî-ahlâkî yozlaşma ve bunun sonucu siyasî istikrarsızlıklar karşısında bir ıslah ve "din ilimlerinin ihyâsı" programıdır. ibâdât, muâmelât, mühlikât ve münecciyât ana bölümleri altında kırk kitapta; inanç, ibadet, ahlâk ve firaset konularıyla kalbin tasfiyesini ve Allah\'a yaklaşmayı öğretir.',
    'kimya': 'Kimyâ-yı Saʿâdet, İḥyâʾü ʿulûmi\'d-dîn\'in Farsça konuşan çevreler için hazırlanmış muhtasarıdır; dünya ve âhiret saadetini elde etmenin (saadet kimyâsının) yollarını gösterir.',
    'mustasfa': 'el-Müstaṣfâ min ʿilmi\'l-uṣûl, usûl-i fıkıh alanında son sözüdür. Kaynakları özlü bir düzene kavuşturur; fıkhî kaynakların üçe indirilmesi ve dört eksenli sistematik yapısıyla müteahhirîn usûlünün temel metinleri arasında kendine yer bulmuştur. Tûs\'a dönüş sonrası (1109/503) telif edildi.',
    'munkiz': 'el-Münḳıẕ min eḍ-ḍalâl (Dalâletten Kurtuluş), Gazzâlî\'nin hakikati arayışının hikâyesidir. Kelâm (ilim), felsefe, Bâtınîlik ve tasavvuf olmak üzere dört araştırma halkasını tartışır; şüphe krizini, dine ve tasavvufa yönelişini, Bağdat\'ı terkedişini ve ilim öğretimine tekrar dönüşünü anlatır. İkinci hocalık döneminde (y. 1108/501) kaleme alınmış; "her asrın başında bir müceddid" hadisine atıfta bulunur.',
    'mucaddid': 'Gazzâlî, Temmuz 1106\'da (Zilkade 499) Nîşâbur\'a dönerek Nizâmiye\'de tekrar öğretime başladı. Bu dönemde "O zaman mevki kazandıran ilmi öğretiyordum... şimdi ise mevki terkettiren ilme çağırıyorum" der. Dönüşünde, İslâm toplumunun her asrın başında bir müceddide sahip olacağını bildiren hadisin de etkili olduğu söylenir; el-Münḳıẕ\'da bu hadise atıfta bulunur. Onu Nîşâbur\'a döndüren, dönemin Selçuklu hükümdarı Sencer\'in veziri ve Nizâmülmülk\'ün oğlu Fahrülmülk idi. Lâkin ikinci hocalık dönemi, birincisi kadar zevkli ve hareketli geçmedi; yeni bir sükûnetin özlemi ve sağlığının bozulmasıyla üç yılı aşkın resmî görevin ardından Tûs\'a döndü (1109/503).',
    'vefat': 'Gazzâlî, 18 Aralık 1111 (14 Cemâziyelâhir 505) tarihinde Tûs\'ta vefat etti ve ünlü şair Firdevsî\'nin mezarının yakınına defnedildi. Günümüzde halk arasında Hârûniyye adıyla anılan, çini ve alçı tezyinatı harap olmakla birlikte tuğladan âbidevî bir eser hâlinde ayakta duran yapının bahçesindeki kabir onun mezarı olarak gösterilir. Yâkūt el-Hamevî ve İbn Battûta gibi müelliflerce ziyaret edilen bu yapının Gazzâlî\'nin türbesi olması kuvvetle muhtemeldir; Sultan Sencer\'in Merv\'deki türbesiyle aynı planda olması ve Selçuklu mimari özellikleri taşıması bunu destekler.'
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
      snSayac.textContent = (snIdx + 1) + ' / ' + slaytlar.length;
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
      const ust = snSahne.clientHeight - 18 - (snZeta ? snZeta.offsetHeight + 10 : 0);
      const yuk = ic.scrollHeight;
      const olcek = (yuk > ust && ust > 0) ? Math.max(0.55, ust / yuk) : 1;
      ic.style.transform = olcek < 1 ? 'scale(' + olcek.toFixed(3) + ')' : '';
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
      if (e.target === snSahne) snGit(true);
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
