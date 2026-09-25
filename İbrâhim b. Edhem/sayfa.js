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

document.querySelectorAll('#olaylar .z-kitap').forEach(k => {
  const n = k.querySelectorAll('a.kitap-link').length;
  if (n > 1) {
    const bas = k.querySelector('.kitap-bas');
    if (bas) bas.textContent = bas.textContent + ' (' + n + ')';
  }
});

const eserlerSec = document.getElementById('eserler');
if (eserlerSec) {
  document.querySelectorAll('#eserler .detay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#eserler .detay-btn').forEach(b => b.classList.toggle('aktif', b === btn));
      eserlerSec.classList.toggle('kapali', btn.dataset.durum === 'kapali');
    });
  });
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

const ESER_TUR = {
  "Münâcât": "Münâcât · Ziyaret metni",
  "Müsnedü İbrâhim b. Edhem ez-Zâhid": "Hadis · Derleme",
  "Cevâbü İbrâhim b. Edhem ʿan ʿademi isticâbeti’d-duʿâʾ": "Dua · Nisbet edilmiş risâle",
  "Menâkıb-ı İbrâhim Edhem": "Mensur · Menkıbe",
  "Kıssa-i İbrâhim b. Edhem ve İnâbetuhû Rabbehû": "Manzum · Hikâye",
  "Manzûme-i Hikâye-i İbrâhim Edhem": "Manzum · Hikâye",
  "Dâstân-ı İbrâhim Edhem": "Türk halk edebiyatı",
  "Edhemnâme": "Mesnevi · Na'tî",
  "Hayât-ı Sultân İbrâhim": "Malayca · Biyografi",
  "Abou ben Adhem": "İngilizce · Şiir",
  "İbrâhim Edhem": "Tiyatro · Beş perdelik oyun"
};

const ESER_ONEMLI = {
  "Münâcât": "Kâbe ziyareti sırasında terennüm edilen altı beyitlik münâcât; Ebû Nuaym tarafından kaydedilmiştir.",
  "Müsnedü İbrâhim b. Edhem ez-Zâhid": "İbrâhim b. Edhem'e ait elli bir tergîb ve terhîbe rivayetinin derlendiği eserdir.",
  "Cevâbü İbrâhim b. Edhem ʿan ʿademi isticâbeti’d-duʿâʾ": "Anonim bir derleme olmakla birlikte, başındaki açıklamanın İbrâhim b. Edhem'e ait olduğu kabul edilir.",
  "Menâkıb-ı İbrâhim Edhem": "İbrâhim Edhem menkıbelerinin mensur anlatımlarından biridir; yazma nüshaları farklılık gösterir.",
  "Kıssa-i İbrâhim b. Edhem ve İnâbetuhû Rabbehû": "Türk dinî halk hikâyeleri geleneğinde İbrâhim Edhem menkıbelerinin manzum örneğidir.",
  "Manzûme-i Hikâye-i İbrâhim Edhem": "Adana İl Halk Kütüphanesi'ndeki elli sekiz beyitlik, sonu eksik manzum nüshadır.",
  "Dâstân-ı İbrâhim Edhem": "Beyit ve hece vezniyle yazılmış farklı İbrâhim Edhem destanları bu başlık altında anılır.",
  "Edhemnâme": "Na'tî'nin İbrâhim b. Edhem'in hayat çerçevesinde yazdığı mesnevidir.",
  "Hayât-ı Sultân İbrâhim": "İbrâhim b. Edhem hayatının Malayca anlatımlarından biridir; kısaltılmış neşri de bulunur.",
  "Abou ben Adhem": "James Henry Leigh Hunt'in İbrâhim b. Edhem için yazdığı İngilizce şiirdir.",
  "İbrâhim Edhem": "Necip Fazıl Kısakürek'in 1978'de yayımladığı beş perdelik tiyatro eseridir."
};

const DERIN_METIN = {
  "dogum": "İbrâhim b. Edhem, Horasan'ın Belh şehrinde dünyaya geldi. Bir görüşe göre anne ve babası hac için Mekke'de bulunurken orada doğduğu söylenir. Ailesinin Arap kabilelerinden Benî İcl'e veya Temîm'e mensup olduğu, birçok hizmetçisi bulunan varlıklı ve itibarlı bir aileden geldiği yönünde kayıtlar vardır. Belh hükümdarı veya hükümdarın oğlu olduğu rivayetleri ise daha az güvenilir kabul edilir.",
  "belh": "Belh, İbrâhim b. Edhem'in doğduğu ve zühd hayatına girmeden önce yaşadığı Horasan şehridir. Ailesinin buradaki hükümdarla ilişkileri hakkında farklı anlatılar bulunsa da kaynakların genelinde tarihî çekirdek ile menkıbelerin birbirine karıştığı görülür.",
  "zuhd": "İbrâhim b. Edhem zühdü üç kısma ayırır: Haramdan kaçınma olan farz, helâlinden olsa bile azla yetinme olan nâfile ve şüpheli şeylerden uzak durma olan selâmet. En mükemmel zâhidin kalbi en temiz, samimi ve cömert olan kişi olduğunu söyler.",
  "av": "Gençlik çağında avlanırken iki kez gaipten bir ses duyduğu, üçüncü kez aynı sesi atının sırtındaki eyerin kaşından duyduğu rivayet edilir. Ses, savaş ve av için yaratılan bir varlığın amacını sorgulamasını söyler; bu uyarıdan sonra malını terk ettiği aktarılır.",
  "terk": "Bütün malını, mülkünü ve vatanını geride bırakmaya karar vermesi İbrâhim b. Edhem menkıbesinin merkezî dönüm noktasıdır. Vatan hasreti ve nefse karşı verdiği mücadele, sonraki tasavvufî anlatılarda önemli bir motif hâline gelmiştir.",
  "mekke": "Mekke, İbrâhim b. Edhem'in zühd yoluna girişiyle ilişkilendirilen seyahatlerin merkezidir. Abdullah b. Mübârek'in de yer aldığı altmış kişilik grubun buraya yönelmesi, kaynaklarda geniş bir ilim yolculuğu olarak anlatılır.",
  "hizir": "Çölde tanımadığı bir kişiden ism-i a'zam duasını öğrenen İbrâhim b. Edhem'in Hızır'la buluştuğu anlatılır. Duayı öğreten kişinin adı hakkında Dâvud, İlyas veya Hızır'a bağlanan farklı rivayetler vardır.",
  "ebumuslim": "İbn Asâkir'in kaydına göre İbrâhim b. Edhem, Abbâsî ihtilâlcisi Ebû Müslim-i Horasânî'den kaçtığı için Belh'ten ayrıldı. Bu bilgi kabul edilirse ayrılış 747 (129) yılı civarına rastlar; olayın sebebi ve tarihi kaynaklarda tartışmalıdır.",
  "seyahat": "İbrâhim b. Edhem, Horasan'dan ayrıldıktan sonra Şam, Irak, Hicaz ve Rum bölgelerinde uzun bir seyahate çıktı. Dımaşk'ta en az yirmi dört yıl kaldı; bostan bekçiliği, ırgatlık ve değirmencilik gibi işlerle geçinmeye çalışırken birçok âlim ve zâhidle tanıştı.",
  "dimask": "Dımaşk'ta geçen uzun dönem, onun memleketinden uzaklaşmasının ardından yerleştiği önemli merkezdir. Hemşerisi Şakīk-ı Belhî ile burada karşılaşmış, halkın içinde yaşamayı ve sohbet meclislerini sürdürmüştür.",
  "saki": "Şakīk-ı Belhî'nin anlatımıyla İbrâhim b. Edhem, memleketi Belh'de bulamadığı huzuru Şam beldelerinde bulmuştur. Bu ifade, onun zühd hayatının yalnızca inzivayla değil, insanlarla birlikte yaşamakla ilişkili olduğunu gösterir.",
  "ebu": "Ebû Hanîfe ile dostluk meydana geldiği ve zâhir ilmini ondan öğrendiği rivayet edilir. İbrâhim b. Edhem'in ameli ihmal etmemek gerektiğine dair söylediği söz, hadis toplama ile yaşama arasında bir denge arayışını gösterir.",
  "hadis": "Tâbiîn ve tebeu't-tâbiînden hadis rivayet eden İbrâhim b. Edhem, bazı rivayetleri mürsel olsa da sika olarak tanımlanmıştır. Hadis toplamaya fazla rağbet etmemesi, ameli ihmal etme endişesi ve riyâdan kaçınma isteğiyle açıklanır.",
  "toplum": "Zühdü bir tecrit yaşamı olarak yaşamayan İbrâhim b. Edhem, zaman zaman yalnızlaşsa da halkın dertleriyle ilgilenmeye devam eder. İnsanları cemaatle namaz, hac, cihâd ve meclislere devam etmeye teşvik eder; helâl kazanmayı öğütler.",
  "evrad": "Ebû Nuaym, onun cuma sabah ve akşam on defa okuduğu evrâdı kaydeder. Kâbe'yi ziyareti sırasında terennüm ettiği altı beyitlik münâcâtı da yayımlar. Bu metinler, zühdün ibadetle ve zikirle ilişkisini gösterir.",
  "vefat": "İbrâhim b. Edhem'in Bizanslılar'a karşı yapılan son deniz seferinde, adı bilinmeyen bir adada vefat ettiği kaydedilir. Ölüm yılı için birçok tarih zikredilir; kaynakların çoğu 161 (778) veya 162 (779) yılını kabul eder. Kabrinin yerine ilişkin rivayetler de çeşitlidir.",
  "munajat": "Münâcât, Kâbe'yi ziyareti sırasında terennüm edilen altı beyitlik bir metindir. Ebû Nuaym'in kaydettiği metin, onun Hicaz seyahati ve dua hayatıyla ilişkilendirilir.",
  "musned": "Müsnedü İbrâhim b. Edhem ez-Zâhid, İbrâhim b. Edhem'e ait elli bir tergîb ve terhîbe rivayetini bir araya getirir. Derleme, zâhidin yaşam biçimi ve toplum içindeki öğütleriyle ilgili kaynaklardan biridir.",
  "cevap": "Cevâbü İbrâhim b. Edhem ʿan ʿademi isticâbeti’d-duʿâʾ, duaların kabul edilmeyişinin sebeplerini ele alan anonim bir derlemedir. Baş tarafta İbrâhim b. Edhem'e ait olduğu rivayet edilen bir açıklama bulunur.",
  "menakib": "Menâkıb-ı İbrâhim Edhem, hayat çevresinde oluşan menkıbelerin mensur anlatımlarını örnekler. Farklı yazma nüshalarının olması, metnin tek bir yazar veya tek bir varyantla sınırlı olmadığını gösterir.",
  "kissa": "Kıssa-i İbrâhim b. Edhem ve İnâbetuhô Rabbehû, Süleymaniye Kütüphanesi'nde bulunan manzum bir hikâyedir. Menkıbelerin beyit ve hece vezniyle yeniden anlatıldığı Türk dinî halk edebiyatı örneklerindendir.",
  "manzume": "Manzûme-i Hikâye-i İbrâhim Edhem, elli sekiz beyitlik ve sonu eksik bir nüshasıyla bilinen manzum anlatımdır. Metin, halk hikâyesi geleneğinin nasıl aktarıldığını göstermesi bakımından değerlidir.",
  "destan": "Dâstân-ı İbrâhim Edhem, farklı yazarların İbrâhim Edhem menkıbelerini destanlaştırdığı eserler için kullanılan genel adlandırmadır. Bu metinlerde maceralar çoğunlukla tasavvufî bir mahiyet taşır.",
  "edhemn": "Edhemnâme, Na'tî'nin İbrâhim b. Edhem'in hayat çerçevesinde yazdığı mesnevidir. Edhem ü Hümâ başlıklı mesnevilerin ise İbrâhim b. Edhem'le doğrudan ilgisi bulunmadığı kaynaklarda belirtilir.",
  "hayat": "Hayât-ı Sultân İbrâhim, İbrâhim b. Edhem hayatının Malayca anlatımlarından biridir. Metnin kısaltılmış bir neşri 1822'de Hollandalı G. W. J. Roorda van Eysinga tarafından yayımlanmıştır.",
  "abou": "Abou ben Adhem, James Henry Leigh Hunt'in İbrâhim b. Edhem için yazdığı İngilizce şiirdir. Şiir, Doğu edebiyatından alınan konularla çalışan Avrupalı yazarların İbrâhim Edhem ilgisini gösterir.",
  "oyun": "Necip Fazıl Kısakürek'in İbrâhim Edhem adlı eseri, 1978'de İstanbul'da yayımlanan beş perdelik bir tiyatrodur. Eser, menkıbeleri modern sahne diliyle yeniden ele alır."
};

function eserBilgi(kart) {
  const h4 = kart.querySelector('h4');
  const ad = normalize(h4 ? h4.textContent : '');
  let tur = '';
  let onemli = '';
  for (const [k, v] of Object.entries(ESER_TUR)) {
    if (ad === normalize(k) || ad.startsWith(normalize(k))) {
      tur = v;
      break;
    }
  }
  for (const [k, v] of Object.entries(ESER_ONEMLI)) {
    if (ad === normalize(k) || ad.startsWith(normalize(k))) {
      onemli = v;
      break;
    }
  }
  return { tur, onemli };
}

function oncekiGrup(kart) {
  let node = kart.parentElement;
  while (node) {
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (sibling.classList.contains('grup')) {
        const yazi = sibling.querySelector('.g-yazi');
        return yazi ? yazi.textContent.trim() : '';
      }
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
  }
  return '';
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
  const kop = kart.querySelector('.kopya') || kart.querySelector('.lokal') || zTarih;
  if (bilgi.tur) {
    blgTur.textContent = bilgi.tur;
    blgTur.classList.remove('hidden');
  } else {
    blgTur.classList.add('hidden');
  }
  if (kop && kop.textContent.trim()) {
    blgTarih.textContent = kop.textContent.trim();
    satirTarih.classList.remove('hidden');
  } else {
    satirTarih.classList.add('hidden');
  }
  let grup = oncekiGrup(kart);
  if (!grup && zItem) {
    const kat = kart.querySelector('.z-kat');
    if (kat) grup = kat.textContent.trim();
  }
  if (grup && !bilgi.tur) {
    blgGrup.textContent = grup;
    satirGrup.classList.remove('hidden');
  } else {
    satirGrup.classList.add('hidden');
  }
  if (bilgi.onemli) {
    blgOnemli.textContent = bilgi.onemli;
    satirOnemli.classList.remove('hidden');
  } else {
    satirOnemli.classList.add('hidden');
  }
  const metin = kart.querySelector('.not, p');
  if (metin && metin.textContent.trim()) {
    blgMetin.textContent = metin.textContent.trim();
    satirMetin.classList.remove('hidden');
  } else {
    satirMetin.classList.add('hidden');
  }
  const derin = kart.dataset.derin;
  if (derin && DERIN_METIN[derin]) {
    blgDetay.textContent = DERIN_METIN[derin];
    satirDetay.classList.remove('hidden');
  } else {
    satirDetay.classList.add('hidden');
  }
  blgUst.classList.remove('hidden');
  blgPop.classList.remove('hidden');
}

const eserKartlari = [...document.querySelectorAll('#eserler .kart')].map(k => {
  const h4 = k.querySelector('h4');
  return { el: k, ad: normalize(h4 ? h4.textContent : '') };
});
function eserBul(ad) {
  const n = normalize(ad);
  return eserKartlari.find(e => e.ad === n || e.ad.startsWith(n)) || null;
}

const kisiKartlari = [...document.querySelectorAll('#kisiler .kart')].map(k => {
  const h4 = k.querySelector('h4');
  return { el: k, ad: normalize(h4 ? h4.textContent : '') };
});
function kisiBul(ad) {
  const n = normalize(ad);
  return kisiKartlari.find(k => k.ad === n || k.ad.includes(n)) || null;
}

document.querySelectorAll('a.kitap-link').forEach(a => {
  a.addEventListener('click', e => {
    e.stopPropagation();
    const kart = eserBul(a.dataset.ad);
    if (kart) blgAc(kart.el);
  });
});
document.querySelectorAll('a.ad-link').forEach(a => {
  a.addEventListener('click', e => {
    e.stopPropagation();
    const kart = kisiBul(a.dataset.ad);
    if (kart) blgAc(kart.el);
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
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !blgPop.classList.contains('hidden')) blgKapat();
});

const SUNUM_AYAR = { saniyeHarf: .053, enAz: 4, enCok: 22, basBekleme: 1000, sonBekleme: 2000, gecis: 2000 };
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
  let snIdx = 0;
  let snDurakMi = false;
  let snBitti = 0;
  let snRaf = null;
  let snKalan = 0;
  let snHiz = 1;
  let snKelimeler = [];
  let snToplamHarf = 0;
  let snGectiIdx = -1;
  let snSiraIdx = -1;
  let snOto = true;
  let snBittiMi = false;
  let snAktifEl = null;
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
          if (/^\s+$/.test(p)) {
            parca.appendChild(document.createTextNode(p));
            return;
          }
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
    kelimeler.forEach(k => {
      toplam += harfSay(k.el);
      k.son = toplam;
    });
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
    const sira = gecen > 0 && gecti < snKelimeler.length ? gecti : -1;
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
    snOtoBtn.title = snOto ? 'Geçişler otomatik — tıklayınca etkileşimliye döner' : 'Geçişler sizin kontrolünüzde — tıklayınca otomatik olur';
  }

  function snOlc() {
    const ic = snAktifEl;
    if (!ic) return;
    ic.style.transform = '';
    const ust = snSahne.clientHeight - 18;
    const yuk = ic.scrollHeight;
    const olcek = yuk > ust && ust > 0 ? Math.max(.55, ust / yuk) : 1;
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
        if (!snOto) {
          snBittiMi = true;
          snDur();
          return;
        }
        if (snIdx >= slaytlar.length - 1) {
          snDur();
          return;
        }
        snIdx += 1;
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

  function snGit(ileri) {
    if (ileri && snIdx >= slaytlar.length - 1) return;
    if (!ileri && snIdx === 0) return;
    snIdx = ileri ? snIdx + 1 : snIdx - 1;
    snDurakMi = false;
    snDuraklatBtn.textContent = '⏸ Duraklat';
    snDuraklatBtn.classList.remove('aktif');
    if (snRaf) cancelAnimationFrame(snRaf);
    snRaf = null;
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
    snOtoYazi();
    snEl.hidden = false;
    document.body.style.overflow = 'hidden';
    snCiz();
    snDongu();
    const fs = snEl.requestFullscreen || snEl.webkitRequestFullscreen;
    if (fs) {
      try {
        const p = fs.call(snEl);
        if (p && p.catch) p.catch(() => {});
      } catch (err) {}
    }
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
    b.addEventListener('click', e => {
      e.stopPropagation();
      snAc(i);
    });
    hedef.appendChild(b);
  });
  snKapat.addEventListener('click', snKapa);
  snGeri.addEventListener('click', () => snGit(false));
  snIleri.addEventListener('click', () => snGit(true));
  snDuraklatBtn.addEventListener('click', () => {
    if (snBittiMi) {
      snGit(true);
      return;
    }
    if (snDurakMi) snDevam();
    else snDur();
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
    if (e.key === 'Escape') {
      if (!snHizListe.hidden) {
        snHizListe.hidden = true;
        snHizDugme.setAttribute('aria-expanded', 'false');
      } else {
        snKapa();
      }
    } else if (e.key === 'ArrowRight') snGit(true);
    else if (e.key === 'ArrowLeft') snGit(false);
    else if (e.key === ' ') {
      e.preventDefault();
      if (snBittiMi) snGit(true);
      else if (snDurakMi) snDevam();
      else snDur();
    }
  });
}
