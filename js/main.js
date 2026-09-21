/* ═══════════════════════════════════════════════════════════════
   AE NOSEARE — regia del movimento
   Lenis per lo scorrimento, GSAP + ScrollTrigger scena per scena.
   Le suddivisioni in lettere e parole sono fatte a mano.
   ?qa nell'URL: niente loader e niente Lenis (per i collaudi).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const QA = new URLSearchParams(location.search).has("qa");
  const riduci = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tocco = matchMedia("(hover: none)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const CARTA = "#F1EEDC", INCHIOSTRO = "#231A12";

  /* ── stato della cucina, calcolato sull'ora di Roma ── */
  function statoCucina() {
    const el = $("#statoCucina");
    if (!el) return;
    const ora = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const g = ora.getDay(), h = ora.getHours();
    let testo, aperta;
    if ((g === 5 || g === 6) && h < 23) { testo = "Stasera la cucina è aperta"; aperta = true; }
    else if (g === 0 && h < 16) { testo = "Oggi la cucina è aperta a pranzo"; aperta = true; }
    else if (g === 4) { testo = "La cucina riapre domani a cena"; aperta = false; }
    else { testo = "La cucina riapre venerdì a cena"; aperta = false; }
    $("span", el).textContent = testo;
    el.classList.toggle("chiusa", !aperta);
  }
  statoCucina();
  setInterval(statoCucina, 60000);

  /* ── utilità: lettere in maschera (raggruppate per parola) ── */
  function spezzaLettere(el) {
    const testo = el.textContent;
    el.textContent = "";
    const interni = [];
    testo.split(" ").forEach((parola, i, arr) => {
      const gruppo = document.createElement("span");
      gruppo.style.whiteSpace = "nowrap";
      for (const ch of parola) {
        const m = document.createElement("span");
        m.className = "l";
        const d = document.createElement("span");
        d.textContent = ch;
        m.appendChild(d);
        gruppo.appendChild(m);
        interni.push(d);
      }
      el.appendChild(gruppo);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return interni;
  }

  /* ── utilità: parole in span.w ── */
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

  /* ── utilità: parole di un titolo in maschera ── */
  function spezzaTitolo(el) {
    const parole = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return parole.map((p, i) => {
      const m = document.createElement("span");
      m.className = "mw";
      const d = document.createElement("span");
      d.textContent = p;
      m.appendChild(d);
      el.appendChild(m);
      if (i < parole.length - 1) el.appendChild(document.createTextNode(" "));
      return d;
    });
  }

  /* ── menu del telefono ── */
  const testata = $("#testata");
  const bottoneMenu = $("#apriMenu");
  const menuMobile = $("#menuMobile");
  let lenis = null;
  function apriMenu(apri) {
    const stato = apri === undefined ? !menuMobile.classList.contains("aperto") : apri;
    menuMobile.classList.toggle("aperto", stato);
    document.body.classList.toggle("menu-aperto", stato);
    bottoneMenu.setAttribute("aria-expanded", String(stato));
    if (lenis) stato ? lenis.stop() : lenis.start();
    else document.documentElement.style.overflow = stato ? "hidden" : "";
  }
  bottoneMenu.addEventListener("click", () => apriMenu());
  $$("a", menuMobile).forEach((a) => a.addEventListener("click", () => apriMenu(false)));

  /* ════════════ MOVIMENTO RIDOTTO: pagina ferma e leggibile ════════════ */
  if (riduci || typeof gsap === "undefined") {
    document.documentElement.classList.add("statico");
    const l = $("#loader");
    if (l) l.remove();
    document.body.classList.remove("tema-scuro");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ════════════ LENIS ════════════ */
  if (!QA) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function vaiA(bersaglio) {
    if (lenis) lenis.scrollTo(bersaglio, { offset: -70, duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
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

  /* ── testata che si nasconde scendendo e torna risalendo ── */
  let ultimoY = 0, accumulo = 0;
  function suScroll(y) {
    const d = y - ultimoY;
    ultimoY = y;
    if ((d > 0) !== (accumulo > 0)) accumulo = 0;
    accumulo += d;
    if (y < 80) { testata.classList.remove("nascosta"); return; }
    if (accumulo > 140) testata.classList.add("nascosta");
    if (accumulo < -40) testata.classList.remove("nascosta");
  }
  if (lenis) lenis.on("scroll", (e) => suScroll(e.scroll));
  else addEventListener("scroll", () => suScroll(scrollY), { passive: true });

  /* ── sezioni scure: la testata cambia colore ── */
  $$('[data-tema="scuro"]').forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: "top 40px", end: "bottom 40px",
      onToggle: (self) => document.body.classList.toggle("tema-scuro", self.isActive),
    });
  });

  /* ── cursore: punto + anello, inseguimento morbido ── */
  if (!tocco) {
    const c = $(".cursore");
    const cx = gsap.quickTo(c, "x", { duration: 0.22, ease: "power3" });
    const cy = gsap.quickTo(c, "y", { duration: 0.22, ease: "power3" });
    addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); c.classList.add("visibile"); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("a, button, [data-cursore]");
      c.classList.toggle("attivo", !!t);
      c.classList.toggle("trascina", !!(t && t.closest(".piatti")));
    });
    document.addEventListener("pointerleave", () => c.classList.remove("visibile"));
  }

  /* ════════════ LOADER → INGRESSO DELL'EROE ════════════ */
  const loader = $("#loader");
  const lettereTitolo = spezzaLettere($(".eroe__titolo"));
  gsap.set(lettereTitolo, { yPercent: 112 });
  gsap.set([".eroe__sopra", ".eroe__motto", ".eroe__stato", ".eroe__giu"], { autoAlpha: 0, y: 16 });
  const ingresso = gsap.timeline({ paused: true })
    .to(lettereTitolo, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.035 })
    .to(".eroe__sopra", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.75")
    .to([".eroe__motto", ".eroe__stato", ".eroe__giu"], { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }, "-=0.5");

  if (QA) {
    loader.remove();
    ingresso.play();
  } else {
    if (lenis) lenis.stop();
    const lettereLoader = spezzaLettere($(".loader__marchio"));
    gsap.timeline({
      onComplete() {
        loader.remove();
        if (lenis) lenis.start();
      },
    })
      .to(lettereLoader, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.04 }, 0.15)
      .to(".loader__nota", { opacity: 0.8, duration: 0.6 }, "-=0.5")
      .to(lettereLoader, { yPercent: -112, duration: 0.55, ease: "expo.in", stagger: 0.02 }, "+=0.45")
      .to(".loader__nota", { opacity: 0, duration: 0.3 }, "<")
      .to(loader, { yPercent: -100, duration: 0.95, ease: "expo.inOut" }, "-=0.2")
      .from(".eroe__foto img", { scale: 1.18, duration: 1.7, ease: "expo.out" }, "-=0.8")
      .add(() => ingresso.play(), "-=1.35");
    /* rete di sicurezza: se la scheda è in secondo piano, il loader non deve restare */
    setTimeout(() => { if (loader.isConnected) { loader.remove(); if (lenis) lenis.start(); ingresso.play(); } }, 6000);
  }

  /* ════════════ EROE: la foto si stringe e si aggancia, il testo sale ════════════ */
  const mm = gsap.matchMedia();
  mm.add({ largo: "(min-width: 821px)", stretto: "(max-width: 820px)" }, (ctx) => {
    const largo = ctx.conditions.largo;
    if (!largo) gsap.set(".eroe__foto", { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".eroe", start: "top top", end: "+=130%", pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate(self) { document.body.classList.toggle("tema-scuro", self.progress < 0.7); },
      },
    });
    if (largo) {
      tl.to(".eroe__foto", { scale: 0.42, transformOrigin: "100% 40%", ease: "power2.inOut", duration: 0.9 }, 0)
        .to(".eroe__velo", { autoAlpha: 0, duration: 0.2 }, 0.55)
        .to(".eroe", { backgroundColor: CARTA, ease: "power1.inOut", duration: 0.14 }, 0.66)
        .to(".eroe__testo", { color: INCHIOSTRO, duration: 0.05, ease: "none" }, 0.7)
        .to(".eroe__testo", { y: () => -innerHeight * 0.17, ease: "power2.inOut", duration: 1 }, 0)
        .to(".eroe__titolo", { scale: 0.74, transformOrigin: "0% 100%", ease: "power2.inOut", duration: 1 }, 0)
        .to(".eroe__giu", { autoAlpha: 0, duration: 0.3 }, 0)
        .to(".eroe__dopo", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.74);
    } else {
      tl.to(".eroe__foto", { clipPath: "inset(9% 5% 51% 5% round 6px)", ease: "power2.inOut", duration: 0.9 }, 0)
        .to(".eroe__foto img", { yPercent: -18, ease: "power2.inOut", duration: 0.9 }, 0)
        .to(".eroe__velo", { autoAlpha: 0, duration: 0.2 }, 0.55)
        .to(".eroe", { backgroundColor: CARTA, ease: "power1.inOut", duration: 0.14 }, 0.66)
        .to(".eroe__testo", { color: INCHIOSTRO, duration: 0.05, ease: "none" }, 0.7)
        .to(".eroe__dopo", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.74);
    }
    return () => {};
  });

  /* ════════════ MANIFESTO: le parole si accendono una a una ════════════ */
  const paroleManifesto = spezzaParole($(".manifesto p"));
  gsap.to(paroleManifesto, {
    opacity: 1, stagger: 0.05, ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top top", end: "+=120%", pin: true, scrub: 0.4, anticipatePin: 1 },
  });

  /* ════════════ L'AIA: parole di traverso, binari, foto sfalsate ════════════ */
  $$(".aia__voce").forEach((voce, i) => {
    const parola = $(".aia__parola > span", voce);
    const binario = $(".aia__binario", voce);
    const foto = $(".aia__foto", voce);
    const img = $("img", foto);
    gsap.fromTo(parola, { xPercent: -16, autoAlpha: 0 }, {
      xPercent: 0, autoAlpha: 1, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: voce, start: "top 80%", once: true },
    });
    gsap.fromTo(binario, { scaleX: 0 }, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: voce, start: "top 96%", end: "bottom 50%", scrub: 0.5 },
    });
    gsap.fromTo(img, { clipPath: "polygon(0% 0%, 0% 0%, -70% 100%, -70% 100%)" }, {
      clipPath: "polygon(0% 0%, 170% 0%, 100% 100%, -70% 100%)", duration: 1.5, ease: "power3.inOut",
      scrollTrigger: { trigger: foto, start: "top 90%", once: true },
    });
    gsap.fromTo(foto, { yPercent: i % 2 ? 9 : 15 }, {
      yPercent: i % 2 ? -9 : -15, ease: "none",
      scrollTrigger: { trigger: voce, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ════════════ CUCINA: la striscia dei piatti scorre di lato ════════════ */
  (function () {
    const striscia = $(".piatti");
    const binario = $(".piatti__binario");
    if (!striscia || !binario) return;
    const corsa = () => Math.max(0, binario.scrollWidth - innerWidth + parseFloat(getComputedStyle(binario).paddingLeft));
    const scorri = gsap.to(binario, {
      x: () => -corsa(), ease: "none",
      scrollTrigger: { trigger: striscia, start: "top top", end: () => "+=" + corsa(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$(".piatto figure > img").forEach((im) => {
      gsap.fromTo(im, { xPercent: -6, scale: 1.14 }, {
        xPercent: 6, scale: 1.14, ease: "none",
        scrollTrigger: { trigger: im.closest(".piatto"), containerAnimation: scorri, start: "left right", end: "right left", scrub: true },
      });
    });
  })();

  /* ════════════ CAMERE: pila di foto che si coprono ════════════ */
  (function () {
    const figure = $$(".camere__pila figure");
    figure.forEach((f, i) => {
      const prossima = figure[i + 1];
      if (!prossima) return;
      gsap.to(f, { scale: 0.92, ease: "none", scrollTrigger: { trigger: prossima, start: "top bottom", end: "top 10%", scrub: true } });
      gsap.to($(".velo", f), { opacity: 0.55, ease: "none", scrollTrigger: { trigger: prossima, start: "top bottom", end: "top 10%", scrub: true } });
    });
  })();

  /* ════════════ NUMERI che salgono ════════════ */
  $$("[data-conta]").forEach((el) => {
    const fine = parseInt(el.dataset.conta, 10);
    const o = { v: el.dataset.da ? parseInt(el.dataset.da, 10) : 0 };
    gsap.to(o, {
      v: fine, duration: 1.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate() { el.textContent = String(Math.round(o.v)); },
    });
  });

  /* ════════════ NASTRI degli animali: velocità e inclinazione dallo scroll ════════════ */
  (function () {
    const nastri = $$(".nastro");
    if (!nastri.length) return;
    let yPrec = scrollY, vel = 0;
    const stati = nastri.map((n, i) => {
      const corsa = $(".nastro__corsa", n);
      corsa.innerHTML += corsa.innerHTML;
      return { corsa, x: 0, dir: i % 2 ? 1 : -1 };
    });
    gsap.ticker.add((t, dt) => {
      let v;
      if (lenis) v = lenis.velocity;
      else { const y = scrollY; v = (y - yPrec) * (60 / Math.max(1, dt)) / 16; yPrec = y; }
      vel += (v - vel) * 0.1;
      const passo = (dt / 16.7);
      const inclina = Math.max(-14, Math.min(14, -vel * 0.12));
      stati.forEach((s) => {
        const meta = s.corsa.scrollWidth / 2;
        if (!meta) return;
        s.x += (0.7 + Math.abs(vel) * 0.06) * passo * s.dir;
        if (s.x <= -meta) s.x += meta;
        if (s.x > 0) s.x -= meta;
        s.corsa.style.transform = "translate3d(" + s.x.toFixed(2) + "px,0,0) skewX(" + inclina.toFixed(2) + "deg)";
      });
    });
  })();

  /* ════════════ STORIA: la linea si riempie, le tappe si accendono ════════════ */
  if ($(".storia")) {
    gsap.fromTo(".storia__pieno", { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".storia", start: "top 70%", end: "bottom 62%", scrub: 0.3 },
    });
    $$(".tappa").forEach((t) => {
      ScrollTrigger.create({ trigger: t, start: "top 68%", onEnter: () => t.classList.add("acceso"), onLeaveBack: () => t.classList.remove("acceso") });
    });
  }

  /* ════════════ SPACCIO: l'anteprima segue il mouse sulle righe ════════════ */
  (function () {
    const ant = $(".anteprima");
    if (!ant || tocco) return;
    const img = $("img", ant);
    const ax = gsap.quickTo(ant, "x", { duration: 0.45, ease: "power3" });
    const ay = gsap.quickTo(ant, "y", { duration: 0.45, ease: "power3" });
    gsap.set(ant, { scale: 0.92, transformOrigin: "0 100%" });
    addEventListener("pointermove", (e) => { ax(e.clientX + 26); ay(e.clientY - 200); }, { passive: true });
    $$(".riga[data-foto]").forEach((r) => {
      r.addEventListener("pointerenter", () => {
        img.src = r.dataset.foto;
        gsap.to(ant, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      });
      r.addEventListener("pointerleave", () => {
        gsap.to(ant, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: "power2.in", overwrite: "auto" });
      });
    });
  })();

  /* ════════════ DINTORNI: le cartoline si inclinano sotto il mouse ════════════ */
  if (!tocco) {
    $$(".meta").forEach((m) => {
      const carta = $(".meta__carta", m);
      const rx = gsap.quickTo(carta, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(carta, "rotationY", { duration: 0.5, ease: "power3" });
      m.addEventListener("pointermove", (e) => {
        const r = m.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 14); rx(-py * 14);
      });
      m.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }

  /* ════════════ PARALLASSE dentro le cornici ════════════ */
  $$("[data-parallasse]").forEach((im) => {
    gsap.fromTo(im, { yPercent: -7, scale: 1.16 }, {
      yPercent: 7, scale: 1.16, ease: "none",
      scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ════════════ TITOLI: parole in maschera; blocchi: alzata con dissolvenza ════════════ */
  $$("[data-titolo]").forEach((h) => {
    const parole = spezzaTitolo(h);
    gsap.fromTo(parole, { yPercent: 108 }, {
      yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.04,
      scrollTrigger: { trigger: h, start: "top 86%", once: true },
    });
  });
  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 36 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
  $$("[data-reveal-gruppo]").forEach((g) => {
    const figli = Array.from(g.children);
    gsap.fromTo(figli, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09,
      scrollTrigger: { trigger: g, start: "top 86%", once: true },
    });
  });

  /* ════════════ PIEDE: il marchio gigante affiora ════════════ */
  gsap.fromTo(".piede__marchio", { yPercent: 55 }, {
    yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".piede", start: "top bottom", end: "bottom bottom", scrub: 0.6 },
  });

  /* ── una sola rimisurazione quando font e immagini sono pronti ── */
  let timerRefresh = null;
  function rimisura() {
    clearTimeout(timerRefresh);
    timerRefresh = setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 200);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rimisura);
  addEventListener("load", rimisura);
  addEventListener("pageshow", (e) => { if (e.persisted) rimisura(); });

  window.__noseare = { lenis, QA };
})();
