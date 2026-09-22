# Entscheidungshilfe MRT der Brust

Patientenseite der Radiologie Dammtor: Ordnet in bis zu vier Fragen ein, ob die
MRT der Brust von der gesetzlichen Krankenversicherung übernommen wird, über
einen anderen Weg läuft oder eine Selbstzahlerleistung ist.

Ausgeliefert über GitHub Pages unter <https://mamma.rosenbaum.hamburg>.

## Die fachliche Kernaussage

In der **ambulanten vertragsärztlichen Versorgung** nennt der EBM für die MRT
der Mamma (GOP 34431, Abschnitt 34.4.3) **abschließend zwei Indikationen**:

1. **Rezidivausschluss** eines histologisch gesicherten Mammakarzinoms nach
   brusterhaltender Therapie oder nach Wiederaufbau, wenn Mammographie und
   Sonographie den Verdacht nicht klären – frühestens 6 Monate nach der
   Operation, frühestens 12 Monate nach Abschluss der Bestrahlung.
2. **Primärtumorsuche** bei histologisch gesicherter axillärer
   Lymphknotenmetastase eines Mammakarzinoms, wenn der Primärtumor klinisch,
   mammographisch und sonographisch nicht darstellbar ist.

Zusätzlich braucht die Praxis eine Abrechnungsgenehmigung nach der
Kernspintomographie-Vereinbarung (§ 135 Abs. 2 SGB V).

Alles andere ist ambulant **keine** Leistung der GKV – auch dann nicht, wenn es
medizinisch indiziert ist. Das betrifft insbesondere die Abklärung unklarer
Befunde, das präoperative Staging bei gesichertem Karzinom, die
Implantatkontrolle und die Früherkennung.

**Sonderweg Hochrisiko:** Bei nachgewiesener krankheitsverursachender
Genvariante oder hohem berechnetem Risiko ist die jährliche MRT Kassenleistung –
aber über Verträge zur besonderen Versorgung nach § 140a SGB V mit den Zentren
des Deutschen Konsortiums Familiärer Brust- und Eierstockkrebs, nicht über den
EBM. Die Seite leitet in diesen Fällen dorthin, statt eine Selbstzahlerleistung
anzubieten.

## Korrekturen gegenüber dem Vorentwurf

Der ursprüngliche Entwurf enthielt Angaben, die einer Prüfung nicht standhielten:

| Aussage im Entwurf | Befund |
|---|---|
| Unklarer Befund nach Mammographie/Ultraschall sei „in der Regel" GKV-Leistung | **Falsch.** Ambulant nicht im EBM vorgesehen. Der Entwurf widersprach sich hier auch selbst: Der IGeL-Kasten nannte drei Indikationen, der Ergebnispfad eine vierte. |
| BRCA-Mutation sei GKV-Indikation nach EBM | **Irreführend.** Nicht über den EBM, sondern über § 140a-Verträge mit den Konsortialzentren. Wer das hier als Kassenleistung buchen will, zahlt am Ende selbst. |
| PKV übernehme „unabhängig von der medizinischen Indikation" | **Falsch.** § 192 Abs. 1 VVG stellt auf medizinische Notwendigkeit ab; reine Früherkennung wird häufig abgelehnt. |
| Verweis auf „Richtlinien des G-BA" als Grundlage der Kostenübernahme | **Unzutreffend.** Grundlage ist der EBM, nicht eine G-BA-Richtlinie. |
| `tel:+494035004845` bei angezeigter Nummer „040 3500484-54" | **Defekt.** Der Link wählte eine andere Nummer als die angezeigte. |
| Antwortwert `brca` in der Logik | **Toter Code.** Kein Bedienelement erzeugte ihn je. |
| „Stand: März 2026" | Lag zum Zeitpunkt der Prüfung in der Vergangenheit und passte zu keiner Quelle. |

Ergänzt wurden die Fristen des EBM, die Voraussetzung vorheriger Mammographie
und Sonographie, die Wege für Staging und Implantatkontrolle sowie die aktuelle
Bewertung des IGeL-Monitors („unklar", 26.06.2025 – zuvor „tendenziell negativ").

## Aufbau

```
index.html          Entscheidungshilfe
impressum.html      Impressum nach § 5 DDG
datenschutz.html    Datenschutzhinweise
stil.css            Design der Praxis, gemeinsam für alle Seiten
data/regeln.js      Fragebaum, Ergebnisse, Quellen, Preis – der gesamte Inhalt
app.js              Ablauflogik, ohne einen einzigen medizinischen Satz
tools/pruefe.mjs    Prüfung des Regelwerks
tools/rauchtest.mjs End-to-End-Test im Browser
robots.txt          Sperrung für Suchmaschinen bis zur Freigabe
CNAME               mamma.rosenbaum.hamburg
```

Bewusste Entscheidungen:

* **Keine externen Ressourcen.** Kein CDN, keine Webfonts, keine Analytik, keine
  Cookies. Damit verlässt keine Besucher-IP den ausliefernden Server, und es
  entsteht keine Einwilligungspflicht. Der Rauchtest prüft das, indem er jeden
  Netzwerkabruf außerhalb von `file://` als Fehler wertet.
* **Inhalt getrennt von Logik.** Wer eine Indikation nachträgt oder einen Text
  ändert, fasst nur `data/regeln.js` an. `app.js` kennt keine Medizin.
* **Jedes Ergebnis nennt seine Quelle.** Der Validator lässt keine Aussage zur
  Kostenübernahme ohne Beleg durch.
* **Keine Eingabe verlässt das Gerät.** Die Seite fragt Gesundheitsdaten ab.
  Diese bleiben im Arbeitsspeicher des Browsers und werden nirgends gespeichert.
* **Kodierung UTF-8** in allen Dateien; die Skript-Einbindungen tragen dazu ein
  ausdrückliches `charset`.

## Prüfen

```bash
npm test              # Regelwerk und Browser
npm run pruefe        # nur das Regelwerk – braucht kein Playwright
```

`tools/pruefe.mjs` prüft: Startknoten vorhanden, jedes Ziel existiert, jede
Frage hat mindestens zwei Antworten, kein Antworttext doppelt, jede Frage und
jedes Ergebnis erreichbar, kein Zyklus, jedes Ergebnis mit Quelle, kein
Selbstzahlerpreis an einem Kassenergebnis, keine externen Ressourcen in den
Seiten, Impressum und Datenschutz überall verlinkt – und dass jede angezeigte
Telefonnummer zu ihrem `tel:`-Link passt.

`tools/rauchtest.mjs` läuft **alle 15 Wege** durch den Fragebaum im echten
Browser ab und prüft Ergebnis, Farbcodierung, Preisanzeige und Quellenzahl.
Dazu Zurück-Knopf, Neustart, Tastaturbedienung, Fokusführung,
Fortschrittsanzeige, die Rechtsseiten und die Darstellung bei 320 px Breite.
Jede Konsolenmeldung des Browsers gilt als Fehler.

Der Rauchtest braucht Playwright und Chromium. Weicht die installierte
Chromium-Fassung von der erwarteten ab, nennt man den Pfad über die
Umgebungsvariable `CHROMIUM_PFAD`.

## Pflege

* **Preis.** Die `ca. 460 Euro` stehen in `data/regeln.js` unter `PREIS`. Bei
  Änderung des Untersuchungsumfangs oder des GOÄ-Steigerungssatzes dort
  anpassen und `stand` mitziehen.
* **Telefonnummer.** `praxis.telefonAnzeige` und `praxis.telefonLink` in
  `data/regeln.js`. Der Validator erzwingt, dass beide zusammenpassen, und
  prüft dasselbe für jede Nummer in den HTML-Seiten.
* **Rechtslage.** Der EBM wird quartalsweise fortgeschrieben. Ändert sich
  Abschnitt 34.4.3, sind die Ergebnisse `gkvRezidiv`, `gkvCup`, `abklaerung`,
  `staging` und `implantat` zu prüfen. Gleiches gilt, wenn der G-BA die
  Altersgrenze des Mammographie-Screenings absenkt – dann ist `frueherkennung`
  samt Quelle `gbaScreening` anzupassen.
* **Stand-Datum.** `R.stand` in `data/regeln.js` erscheint im Seitenfuß. Bei
  jeder inhaltlichen Änderung mitziehen.

## Quellen

* EBM, GOP 34431 (Abschnitt 34.4.3) – <https://www.kbv.de/html/ebm.php>
* Kernspintomographie-Vereinbarung nach § 135 Abs. 2 SGB V
* Deutsches Konsortium Familiärer Brust- und Eierstockkrebs –
  <https://www.konsortium-familiaerer-brustkrebs.de/>
* S3-Leitlinie Mammakarzinom, Leitlinienprogramm Onkologie –
  <https://www.leitlinienprogramm-onkologie.de/leitlinien/mammakarzinom/>
* IGeL-Monitor, MRT der Brust zur Krebsfrüherkennung, Stand 26.06.2025 –
  <https://www.igel-monitor.de/igel-a-z/igel/show/mrt-der-brust-zur-krebsfrueherkennung.html>
* G-BA, Mammographie-Screening-Programm – <https://www.g-ba.de/>
* § 18 Abs. 8 Bundesmantelvertrag-Ärzte; § 192 Abs. 1 VVG

Alle Angaben mit Stand 22. September 2026.

## Veröffentlichung

GitHub Pages, Quelle `main`, Verzeichnis `/`. Die Datei `CNAME` setzt die
eigene Domain. Im DNS von `rosenbaum.hamburg` zeigt `mamma` als CNAME auf
`jd5vhjp86f-code.github.io`.

Das Repository muss dafür öffentlich sein – GitHub Pages aus einem privaten
Repository setzt einen kostenpflichtigen Tarif voraus. Danach in den
Repository-Einstellungen unter Pages „Enforce HTTPS" aktivieren, sobald das
Zertifikat ausgestellt ist.

### Die Seite ist für Suchmaschinen gesperrt

Bis zur Freigabe durch die Praxis tragen alle drei Seiten
`<meta name="robots" content="noindex, nofollow">`, und `robots.txt` sperrt
den gesamten Pfad. Die Seite ist damit über ihre Adresse erreichbar, taucht
aber nicht in Suchergebnissen auf.

**Zur Freigabe beides gemeinsam ändern:** die `noindex`-Zeilen aus den drei
HTML-Seiten entfernen (in `index.html` gegen `index, follow` tauschen) und in
`robots.txt` `Disallow: /` streichen. `tools/pruefe.mjs` lässt einen
Zwischenzustand nicht durch – eine Seite mit `noindex` bei freigebender
`robots.txt` ist ein harter Fehler, und umgekehrt.
