/*
 * End-to-End-Test im echten Browser.
 *
 * Läuft jeden Weg durch den Fragebaum ab und prüft, dass am Ende das Ergebnis
 * steht, das das Regelwerk vorsieht. Zusätzlich: Tastaturbedienung, Zurück,
 * Neustart und die Rechtsseiten.
 *
 * Aufruf: node tools/rauchtest.mjs
 */
import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = {};
new Function(readFileSync(join(wurzel, "data/regeln.js"), "utf8"))();
const R = globalThis.window.MAMMA_REGELN;

const seite = pathToFileURL(join(wurzel, "index.html")).href;
let geprueft = 0;
const fehler = [];

/* Alle Wege durch den Baum aufzählen: Liste von Antwortindizes je Weg. */
function wege(frageId, pfad = []) {
  const raus = [];
  R.fragen[frageId].antworten.forEach((a, i) => {
    const [typ, ziel] = a.ziel.split(":");
    if (typ === "ergebnis") raus.push({ klicks: [...pfad, i], ergebnis: ziel });
    else raus.push(...wege(ziel, [...pfad, i]));
  });
  return raus;
}

/* Die in dieser Umgebung installierte Chromium-Fassung weicht von der ab,
   die Playwright erwartet. Deshalb wird der vorhandene Browser direkt benannt,
   statt einen zweiten herunterzuladen. */
const chromPfad = process.env.CHROMIUM_PFAD ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(
  existsSync(chromPfad) ? { executablePath: chromPfad } : {});
const page = await browser.newPage();

/* Jede Konsolenmeldung des Browsers ist ein Fehler – die Seite soll schweigen. */
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") fehler.push(`Konsole: ${m.text()}`);
});
page.on("pageerror", (e) => fehler.push(`Laufzeitfehler: ${e.message}`));

/* Netzwerk: nichts darf nach außen gehen. */
page.on("request", (r) => {
  if (!r.url().startsWith("file://")) fehler.push(`Externer Abruf: ${r.url()}`);
});

for (const { klicks, ergebnis } of wege(R.start)) {
  await page.goto(seite);
  for (const i of klicks) {
    const knoepfe = page.locator(".antwort");
    if ((await knoepfe.count()) === 0) { fehler.push(`Weg ${klicks}: keine Antworten sichtbar.`); break; }
    await knoepfe.nth(i).click();
  }
  const erwartet = R.ergebnisse[ergebnis];
  const titel = await page.locator("#ergebnis-titel").textContent().catch(() => null);
  if (titel !== erwartet.titel) {
    fehler.push(`Weg ${klicks}: erwartet "${erwartet.titel}", gezeigt "${titel}".`);
  }
  /* Klasse muss zur Art passen – sonst stimmt die Farbcodierung nicht. */
  const klasse = await page.locator(".ergebnis").getAttribute("class");
  if (!klasse?.includes("e-" + erwartet.art)) {
    fehler.push(`Weg ${klicks}: Ergebnisklasse "${klasse}" passt nicht zu Art "${erwartet.art}".`);
  }
  /* Preis nur dort, wo er hingehört. */
  const preisSichtbar = (await page.locator(".preis").count()) > 0;
  if (preisSichtbar !== Boolean(erwartet.preis)) {
    fehler.push(`Weg ${klicks}: Preisangabe ${preisSichtbar ? "sichtbar" : "fehlt"}, erwartet umgekehrt.`);
  }
  /* Quellen müssen angezeigt werden, wo das Regelwerk welche nennt. */
  const quellenZahl = await page.locator(".quellenkasten li").count();
  if (quellenZahl !== (erwartet.quellen ?? []).length) {
    fehler.push(`Weg ${klicks}: ${quellenZahl} Quellen angezeigt, ${(erwartet.quellen ?? []).length} erwartet.`);
  }
  geprueft++;
}

/* --- Zurück-Knopf ------------------------------------------------------- */
await page.goto(seite);
await page.locator(".antwort").first().click();          /* GKV */
const zweiteFrage = await page.locator("#frage-titel").textContent();
await page.locator(".antwort").nth(4).click();           /* -> Ergebnis */
await page.getByRole("button", { name: /zurück/i }).click();
if ((await page.locator("#frage-titel").textContent()) !== zweiteFrage) {
  fehler.push("Zurück führt nicht auf die vorherige Frage.");
}
await page.getByRole("button", { name: /zurück/i }).click();
if ((await page.locator("#frage-titel").textContent()) !== R.fragen[R.start].titel) {
  fehler.push("Zweimal Zurück führt nicht auf die Startfrage.");
}
if ((await page.getByRole("button", { name: /zurück/i }).count()) !== 0) {
  fehler.push("Auf der Startfrage wird ein Zurück-Knopf angezeigt.");
}

/* --- Neustart ----------------------------------------------------------- */
await page.locator(".antwort").first().click();
await page.locator(".antwort").nth(4).click();
await page.getByRole("button", { name: /von vorn/i }).click();
if ((await page.locator("#frage-titel").textContent()) !== R.fragen[R.start].titel) {
  fehler.push("Von vorn beginnen führt nicht auf die Startfrage.");
}

/* --- Tastaturbedienung -------------------------------------------------- */
await page.goto(seite);
await page.keyboard.press("Tab");
for (let i = 0; i < 12; i++) {
  const rolle = await page.evaluate(() => document.activeElement?.className ?? "");
  if (rolle.includes("antwort")) break;
  await page.keyboard.press("Tab");
}
if (!(await page.evaluate(() => document.activeElement?.className ?? "")).includes("antwort")) {
  fehler.push("Die Antwortknöpfe sind per Tabulator nicht erreichbar.");
} else {
  await page.keyboard.press("Enter");
  if ((await page.locator(".antwort").count()) === 0) {
    fehler.push("Auswahl per Tastatur führt nicht weiter.");
  }
  /* Nach dem Wechsel muss der Fokus auf der neuen Überschrift liegen. */
  const fokusId = await page.evaluate(() => document.activeElement?.id ?? "");
  if (fokusId !== "frage-titel" && fokusId !== "ergebnis-titel") {
    fehler.push(`Fokus nach Auswahl liegt auf "${fokusId}", nicht auf der Überschrift.`);
  }
}

/* --- Fortschrittsanzeige ------------------------------------------------ */
await page.goto(seite);
const ersterZaehler = await page.locator(".fortschritt .zaehler").textContent();
if (!/Frage 1 von \d/.test(ersterZaehler ?? "")) {
  fehler.push(`Fortschrittsanzeige lautet "${ersterZaehler}".`);
}

/* --- Rechtsseiten ------------------------------------------------------- */
for (const datei of ["impressum.html", "datenschutz.html"]) {
  await page.goto(pathToFileURL(join(wurzel, datei)).href);
  if ((await page.locator("h1").count()) === 0) fehler.push(`${datei}: keine Überschrift.`);
  if ((await page.locator('a[href="index.html"]').count()) === 0) {
    fehler.push(`${datei}: kein Rückweg zur Entscheidungshilfe.`);
  }
}

/* --- Mobile Darstellung: kein waagerechter Überlauf ---------------------- */
await page.setViewportSize({ width: 320, height: 720 });
await page.goto(seite);
const ueberlauf = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth);
if (ueberlauf) fehler.push("Bei 320 px Breite entsteht waagerechtes Scrollen.");

await browser.close();

console.log(`${geprueft} Wege durch den Fragebaum geprüft.`);
if (fehler.length) {
  console.error(`\n${fehler.length} Fehler:`);
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("Rauchtest bestanden.");
