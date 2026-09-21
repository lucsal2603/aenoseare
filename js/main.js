/* ═══════════════════════════════════════════════════════════════
   AE NOSEARE — regia del movimento (impianto facetad.com)
   Lenis per lo scorrimento, GSAP + ScrollTrigger scena per scena.
   ?qa nell'URL: niente Lenis (scorrimento nativo per i collaudi).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const QA = new URLSearchParams(location.search).has("qa");
  const riduci = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tocco = matchMedia("(hover: none)").matches;
  const stretto = () => innerWidth < 761;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ── la nuvola di foto: nome, sinistra %, alto % (della nuvola), larghezza px, rapporto l/a, ampiezza parallasse, taglio, vicina ── */
  const TESSERE = [
    ["casa-fronte", 6, 16, 470, 2.08, -60, "B", false],
    ["camera-travi", 63, 14, 300, 1.6, 120, "A", true],
    ["salumi", 30, 26, 460, 1.56, 200, "C", true],
    ["asino", 74, 30, 250, 1.6, 60, "B", false],
    ["torta-mele", 10, 35, 200, 1.0, -60, "D", false],
    ["vicenza", 4, 46.6, 150, 1.5, 20, "A", false],
    ["camera-azzurra", 52, 38.3, 210, 1.5, 120, "E", true],
    ["camera-lampada", 80, 45, 230, 1.0, -60, "A", false],
    ["giardino", 22, 53.3, 340, 1.8, -60, "B", false],
    ["formaggi", 56, 50, 260, 1.6, 160, "C", true],
    ["capretta", 69, 59.3, 390, 1.56, 200, "A", true],
    ["pasta-fresca", 4, 63.3, 200, 1.5, 120, "D", true],
    ["sala", 30, 66.6, 340, 1.5, 60, "B", false],
    ["carretto", 58, 70, 245, 1.6, 20, "A", false],
    ["camera-rosa", 8, 76, 250, 1.6, -60, "E", false],
    ["polenta-sopressa", 46, 75.3, 180, 0.75, 120, "C", true],
    ["marostica", 86, 71.3, 150, 1.5, -60, "B", false],
    ["affettato-pane", 66, 79.3, 230, 1.33, 60, "D", false],
    ["camera-righe", 20, 85.3, 280, 1.6, 120, "A", true],
    ["verona", 5, 89.3, 180, 1.5, 20, "B", false],
    ["vassoio-affettato", 40, 90, 225, 1.5, -60, "C", false],
    ["carne-griglia", 74, 87.3, 200, 1.33, 100, "E", true],
    ["padova", 55, 95.6, 160, 1.5, 20, "A", false],
    ["erba", 84, 94, 200, 1.5, 160, "B", true],
  ];
  const MISURE = { "casa-fronte": [1000, 480], "camera-travi": [1400, 874], salumi: [1000, 480], asino: [1000, 480], "torta-mele": [1200, 900], vicenza: [380, 254], "camera-azzurra": [1400, 874], "camera-lampada": [1400, 874], giardino: [1334, 750], formaggi: [1000, 480], capretta: [1000, 480], "pasta-fresca": [1400, 789], sala: [1000, 480], carretto: [1000, 480], "camera-rosa": [1400, 874], "polenta-sopressa": [1200, 1600], marostica: [380, 254], "affettato-pane": [1200, 900], "camera-righe": [1400, 874], verona: [380, 254], "vassoio-affettato": [1400, 789], "carne-griglia": [1200, 900], padova: [380, 254], erba: [1600, 901] };

  function costruisciNuvola() {
    const lontane = $(".nuvola__foto--lontane");
    const vicine = $(".nuvola__foto--vicine");
    const fattore = stretto() ? 0.5 : 1;
    const tessere = [];
    TESSERE.forEach(([nome, sx, alto, larg, rapporto, amp, taglio, vicina]) => {
      const t = document.createElement("div");
      t.className = "tessera tessera--" + taglio;
      t.style.left = sx + "%";
      t.style.top = alto + "%";
      t.style.width = Math.round(larg * fattore) + "px";
      t.dataset.amp = String(amp);
      const mossa = document.createElement("div");
      mossa.className = "tessera__mossa";
      const foto = document.createElement("div");
      foto.className = "tessera__foto";
      foto.style.aspectRatio = String(rapporto);
      const img = document.createElement("img");
      img.src = "img/" + nome + ".webp";
      img.width = MISURE[nome][0];
      img.height = MISURE[nome][1];
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      foto.appendChild(img);
      mossa.appendChild(foto);
      t.appendChild(mossa);
      (vicina ? vicine : lontane).appendChild(t);
      tessere.push(t);
    });
    return tessere;
  }
  const tessere = costruisciNuvola();

  /* ── parole del manifesto in span ── */
  function spezzaParole(el) {
    const parole = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return parole.map((p, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = p;
      el.appendChild(s);
      if (i < parole.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
  }

  /* ── menu ── */
  const testata = $("#testata");
  const bottoneMenu = $("#apriMenu");
  const menu = $("#menu");
  let lenis = null;
  function apriMenu(apri) {
    const stato = apri === undefined ? !menu.classList.contains("aperto") : apri;
    menu.classList.toggle("aperto", stato);
    menu.setAttribute("aria-hidden", String(!stato));
    document.body.classList.toggle("menu-aperto", stato);
    bottoneMenu.setAttribute("aria-expanded", String(stato));
    if (lenis) stato ? lenis.stop() : lenis.start();
    else document.documentElement.style.overflow = stato ? "hidden" : "";
  }
  bottoneMenu.addEventListener("click", () => apriMenu());
  addEventListener("keydown", (e) => { if (e.key === "Escape") apriMenu(false); });

  /* ════════════ MOVIMENTO RIDOTTO ════════════ */
  if (riduci || typeof gsap === "undefined") {
    document.documentElement.classList.add("statico");
    $$("a", menu).forEach((a) => a.addEventListener("click", () => apriMenu(false)));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ════════════ LENIS ════════════ */
  if (!QA) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function vaiA(bersaglio) {
    if (lenis) lenis.scrollTo(bersaglio, { offset: 0, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else bersaglio.scrollIntoView({ behavior: "smooth" });
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      let bersaglio = null;
      try { bersaglio = document.querySelector(id); } catch (err) { bersaglio = null; }
      if (!bersaglio) return;
      e.preventDefault();
      apriMenu(false);
      vaiA(bersaglio);
    });
  });

  /* ════════════ EROE: ingresso del palco ════════════ */
  gsap.set(".palco__logo", { autoAlpha: 0, scale: 0.96 });
  gsap.set([".palco__motto", ".palco__dove", ".palco__giu"], { autoAlpha: 0, y: 14 });
  gsap.timeline({ delay: 0.15 })
    .to(".palco__logo", { autoAlpha: 1, scale: 1, duration: 1.3, ease: "expo.out" })
    .to([".palco__motto", ".palco__dove", ".palco__giu"], { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 }, "-=0.8");

  /* il palco sbiadisce quando la prima fascia arriva a coprirlo */
  gsap.to(".palco__dentro", {
    autoAlpha: 0.1, ease: "none",
    scrollTrigger: { trigger: ".nuvola", start: "bottom 125%", end: "bottom 95%", scrub: true },
  });

  /* ════════════ NUVOLA: parallasse a velocità diverse + dissolvenza in entrata ════════════ */
  function ampiezza(t) { return parseFloat(t.dataset.amp) * (stretto() ? 0.55 : 1) * (innerHeight / 800); }
  tessere.forEach((t) => {
    const mossa = $(".tessera__mossa", t);
    gsap.fromTo(mossa, { y: () => ampiezza(t) }, {
      y: () => -ampiezza(t), ease: "none",
      scrollTrigger: { trigger: ".nuvola", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
    });
    gsap.fromTo($(".tessera__foto", t), { autoAlpha: 0 }, {
      autoAlpha: 1, ease: "none",
      scrollTrigger: { trigger: t, start: "top 102%", end: "top 74%", scrub: true },
    });
  });

  /* le foto seguono appena il mouse: le vicine di più, le lontane di meno */
  if (!tocco) {
    const vx = gsap.quickTo(".nuvola__foto--vicine", "x", { duration: 0.9, ease: "power2" });
    const vy = gsap.quickTo(".nuvola__foto--vicine", "y", { duration: 0.9, ease: "power2" });
    const lx = gsap.quickTo(".nuvola__foto--lontane", "x", { duration: 1.2, ease: "power2" });
    const ly = gsap.quickTo(".nuvola__foto--lontane", "y", { duration: 1.2, ease: "power2" });
    addEventListener("pointermove", (e) => {
      const px = e.clientX / innerWidth - 0.5, py = e.clientY / innerHeight - 0.5;
      vx(-px * 26); vy(-py * 18); lx(px * 12); ly(py * 8);
    }, { passive: true });
  }

  /* ════════════ FASCE: la foto scorre dentro il taglio ════════════ */
  $$(".fascia img[data-parallasse]").forEach((im) => {
    gsap.fromTo(im, { yPercent: -9 }, {
      yPercent: 9, ease: "none",
      scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ════════════ MANIFESTO: parole che arrivano una dietro l'altra ════════════ */
  $$("[data-parole]").forEach((p) => {
    const parole = spezzaParole(p);
    gsap.fromTo(parole, { autoAlpha: 0, y: 12 }, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.035,
      scrollTrigger: { trigger: p, start: "top 82%", once: true },
    });
  });

  /* ════════════ LISTE: la striscia di foto scorre in linea con lo scroll, i testi scorrono a lato ════════════ */
  $$("[data-lista]").forEach((sezione) => {
    const nastro = $(".lista__nastro", sezione);
    const finestra = $(".lista__finestra", sezione);
    const quadri = $$(".lista__quadro", sezione);
    const n = quadri.length;
    const verso = sezione.classList.contains("lista--foto-dx") ? 1 : -1;
    const passoPx = () => finestra.clientWidth;          /* un quadro (84%) + il vuoto (16%) */
    const passoScroll = () => parseFloat(getComputedStyle(sezione).getPropertyValue("--passo")) / 100 * innerHeight;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sezione, start: "top top", end: () => "+=" + n * passoScroll(),
        scrub: true, invalidateOnRefresh: true,
      },
    });
    /* ogni voce vale 1 unità di tempo: la striscia si sposta in linea retta nei 0.7 finali dell'arrivo della voce, poi tiene */
    for (let i = 1; i < n; i++) {
      tl.to(nastro, { x: () => verso * i * passoPx(), duration: 0.7, ease: "none" }, i - 0.7);
    }
    tl.to({}, { duration: 1 }, n - 1);
    /* la foto respira piano con lo scroll */
    $$(".lista__quadro img", sezione).forEach((im) => {
      gsap.fromTo(im, { yPercent: -5, scale: 1.12 }, {
        yPercent: 5, scale: 1.12, ease: "none",
        scrollTrigger: { trigger: sezione, start: "top top", end: "bottom bottom", scrub: true },
      });
    });
  });

  /* ════════════ COSA VISITARE: la fila di cartoline scivola piano con lo scroll (solo dove non si scorre col dito) ════════════ */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const nastro = $(".mete-sez__nastro");
    if (!nastro) return;
    gsap.fromTo(nastro, { xPercent: 6 }, {
      xPercent: -6, ease: "none",
      scrollTrigger: { trigger: ".mete-sez", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ════════════ CITAZIONE: righe rivelate da sinistra a destra ════════════ */
  $$(".citazione__riga").forEach((r, i) => {
    gsap.fromTo(r, { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none",
      scrollTrigger: { trigger: ".citazione__testo", start: "top " + (78 - i * 6) + "%", end: "top " + (40 - i * 6) + "%", scrub: 0.4 },
    });
  });

  /* ════════════ REVEAL generici ════════════ */
  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
  $$("[data-reveal-gruppo]").forEach((g) => {
    gsap.fromTo(Array.from(g.children), { autoAlpha: 0, y: 26 }, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: g, start: "top 86%", once: true },
    });
  });

  /* ── una sola rimisurazione quando font e immagini sono pronti; ricostruzione della nuvola al cambio di larghezza ── */
  let timerRefresh = null;
  function rimisura() {
    clearTimeout(timerRefresh);
    timerRefresh = setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 200);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rimisura);
  addEventListener("load", rimisura);
  let eraStretto = stretto();
  addEventListener("resize", () => {
    if (stretto() !== eraStretto) {
      eraStretto = stretto();
      const fattore = stretto() ? 0.5 : 1;
      tessere.forEach((t, i) => { t.style.width = Math.round(TESSERE[i][3] * fattore) + "px"; });
      rimisura();
    }
  });

  window.__noseare = { lenis, QA, tessere: tessere.length };
})();
