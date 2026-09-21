# Ae Noseare — bozza del nuovo sito

Proposta di home page per l'**Agriturismo Ae Noseare** di Torri di Quartesolo
(Vicenza): cucina vicentina, nove camere con colazione, fattoria didattica,
spaccio. Bozza gratuita concordata con Claudia il 16 settembre 2026.

**Anteprima:** https://lucsal2603.github.io/aenoseare/

Questa è una bozza: la pagina dichiara `noindex, nofollow` e `robots.txt`
chiude tutto, così l'anteprima non disturba il sito ufficiale aenoseare.it.
La prima versione (l'aia con le parole di traverso) resta nel tag `v1-aia`.

## Impianto
Crema, rosso mattone, un solo carattere (Hanken Grotesk) e tagli diagonali
fra le fasce: l'impianto è quello di facetad.com, riempito con le foto e i
contenuti veri dell'agriturismo. Il marchio script con i quattro girasoli
(preso dal sito attuale in bianco) è stato tinto di rosso per il fondo chiaro.

## Movimento
- Logo e motto fermi al centro mentre una **nuvola di 24 foto a parallelogramma**
  gli scorre attorno, ognuna con la sua velocità di parallasse e la sua
  dissolvenza in entrata; le foto seguono appena il mouse (le vicine più
  delle lontane); il palco sbiadisce quando arriva la prima fascia
- Tre **fasce a tutto schermo con i tagli diagonali** alternati, ognuna
  con la foto che scorre dentro il taglio
- Manifesto rosso in maiuscolo con le parole che arrivano in sequenza
- Due **liste appiccicose** (l'agriturismo, le camere): la foto inclinata si
  scambia con scivolata e sfocatura mentre titolo e testo cambiano, tutto
  legato allo scroll e reversibile; la foto in vista respira piano
- **Citazione rossa** con il taglio in alto e le righe rivelate da sinistra a destra
- Contatti e certificazioni con alzata in sequenza, piede rosso tagliato
- Testata fissa crema con menu a tutto schermo che si apre a cerchio;
  bottone tondo fisso in basso a sinistra per chiamare

## Tecnica
HTML, CSS e JavaScript puri, senza build. GSAP 3.13 con ScrollTrigger e Lenis
via CDN. Con `prefers-reduced-motion` la pagina è ferma e leggibile.
`?qa` nell'URL salta Lenis (serve ai collaudi).

Le foto vengono dal sito attuale aenoseare.it (risoluzione bassa, del 2018-2020).
Il riquadro tratteggiato è un segnaposto e dice quale foto va fatta.
Tutto ciò che è stato dedotto o inventato è in `DA-VERIFICARE.md`.

## In locale
```bash
python3 -m http.server 8086
```
