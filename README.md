# Ae Noseare — bozza del nuovo sito

Proposta di home page per l'**Agriturismo Ae Noseare** di Torri di Quartesolo
(Vicenza): cucina vicentina, nove camere con colazione, fattoria didattica,
spaccio. Bozza gratuita concordata con Claudia il 16 settembre 2026.

**Anteprima:** https://lucsal2603.github.io/aenoseare/

Questa è una bozza: la pagina dichiara `noindex, nofollow` e `robots.txt`
chiude tutto, così l'anteprima non disturba il sito ufficiale aenoseare.it.
Le versioni precedenti restano nei tag `v1-aia` (l'aia con le parole di
traverso) e `v2-facetad` (nuvola di foto e tagli diagonali).

## Terza versione (23 settembre 2026): una giornata in campagna
Rifatta da zero prendendo impianto, movimento e stile da due siti:

- **visiblecuration.vercel.app** (Art of Korea): il mattino illustrato.
  Cielo azzurro, archi annidati a bande (qui il portico di casa, nei toni
  dell'ocra e del cotto), le onde a ventaglio in basso (qui un campo di
  lavanda che ondeggia al vento), gli alberi bianchi, l'animale sulla palla
  (qui un gallo sul sole, che canta), la scritta a mano che resta al centro,
  la fascia azzurra con le due righe che scorrono in versi opposti, le
  cartoline sparse con le nuvole, i salti fra le sezioni con il cerchio che
  si apre dal punto del clic.
- **dkton.at** (Dominik Kostolnik): la sera e la notte. L'ingresso nero con
  le pillole che si accendono e il nome giallo, la testata a scatole con le
  barre di avanzamento e la voce attiva gialla, il bottone con gli angoli da
  mirino, il manifesto con le lettere che si accendono e le foto dentro il
  testo, le righe a "livello" che si riempiono di colore con la parola che
  cambia tinta, le pillole che salgono come un equalizzatore e diventano
  strisce di foto fino a riempire lo schermo, le specialità con i crediti
  fissi a lato e il nome enorme che si accende lettera per lettera, il menù
  a righe che si riempiono di giallo con l'anteprima che segue il mouse, le
  domande con l'interruttore, le foto che si ricompongono, il piede con la
  linea che si disegna e il marchio gigante.

Lo scorrimento è la giornata: alba (ingresso), mattino (eroe, chi siamo,
fattoria, spaccio, dintorni), tramonto (il cielo si spegne mentre salgono le
pillole), sera (cucina, menù, cene a tema), notte (camere, domande, album,
contatti). Il puntatore è un sole che gira con la velocità di scorrimento e
di sera diventa una luna.

Colori presi dai due riferimenti e dalla campagna: cielo `#B7D4EC`, nuvola
`#F3F7FB`, inchiostro `#132C43`, girasole `#FFB800`, lavanda `#A67EFF`,
pomodoro `#FF4337`, notte `#0B0401`. Caratteri: **Archivo** (largo e dritto
per il nome, stretto e corsivo per i titoli, come il GT Walsheim Condensed di
dkton), **Geist Mono** per le etichette tra parentesi, **Borel** per la
scritta a mano.

## Sezioni
Alba, eroe illustrato, chi siamo, cosa trovate (livelli), la fattoria
(animali, fattoria didattica, centri estivi, l'anno in campagna con il mese in
corso acceso), lo spaccio (vasi, distributore del latte che si riempie, stato
del punto vendita in tempo reale), cosa visitare, fascia prenotazioni,
tramonto, la cucina (quattro specialità), il menù di settembre con prezzi e
allergeni, cene a tema, le camere (binario orizzontale, prezzi a barre,
colazione), domande, album, contatti e certificazioni.

## Tecnica
HTML, CSS e JavaScript puri, senza build. GSAP 3.15 (ScrollTrigger,
SplitText, CustomEase, ScrambleText) e Lenis 1.3 da jsDelivr, font da Google
Fonts. Con `prefers-reduced-motion` (o `?statico`) la pagina è ferma, senza
pin, e leggibile. `?qa` salta l'alba e Lenis (serve ai collaudi), `?scroll=N`
apre la pagina già scesa di N pixel.

Le foto vengono tutte dal sito attuale aenoseare.it e dalla sua libreria
(2018-2022). Quello che è stato dedotto o scelto da me è in `DA-VERIFICARE.md`.

## In locale
```bash
python3 -m http.server 8086
```
