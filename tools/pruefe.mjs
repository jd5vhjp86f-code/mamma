/*
 * Prüft das Regelwerk in data/regeln.js.
 *
 * Ein Entscheidungsbaum versagt leise: Ein Tippfehler in einem Ziel führt nicht
 * zu einem Absturz, sondern zu einer Seite, auf der nichts passiert. Dieses
 * Werkzeug macht solche Fehler laut.
 *
 * Aufruf: node tools/pruefe.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const fehler = [];
const warnungen = [];

/* --- Regelwerk laden, wie der Browser es täte --------------------------- */
globalThis.window = {};
new Function(readFileSync(join(wurzel, "data/regeln.js"), "utf8"))();
const R = globalThis.window.MAMMA_REGELN;

const fragen = Object.keys(R.fragen);
const ergebnisse = Object.keys(R.ergebnisse);
const quellen = Object.keys(R.quellen);

const erreichteFragen = new Set();
const erreichteErgebnisse = new Set();
const benutzteQuellen = new Set();
const ARTEN = new Set(["kasse", "weg", "schritt", "selbst", "offen"]);

/* --- 1. Startknoten ----------------------------------------------------- */
if (!R.fragen[R.start]) {
  fehler.push(`Startfrage "${R.start}" existiert nicht.`);
}

/* --- 2. Jede Frage: Aufbau und Ziele ------------------------------------ */
for (const id of fragen) {
  const f = R.fragen[id];
  if (!f.titel) fehler.push(`Frage "${id}" hat keinen Titel.`);
  if (!Array.isArray(f.antworten) || f.antworten.length < 2) {
    fehler.push(`Frage "${id}" hat weniger als zwei Antworten.`);
    continue;
  }
  const gesehen = new Set();
  for (const a of f.antworten) {
    if (!a.text) fehler.push(`Frage "${id}": Antwort ohne Text.`);
    if (gesehen.has(a.text)) fehler.push(`Frage "${id}": Antworttext doppelt – "${a.text}".`);
    gesehen.add(a.text);

    const [typ, ziel] = String(a.ziel ?? "").split(":");
    if (typ === "frage") {
      if (!R.fragen[ziel]) fehler.push(`Frage "${id}" verweist auf unbekannte Frage "${ziel}".`);
      else erreichteFragen.add(ziel);
    } else if (typ === "ergebnis") {
      if (!R.ergebnisse[ziel]) fehler.push(`Frage "${id}" verweist auf unbekanntes Ergebnis "${ziel}".`);
      else erreichteErgebnisse.add(ziel);
    } else {
      fehler.push(`Frage "${id}": Ziel "${a.ziel}" ist weder "frage:" noch "ergebnis:".`);
    }
  }
}

/* --- 3. Jedes Ergebnis: Aufbau und Quellen ------------------------------ */
for (const id of ergebnisse) {
  const e = R.ergebnisse[id];
  for (const feld of ["art", "etikett", "titel", "kernsatz"]) {
    if (!e[feld]) fehler.push(`Ergebnis "${id}": Feld "${feld}" fehlt.`);
  }
  if (e.art && !ARTEN.has(e.art)) {
    fehler.push(`Ergebnis "${id}": unbekannte Art "${e.art}".`);
  }
  for (const b of e.bloecke ?? []) {
    if (!b.titel) fehler.push(`Ergebnis "${id}": Block ohne Titel.`);
    if (!Array.isArray(b.punkte) || b.punkte.length === 0) {
      fehler.push(`Ergebnis "${id}": Block "${b.titel}" ohne Punkte.`);
    }
  }
  for (const k of e.quellen ?? []) {
    if (!R.quellen[k]) fehler.push(`Ergebnis "${id}" nennt unbekannte Quelle "${k}".`);
    else benutzteQuellen.add(k);
  }
  /* Eine Aussage zur Kostenübernahme ohne Beleg ist genau das, was diese
     Seite vermeiden soll. Reine Beratungsergebnisse sind ausgenommen. */
  if (e.art !== "offen" && (e.quellen ?? []).length === 0) {
    fehler.push(`Ergebnis "${id}" trifft eine Aussage zur Kostenübernahme, nennt aber keine Quelle.`);
  }
  /* Wo ein Preis steht, muss auch der Weg dorthin beschrieben sein. */
  if (e.preis && e.art === "kasse") {
    fehler.push(`Ergebnis "${id}" ist Kassenleistung, zeigt aber einen Selbstzahlerpreis.`);
  }
}

/* --- 4. Erreichbarkeit -------------------------------------------------- */
for (const id of fragen) {
  if (id !== R.start && !erreichteFragen.has(id)) {
    fehler.push(`Frage "${id}" ist von keiner anderen Frage aus erreichbar.`);
  }
}
for (const id of ergebnisse) {
  if (!erreichteErgebnisse.has(id)) {
    fehler.push(`Ergebnis "${id}" ist von keiner Frage aus erreichbar.`);
  }
}
for (const k of quellen) {
  if (!benutzteQuellen.has(k)) {
    warnungen.push(`Quelle "${k}" wird von keinem Ergebnis genannt.`);
  }
}

/* --- 5. Jeder Weg endet ------------------------------------------------- */
function endet(id, pfad) {
  if (pfad.includes(id)) {
    fehler.push(`Zyklus im Fragebaum: ${[...pfad, id].join(" → ")}`);
    return false;
  }
  return R.fragen[id].antworten.every((a) => {
    const [typ, ziel] = a.ziel.split(":");
    return typ === "ergebnis" ? true : endet(ziel, [...pfad, id]);
  });
}
endet(R.start, []);

/* --- 6. Quellen: Kurztext und erreichbare Adresse ----------------------- */
for (const k of quellen) {
  const q = R.quellen[k];
  if (!q.kurz || !q.text) fehler.push(`Quelle "${k}": kurz oder text fehlt.`);
  if (!/^https:\/\//.test(q.url ?? "")) {
    fehler.push(`Quelle "${k}": url fehlt oder ist nicht https.`);
  }
}

/* --- 7. Keine externen Ressourcen in den Seiten ------------------------- */
for (const datei of ["index.html", "impressum.html", "datenschutz.html"]) {
  const html = readFileSync(join(wurzel, datei), "utf8");
  const extern = [...html.matchAll(/<(?:script|link|img|iframe)[^>]*?(?:src|href)="(https?:\/\/[^"]+)"/gi)]
    .map((m) => m[1])
    .filter((u) => !/^https:\/\/(www\.)?(radiologie-dammtor\.de|docs\.github\.com|kvhh\.de|aerztekammer-hamburg\.org)/.test(u));
  for (const u of extern) {
    fehler.push(`${datei} lädt eine externe Ressource: ${u}`);
  }
  if (!/<html lang="de">/.test(html)) fehler.push(`${datei}: lang="de" fehlt.`);
  if (!/charset="?UTF-8/i.test(html)) fehler.push(`${datei}: charset fehlt.`);
  for (const pflicht of ["impressum.html", "datenschutz.html"]) {
    if (!html.includes(pflicht)) fehler.push(`${datei} verlinkt ${pflicht} nicht.`);
  }
}

/* --- 8. Telefonnummern: Anzeige und Link müssen zusammenpassen ---------- */
const alleTexte = ["index.html", "impressum.html", "datenschutz.html"]
  .map((d) => readFileSync(join(wurzel, d), "utf8"))
  .concat(readFileSync(join(wurzel, "data/regeln.js"), "utf8"))
  .join("\n");

for (const [, link, anzeige] of alleTexte.matchAll(/tel:\+49(\d+)"[^>]*>([^<]*040[^<]*)</g)) {
  const normalisiert = anzeige.replace(/[^\d]/g, "").replace(/^0/, "49");
  if (normalisiert !== "49" + link) {
    fehler.push(`Telefonnummer stimmt nicht: Link "+49${link}" gegen Anzeige "${anzeige.trim()}".`);
  }
}
const p = R.praxis;
if (p.telefonLink.replace(/\D/g, "") !== "49" + p.telefonAnzeige.replace(/\D/g, "").replace(/^0/, "")) {
  fehler.push(`praxis.telefonLink passt nicht zu praxis.telefonAnzeige.`);
}

/* --- Bericht ------------------------------------------------------------ */
const tiefe = (function tief(id, gesehen = new Set()) {
  if (gesehen.has(id)) return 0;
  gesehen.add(id);
  return 1 + Math.max(0, ...R.fragen[id].antworten
    .filter((a) => a.ziel.startsWith("frage:"))
    .map((a) => tief(a.ziel.split(":")[1], new Set(gesehen))));
})(R.start);

console.log(`Fragen:     ${fragen.length}`);
console.log(`Ergebnisse: ${ergebnisse.length}  (${ergebnisse.filter((i) => R.ergebnisse[i].art === "kasse").length}x Kassenleistung)`);
console.log(`Quellen:    ${quellen.length}`);
console.log(`Tiefe:      ${tiefe} Fragen bis zum Ergebnis`);
console.log(`Stand:      ${R.stand}`);

for (const w of warnungen) console.log(`HINWEIS  ${w}`);

if (fehler.length) {
  console.error(`\n${fehler.length} Fehler:`);
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nAlles geprüft, keine Fehler.");
