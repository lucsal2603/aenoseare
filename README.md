# Ae Noseare — bozza del nuovo sito

Proposta di home page per l'**Agriturismo Ae Noseare** di Torri di Quartesolo
(Vicenza): cucina vicentina, nove camere con colazione, fattoria didattica,
spaccio. Bozza gratuita concordata con Claudia il 16 settembre 2026.

**Anteprima:** https://lucsal2603.github.io/aenoseare/

Questa è una bozza: la pagina dichiara `noindex, nofollow` e `robots.txt`
chiude tutto, così l'anteprima non disturba il sito ufficiale aenoseare.it.

## Idea
Il nome, in dialetto, sono i noci: la casa gialla in mezzo ai campi. Carta di
noce, verde delle foglie e giallo dei girasoli del loro marchio. Al centro
della pagina c'è **l'aia**: sette parole giganti di traverso (cucina, camere,
fattoria, spaccio, feste, dintorni, contatti), ognuna col suo binario e la sua
foto, che portano alle sezioni.

## Movimento
- Schermata d'ingresso con il nome lettera per lettera, solo alla prima visita
- Eroe appuntato: la foto della casa si stringe e si aggancia a destra mentre
  entra il testo; su telefono diventa una fascia sopra al titolo
- Manifesto appuntato con le parole che si accendono una a una
- L'aia: parole che scivolano lungo il binario, binari che si disegnano,
  foto che si aprono di traverso e vanno in parallasse, riempimento giallo al passaggio
- Striscia dei piatti a scorrimento orizzontale appuntata, con parallasse dentro le foto
- Pila delle camere che si coprono, numeri che salgono
- Nastri degli animali che accelerano e si inclinano con lo scroll
- Linea della famiglia che si riempie, tappe che si accendono
- Righe dello spaccio con velo giallo e anteprima che segue il mouse
- Cartoline dei dintorni che si inclinano sotto il mouse
- Titoli a parole mascherate, blocchi con alzata, cornici in parallasse
- Marchio gigante che affiora nel piede, testata che si nasconde scendendo
- Stato della cucina calcolato sul giorno (ora di Roma)

## Tecnica
HTML, CSS e JavaScript puri, senza build. GSAP 3.13 con ScrollTrigger e Lenis
via CDN. Font Bricolage Grotesque e Newsreader da Google Fonts.
Con `prefers-reduced-motion` la pagina è ferma e leggibile.
`?qa` nell'URL salta loader e Lenis (serve ai collaudi).

Le foto vengono dal sito attuale aenoseare.it (risoluzione bassa, del 2018-2020).
I riquadri tratteggiati sono segnaposto e dicono quale foto va fatta.
Tutto ciò che è stato dedotto o inventato è in `DA-VERIFICARE.md`.

## In locale
```bash
python3 -m http.server 8086
```
