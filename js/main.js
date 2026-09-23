/* Ae Noseare — terza bozza.
   Una giornata in campagna: alba, mattino illustrato, tramonto a pillole, sera, notte.
   GSAP 3.15 (ScrollTrigger, SplitText, CustomEase, ScrambleText) + Lenis. */
(() => {
  'use strict';

  const html = document.documentElement;
  const QA = html.classList.contains('qa');
  const STATICO = html.classList.contains('statico');
  const TOCCO = matchMedia('(hover: none), (pointer: coarse)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const telefono = () => matchMedia('(max-width: 700px)').matches;
  const parametri = new URLSearchParams(location.search);

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, ScrambleTextPlugin);
  CustomEase.create('morbido', '0.23, 1, 0.32, 1');
  CustomEase.create('scorre', '0.77, 0, 0.175, 1');
  gsap.defaults({ ease: 'morbido', duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------------- testi che rotolano ---------------- */
  $$('.rotola').forEach((el) => {
    const t = el.dataset.t || el.textContent.trim();
    const dentro = document.createElement('span');
    dentro.className = 'rotola-in';
    dentro.dataset.t = t;
    while (el.firstChild) dentro.appendChild(el.firstChild);
    el.appendChild(dentro);
  });

  /* ---------------- scorrimento morbido ---------------- */
  let lenis = null;
  if (!QA && !STATICO) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const vaiA = (y) => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, typeof y === 'number' ? y : y.getBoundingClientRect().top + scrollY); };

  /* ---------------- ora di Roma ---------------- */
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  function adesso() {
    const parti = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date());
    const p = (t) => (parti.find((x) => x.type === t) || {}).value;
    const g = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p('weekday')];
    return { g, h: +p('hour') % 24, m: +p('minute'), mese: +p('month') - 1, anno: +p('year') };
  }
  const ora = adesso();
  $$('.anno-corrente').forEach((el) => { el.textContent = ora.anno; });

  /* la settimana della cucina nella testata */
  (function settimana() {
    const barre = $$('.oggi__barre i');
    const altezze = [0.34, 0.34, 0.34, 0.34, 0.86, 1, 0.74]; /* lun ... dom */
    barre.forEach((b, i) => {
      b.style.setProperty('--h', altezze[i]);
      if (i >= 4) b.classList.add('aperto');
      if ((i + 1) % 7 === ora.g) b.classList.add('oggi');
    });
    const oggi = GIORNI[ora.g];
    let frase;
    if (ora.g === 5 || ora.g === 6) frase = `Oggi è ${oggi}: la cucina è aperta a cena.`;
    else if (ora.g === 0) frase = 'Oggi è domenica: la cucina è aperta a pranzo.';
    else frase = `Oggi è ${oggi}: in settimana la cucina apre solo su prenotazione.`;
    $('.oggi__testo').textContent = `${frase} Venerdì e sabato a cena, domenica a pranzo.`;
    if (!STATICO) {
      barre.forEach((b, i) => {
        gsap.to(b, { scaleY: () => gsap.utils.random(0.55, 1.15), duration: gsap.utils.random(0.35, 0.6), repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut', delay: i * 0.05 });
      });
    }
  })();

  /* lo spaccio adesso */
  (function statoSpaccio() {
    const el = $('.stato-spaccio'); if (!el) return;
    const minuti = ora.h * 60 + ora.m;
    const feriale = ora.g >= 1 && ora.g <= 6;
    let t;
    if (feriale && minuti >= 510 && minuti < 720) t = 'Adesso il punto vendita è <b>aperto</b>, fino alle 12. Il distributore è sempre aperto.';
    else {
      let quando;
      if (feriale && minuti < 510) quando = 'stamattina alle 8:30';
      else if (ora.g === 6 || ora.g === 0) quando = 'lunedì alle 8:30';
      else quando = 'domattina alle 8:30';
      t = `Adesso il punto vendita è chiuso e riapre ${quando}. Il distributore invece è <b>aperto</b>, h24.`;
    }
    el.innerHTML = t;
  })();

  /* il mese in corso nell'anno in campagna */
  (function meseInCorso() {
    const li = $(`.anno__mesi li[data-mese="${ora.mese}"]`); if (!li) return;
    li.classList.add('adesso');
    const el = $('.anno__adesso');
    const cosa = li.dataset.cosa;
    el.innerHTML = cosa ? `Adesso, a ${MESI[ora.mese]}: <b>${cosa}</b>` : `Adesso siamo a ${MESI[ora.mese]}`;
  })();

  /* ---------------- menu del telefono ---------------- */
  const apri = $('.testata__apri'), menuTel = $('#menu-tel');
  function menu(stato) {
    const aperto = stato ?? !menuTel.classList.contains('aperto');
    menuTel.classList.toggle('aperto', aperto);
    menuTel.setAttribute('aria-hidden', String(!aperto));
    apri.setAttribute('aria-expanded', String(aperto));
    html.classList.toggle('menu-aperto', aperto);
    if (lenis) aperto ? lenis.stop() : lenis.start();
    if (aperto && !STATICO) gsap.fromTo($$('#menu-tel li'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8, delay: 0.25 });
  }
  apri.addEventListener('click', () => menu());
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuTel.classList.contains('aperto')) menu(false); });

  /* ---------------- salti con il cerchio (visiblecuration) ---------------- */
  const velo = $('.velo');
  const FONDI = { giorno: '#F3F7FB', sera: '#0B0401', notte: '#070A14' };
  function fondoDi(el) {
    let n = el;
    while (n && n !== document.body) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      if (n.dataset && n.dataset.tema && FONDI[n.dataset.tema]) return FONDI[n.dataset.tema];
      n = n.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  }
  function salta(href, e) {
    const bersaglio = href === '#inizio' ? $('#inizio') : $(href);
    if (!bersaglio) return;
    const primo = bersaglio.querySelector('.eroe__palco, .tramonto__palco, .camere__fisso') || bersaglio;
    if (STATICO) { bersaglio.scrollIntoView(); return; }
    const x = e && e.clientX ? e.clientX : innerWidth / 2;
    const y = e && e.clientY ? e.clientY : innerHeight / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    velo.style.setProperty('--velo-c', fondoDi(primo));
    gsap.timeline()
      .set(velo, { opacity: 1, clipPath: `circle(0px at ${x}px ${y}px)` })
      .to(velo, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.7, ease: 'scorre' })
      .add(() => {
        const top = bersaglio.getBoundingClientRect().top + (lenis ? lenis.scroll : scrollY);
        vaiA(Math.max(0, top));
        ScrollTrigger.update();
      })
      .to(velo, { opacity: 0, duration: 0.55, ease: 'power1.inOut' }, '+=0.08')
      .set(velo, { clipPath: 'circle(0px at 50% 50%)', opacity: 1 });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    e.preventDefault();
    if (menuTel.classList.contains('aperto')) { menu(false); setTimeout(() => salta(href), 350); return; }
    salta(href, e);
  });

  /* ---------------- puntatore: sole e luna ---------------- */
  if (!TOCCO && !STATICO && !QA) {
    html.classList.add('con-cursore');
    const c = $('.cursore'), svg = $('.cursore__corpo svg'), ombra = $('.cursore__ombra');
    gsap.set(c, { x: -100, y: -100 });
    const xTo = gsap.quickTo(c, 'x', { duration: 0.18, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.18, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    const cliccabile = 'a, button, summary, .riga, label';
    document.addEventListener('pointerover', (e) => { if (e.target.closest(cliccabile)) html.classList.add('cursore-su'); });
    document.addEventListener('pointerout', (e) => { if (e.target.closest(cliccabile)) html.classList.remove('cursore-su'); });
    let giro = 0;
    gsap.ticker.add(() => {
      const sera = html.classList.contains('di-sera');
      const v = lenis ? Math.abs(lenis.velocity) : 0;
      giro = sera ? giro + (-18 - giro) * 0.08 : giro + 0.35 + v * 0.22;
      svg.style.transform = `rotate(${giro}deg)`;
    });
    new MutationObserver(() => {
      gsap.to(ombra, { attr: { cx: html.classList.contains('di-sera') ? 7 : 34 }, duration: 0.6, ease: 'morbido', overwrite: true });
    }).observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------------- la testata ---------------- */
  const testata = $('#testata');
  function tema(t) {
    testata.dataset.tema = t;
    html.classList.toggle('di-sera', t === 'sera' || t === 'notte');
  }
  tema('giorno');

  /* ---------------- il campo di lavanda (onde di visiblecuration) ---------------- */
  const PALETTE_LAV = [
    ['#9C84E8', '#C7B6FA', '#E6DDFF', '#FFFFFF'],
    ['#B9A6F5', '#DCD1FD', '#F3EEFF', '#FFFFFF'],
    ['#7E63D6', '#A994F2', '#D2C6FB', '#F4F0FF'],
    ['#C9BAF8', '#E9E2FE', '#FFFFFF', '#E3D9FF'],
    ['#A67EFF', '#CDB8FF', '#EFE8FF', '#FFFFFF'],
    ['#B9A6F5', '#E3DAFE', '#FFFFFF', '#CDB8FF'],
  ];
  function campoLavanda() {
    const svg = $('.lavanda'), box = svg.parentElement;
    const W = box.clientWidth, H = box.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const r = telefono() ? Math.max(38, W * 0.125) : Math.max(54, Math.min(W * 0.066, 116));
    const passo = r * 1.9, bordo = Math.max(3, r * 0.055);
    let seme = 11;
    const caso = () => (seme = (seme * 9301 + 49297) % 233280) / 233280;
    let out = '';
    for (let f = 0; f < 3; f++) {
      const cy = H - (2 - f) * r * 0.58 + r * 0.12;
      const sfasa = f % 2 ? passo / 2 : 0;
      out += `<g class="fila" data-fila="${f}">`;
      for (let x = -passo + sfasa; x < W + passo; x += passo) {
        const pal = PALETTE_LAV[Math.floor(caso() * PALETTE_LAV.length)];
        out += `<g transform="translate(${x.toFixed(1)} ${cy.toFixed(1)})"><g class="ventaglio">`;
        [1, 0.76, 0.52, 0.28].forEach((k, i) => { out += `<circle r="${(r * k).toFixed(1)}" fill="${pal[i]}" stroke="#fff" stroke-width="${bordo.toFixed(1)}"/>`; });
        out += '</g></g>';
      }
      out += '</g>';
    }
    svg.innerHTML = out;
    return r;
  }

  /* ---------------- la scena del tramonto ---------------- */
  const TINTE = [
    ['#FFC21A', '#FF9A00'], ['#FF7A00', '#FFA23A'], ['#FCE4BC', '#F7C98A'], ['#E8401A', '#FF7A2E'],
    ['#FF6040', '#FFC000'], ['#FFA83A', '#FFD060'], ['#FFC870', '#FFE3A6'],
  ];
  const PROFILO = [0.36, 0.58, 0.7, 0.88, 0.64, 0.52, 0.4];
  let geoTramonto = null;
  function scenaTramonto() {
    const palco = $('.tramonto__palco'), svg = $('.tramonto__scena');
    const W = palco.clientWidth, H = palco.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const foto = $('.tramonto__foto');
    foto.setAttribute('width', W); foto.setAttribute('height', H);
    const n = 7, m = W * (telefono() ? 0.02 : 0.03), g = W * (telefono() ? 0.014 : 0.012);
    const w = (W - 2 * m - (n - 1) * g) / n;
    const taglio = $('#tramonto-taglio'), tinte = $('.tramonto__tinte');
    let rc = '', rt = '', defs = '';
    for (let i = 0; i < n; i++) {
      const x = m + i * (w + g);
      rc += `<rect x="${x}" y="${H + 20}" width="${w}" height="${H * PROFILO[i]}" rx="${w / 2}"/>`;
      defs += `<linearGradient id="tinta-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TINTE[i][0]}"/><stop offset="1" stop-color="${TINTE[i][1]}"/></linearGradient>`;
      rt += `<rect x="${x}" y="${H + 20}" width="${w}" height="${H * PROFILO[i]}" rx="${w / 2}" fill="url(#tinta-${i})"/>`;
    }
    taglio.innerHTML = rc;
    tinte.innerHTML = `<defs>${defs}</defs>${rt}<rect class="tramonto__velo" x="0" y="0" width="${W}" height="${H}" fill="url(#tramonto-buio)" opacity="0"/>`;
    if (!$('#tramonto-buio')) {
      const d = svg.querySelector('defs');
      d.insertAdjacentHTML('beforeend', '<linearGradient id="tramonto-buio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0401" stop-opacity=".1"/><stop offset=".55" stop-color="#0B0401" stop-opacity=".35"/><stop offset="1" stop-color="#0B0401" stop-opacity=".92"/></linearGradient>');
    }
    geoTramonto = { W, H, n, m, g, w };
  }

  /* ---------------- l'orizzonte del piede ---------------- */
  function orizzonte() {
    const box = $('.piede__orizzonte'); if (!box) return null;
    const W = box.clientWidth, H = box.clientHeight;
    const svg = $('.orizzonte');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const P = [[0, 0.74], [0.1, 0.6], [0.22, 0.66], [0.34, 0.46], [0.47, 0.56], [0.6, 0.32], [0.73, 0.44], [0.86, 0.24], [1, 0.3]].map(([x, y]) => [x * W, y * H]);
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    const linea = $('.orizzonte__linea'), ombra = $('.orizzonte__ombra');
    linea.setAttribute('d', d);
    ombra.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
    const L = linea.getTotalLength();
    linea.style.strokeDasharray = `${L}`;
    return { linea, L };
  }

  /* ---------------- misure dei livelli ---------------- */
  function misuraLivelli() {
    $$('.livello__scena').forEach((scena) => {
      const W = scena.clientWidth;
      $$('.livello__binario', scena).forEach((b) => {
        const parole = b.children, terza = parole[2];
        const passo = parole[1].offsetLeft - parole[0].offsetLeft;
        const x0 = W / 2 - (terza.offsetLeft + terza.offsetWidth / 2);
        b.style.setProperty('--x0', `${x0}px`);
        scena._passo = passo; scena._x0 = x0;
      });
    });
  }

  /* ================================================================ */
  /*                      MODALITÀ STATICA                              */
  /* ================================================================ */
  if (STATICO) {
    campoLavanda();
    misuraLivelli();
    $$('.livello__scena').forEach((s) => { s.style.setProperty('--p', s.parentElement.dataset.livello); $$('.livello__binario', s).forEach((b) => b.style.setProperty('--x', `${s._x0}px`)); });
    scenaTramonto();
    const { W, H, n } = geoTramonto;
    $$('#tramonto-taglio rect').forEach((r, i) => { r.setAttribute('x', (i * W) / n - 0.5); r.setAttribute('width', W / n + 1); r.setAttribute('y', 0); r.setAttribute('height', H); r.setAttribute('rx', 0); });
    $$('.tramonto__tinte > rect:not(.tramonto__velo)').forEach((r) => r.setAttribute('opacity', 0));
    const buio = $('.tramonto__velo'); if (buio) buio.setAttribute('opacity', 1);
    const targa = $('.tramonto__targa'); if (targa) targa.style.display = 'none';
    return;
  }

  /* ================================================================ */
  /*                         ANIMAZIONI                                 */
  /* ================================================================ */
  const rLav = campoLavanda();
  scenaTramonto();
  misuraLivelli();
  const orz = orizzonte();

  /* ---------- ingresso dell'eroe ---------- */
  const nomeSplit = SplitText.create('.eroe__nome', { type: 'words,chars', mask: 'chars', wordsClass: 'parola' });
  gsap.set('.palla__fumetto', { opacity: 0 });
  function ingressoEroe() {
    const tl = gsap.timeline({ defaults: { ease: 'morbido' } });
    tl.from('.arco', { yPercent: 60, duration: 1.5, stagger: { each: 0.09, from: 'center' } }, 0)
      .from('.arco', { '--b1': '#ffffff', '--b2': '#ffffff', '--b3': '#ffffff', duration: 1.6, stagger: { each: 0.12, from: 'center' }, ease: 'power2.out' }, 0.3)
      .from('.lavanda .fila', { y: rLav * 1.6, duration: 1.3, stagger: 0.12 }, 0.15)
      .from('.noce', { scale: 0.3, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'back.out(1.5)', transformOrigin: '50% 100%' }, 0.45)
      .from('.eroe__nuvole .nuvola', { x: (i) => (i % 2 ? 90 : -90), opacity: 0, duration: 1.8, stagger: 0.1 }, 0.3)
      .from(nomeSplit.chars, { yPercent: 115, duration: 1.15, stagger: 0.04 }, 0.35)
      .from('.eroe__sotto', { opacity: 0, y: 14, duration: 0.9 }, 0.95)
      .fromTo('.eroe__corsivo span', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 1.6, ease: 'scorre' }, 1.0)
      .from('.palla', { scale: 0.5, opacity: 0, duration: 1.1, stagger: 0.18, ease: 'back.out(1.8)', transformOrigin: '50% 75%' }, 0.8)
      .from('.gallo', { y: -90, opacity: 0, duration: 1, ease: 'bounce.out' }, 1.25)
      .from('.eroe__giu', { opacity: 0, y: 12, duration: 0.7 }, 1.7)
      .fromTo(testata, { yPercent: -130 }, { yPercent: 0, duration: 1.1, clearProps: 'transform' }, 0.9)
      .add(() => canta(), 2.3);
    return tl;
  }

  /* il gallo */
  const testa = $('.gallo__testa'), coda = $('.gallo__coda'), fumetto = $('.palla__fumetto');
  let beccate = null, cantando = false;
  function canta() {
    if (cantando) return;
    cantando = true;
    if (beccate) beccate.pause();
    gsap.timeline({ onComplete: () => { cantando = false; if (beccate) beccate.restart(true); } })
      .to(testa, { rotation: -22, duration: 0.25, ease: 'power2.out' })
      .to(fumetto, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.1)
      .to(testa, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, 0.9)
      .to(fumetto, { opacity: 0, y: 6, scale: 0.92, duration: 0.3, ease: 'power2.in' }, 1.9);
  }
  beccate = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 4 })
    .to(testa, { rotation: 16, duration: 0.18, ease: 'power2.in' })
    .to(testa, { rotation: 0, duration: 0.3, ease: 'power2.out' })
    .to(testa, { rotation: 14, duration: 0.16, ease: 'power2.in' }, '+=0.2')
    .to(testa, { rotation: 0, duration: 0.35, ease: 'power2.out' });
  gsap.to(coda, { rotation: 5, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  $('.palla--sole').addEventListener('pointerenter', () => canta());

  /* vita dell'eroe: alberi, nuvole, palle, lavanda */
  gsap.to('.noce', { rotation: (i) => (i % 2 ? -1.6 : 1.8), duration: (i) => 3.2 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' });
  gsap.to('.eroe__nuvole .nuvola', { x: (i) => (i % 2 ? -40 : 50), duration: (i) => 9 + i * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.palla svg', { y: -7, duration: (i) => 2.4 + i * 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  let vento = null;
  function ventoLavanda(r) {
    if (vento) vento.revert();
    vento = gsap.context(() => {
      $$('.lavanda .fila').forEach((f, i) => {
        gsap.to(f, { x: (i % 2 ? -1 : 1) * r * 0.16, duration: 3.4 + i * 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });
      gsap.to('.lavanda .ventaglio', { y: -r * 0.09, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut', stagger: { each: 0.04, from: 'start', repeat: -1, repeatDelay: 2.6 } });
    });
  }
  ventoLavanda(rLav);

  /* ---------- alba ---------- */
  function alba() {
    return new Promise((fine) => {
      const el = $('#alba');
      if (!html.classList.contains('in-alba')) { fine(); return; }
      if (lenis) lenis.stop();
      window.scrollTo(0, 0);
      const pillole = $$('.alba__pillole i', el);
      const righe = $$('.alba__riga, .alba__targa', el);
      const bottone = $('.alba__entra', el), stato = $('.alba__stato', el);
      gsap.timeline()
        .from(pillole, { scaleY: 0.15, opacity: 0, duration: 1, stagger: { each: 0.06, from: 'center' } }, 0)
        .from(righe, { yPercent: 70, opacity: 0, duration: 1, stagger: 0.09 }, 0.2)
        .to(bottone, { opacity: 1, duration: 0.6 }, 0.6);

      /* avanzamento: font e immagini delle prime sezioni, con un tempo minimo */
      const caricamento = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
      const attese = [document.fonts.ready.catch(() => {}), caricamento];
      let caricati = 0;
      attese.forEach((p) => p.then(() => { caricati++; }));
      const t0 = performance.now(), MIN = 1500, MAX = 4200;
      let accese = 0, uscito = false;
      function accendi(i) {
        const p = pillole[i];
        gsap.to(p, { '--acceso': 1, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(p, { scaleY: 1.18 }, { scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      }
      const giro = () => {
        const tp = Math.min(1, (performance.now() - t0) / MIN);
        const cp = caricati / attese.length;
        const p = performance.now() - t0 > MAX ? 1 : Math.min(tp, cp);
        const bersaglio = Math.floor(p * pillole.length + 0.001);
        while (accese < bersaglio) accendi(accese++);
        if (accese >= pillole.length) {
          gsap.ticker.remove(giro);
          gsap.to(stato, { duration: 0.7, scrambleText: { text: 'entra in campagna', chars: 'abcdefghilmnopqrstuvz', speed: 0.6 } });
          gsap.delayedCall(0.75, esci);
        }
      };
      gsap.ticker.add(giro);
      bottone.addEventListener('click', () => { accese = pillole.length; pillole.forEach((p) => gsap.set(p, { '--acceso': 1 })); gsap.ticker.remove(giro); esci(); });

      function esci() {
        if (uscito) return; uscito = true;
        const R = Math.hypot(innerWidth / 2, innerHeight * 1.1) + 40;
        const tl = gsap.timeline({ onComplete: () => { html.classList.remove('in-alba'); if (lenis) lenis.start(); ScrollTrigger.refresh(); fine(); } });
        tl.to(pillole, { scaleY: 1.25, duration: 0.3, stagger: { each: 0.04, from: 'center' }, ease: 'power2.out' })
          .to(pillole, { yPercent: 160, opacity: 0, duration: 0.8, stagger: { each: 0.05, from: 'center' }, ease: 'power3.in' }, 0.25)
          .to([...righe, bottone], { yPercent: -60, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power2.in' }, 0.2)
          .to('.alba__bagliore', { scale: 1.2, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.35)
          .fromTo(el, { '--buco': '0px' }, { '--buco': `${R}px`, duration: 1.3, ease: 'scorre' }, 0.7)
          .add(() => { ingressoEroe(); }, 0.95);
      }
    });
  }

  /* ================================================================ */
  /*          PIN E SCROLL (creati dall'alto in basso)                  */
  /* ================================================================ */

  /* eroe pinnato: gli strati si separano */
  const mouseEroe = {};
  gsap.timeline({ scrollTrigger: { trigger: '.eroe', start: 'top top', end: '+=75%', pin: true, scrub: 0.6 } })
    .to('.eroe__titolo', { yPercent: -70, opacity: 0, ease: 'none' }, 0)
    .to('.eroe__lavanda', { yPercent: 22, scale: 1.14, transformOrigin: '50% 100%', ease: 'none' }, 0)
    .to('.eroe__archi', { yPercent: -5, scale: 0.93, transformOrigin: '50% 100%', ease: 'none' }, 0)
    .to('.noce--sx, .noce--sx2', { xPercent: -45, ease: 'none' }, 0)
    .to('.noce--dx', { xPercent: 45, ease: 'none' }, 0)
    .to('.palla--sole', { xPercent: -40, yPercent: -25, ease: 'none' }, 0)
    .to('.palla--lavanda', { xPercent: 45, yPercent: -35, ease: 'none' }, 0)
    .to('.eroe__corsivo', { yPercent: 70, scale: 1.14, ease: 'none' }, 0)
    .to('.eroe__nuvole', { yPercent: -18, ease: 'none' }, 0)
    .to('.eroe__cielo', { opacity: 0.6, ease: 'none' }, 0)
    .to('.eroe__giu', { opacity: 0, duration: 0.15, ease: 'none' }, 0);

  if (!TOCCO) {
    const strati = [['.eroe__nuvole', 6], ['.eroe__archi', 10], ['.eroe__alberi', 18], ['.eroe__lavanda', 26], ['.palla--sole', 22], ['.palla--lavanda', 22], ['.eroe__corsivo', 12]];
    strati.forEach(([s, a]) => { mouseEroe[s] = { x: gsap.quickTo(s, 'x', { duration: 1.1, ease: 'power3' }), a }; });
    $('.eroe').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      strati.forEach(([s]) => mouseEroe[s].x(-nx * mouseEroe[s].a));
    });
  }

  /* tramonto: il cielo si spegne, le pillole salgono e diventano la griglia */
  function timelineTramonto() {
    const { W, H, n, w } = geoTramonto;
    const tagli = $$('#tramonto-taglio rect'), tinte = $$('.tramonto__tinte > rect:not(.tramonto__velo)');
    const buio = $('.tramonto__velo');
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('.tramonto__palco', { keyframes: { backgroundColor: ['#ADD8F0', '#F4B47E', '#C2531E', '#3A1206', '#0B0401'] }, duration: 1.1 }, 0)
      .fromTo('.tramonto__sole', { top: '28%' }, { top: '112%', duration: 1.1, ease: 'power1.in' }, 0)
      .fromTo('.tramonto__parola', { opacity: 0, yPercent: -20 }, { opacity: 1, yPercent: -50, duration: 0.6 }, 0.55);
    [tagli, tinte].forEach((gruppo) => {
      gruppo.forEach((r, i) => {
        const h = H * PROFILO[i];
        const ritardo = Math.abs(i - (n - 1) / 2) * 0.07;
        tl.fromTo(r, { attr: { y: H + 20, height: h } }, { attr: { y: H - h * 0.92, height: h + 40 }, duration: 0.85, ease: 'power2.out' }, 1.1 + ritardo);
        tl.to(r, { attr: { y: -40, height: H + 80 }, duration: 0.9, ease: 'power1.inOut' }, 2.15 + ritardo * 0.5);
        tl.to(r, { attr: { x: (i * W) / n - 0.5, width: W / n + 1, rx: 0 }, duration: 0.9, ease: 'power2.inOut' }, 3.1);
      });
    });
    tl.fromTo(tinte, { opacity: 0.92 }, { opacity: 0.35, duration: 0.9 }, 2.15)
      .to(tinte, { opacity: 0, duration: 0.8 }, 3.1)
      .fromTo('.tramonto__foto', { scale: 1.14, svgOrigin: `${W / 2} ${H / 2}` }, { scale: 1, svgOrigin: `${W / 2} ${H / 2}`, duration: 1.9 }, 1.1)
      .fromTo('.tramonto__targa', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 1.5)
      .to('.tramonto__targa', { opacity: 0, duration: 0.3 }, 3.6)
      .to(buio, { opacity: 1, duration: 0.7 }, 3.9)
      .fromTo('.tramonto__testo', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 4.1)
      .to({}, { duration: 0.4 });
    return tl;
  }
  let tlTramonto = timelineTramonto();
  const stTramonto = ScrollTrigger.create({ trigger: '.tramonto', start: 'top top', end: '+=320%', pin: '.tramonto__palco', scrub: 0.8, animation: tlTramonto, invalidateOnRefresh: true });

  /* camere: il binario orizzontale */
  const binario = $('.camere__binario');
  const corsaCamere = () => Math.max(0, binario.scrollWidth - innerWidth);
  const tweenCamere = gsap.to(binario, {
    x: () => -corsaCamere(), ease: 'none',
    scrollTrigger: { trigger: '.camere__fisso', start: 'top top', end: () => `+=${corsaCamere() * 1.1}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
  });
  $$('.finestra').forEach((f) => {
    gsap.fromTo(f.querySelector('img'), { xPercent: -22 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tweenCamere, start: 'left right', end: 'right left', scrub: true } });
    gsap.fromTo(f, { rotation: 4, scale: 0.9 }, { rotation: -3, scale: 1, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tweenCamere, start: 'left right', end: 'center center', scrub: true } });
  });

  /* album: le foto sparse si ricompongono */
  const tlAlbum = gsap.timeline({ scrollTrigger: { trigger: '.album__palco', start: 'top top', end: '+=170%', pin: true, scrub: 0.8, invalidateOnRefresh: true } });
  $$('.scatto').forEach((s, i) => {
    const cs = getComputedStyle(s);
    const vx = parseFloat(cs.getPropertyValue('--x')), vy = parseFloat(cs.getPropertyValue('--y')), vr = parseFloat(cs.getPropertyValue('--r'));
    const k = () => (telefono() ? 0.95 : 1);
    gsap.set(s, { xPercent: -50, yPercent: -50 });
    tlAlbum.fromTo(s,
      { x: () => vx * innerWidth / 100 * 2.2 * k(), y: () => vy * innerHeight / 100 * 2.4 + innerHeight * 0.18, rotation: vr * 3, scale: 0.7, opacity: 0.25 },
      { x: () => vx * innerWidth / 100 * k() * (telefono() ? 0.62 : 1), y: () => vy * innerHeight / 100 * (telefono() ? 0.8 : 1), rotation: vr, scale: 1, opacity: 1, ease: 'power2.out', duration: 1 },
      i * 0.07);
  });
  tlAlbum.fromTo('.album__link', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, '>-0.25').to({}, { duration: 0.25 });

  /* ================================================================ */
  /*                    TRIGGER DOPO I PIN                              */
  /* ================================================================ */

  /* testata: si nasconde scendendo, cambia tema sulle sezioni */
  let accumulo = 0, ultimoY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll(), d = y - ultimoY; ultimoY = y;
      if (menuTel.classList.contains('aperto')) return;
      accumulo = Math.sign(d) === Math.sign(accumulo) ? accumulo + d : d;
      if (y < 120) testata.classList.remove('nascosta');
      else if (accumulo > 60) testata.classList.add('nascosta');
      else if (accumulo < -30) testata.classList.remove('nascosta');
    },
  });
  $$('[data-tema]').forEach((sez) => {
    if (sez === testata) return;
    ScrollTrigger.create({ trigger: sez, start: 'top 40px', end: 'bottom 40px', onToggle: (self) => { if (self.isActive) tema(sez.dataset.tema); } });
  });

  /* barre di avanzamento e voce attiva */
  const TRATTI = { fattoria: ['#fattoria', '#fattoria'], spaccio: ['#spaccio', '#dintorni'], cucina: ['#tramonto', '#cene'], camere: ['#camere', '#album'], contatti: ['#contatti', '#contatti'] };
  $$('.testata__voci a').forEach((a) => {
    const [da, a2] = TRATTI[a.dataset.voce];
    const barra = a.parentElement.querySelector('.corsa b');
    const ultima = a.dataset.voce === 'contatti';
    ScrollTrigger.create({
      trigger: da, endTrigger: a2,
      start: ultima ? 'top bottom' : 'top 50%', end: ultima ? 'bottom bottom' : 'bottom 50%',
      onUpdate: (self) => gsap.set(barra, { scaleX: self.progress }),
      onToggle: (self) => a.classList.toggle('attiva', self.isActive),
      onLeave: () => gsap.set(barra, { scaleX: 1 }), onLeaveBack: () => gsap.set(barra, { scaleX: 0 }),
    });
  });

  /* titoloni: lettere che salgono dalla maschera */
  $$('.titolone').forEach((t) => {
    const s = SplitText.create(t, { type: 'words,chars', mask: 'chars', wordsClass: 'parola' });
    gsap.from(s.chars, { yPercent: 118, duration: 1.1, stagger: 0.035, scrollTrigger: { trigger: t, start: 'top 88%', toggleActions: 'play none none reverse' } });
  });

  /* etichette: il testo si rimescola (dkton) */
  $$('.etichetta').forEach((e) => {
    if (e.closest('.alba')) return;
    const testo = e.textContent;
    gsap.fromTo(e, { opacity: 0 }, {
      opacity: 1, duration: 0.2,
      scrollTrigger: { trigger: e, start: 'top 92%', toggleActions: 'play none none none' },
      onStart: () => gsap.to(e, { duration: 1, scrambleText: { text: testo, chars: 'abcdefghilmnopqrstuvz', speed: 0.5, revealDelay: 0.15 } }),
    });
  });

  /* paragrafi in mono: righe che salgono */
  $$('.sez-testa__testo, .livelli__nota, .fattoria__testi p, .bottiglia p:not(.etichetta):not(.tag-fila), .latte__testi > p:not(.etichetta):not(.stato-spaccio), .occasioni p, .cucina__claudia, .vasi__nota, .colazione__piede, .prezzi__nota, .dintorni__anche').forEach((p) => {
    SplitText.create(p, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1, stagger: 0.07, scrollTrigger: { trigger: p, start: 'top 90%', toggleActions: 'play none none none' } }),
    });
  });

  /* ---------- manifesto: le lettere si accendono ---------- */
  (function manifesto() {
    const testo = $('.manifesto__testo');
    const split = SplitText.create(testo, { type: 'words,chars', wordsClass: 'parola' });
    const chars = split.chars;
    const passo = 0.05;
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.manifesto', start: 'top 55%', end: '+=125%', scrub: 0.5 } });
    tl.to(chars, { color: '#132C43', duration: 0.3, stagger: passo }, 0);
    $$('mark', testo).forEach((m) => {
      const primo = chars.findIndex((c) => m.contains(c));
      const quanti = chars.filter((c) => m.contains(c)).length;
      tl.fromTo(m, { '--m': 0 }, { '--m': 1, duration: quanti * passo }, primo * passo);
    });
    $$('.pillola', testo).forEach((p) => {
      const prima = chars.filter((c) => c.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING).length;
      tl.fromTo(p, { scale: 0, rotation: -14 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.2)' }, Math.max(0, prima * passo - 0.1));
    });
    gsap.from('.manifesto .etichetta', { opacity: 0, y: 10, scrollTrigger: { trigger: '.manifesto', start: 'top 60%' } });
  })();

  /* ---------- livelli (dkton) ---------- */
  (function livelli() {
    $$('.livello').forEach((li) => {
      const scena = $('.livello__scena', li), lettura = $('.livello__lettura', li);
      const binari = $$('.livello__binario', li);
      const livello = parseFloat(li.dataset.livello);
      const stato = { scroll: 0, sopra: 0, vivo: 0, off: 0 };
      const disegna = () => {
        const base = stato.scroll + (1 - stato.scroll) * stato.sopra;
        const p = gsap.utils.clamp(0, 1, base + stato.vivo * (1 - stato.sopra));
        scena.style.setProperty('--p', p.toFixed(4));
        lettura.classList.toggle('dentro', p > 0.82);
        const x = scena._x0 - stato.off;
        binari.forEach((b) => b.style.setProperty('--x', `${x}px`));
      };
      disegna();
      ScrollTrigger.create({
        trigger: li, start: 'top 96%', end: 'center 42%', scrub: 0.4,
        onUpdate: (self) => { stato.scroll = self.progress * livello; disegna(); },
      });
      /* il livello vive un poco, come un vu-meter */
      let tempo = Math.random() * 10;
      const vive = () => { tempo += 0.03; stato.vivo = (Math.sin(tempo * 2.1) * 0.6 + Math.sin(tempo * 5.3) * 0.4) * 0.014 * (stato.scroll > 0.05 ? 1 : 0); disegna(); };
      ScrollTrigger.create({ trigger: li, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? gsap.ticker.add(vive) : gsap.ticker.remove(vive)) });
      if (!TOCCO) {
        let giro = null;
        scena.addEventListener('pointerenter', () => {
          gsap.to(stato, { sopra: 1, duration: 0.6, ease: 'morbido', onUpdate: disegna, overwrite: 'auto' });
          giro = gsap.to(stato, { off: scena._passo, duration: 1.6, ease: 'none', repeat: -1, onUpdate: disegna });
        });
        scena.addEventListener('pointerleave', () => {
          gsap.to(stato, { sopra: 0, duration: 0.7, ease: 'scorre', onUpdate: disegna, overwrite: 'auto' });
          if (giro) { giro.kill(); giro = null; }
          gsap.to(stato, { off: 0, duration: 0.6, ease: 'morbido', onUpdate: disegna });
        });
      }
    });
  })();

  /* ---------- fattoria ---------- */
  gsap.fromTo('.arcata img', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.arcata', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.arcata', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.4, ease: 'scorre', scrollTrigger: { trigger: '.arcata', start: 'top 85%' } });
  gsap.from('.testo-grande', { y: 40, opacity: 0, duration: 1, scrollTrigger: { trigger: '.testo-grande', start: 'top 88%' } });

  /* nastri che scorrono, con l'inclinazione legata alla velocità */
  function nastro(el, verso) {
    const bin = $('.nastro__binario', el), giro = $('.nastro__giro', el);
    bin.appendChild(giro.cloneNode(true)).setAttribute('aria-hidden', 'true');
    const t = gsap.fromTo(bin, { xPercent: verso > 0 ? -50 : 0 }, { xPercent: verso > 0 ? 0 : -50, duration: giro.offsetWidth / 90, ease: 'none', repeat: -1 });
    const skew = gsap.quickTo(bin, 'skewX', { duration: 0.5, ease: 'power3' });
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        skew(gsap.utils.clamp(-14, 14, v / -220));
        gsap.to(t, { timeScale: 1 + Math.min(4, Math.abs(v) / 700), duration: 0.2, overwrite: true, onComplete: () => gsap.to(t, { timeScale: 1, duration: 1.2 }) });
      },
      onToggle: (self) => (self.isActive ? t.play() : t.pause()),
    });
    $$('.nastro__sole', bin).forEach((s) => gsap.to(s, { rotation: 360, duration: 8, repeat: -1, ease: 'none' }));
  }
  $$('.nastro').forEach((n) => nastro(n, n.classList.contains('nastro--rovescio') ? 1 : -1));

  $$('.bottiglia').forEach((b, i) => {
    gsap.from(b, { y: 90, opacity: 0, duration: 1.2, scrollTrigger: { trigger: b, start: 'top 90%' } });
    gsap.fromTo(b.querySelector('.bottiglia__foto'), { yPercent: i ? 8 : -4 }, { yPercent: i ? -8 : 6, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(b.querySelector('img'), { scale: 1.3 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* l'anno in campagna: le pillole salgono come un equalizzatore */
  (function anno() {
    const barre = $$('.anno__mesi i'), scritte = $$('.anno__mesi span');
    gsap.set(barre, { scaleY: 0.04 });
    ScrollTrigger.create({
      trigger: '.anno__mesi', start: 'top 80%', once: true,
      onEnter: () => {
        gsap.to(barre, { scaleY: 1, duration: 1.4, ease: 'elastic.out(1, 0.55)', stagger: { each: 0.06, from: 'start' } });
        gsap.from(scritte, { opacity: 0, y: 16, duration: 0.8, stagger: 0.12, delay: 0.7 });
        gsap.delayedCall(2.4, () => {
          barre.forEach((b) => gsap.to(b, { scaleY: () => gsap.utils.random(0.9, 1.04), duration: gsap.utils.random(0.9, 1.6), repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut' }));
        });
      },
    });
  })();

  /* ---------- spaccio ---------- */
  $$('.vaso').forEach((v, i) => {
    gsap.from(v, { y: 120, opacity: 0, duration: 1.3, delay: i * 0.12, scrollTrigger: { trigger: '.vasi', start: 'top 85%' } });
    gsap.fromTo(v.querySelector('.vaso__foto'), { yPercent: i === 1 ? 10 : 4 }, { yPercent: i === 1 ? -12 : -4, ease: 'none', scrollTrigger: { trigger: '.vasi', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(v.querySelector('img'), { scale: 1.32 }, { scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.vasi', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  (function latte() {
    const livello = $('.latte__livello'), cifra = $('.latte__cifra'), val = { v: 0 };
    gsap.to('.latte__onda', { x: 60, duration: 1.6, repeat: -1, ease: 'none' });
    gsap.timeline({ scrollTrigger: { trigger: '.latte', start: 'top 80%', end: 'center 45%', scrub: 0.6 } })
      .fromTo(livello, { y: 300 }, { y: 62, ease: 'power1.out' }, 0)
      .to(val, { v: 1.2, ease: 'none', onUpdate: () => { cifra.textContent = val.v.toFixed(2).replace('.', ','); } }, 0);
    gsap.from('.latte__titolo', { y: 40, opacity: 0, duration: 1, scrollTrigger: { trigger: '.latte', start: 'top 80%' } });
    gsap.from('.orari div', { x: -30, opacity: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.orari', start: 'top 90%' } });
  })();

  /* ---------- dintorni: cartoline sparse che fluttuano ---------- */
  const mmDintorni = gsap.matchMedia();
  mmDintorni.add('(min-width: 701px)', () => {
    $$('.cartolina').forEach((c) => {
      const vel = parseFloat(c.dataset.vel || 0);
      gsap.fromTo(c, { yPercent: vel * -260 }, { yPercent: vel * 260, ease: 'none', scrollTrigger: { trigger: '.dintorni__campo', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(c.querySelector('img'), { scale: 0.7, rotation: vel * 40, opacity: 0, duration: 1.2, ease: 'back.out(1.4)', scrollTrigger: { trigger: c, start: 'top 90%' } });
    });
    $$('.dintorni__campo .nuvola').forEach((n, i) => {
      gsap.fromTo(n, { x: i % 2 ? 120 : -120 }, { x: i % 2 ? -120 : 120, ease: 'none', scrollTrigger: { trigger: '.dintorni__campo', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  mmDintorni.add('(max-width: 700px)', () => {
    $$('.cartolina').forEach((c, i) => {
      gsap.from(c, { x: i % 2 ? 80 : -80, rotation: i % 2 ? 5 : -5, opacity: 0, duration: 1.1, scrollTrigger: { trigger: c, start: 'top 88%' } });
      gsap.fromTo(c.querySelector('img'), { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* ---------- fascia: le due righe scorrono in versi opposti ---------- */
  gsap.fromTo('.fascia__riga--sx', { x: () => -innerWidth * 0.14 }, { x: () => innerWidth * 0.03, ease: 'none', scrollTrigger: { trigger: '.fascia', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  gsap.fromTo('.fascia__riga--dx', { x: () => innerWidth * 0.14 }, { x: () => -innerWidth * 0.03, ease: 'none', scrollTrigger: { trigger: '.fascia', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  gsap.from('.fascia__linea', { scaleX: 0, transformOrigin: (i) => (i ? '100% 50%' : '0 50%'), duration: 1, stagger: 0.2, scrollTrigger: { trigger: '.fascia', start: 'top 75%' } });

  /* ---------- cucina: i nomi si accendono lettera per lettera ---------- */
  $$('.piatto').forEach((p) => {
    const nome = $('.piatto__nome', p), foto = $('.piatto__foto', p);
    const s = SplitText.create(nome, { type: 'words,chars', wordsClass: 'parola' });
    gsap.fromTo(s.chars, { color: '#2F2B2D' }, { color: '#FFB800', ease: 'none', stagger: 0.08, scrollTrigger: { trigger: nome, start: 'top 95%', end: 'bottom 55%', scrub: 0.4 } });
    gsap.fromTo(foto, { clipPath: 'inset(14% 10% 14% 10% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: foto, start: 'top 95%', end: 'top 35%', scrub: 0.5 } });
    gsap.fromTo(foto.querySelector('img'), { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: foto, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.piatto__crediti div', p), { x: -30, opacity: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: p, start: 'top 75%' } });
    gsap.from($$('.tag', foto), { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)', scrollTrigger: { trigger: foto, start: 'top 60%' } });
  });

  /* ---------- carta: righe che si riempiono di giallo (dkton) ---------- */
  (function carta() {
    const righe = $$('.riga');
    const anteprima = $('.anteprima'), dentro = $('.anteprima__dentro'), foto = $('.anteprima img');
    const accendi = (r, si) => {
      const f = $('.riga__riempi', r);
      r.classList.toggle('attiva', si);
      if (si) gsap.to(f, { scaleX: 1, duration: 0.55, ease: 'morbido', overwrite: true });
      else gsap.to(f, { scaleX: 0, duration: 0.5, ease: 'scorre', overwrite: true });
    };
    ScrollTrigger.batch('.riga', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 0.9, stagger: 0.06 }) });
    if (!TOCCO) {
      gsap.set(anteprima, { x: innerWidth / 2, y: innerHeight / 2 });
      const xTo = gsap.quickTo(anteprima, 'x', { duration: 0.55, ease: 'power3' }), yTo = gsap.quickTo(anteprima, 'y', { duration: 0.55, ease: 'power3' });
      const rTo = gsap.quickTo(dentro, 'rotation', { duration: 0.6, ease: 'power3' });
      let ultimoX = 0;
      addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); rTo(gsap.utils.clamp(-8, 8, (e.clientX - ultimoX) * 0.4)); ultimoX = e.clientX; }, { passive: true });
      righe.forEach((r) => {
        r.addEventListener('pointerenter', () => {
          accendi(r, true);
          if (r.dataset.foto) { foto.src = r.dataset.foto; gsap.to(dentro, { scale: 1, duration: 0.55, ease: 'back.out(1.5)', overwrite: 'auto' }); }
          else gsap.to(dentro, { scale: 0, duration: 0.3, overwrite: 'auto' });
        });
        r.addEventListener('pointerleave', () => { accendi(r, false); gsap.to(dentro, { scale: 0, duration: 0.3, overwrite: 'auto' }); });
      });
    } else {
      /* sul telefono si accende la riga che passa a metà schermo */
      righe.forEach((r) => ScrollTrigger.create({ trigger: r, start: 'top 58%', end: 'bottom 42%', onToggle: (self) => accendi(r, self.isActive) }));
    }
  })();

  /* ---------- cene e occasioni ---------- */
  gsap.from('.occasioni article', { y: 60, opacity: 0, duration: 1, stagger: 0.12, scrollTrigger: { trigger: '.occasioni', start: 'top 85%' } });

  /* ---------- camere: prezzi a livello e colazione ---------- */
  $$('.prezzo').forEach((p) => {
    const v = +p.dataset.valore;
    p.style.setProperty('--quota', (v / 110).toFixed(3));
    const cifra = $('.prezzo__cifra', p), n = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 88%', end: 'top 50%', scrub: 0.5 } })
      .fromTo($('.prezzo__riempi', p), { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      .to(n, { v, ease: 'none', onUpdate: () => { cifra.textContent = `da ${Math.round(n.v)} €`; } }, 0);
  });
  (function colazione() {
    const c = $('.colazione__corsivo');
    gsap.fromTo(c, { clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.8, ease: 'scorre', scrollTrigger: { trigger: c, start: 'top 85%' } });
    gsap.from('.colazione__testo', { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: '.colazione__testo', start: 'top 90%' } });
    gsap.from('.colazione__cose li', { scale: 0.4, opacity: 0, y: 20, duration: 0.7, ease: 'back.out(2.2)', stagger: { each: 0.06, from: 'random' }, scrollTrigger: { trigger: '.colazione__cose', start: 'top 90%' } });
  })();

  /* ---------- domande: fisarmonica ---------- */
  $$('.domanda').forEach((d) => {
    const sum = $('summary', d), ris = $('.domanda__risposta', d);
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(ris, { height: 0, duration: 0.45, ease: 'scorre', onComplete: () => { d.open = false; gsap.set(ris, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        d.classList.remove('aperta');
      } else {
        d.open = true;
        gsap.fromTo(ris, { height: 0 }, { height: 'auto', duration: 0.6, ease: 'morbido', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo(ris.querySelector('p'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.1 });
      }
    });
  });
  ScrollTrigger.batch('.domanda', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: 0.8, stagger: 0.07 }) });

  /* ---------- piede: l'orizzonte si disegna e il sole ci corre sopra ---------- */
  if (orz) {
    const sole = $('.orizzonte__sole');
    const disegna = (p) => {
      const L = orz.L;
      orz.linea.style.strokeDashoffset = `${L * (1 - p)}`;
      const pt = orz.linea.getPointAtLength(Math.max(0.01, L * p));
      gsap.set(sole, { x: pt.x, y: pt.y, rotation: p * 540 });
    };
    disegna(0);
    ScrollTrigger.create({ trigger: '.piede__orizzonte', start: 'top 95%', end: 'bottom 55%', scrub: 0.6, onUpdate: (self) => disegna(self.progress), onRefresh: (self) => disegna(self.progress) });
    gsap.fromTo('.orizzonte__ombra', { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.piede__orizzonte', start: 'top 80%', end: 'bottom 55%', scrub: true } });
  }
  (function marchio() {
    const parole = $$('.piede__parola');
    const s = SplitText.create(parole, { type: 'words,chars', mask: 'chars', wordsClass: 'parola' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.piede__marchio', start: 'top 95%', toggleActions: 'play none none reverse' } });
    tl.from(s.chars, { yPercent: 115, duration: 1.2, stagger: 0.045 })
      .from('.piede__sole', { scale: 0, rotation: -200, duration: 1.4, ease: 'back.out(1.6)' }, 0.2);
    gsap.to('.piede__sole', { rotation: '+=360', duration: 14, repeat: -1, ease: 'none', delay: 1.6 });
    gsap.from('.piede__blocco', { y: 50, opacity: 0, duration: 1, stagger: 0.12, scrollTrigger: { trigger: '.piede__alto', start: 'top 88%' } });
    gsap.from('.piede__marchi li', { y: 30, opacity: 0, rotation: () => gsap.utils.random(-6, 6), duration: 0.8, stagger: 0.07, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.piede__marchi', start: 'top 92%' } });
  })();

  /* sole della testata che gira piano */
  gsap.to('.testata__marchio svg', { rotation: 360, duration: 20, repeat: -1, ease: 'none' });

  /* il bottone per chiamare: squilla ogni tanto */
  gsap.timeline({ repeat: -1, repeatDelay: 6, delay: 6 })
    .to('.chiama svg', { rotation: -16, duration: 0.07 })
    .to('.chiama svg', { rotation: 14, duration: 0.07, repeat: 5, yoyo: true })
    .to('.chiama svg', { rotation: 0, duration: 0.2, ease: 'elastic.out(1, 0.4)' });

  /* ---------------- ridisegno al cambio di misura ---------------- */
  let larghezza = innerWidth;
  let timer = null;
  addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(innerWidth - larghezza) < 2 && TOCCO) return; /* barra del telefono */
      larghezza = innerWidth;
      ventoLavanda(campoLavanda());
      scenaTramonto();
      const p = stTramonto.progress;
      tlTramonto.kill();
      tlTramonto = timelineTramonto();
      stTramonto.animation = tlTramonto;
      tlTramonto.progress(p);
      misuraLivelli();
      orizzonte();
      ScrollTrigger.refresh();
    }, 220);
  });

  /* ---------------- partenza ---------------- */
  const vai = parametri.get('scroll');
  document.fonts.ready.then(() => {
    misuraLivelli();
    ScrollTrigger.refresh();
    if (lenis) lenis.resize();
    if (vai) { vaiA(+vai); ScrollTrigger.update(); }
  });
  if (html.classList.contains('in-alba')) alba();
  else ingressoEroe();
  window.__aeNoseare = { lenis, gsap, ScrollTrigger };
})();
