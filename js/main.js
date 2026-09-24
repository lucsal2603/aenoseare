/* Ae Noseare — quarta bozza.
   Il marchio gigante che vola nella testata, la foto che si apre da una macchia,
   la campagna che si apre tra le parole, la fisarmonica, i piatti che rotolano,
   la fascia che spazza, le camere dal fondo, il rullo delle città, il cestino con la fisica.
   GSAP 3.15 (ScrollTrigger, SplitText, CustomEase) + Lenis + Matter.js. */
(() => {
  'use strict';

  const html = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    html.classList.remove('in-caricamento');
    html.classList.add('statico');
    return;
  }
  const QA = html.classList.contains('qa');
  const STATICO = html.classList.contains('statico');
  const TOCCO = matchMedia('(hover: none), (pointer: coarse)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const telefono = () => matchMedia('(max-width: 760px)').matches;
  const parametri = new URLSearchParams(location.search);

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
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
  function cambiaRotola(el, t) {
    const d = $('.rotola-in', el);
    if (!d) { el.textContent = t; return; }
    d.textContent = t; d.dataset.t = t; el.dataset.t = t;
  }

  /* ---------------- scorrimento morbido ---------------- */
  let lenis = null;
  if (!QA && !STATICO && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const vaiA = (y) => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
  const scrollAdesso = () => (lenis ? lenis.scroll : window.scrollY);

  /* ---------------- ora di Roma ---------------- */
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const aMese = (m) => (/^[aeiou]/.test(m) ? `ad ${m}` : `a ${m}`);
  function adesso() {
    const parti = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date());
    const p = (t) => (parti.find((x) => x.type === t) || {}).value;
    const g = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p('weekday')];
    return { g, h: +p('hour') % 24, m: +p('minute'), mese: +p('month') - 1, anno: +p('year') };
  }
  const ora = adesso();
  $$('.anno-corrente').forEach((el) => { el.textContent = ora.anno; });

  /* ---------------- la grana della pellicola ---------------- */
  (function grana() {
    const el = $('.grana'); if (!el) return;
    const c = document.createElement('canvas');
    c.width = c.height = 180;
    const x = c.getContext('2d');
    if (!x) return;
    const img = x.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    el.style.setProperty('--grana', `url(${c.toDataURL('image/png')})`);
  })();

  /* ---------------- lo spaccio adesso ---------------- */
  (function statoSpaccio() {
    const el = $('.spaccio__adesso'); if (!el) return;
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

  /* ---------------- l'anno in campagna: dove siamo adesso ---------------- */
  (function anno() {
    const tappe = $$('.anno__tappe li'), el = $('.anno__adesso');
    if (!tappe.length || !el) return;
    const m = ora.mese;
    const mesi = (li) => li.dataset.mesi.split(',').map(Number);
    const qui = tappe.find((li) => mesi(li).includes(m));
    if (qui) {
      qui.classList.add('adesso');
      el.innerHTML = `Adesso, ${aMese(MESI[m])}: <b>${$('span', qui).textContent}</b>.`;
      return;
    }
    let prossima = tappe[0], dist = 13;
    tappe.forEach((li) => mesi(li).forEach((x) => { const d = (x - m + 12) % 12; if (d > 0 && d < dist) { dist = d; prossima = li; } }));
    el.innerHTML = `Adesso siamo ${aMese(MESI[m])}. La prossima tappa è ${aMese(MESI[(m + dist) % 12])}: <b>${$('span', prossima).textContent}</b>.`;
  })();

  /* ---------------- gli orari del giorno, nel piede ---------------- */
  (function orari() {
    const box = $('.orari'); if (!box) return;
    const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    const titolo = $('.orari__giorno', box), lista = $('.orari__lista', box);
    let scarto = 0;
    function righe(g) {
      const cucina = g === 5 || g === 6 ? 'a cena' : g === 0 ? 'a pranzo' : 'solo su prenotazione';
      const negozio = g >= 1 && g <= 6 ? '8:30 – 12:00' : 'chiuso';
      return [['Ristorante', cucina], ['Punto vendita', negozio], ['Distributore del latte', 'h24'], ['Camere', 'su prenotazione']];
    }
    function mostra(verso) {
      const g = (ora.g + scarto) % 7, nome = GIORNI[g];
      titolo.textContent = scarto === 0 ? `Oggi, ${nome}` : scarto === 1 ? `Domani, ${nome}` : nome.charAt(0).toUpperCase() + nome.slice(1);
      lista.innerHTML = righe(g).map(([a, b]) => `<div><dt>${a}</dt><dd${b === 'chiuso' ? ' class="chiuso"' : ''}>${b}</dd></div>`).join('');
      if (verso && !STATICO) gsap.from([titolo, ...lista.children], { x: 22 * verso, opacity: 0, stagger: 0.04, duration: 0.5 });
    }
    $$('.orari__freccia', box).forEach((b) => b.addEventListener('click', () => {
      const v = +b.dataset.verso;
      scarto = (scarto + v + 7) % 7;
      mostra(v);
    }));
    mostra(0);
  })();

  /* ---------------- il menu a tutto schermo ---------------- */
  const bottoneMenu = $('.testata__menu'), menuEl = $('#menu');
  function menu(stato) {
    const aperto = stato ?? !menuEl.classList.contains('aperto');
    menuEl.classList.toggle('aperto', aperto);
    menuEl.setAttribute('aria-hidden', String(!aperto));
    bottoneMenu.setAttribute('aria-expanded', String(aperto));
    html.classList.toggle('menu-aperto', aperto);
    cambiaRotola($('.rotola', bottoneMenu), aperto ? 'Chiudi' : 'Menu');
    if (lenis) { if (aperto) lenis.stop(); else lenis.start(); }
    if (aperto && !STATICO) gsap.fromTo($$('#menu li'), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.9, delay: 0.25 });
  }
  bottoneMenu.addEventListener('click', () => menu());
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuEl.classList.contains('aperto')) { menu(false); bottoneMenu.focus(); } });

  /* ---------------- salti tra le sezioni ---------------- */
  function salta(href) {
    const el = href === '#inizio' ? null : $(href);
    if (href !== '#inizio' && !el) return;
    if (lenis) {
      const y = el ? el.getBoundingClientRect().top + lenis.scroll : 0;
      const dist = Math.abs(y - lenis.scroll);
      lenis.scrollTo(y, { duration: Math.min(2.6, 1 + dist / 9000), easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    } else if (el) el.scrollIntoView({ behavior: STATICO ? 'auto' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: STATICO ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    e.preventDefault();
    if (menuEl.classList.contains('aperto')) { menu(false); setTimeout(() => salta(href), 480); return; }
    salta(href);
  });

  /* ---------------- il puntatore: un girasole del logo ---------------- */
  if (!TOCCO && !STATICO && !QA) {
    html.classList.add('con-cursore');
    const c = $('.cursore'), svg = $('.cursore__corpo svg');
    gsap.set(c, { x: -100, y: -100 });
    const xTo = gsap.quickTo(c, 'x', { duration: 0.2, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.2, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); c.style.opacity = 1; }, { passive: true });
    document.addEventListener('mouseleave', () => { c.style.opacity = 0; });
    const cliccabile = 'a, button, summary, .colonna:not(.attiva), .cestino__palla, .riga[data-foto], .muro__nomi span[data-foto]';
    document.addEventListener('pointerover', (e) => { html.classList.toggle('cursore-su', !!(e.target.closest && e.target.closest(cliccabile))); });
    let giro = 0;
    gsap.ticker.add(() => {
      giro += 0.5 + (lenis ? Math.min(40, Math.abs(lenis.velocity)) * 0.6 : 0);
      svg.style.transform = `rotate(${giro.toFixed(1)}deg)`;
    });
  }

  /* ---------------- la testata cambia colore con la sezione ---------------- */
  const testata = $('#testata');
  const tema = (t) => { if (testata.dataset.tema !== t) testata.dataset.tema = t; };

  if (STATICO) {
    testata.classList.add('con-logo');
    html.classList.remove('in-caricamento');
    return;
  }

  /* =====================================================================
     APERTURA: il logo gigante vola nella testata, la foto si apre da una macchia
     ===================================================================== */
  const eroe = $('.eroe'), palcoEroe = $('.eroe__palco');
  const marchio = $('.eroe__marchio'), logoTestata = $('.testata__logo');
  const macchia = $('.eroe__macchia'), immagine = $('.eroe__immagine');
  const soli = $$('.eroe__marchio .logo__sole'), svela = $('.logo__svela');
  const grido = $('.eroe__grido'), sotto = $('.eroe__sotto');
  const macchiaStato = { r: 0 };
  let WE = innerWidth, HE = innerHeight;

  function misuraEroe() {
    WE = palcoEroe.clientWidth; HE = palcoEroe.clientHeight;
    immagine.setAttribute('x', 0); immagine.setAttribute('y', 0);
    immagine.setAttribute('width', WE); immagine.setAttribute('height', HE);
  }
  function curvaChiusa(p) {
    const n = p.length;
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return `${d}Z`;
  }
  let macchiaVuota = false;
  function disegnaMacchia(t) {
    const R = Math.hypot(WE, HE) * 0.5 * 1.16;
    const r = macchiaStato.r * R;
    if (r < 1) {
      if (!macchiaVuota) { macchia.setAttribute('d', 'M0 0Z'); macchiaVuota = true; }
      return;
    }
    macchiaVuota = false;
    const n = 9, cx = WE / 2, cy = HE * 0.52, pts = [];
    const onda = 0.17 * (1 - macchiaStato.r * 0.72);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.14;
      const k = 1 + onda * (Math.sin(t * 1.3 + i * 1.9) * 0.6 + Math.sin(t * 0.7 + i * 3.1) * 0.4);
      pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
    }
    macchia.setAttribute('d', curvaChiusa(pts));
  }
  misuraEroe();
  disegnaMacchia(0);

  const splitGrido = SplitText.create(grido, { type: 'chars,words', wordsClass: 'parola' });

  /* l'ingresso: il logo si scrive, i girasoli sbocciano */
  const conIngresso = html.classList.contains('in-caricamento');
  let ingresso = null;
  if (conIngresso) {
    if (lenis) lenis.stop();
    gsap.set(svela, { attr: { width: 0 } });
    gsap.set(soli, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(['.eroe__dove', '.eroe__dal'], { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set('.eroe__azioni li', { autoAlpha: 0, y: 26 });
    gsap.set(testata, { autoAlpha: 0 });
    gsap.set([marchio, '.eroe__dove', '.eroe__dal', '.eroe__azioni'], { visibility: 'visible' });
    ingresso = gsap.timeline({
      paused: true,
      onComplete: () => {
        clearTimeout(window.__aeRiserva);
        html.classList.remove('in-caricamento');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      },
    });
    ingresso
      .to('.eroe__carica', { autoAlpha: 0, duration: 0.5 }, 0)
      .to(svela, { attr: { width: 540 }, duration: 1.8, ease: 'power2.inOut' }, 0.15)
      .to(soli, { scale: 1, duration: 1.1, stagger: 0.12, ease: 'back.out(2.4)' }, 1.15)
      .to(['.eroe__dove', '.eroe__dal'], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, stagger: 0.12, ease: 'scorre' }, 1.4)
      .to('.eroe__azioni li', { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.9 }, 1.55)
      .to(testata, { autoAlpha: 1, duration: 0.9 }, 1.7);
  }

  /* lo scroll: il logo va nella testata, la macchia si allarga fino a tutto schermo */
  const verso = () => {
    const a = logoTestata.getBoundingClientRect();
    return { x: a.left - marchio.offsetLeft, y: a.top - marchio.offsetTop, s: a.width / marchio.offsetWidth };
  };
  gsap.set(marchio, { transformOrigin: '0 0' });
  let arrivato = null;
  function logoArrivato(si) {
    if (si === arrivato) return;
    arrivato = si;
    testata.classList.toggle('con-logo', si);
    marchio.style.opacity = si ? 0 : 1;
  }
  const tlEroe = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: eroe, start: 'top top', end: () => `+=${Math.round(innerHeight * 1.7)}`, pin: palcoEroe, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: misuraEroe },
    onUpdate: () => logoArrivato(tlEroe.progress() >= 0.56),
  });
  tlEroe
    .to('.eroe__azioni', { autoAlpha: 0, y: 40, duration: 0.14 }, 0)
    .to(['.eroe__dove', '.eroe__dal'], { autoAlpha: 0, y: 30, duration: 0.12 }, 0)
    .to(marchio, { x: () => verso().x, y: () => verso().y, scale: () => verso().s, duration: 0.56, ease: 'power3.inOut' }, 0)
    .to(soli, { rotation: 360, duration: 0.56, ease: 'power1.inOut' }, 0)
    .to(macchiaStato, { r: 1, duration: 0.66, ease: 'power2.in' }, 0.08)
    .fromTo(immagine, { scale: 1.25, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.84, ease: 'power1.out' }, 0.08)
    .from(splitGrido.chars, { yPercent: 120, rotation: 12, opacity: 0, stagger: 0.012, duration: 0.2, ease: 'back.out(1.6)' }, 0.6)
    .from(sotto, { y: 30, opacity: 0, duration: 0.14 }, 0.8)
    .to({}, { duration: 0.08 });
  logoArrivato(false);
  const stEroe = tlEroe.scrollTrigger;
  gsap.ticker.add((t) => { if (stEroe.progress < 1) disegnaMacchia(t); });

  /* =====================================================================
     CHI SIAMO: le parole si accendono, i nomi arrivano come etichette
     ===================================================================== */
  (function manifesto() {
    const testo = $('.manifesto__testo'); if (!testo) return;
    const s = SplitText.create(testo, { type: 'words', wordsClass: 'parola' });
    gsap.fromTo(s.words, { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: testo, start: 'top 80%', end: 'bottom 48%', scrub: true } });
    $$('.nome', testo).forEach((n, i) => {
      gsap.from(n, { scale: 0, rotation: i % 2 ? 34 : -34, duration: 0.8, ease: 'back.out(2.2)', scrollTrigger: { trigger: n, start: 'top 74%', toggleActions: 'play none none reverse' } });
    });
  })();

  /* =====================================================================
     GALLERIA: la foto si apre tra le parole, poi diventa una griglia
     ===================================================================== */
  (function galleria() {
    const sez = $('.galleria'); if (!sez) return;
    const palco = $('.galleria__palco'), sx = $('.galleria__sx'), dx = $('.galleria__dx');
    const lampo = $('.galleria__lampo'), griglia = $('.galleria__griglia'), centro = $('.galleria__centro');
    const buco = $('.galleria__spazio'), didascalia = $('.galleria__didascalia');
    const fotoGriglia = $$('.galleria__griglia figure:not(.galleria__centro) img');
    let s0 = 3, sL = 0.5;
    function misura() {
      const w = centro.offsetWidth, h = centro.offsetHeight;
      if (!w || !h) return;
      gsap.set(lampo, { width: w, height: h, left: centro.offsetLeft, top: centro.offsetTop });
      s0 = Math.max(palco.clientWidth / w, palco.clientHeight / h) * 1.002;
      sL = telefono() ? (buco.offsetHeight * 0.96) / h : (buco.offsetWidth * 0.94) / w;
    }
    misura();
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(innerHeight * 2.6)}`, pin: palco, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: misura },
    });
    tl.fromTo(lampo, { scale: () => sL }, { scale: () => s0, duration: 0.4, ease: 'power2.in' }, 0)
      .to(sx, { x: () => (telefono() ? 0 : -innerWidth * 0.62), y: () => (telefono() ? -innerHeight * 0.5 : 0), duration: 0.4, ease: 'power2.in' }, 0)
      .to(dx, { x: () => (telefono() ? 0 : innerWidth * 0.62), y: () => (telefono() ? innerHeight * 0.5 : 0), duration: 0.4, ease: 'power2.in' }, 0)
      .set(griglia, { opacity: 1 }, 0.4)
      .set(lampo, { autoAlpha: 0 }, 0.4)
      .fromTo(griglia, { scale: () => s0 }, { scale: 1, duration: 0.44, ease: 'power2.inOut' }, 0.4)
      .fromTo(fotoGriglia, { scale: 1.35 }, { scale: 1, duration: 0.44, ease: 'power2.out' }, 0.4)
      .fromTo(didascalia, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1 }, 0.8)
      .to({}, { duration: 0.1 });
  })();

  /* =====================================================================
     QUATTRO COSE: la fisarmonica a colonne (orizzontale, al telefono verticale)
     ===================================================================== */
  (function quattro() {
    const sez = $('.quattro'); if (!sez) return;
    const palco = $('.quattro__palco'), box = $('.quattro__colonne');
    const col = $$('.colonna', box), dentro = col.map((c) => $('.colonna__dentro', c));
    let attiva = 0, G = 10;
    const chiusa = () => (telefono() ? 62 : 82);
    function misura() {
      const tel = telefono(), st = getComputedStyle(box);
      const gap = parseFloat(tel ? st.rowGap : st.columnGap) || 10;
      const avail = (tel ? box.clientHeight : box.clientWidth) - gap * (col.length - 1);
      G = Math.max(2, avail / chiusa() - (col.length - 1));
      const aperta = Math.max(0, avail - (col.length - 1) * chiusa());
      dentro.forEach((d) => {
        if (tel) { d.style.width = '100%'; d.style.height = `${aperta}px`; }
        else { d.style.width = `${aperta}px`; d.style.height = ''; }
      });
      col.forEach((c, i) => gsap.set(c, { flexGrow: i === attiva ? G : 1 }));
    }
    function apri(i) {
      if (i === attiva) return;
      const prima = attiva;
      attiva = i;
      col.forEach((c, k) => c.classList.toggle('attiva', k === i));
      gsap.to(col, { flexGrow: (k) => (k === i ? G : 1), duration: 0.95, ease: 'scorre', overwrite: true });
      gsap.to(dentro[prima], { autoAlpha: 0, duration: 0.25, overwrite: true });
      gsap.fromTo(dentro[i], { autoAlpha: 0, x: telefono() ? 0 : 50, y: telefono() ? 30 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, delay: 0.3, overwrite: true });
      gsap.fromTo($('img', dentro[i]), { scale: 1.25 }, { scale: 1, duration: 1.4, delay: 0.25, overwrite: true });
    }
    dentro.forEach((d, i) => gsap.set(d, { autoAlpha: i === attiva ? 1 : 0 }));
    misura();
    const st = ScrollTrigger.create({
      trigger: sez, start: 'top top', end: () => `+=${Math.round(innerHeight * 3)}`, pin: palco, anticipatePin: 1,
      onUpdate: (s) => apri(Math.min(col.length - 1, Math.floor(s.progress * col.length * 0.9999))),
      onRefresh: misura,
    });
    col.forEach((c, i) => c.addEventListener('click', (e) => {
      if (i === attiva || e.target.closest('a')) return;
      const y = st.start + ((st.end - st.start) * (i + 0.5)) / col.length;
      if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    }));
  })();

  /* =====================================================================
     DALLA NOSTRA CUCINA: i piatti tondi rotolano, lo sfondo prende il colore del piatto
     ===================================================================== */
  (function piatti() {
    const sez = $('.piatti'); if (!sez) return;
    const palco = $('.piatti__palco'), binario = $('.piatti__binario');
    const lista = $$('.piatto'), cerchi = $$('.piatto__cerchio'), foto = $$('.piatto__cerchio img');
    const testi = lista.map((p) => $$(':scope > :not(.piatto__cerchio)', p));
    const corsa = () => Math.max(0, binario.scrollWidth - innerWidth);
    let indice = -1;
    function aggiorna() {
      const x = gsap.getProperty(binario, 'x'), W = innerWidth;
      let migliore = 0, dmin = Infinity;
      lista.forEach((p, i) => {
        const c = p.offsetLeft + p.offsetWidth / 2 + x - W / 2;
        const a = Math.min(1, Math.abs(c) / (p.offsetWidth * 1.15));
        gsap.set(cerchi[i], { scale: 1 - 0.24 * a, y: a * 46 });
        gsap.set(foto[i], { rotation: -c * 0.16 });
        gsap.set(testi[i], { opacity: 1 - a * 0.75 });
        if (Math.abs(c) < dmin) { dmin = Math.abs(c); migliore = i; }
      });
      if (migliore !== indice) {
        indice = migliore;
        gsap.to(sez, { backgroundColor: lista[migliore].dataset.colore, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
      }
    }
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(Math.max(corsa(), innerHeight) * 1.15)}`, pin: palco, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
      onUpdate: aggiorna,
    }).to(binario, { x: () => -corsa() });
    aggiorna();
    ScrollTrigger.addEventListener('refresh', aggiorna);
    const tp = $('.piatti__arco textPath');
    if (tp) gsap.fromTo(tp, { attr: { startOffset: '120%' } }, { attr: { startOffset: '50%' }, ease: 'none', scrollTrigger: { trigger: sez, start: 'top 95%', end: 'top 5%', scrub: 0.5 } });
    gsap.from('.piatti__intro', { opacity: 0, y: 20, scrollTrigger: { trigger: sez, start: 'top 40%', toggleActions: 'play none none reverse' } });
  })();

  /* =====================================================================
     IL MENÙ: le righe si mettono a fuoco a metà schermo, la foto segue il mouse
     ===================================================================== */
  (function carta() {
    $$('.riga').forEach((r) => ScrollTrigger.create({ trigger: r, start: 'top 66%', end: 'bottom 34%', toggleClass: 'a-fuoco' }));
    const ant = $('.anteprima'); if (!ant || TOCCO) return;
    const dentro = $('.anteprima__dentro'), img = $('img', ant);
    gsap.set(ant, { x: -600, y: -600 });
    gsap.set(dentro, { scale: 0, rotation: -14 });
    const xTo = gsap.quickTo(ant, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(ant, 'y', { duration: 0.55, ease: 'power3' });
    $('.carta').addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    $$('.riga[data-foto]').forEach((r) => {
      r.addEventListener('pointerenter', () => {
        img.src = r.dataset.foto;
        gsap.to(dentro, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.6)', overwrite: true });
      });
      r.addEventListener('pointerleave', () => gsap.to(dentro, { scale: 0, rotation: -14, duration: 0.4, overwrite: true }));
    });
  })();

  /* =====================================================================
     NUMERI DI CASA: bolle che galleggiano a velocità diverse, numeri che contano
     ===================================================================== */
  (function numeri() {
    $$('.bolla').forEach((b) => {
      const v = parseFloat(b.dataset.vel) || 0;
      gsap.fromTo(b, { y: () => v * innerHeight * 0.55 }, { y: () => -v * innerHeight * 0.55, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      gsap.from(b, { scale: 0.3, opacity: 0, rotation: v > 0 ? 30 : -30, duration: 1.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: b, start: 'top 94%', toggleActions: 'play none none reverse' } });
    });
    if (QA) return;
    $$('.bolla b[data-conta]').forEach((b) => {
      const fine = +b.dataset.conta, inizio = fine > 1000 ? fine - 60 : 0;
      const o = { v: inizio };
      b.textContent = inizio;
      gsap.to(o, { v: fine, duration: 1.8, ease: 'power2.out', onUpdate: () => { b.textContent = Math.round(o.v); }, scrollTrigger: { trigger: b, start: 'top 88%', toggleActions: 'play none none none' } });
    });
  })();

  /* =====================================================================
     LA FASCIA CHE SPAZZA: una pennellata vinaccia attraversa lo schermo e diventa la sera
     ===================================================================== */
  (function spazzata() {
    const sez = $('.spazzata'); if (!sez) return;
    const palco = $('.spazzata__palco'), svg = $('.spazzata__svg'), linea = $('.spazzata__linea');
    const NS = 'http://www.w3.org/2000/svg';
    linea.id = 'spazzata-linea';
    const testo = document.createElementNS(NS, 'text');
    testo.setAttribute('class', 'spazzata__testo');
    testo.setAttribute('dominant-baseline', 'central');
    const tp = document.createElementNS(NS, 'textPath');
    tp.setAttribute('href', '#spazzata-linea');
    tp.textContent = 'Dopo cena, restate a dormire in campagna.';
    testo.appendChild(tp);
    svg.appendChild(testo);
    let L = 1, spessore = 100, finale = 3000, lungTesto = 800;
    function misura() {
      const W = palco.clientWidth, H = palco.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      linea.setAttribute('d', `M${-0.12 * W} ${0.9 * H}C${0.18 * W} ${1.18 * H} ${0.3 * W} ${0.18 * H} ${0.56 * W} ${0.38 * H}S${0.9 * W} ${0.72 * H} ${1.14 * W} ${0.06 * H}`);
      L = linea.getTotalLength();
      spessore = Math.max(70, Math.min(W, H) * 0.14);
      finale = Math.hypot(W, H) * 2.2;
      testo.style.fontSize = `${Math.round(spessore * 0.46)}px`;
      lungTesto = testo.getComputedTextLength ? testo.getComputedTextLength() : L * 0.4;
      gsap.set(linea, { strokeDasharray: `${L} ${L + 10}`, strokeWidth: spessore });
    }
    misura();
    const testa = { t: 0 };
    /* la testata diventa chiara solo quando il logo in alto a sinistra è davvero sotto la pennellata */
    const coperta = () => {
      try {
        const r = logoTestata.getBoundingClientRect();
        return linea.isPointInStroke(new DOMPoint(r.left + r.width / 2, r.top + r.height / 2));
      } catch (e) { return tl.progress() > 0.8; }
    };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(innerHeight * 1.25)}`, pin: palco, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: misura, onLeave: () => tema('scuro'), onLeaveBack: () => tema('crema') },
      onUpdate: () => { if (tl.scrollTrigger && tl.scrollTrigger.isActive) tema(coperta() ? 'scuro' : 'crema'); },
    });
    tl.fromTo(linea, { strokeDashoffset: () => L }, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, 0)
      .fromTo(testa, { t: 0 }, {
        t: 1, duration: 0.5, ease: 'power1.inOut',
        onUpdate: () => tp.setAttribute('startOffset', (testa.t * L - lungTesto - spessore * 0.6).toFixed(1)),
      }, 0)
      .fromTo(linea, { strokeWidth: () => spessore }, { strokeWidth: () => finale, duration: 0.4, ease: 'power2.in' }, 0.44)
      .to(testo, { opacity: 0, duration: 0.08 }, 0.46);
  })();

  /* =====================================================================
     LE CAMERE: le foto arrivano dal fondo e ci passano accanto
     ===================================================================== */
  (function camere() {
    const sez = $('.camere'); if (!sez) return;
    const palco = $('.camere__palco'), voli = $$('.volo');
    const pos = voli.map((v) => {
      const cs = getComputedStyle(v);
      return { x: parseFloat(cs.getPropertyValue('--x')) || 0, y: parseFloat(cs.getPropertyValue('--y')) || 0 };
    });
    const dove = (i, s, asse) => {
      const k = telefono() ? 0.55 : 1;
      return asse === 'x' ? (pos[i].x * k * innerWidth * s) / 100 : (pos[i].y * innerHeight * s) / 100;
    };
    gsap.set(voli, { xPercent: -50, yPercent: -50, opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(innerHeight * 4.2)}`, pin: palco, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
    });
    const PASSO = 0.42, DUR = 1.7;
    voli.forEach((v, i) => {
      const t0 = 0.1 + i * PASSO;
      tl.set(v, { zIndex: voli.length - i }, 0)
        .fromTo(v, { scale: 0.1, x: () => dove(i, 0.1, 'x'), y: () => dove(i, 0.1, 'y') }, { scale: 2.5, x: () => dove(i, 2.5, 'x'), y: () => dove(i, 2.5, 'y'), duration: DUR, ease: 'power2.in' }, t0)
        .to(v, { opacity: 1, duration: DUR * 0.2 }, t0)
        .to(v, { opacity: 0, duration: DUR * 0.16 }, t0 + DUR * 0.84);
    });
    tl.to({}, { duration: 0.2 });
    gsap.from('.camere__fondo', { opacity: 0, y: 20, scrollTrigger: { trigger: sez, start: 'top 20%', toggleActions: 'play none none reverse' } });

    /* dopo il tunnel: i prezzi e il buongiorno */
    gsap.utils.toArray('.camere__prezzi li').forEach((li, i) => {
      gsap.from(li, { x: i % 2 ? 60 : -60, opacity: 0, duration: 1, scrollTrigger: { trigger: li, start: 'top 92%', toggleActions: 'play none none reverse' } });
    });
    const saluto = $('.colazione__saluto');
    if (saluto) {
      const s = SplitText.create(saluto, { type: 'chars' });
      gsap.from(s.chars, { yPercent: 90, scaleY: 0.2, opacity: 0, transformOrigin: '50% 100%', stagger: 0.045, duration: 0.9, ease: 'back.out(3)', scrollTrigger: { trigger: saluto, start: 'top 86%', toggleActions: 'play none none reverse' } });
    }
    gsap.from('.colazione__cose li', { scale: 0, rotation: () => gsap.utils.random(-24, 24), stagger: 0.06, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: '.colazione__cose', start: 'top 92%', toggleActions: 'play none none reverse' } });
  })();

  /* =====================================================================
     LA FATTORIA: le lettere cadono al loro posto, il muro dei nomi si accende
     ===================================================================== */
  (function fattoria() {
    const titolo = $('.titolo--cade');
    if (titolo) {
      const s = SplitText.create(titolo, { type: 'chars,words', wordsClass: 'parola' });
      gsap.from(s.chars, {
        yPercent: () => -gsap.utils.random(240, 520), rotation: () => gsap.utils.random(-60, 60), opacity: 0,
        ease: 'bounce.out', duration: 1, stagger: { each: 0.07, from: 'random' },
        scrollTrigger: { trigger: titolo, start: 'top 92%', end: 'top 38%', scrub: 0.6 },
      });
    }
    const nomi = $$('.muro__nomi span');
    if (nomi.length) {
      ScrollTrigger.create({
        trigger: '.muro__nomi', start: 'top 78%', end: 'bottom 46%',
        onUpdate: (st) => { const n = Math.round(st.progress * nomi.length); nomi.forEach((el, i) => el.classList.toggle('acceso', i < n)); },
      });
    }
    const muro = $('.muro'), cornice = $('.muro__foto');
    if (muro && cornice && !TOCCO) {
      const img = $('img', cornice);
      gsap.set(cornice, { xPercent: 12, yPercent: -112, scale: 0, opacity: 0 });
      const xTo = gsap.quickTo(cornice, 'x', { duration: 0.55, ease: 'power3' });
      const yTo = gsap.quickTo(cornice, 'y', { duration: 0.55, ease: 'power3' });
      muro.addEventListener('pointermove', (e) => { const r = muro.getBoundingClientRect(); xTo(e.clientX - r.left); yTo(e.clientY - r.top); });
      $$('.muro__nomi span[data-foto]').forEach((sp) => {
        sp.addEventListener('pointerenter', () => {
          img.src = sp.dataset.foto;
          gsap.to(cornice, { scale: 1, opacity: 1, rotation: gsap.utils.random(-10, 10), duration: 0.55, ease: 'back.out(1.7)', overwrite: 'auto' });
        });
        sp.addEventListener('pointerleave', () => gsap.to(cornice, { scale: 0, opacity: 0, duration: 0.35, overwrite: 'auto' }));
      });
    }
    /* i titoli ad arco scorrono sulla curva, le foto tonde girano */
    $$('.scheda, .pannello').forEach((el, i) => {
      const tp = $('textPath', el);
      if (tp) gsap.fromTo(tp, { attr: { startOffset: i % 2 ? '130%' : '-30%' } }, { attr: { startOffset: '50%' }, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 40%', scrub: 0.5 } });
      const c = $('.scheda__cerchio, .pannello__cerchio', el);
      if (c) gsap.fromTo(c, { rotation: i % 2 ? 30 : -30, scale: 0.82 }, { rotation: i % 2 ? -12 : 12, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  })();

  /* =====================================================================
     COSA VISITARE: il rullo delle città gira come un tamburo
     ===================================================================== */
  (function dintorni() {
    const sez = $('.dintorni'); if (!sez) return;
    const palco = $('.dintorni__palco'), nomi = $$('.rullo__nomi li');
    const figura = $('.rullo__foto'), img = $('img', figura), tempo = $('.rullo__tempo'), riga = $('.rullo__riga');
    const n = nomi.length;
    nomi.forEach((li) => { const i = new Image(); i.src = li.dataset.foto; });
    const stato = { p: 0 };
    const ANG = 26 * (Math.PI / 180);
    let attuale = 0, tlFoto = null;
    function cambia(j) {
      const li = nomi[j];
      if (tlFoto) tlFoto.kill();
      tlFoto = gsap.timeline()
        .to(img, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.22, ease: 'power2.in' })
        .to([tempo, riga], { opacity: 0, y: -10, duration: 0.18, stagger: 0.03 }, 0)
        .add(() => { img.src = li.dataset.foto; tempo.textContent = li.dataset.tempo; riga.textContent = li.dataset.riga; })
        .fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'scorre' })
        .fromTo([tempo, riga], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 }, '<0.1');
    }
    function disegna() {
      const fs = parseFloat(getComputedStyle(nomi[0]).fontSize) || 80;
      const R = (fs * 1.2) / Math.sin(ANG);
      nomi.forEach((li, i) => {
        const a = Math.max(-1.45, Math.min(1.45, (i - stato.p) * ANG));
        const c = Math.cos(a);
        gsap.set(li, { y: Math.sin(a) * R, scaleY: Math.max(0.05, c), opacity: Math.max(0, c * c * c), color: Math.abs(i - stato.p) < 0.5 ? '#F2B33D' : '#F6EEDC' });
      });
      const j = Math.max(0, Math.min(n - 1, Math.round(stato.p)));
      if (j !== attuale) { attuale = j; cambia(j); }
    }
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(innerHeight * (n - 1) * 0.75)}`, pin: palco, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
    })
      .to({}, { duration: 0.25 })
      .to(stato, { p: n - 1, duration: n - 1, onUpdate: disegna })
      .to({}, { duration: 0.25 });
    disegna();
    ScrollTrigger.addEventListener('refresh', disegna);
  })();

  /* =====================================================================
     CENE A TEMA: le carte scorrono come un ventaglio
     ===================================================================== */
  (function cene() {
    const sez = $('.cene'); if (!sez) return;
    const palco = $('.cene__palco'), binario = $('.cene__binario'), carte = $$('.cena');
    const corsa = () => Math.max(0, binario.scrollWidth - innerWidth);
    function ventaglio() {
      const x = gsap.getProperty(binario, 'x'), W = innerWidth;
      carte.forEach((c) => {
        const k = (c.offsetLeft + c.offsetWidth / 2 + x - W / 2) / W;
        gsap.set(c, { rotation: k * 16, y: k * k * 180 });
      });
    }
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${Math.round(corsa() + innerHeight * 0.35)}`, pin: palco, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      onUpdate: ventaglio,
    }).to(binario, { x: () => -corsa() });
    ventaglio();
    ScrollTrigger.addEventListener('refresh', ventaglio);
  })();

  /* =====================================================================
     DOMANDE: il titolo si scrive da solo, le risposte si aprono morbide
     ===================================================================== */
  (function domande() {
    const t = $('.titolo--cursore');
    if (t && !QA) {
      const nodo = Array.from(t.childNodes).find((x) => x.nodeType === 3 && x.textContent.trim());
      if (nodo) {
        const pieno = nodo.textContent;
        const o = { n: 0 };
        const scrivi = () => { nodo.textContent = pieno.slice(0, Math.round(o.n)); };
        nodo.textContent = '';
        ScrollTrigger.create({
          trigger: t, start: 'top 84%',
          onEnter: () => gsap.fromTo(o, { n: 0 }, { n: pieno.length, duration: pieno.length * 0.1, ease: 'none', onUpdate: scrivi, overwrite: true }),
          onLeaveBack: () => { gsap.killTweensOf(o); o.n = 0; scrivi(); },
        });
      }
    }
    $$('.domanda').forEach((d) => {
      const s = $('summary', d), r = $('.domanda__risposta', d);
      s.addEventListener('click', (e) => {
        e.preventDefault();
        if (d.open) {
          d.classList.add('chiude');
          gsap.to(r, { height: 0, duration: 0.45, ease: 'scorre', overwrite: true, onComplete: () => { d.open = false; d.classList.remove('chiude'); gsap.set(r, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        } else {
          d.open = true;
          gsap.fromTo(r, { height: 0 }, { height: 'auto', duration: 0.6, overwrite: true, onComplete: () => ScrollTrigger.refresh() });
          gsap.from($('p', r), { y: 16, opacity: 0, duration: 0.6, delay: 0.1 });
        }
      });
    });
  })();

  /* =====================================================================
     IL PIEDE: il cestino con le palline che cadono (Matter.js)
     ===================================================================== */
  (function cestino() {
    const box = $('.cestino');
    if (!box || !window.Matter) { if (box) box.style.display = 'none'; return; }
    const { Engine, Bodies, Body, Composite, Constraint } = Matter;
    const palle = $$('.cestino__palla', box);
    let engine = null, corpi = [], attivo = false, presa = null, creato = false;
    gsap.set(palle, { autoAlpha: 0 });
    function crea() {
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      engine = Engine.create();
      engine.gravity.y = 1.15;
      const W = box.clientWidth, H = box.clientHeight;
      const alto = 3000;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + 60, W * 3, 120, { isStatic: true }),
        Bodies.rectangle(-60, (H - alto) / 2, 120, H + alto, { isStatic: true }),
        Bodies.rectangle(W + 60, (H - alto) / 2, 120, H + alto, { isStatic: true }),
      ]);
      corpi = palle.map((el, i) => {
        const r = el.offsetWidth / 2;
        const b = Bodies.circle(r + Math.random() * Math.max(1, W - 2 * r), -r - i * r * 0.9 - Math.random() * r, r, { restitution: 0.5, friction: 0.06, frictionAir: 0.012, density: 0.0016 });
        Body.setAngle(b, Math.random() * Math.PI * 2);
        b.el = el; b.r = r;
        return b;
      });
      Composite.add(engine.world, corpi);
      gsap.set(palle, { autoAlpha: 1 });
      creato = true;
    }
    function passo() {
      if (!attivo || !engine) return;
      Engine.update(engine, 1000 / 60);
      for (const b of corpi) b.el.style.transform = `translate3d(${(b.position.x - b.r).toFixed(1)}px, ${(b.position.y - b.r).toFixed(1)}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
    }
    gsap.ticker.add(passo);
    ScrollTrigger.create({
      trigger: box, start: 'top 88%', end: 'bottom top',
      onToggle: (s) => { attivo = s.isActive; if (attivo && !creato) crea(); },
    });
    const punto = (e) => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    palle.forEach((el, i) => el.addEventListener('pointerdown', (e) => {
      const b = corpi[i]; if (!b || !engine) return;
      if (e.pointerType !== 'mouse') { Body.setVelocity(b, { x: (Math.random() - 0.5) * 14, y: -16 - Math.random() * 6 }); Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.4); return; }
      e.preventDefault();
      const p = punto(e);
      presa = Constraint.create({ pointA: p, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.1, damping: 0.08, length: 0 });
      Composite.add(engine.world, presa);
      box.classList.add('trascina');
    }));
    addEventListener('pointermove', (e) => { if (presa) presa.pointA = punto(e); });
    addEventListener('pointerup', () => { if (presa && engine) { Composite.remove(engine.world, presa); presa = null; box.classList.remove('trascina'); } });
    let larghezza = innerWidth;
    addEventListener('resize', gsap.utils.debounce ? gsap.utils.debounce(() => { if (creato && Math.abs(innerWidth - larghezza) > 40) { larghezza = innerWidth; crea(); } }, 300) : () => {});
  })();

  /* =====================================================================
     TITOLI E TESTI: le parole salgono da dietro una riga
     ===================================================================== */
  $$('.titolo:not(.titolo--cade):not(.titolo--cursore), .numeri__titolo, .piede__grido p, .colazione__testo').forEach((el) => {
    SplitText.create(el, {
      type: 'lines,words', mask: 'lines', linesClass: 'linea', wordsClass: 'parola', autoSplit: true,
      onSplit: (s) => gsap.from(s.words, { yPercent: 118, rotation: 5, duration: 1.1, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } }),
    });
  });
  const SALGONO = '.etichetta, .manifesto__colonne p, .carta__nota, .carta__portata, .fattoria__testo, .scheda p, .pannello p, .spaccio__adesso, .cene__testo, .occasioni p, .camere__nota, .anno__tappe li, .anno__adesso, .dintorni__testo, .domanda, .piede__info > div, .piede__marchi li, .orari, .allergeni';
  const daAlzare = $$(SALGONO).filter((el) => !el.closest('.eroe'));
  gsap.set(daAlzare, { opacity: 0, y: 44 });
  ScrollTrigger.batch(daAlzare, {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.07, duration: 1, overwrite: true }),
    onLeaveBack: (els) => gsap.to(els, { opacity: 0, y: 44, duration: 0.4, overwrite: true }),
  });

  /* ---------------- la testata segue i colori delle sezioni ---------------- */
  $$('main [data-tema], footer[data-tema]').forEach((sez) => {
    ScrollTrigger.create({ trigger: sez, start: 'top 40px', end: 'bottom 40px', onToggle: (s) => { if (s.isActive) tema(sez.dataset.tema); } });
  });

  /* ---------------- partenza ---------------- */
  const pronto = () => {
    ScrollTrigger.refresh();
    if (parametri.has('scroll')) {
      const y = parseInt(parametri.get('scroll'), 10) || 0;
      requestAnimationFrame(() => { vaiA(y); ScrollTrigger.update(); });
    }
  };
  const font = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve();
  font.then(() => {
    pronto();
    if (ingresso) ingresso.play();
  });
  addEventListener('load', () => ScrollTrigger.refresh());

  window.__ae = { lenis, ScrollTrigger, vaiA, scroll: scrollAdesso };
})();
