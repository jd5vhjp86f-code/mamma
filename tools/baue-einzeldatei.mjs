/*
 * Erzeugt aus den Quelldateien eine einzige HTML-Datei, die sich per
 * Doppelklick im Browser öffnen lässt – ohne Server, ohne Netz, ohne
 * Nebendateien. Gedacht für die interne Nutzung: auf dem Praxislaufwerk
 * ablegen, per Mail verschicken, auf einen Stick kopieren.
 *
 * Die Einzeldatei ist ein Erzeugnis, keine zweite Quelle. Inhalte werden
 * ausschließlich in data/regeln.js gepflegt; wer hier etwas ändert, verliert
 * es beim nächsten Lauf.
 *
 * Aufruf: node tools/baue-einzeldatei.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const ZIEL_ORDNER = join(wurzel, "dist");
const ZIEL_NAME = "MRT-Mamma-Kostenuebernahme.html";

/* Ein </script> im eingebetteten Code würde den umschließenden Block
   vorzeitig schließen. Das darf nicht still passieren. */
function pruefeEinbettbar(name, inhalt) {
  if (/<\/script/i.test(inhalt)) {
    throw new Error(`${name} enthält "</script>" und kann nicht eingebettet werden.`);
  }
}

let html = lies("index.html");
const stil = lies("stil.css");
const regeln = lies("data/regeln.js");
const app = lies("app.js");

pruefeEinbettbar("data/regeln.js", regeln);
pruefeEinbettbar("app.js", app);

const ersetzungen = [
  /* Stylesheet einbetten */
  [/<link rel="stylesheet" href="stil\.css"><!--STIL-->/,
   `<style>\n${stil}\n</style>`],

  /* Favicon als Daten-URI, damit keine Nebendatei nötig ist */
  [/<link rel="icon" href="logo\/symbol-quadrat\.svg"><!--ICON-->/,
   `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(lies("logo/symbol-quadrat.svg"))}">`],

  /* Skripte einbetten */
  [/<script src="data\/regeln\.js" charset="UTF-8"><\/script><!--REGELN-->/,
   `<script>\n${regeln}\n</script>`],
  [/<script src="app\.js" charset="UTF-8"><\/script><!--APP-->/,
   `<script>\n${app}\n</script>`],

  /* Die Marke verlinkt auf index.html – daneben liegt hier nichts. */
  [/<a class="marke" href="index\.html"><!--MARKE-HREF-->/,
   `<span class="marke">`],
  [/<\/a>\n  <\/div>\n<\/header>/,
   `</span>\n  </div>\n</header>`],

  /* Impressum und Datenschutz sind eigene Seiten und entfallen.
     An ihre Stelle tritt der Hinweis auf die interne Nutzung. */
  [/<div><!--NUR-MEHRDATEIEN-ANFANG-->[\s\S]*?<!--NUR-MEHRDATEIEN-ENDE-->/,
   `<div>
        <h4>Interne Fassung</h4>
        <p>Einzeldatei f&uuml;r den Gebrauch in der Praxis.</p>
        <p>Nicht ver&ouml;ffentlichen und nicht an Patientinnen weitergeben &ndash;
           ohne Impressum und Datenschutzhinweise ist die Seite daf&uuml;r nicht geeignet.</p>
      </div>`],
];

for (const [suchen, ersetzen] of ersetzungen) {
  if (!suchen.test(html)) {
    throw new Error(`Markierung nicht gefunden: ${suchen}`);
  }
  html = html.replace(suchen, () => ersetzen);
}

/* Gegenprobe: keine Verweise auf Nebendateien mehr. */
const uebrig = [...html.matchAll(/(?:src|href)="(?!#|data:|tel:|mailto:|https?:)([^"]+)"/g)]
  .map((m) => m[1]);
if (uebrig.length) {
  throw new Error(`Die Einzeldatei verweist noch auf Nebendateien: ${uebrig.join(", ")}`);
}

mkdirSync(ZIEL_ORDNER, { recursive: true });
const ziel = join(ZIEL_ORDNER, ZIEL_NAME);
writeFileSync(ziel, html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(0);
console.log(`dist/${ZIEL_NAME}  –  ${kb} KB, eine Datei, keine Nebendateien.`);
