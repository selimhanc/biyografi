(function () {
  const KAPI_ANAHTAR = '40f378fe8ea4677fa64671a50b8d9243a9906a708efcc9a76c0bf0fa37040cd2';
  const KAPI_GUN = 30;
  const KAPI_HAYIR = 'kapi_acilis';

  function ilkPrimalar(adet) {
    const liste = [];
    let n = 2;
    while (liste.length < adet) {
      let asal = true;
      for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) { asal = false; break; }
      }
      if (asal) liste.push(n);
      n++;
    }
    return liste;
  }

  const PR = ilkPrimalar(64);
  const K = PR.map(p => {
    const k = Math.cbrt(p);
    return Math.floor((k - Math.floor(k)) * 4294967296) >>> 0;
  });
  const H0 = PR.slice(0, 8).map(p => {
    const k = Math.sqrt(p);
    return Math.floor((k - Math.floor(k)) * 4294967296) >>> 0;
  });

  const dondur = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;

  function sha256(metin) {
    const veri = new TextEncoder().encode(metin);
    const bitSayisi = veri.length * 8;
    const dolgu = ((veri.length + 9 + 63) >> 6) << 6;
    const blok = new Uint8Array(dolgu);
    blok.set(veri);
    blok[veri.length] = 0x80;
    const dv = new DataView(blok.buffer);
    dv.setUint32(dolgu - 8, Math.floor(bitSayisi / 4294967296), false);
    dv.setUint32(dolgu - 4, bitSayisi >>> 0, false);

    const H = H0.slice();
    const w = new Uint32Array(64);
    for (let o = 0; o < dolgu; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const g15 = w[i - 15];
        const g2 = w[i - 2];
        const s0 = (dondur(g15, 7) ^ dondur(g15, 18) ^ (g15 >>> 3)) >>> 0;
        const s1 = (dondur(g2, 17) ^ dondur(g2, 19) ^ (g2 >>> 10)) >>> 0;
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let i = 0; i < 64; i++) {
        const S1 = (dondur(e, 6) ^ dondur(e, 11) ^ dondur(e, 25)) >>> 0;
        const ch = ((e & f) ^ (~e & g)) >>> 0;
        const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = (dondur(a, 2) ^ dondur(a, 13) ^ dondur(a, 22)) >>> 0;
        const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e;
        e = (d + t1) >>> 0;
        d = c; c = b; b = a;
        a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  }

  function acildiMi() {
    try {
      const kayit = JSON.parse(localStorage.getItem(KAPI_HAYIR) || 'null');
      return !!kayit && kayit.h === KAPI_ANAHTAR && kayit.b > Date.now();
    } catch (err) {
      return false;
    }
  }

  function stilEkle() {
    const s = document.createElement('style');
    s.textContent = [
      '#kapi{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:1.2rem;',
      'background:radial-gradient(circle at 50% 26%,#2e2514,#13100a 72%);color:#f6efdd;',
      'font-family:Georgia,"Times New Roman",serif;overflow:auto}',
      '#kapi .kapi-kutu{width:100%;max-width:23rem;background:rgba(255,255,255,.06);',
      'border:1px solid rgba(255,255,255,.16);border-radius:1.1rem;padding:1.9rem 1.6rem 1.6rem;',
      'text-align:center;box-shadow:0 26px 70px rgba(0,0,0,.55)}',
      '#kapi .kapi-rozet{width:3rem;height:3rem;margin:0 auto .9rem;border-radius:50%;display:grid;place-items:center;',
      'font-size:1.4rem;background:linear-gradient(135deg,#c9a43a,#8c6a1c);color:#241d12}',
      '#kapi h1{margin:0;font-size:1.35rem;letter-spacing:.4px;color:#f3dc9a}',
      '#kapi .kapi-alt{margin:.5rem 0 1.3rem;font-size:.86rem;color:rgba(246,239,221,.68);',
      'font-family:inherit;line-height:1.5}',
      '#kapi form{display:flex;gap:.5rem;flex-wrap:wrap}',
      '#kapi input{flex:1 1 9rem;min-width:0;font-family:inherit;font-size:.95rem;padding:.68rem .85rem;',
      'border-radius:.6rem;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.3);color:#f6efdd}',
      '#kapi input:focus{outline:2px solid #c9a43a;outline-offset:1px}',
      '#kapi button{font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer;padding:.68rem 1.4rem;',
      'border-radius:.6rem;border:1px solid rgba(122,90,20,.45);color:#241d12;',
      'background:linear-gradient(135deg,#c9a43a,#8c6a1c);transition:filter .15s ease,transform .15s ease}',
      '#kapi button:hover{filter:brightness(1.07);transform:translateY(-1px)}',
      '#kapi .kapi-hata{margin:1rem 0 0;font-size:.85rem;color:#ff9aa6;min-height:1.2em}',
      '#kapi .kapi-hata:empty{margin:0;min-height:0}',
      '#kapi.sallan .kapi-kutu{animation:kapiSallan .38s ease}',
      '@keyframes kapiSallan{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}',
      '@media (max-width:420px){#kapi .kapi-kutu{padding:1.5rem 1.1rem 1.2rem}}'
    ].join('');
    document.head.appendChild(s);
  }

  function kapiKur() {
    if (acildiMi()) return;
    document.documentElement.style.overflow = 'hidden';
    const kap = document.createElement('div');
    kap.id = 'kapi';
    kap.innerHTML = [
      '<div class="kapi-kutu">',
      '  <div class="kapi-rozet">☪</div>',
      '  <h1>Biyoğrafiler</h1>',
      '  <p class="kapi-alt">Bu site şifre korumalıdır. Devam etmek için şifreyi girin.</p>',
      '  <form autocomplete="off">',
      '    <input type="password" id="kapiSifre" placeholder="Şifre" aria-label="Şifre" autocomplete="current-password" spellcheck="false">',
      '    <button type="submit">Giriş</button>',
      '  </form>',
      '  <p class="kapi-hata" id="kapiHata" role="alert"></p>',
      '</div>'
    ].join('\n');
    document.documentElement.appendChild(kap);
    stilEkle();

    const form = kap.querySelector('form');
    const input = kap.querySelector('#kapiSifre');
    const hata = kap.querySelector('#kapiHata');

    setTimeout(() => input.focus(), 60);

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (sha256(input.value) === KAPI_ANAHTAR) {
        try {
          localStorage.setItem(KAPI_HAYIR, JSON.stringify({
            h: KAPI_ANAHTAR,
            b: Date.now() + KAPI_GUN * 24 * 60 * 60 * 1000
          }));
        } catch (err) {}
        document.documentElement.style.overflow = '';
        kap.remove();
        return;
      }
      hata.textContent = 'Şifre hatalı, tekrar deneyin.';
      input.value = '';
      input.focus();
      kap.classList.remove('sallan');
      void kap.offsetWidth;
      kap.classList.add('sallan');
    });
  }

  kapiKur();
})();
