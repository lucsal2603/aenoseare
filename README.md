# Ae Noseare — bozza del nuovo sito

Proposta di home page per l'**Agriturismo Ae Noseare** di Torri di Quartesolo
(Vicenza): cucina vicentina, nove camere con colazione, fattoria didattica,
spaccio. Bozza gratuita concordata con Claudia il 16 settembre 2026.

**Anteprima:** https://lucsal2603.github.io/aenoseare/

Questa è una bozza: la pagina dichiara `noindex, nofollow` e `robots.txt`
chiude tutto, così l'anteprima non disturba il sito ufficiale aenoseare.it.
Le versioni precedenti restano nei tag `v1-aia` (l'aia con le parole di
traverso), `v2-facetad` (nuvola di foto e tagli diagonali) e `v3-giornata`
(una giornata in campagna, illustrata).

## Quarta versione (24 settembre 2026): in campagna dal 1970
Rifatta da zero. Niente illustrazioni: il carattere viene dal loro logo, dalle
foto vere e da colori pieni di campagna che cambiano di sezione in sezione
(rosso pomodoro, crema, vinaccia, oliva, polenta, lavanda, notte, zucca,
acqua). Impianto e movimenti presi da sette siti:

- **s25.studio**: il marchio gigante che, scorrendo, vola a rimpicciolirsi
  nella testata.
- **delice.ca**: il ristorante di famiglia a colori pieni, i piatti tondi, i
  pannelli affiancati con i titoli ad arco, il riquadro degli orari del giorno
  con le frecce.
- **joinswsh.com**: la foto che si apre tra due parole che si allontanano e
  poi diventa una griglia che si allarga; il cestino con le palline che cadono
  e si possono prendere col mouse (fisica vera, Matter.js).
- **moremedia.at**: la fisarmonica a colonne colorate, il muro dei nomi che si
  accende, il timbro che gira col numero di telefono.
- **alejandroha.com**: la pennellata che attraversa lo schermo e porta alla
  sera, le lettere che cadono al loro posto.
- **loehx.com**: le foto delle camere che arrivano dal fondo e ci passano
  accanto.
- **ascension.pegassi.be**: la grana da pellicola su tutta la pagina.

## Il percorso
Apertura rossa col logo che si scrive e i girasoli che sbocciano; scorrendo
il logo va nella testata e una macchia che respira si allarga fino a mostrare
la casa col portico, con "Venite a trovarci!". Poi chi siamo (le parole si
accendono, i nomi della famiglia come etichette), la campagna (lavanda tra le
parole, poi nove foto), quattro cose (fisarmonica: cucina, camere, fattoria,
spaccio), dalla nostra cucina (otto piatti tondi che rotolano e lo sfondo che
prende il colore del piatto), il menù di settembre (righe che si mettono a
fuoco a metà schermo, foto che segue il mouse), qualche numero di casa (bolle
che galleggiano), la pennellata vinaccia, le camere (tunnel di foto), prezzi e
"Buongiorno!" con la colazione, la fattoria (lettere che cadono, muro degli
animali, fattoria didattica e centri estivi, l'anno in campagna col mese in
corso), lo spaccio e il distributore (con lo stato aperto o chiuso in ora di
Roma), cosa visitare (il rullo delle città che gira come un tamburo), le cene
a tema (carte a ventaglio), le domande (il titolo si scrive da solo), il piede
(orari giorno per giorno, timbro, certificazioni, cestino).

Caratteri: **Gloock** per i titoli, **Instrument Serif** corsivo per le
parole morbide, **Instrument Sans** per i testi. Il puntatore è uno dei
girasoli del logo e gira più veloce quando si scorre.

## Logo
Il logo è il loro, ricalcato in vettoriale dal PNG del sito attuale, con i
quattro girasoli ridisegnati.

## Tecnica
HTML, CSS e JavaScript puri, senza build. GSAP 3.15 (ScrollTrigger, SplitText,
CustomEase), Lenis 1.3 e Matter.js 0.20 da jsDelivr, font da Google Fonts.
Con `prefers-reduced-motion` (o `?statico`) la pagina è ferma, senza pin, e
leggibile. `?qa` salta l'ingresso e Lenis (serve ai collaudi), `?scroll=N`
apre la pagina già scesa di N pixel.

Le foto vengono tutte dal sito attuale aenoseare.it e dalla sua libreria
(2018-2022). Quello che è stato dedotto o scelto da me è in `DA-VERIFICARE.md`.

## In locale
```bash
python3 -m http.server 8086
```
