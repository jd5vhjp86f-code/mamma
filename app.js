/*
 * Entscheidungshilfe MRT der Brust – Ablauflogik
 *
 * Diese Datei enthält keinen einzigen medizinischen Satz. Sie läuft den
 * Fragebaum aus data/regeln.js ab und stellt ihn dar. Wer Inhalte ändert,
 * fasst ausschließlich data/regeln.js an.
 *
 * Alle Eingaben bleiben im Arbeitsspeicher des Browsers. Es wird nichts
 * übertragen, nichts gespeichert, kein Cookie gesetzt.
 */
(function () {
  "use strict";

  var R = window.MAMMA_REGELN;
  var wurzel = document.getElementById("app");

  /* Verlauf als Stapel: ermöglicht "Zurück" ohne Neuberechnung. */
  var verlauf = [];
  var aktuell = null;   // { typ: "frage"|"ergebnis", id: "..." }
  var ersterAufbau = true;

  /* ------------------------------------------------------------------ */
  /* Hilfsmittel                                                         */
  /* ------------------------------------------------------------------ */

  /* Alles, was aus den Regeln kommt, wird escaped. Die Regeldatei ist
     zwar vertrauenswürdig, aber ein Tippfehler mit spitzer Klammer soll
     kein Markup erzeugen. */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) { n.className = klasse; }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }

  function ziel(str) {
    var teile = String(str).split(":");
    return { typ: teile[0], id: teile[1] };
  }

  /* Tiefe des Baums: längster Weg von der Startfrage zu einem Ergebnis.
     Daraus entsteht die Anzeige "Frage 2 von 3" – ohne feste Zahl im Code. */
  function maximaleTiefe(frageId, gesehen) {
    gesehen = gesehen || {};
    if (gesehen[frageId]) { return 0; }      /* Zyklusschutz */
    gesehen[frageId] = true;
    var frage = R.fragen[frageId];
    var tiefste = 1;
    frage.antworten.forEach(function (a) {
      var z = ziel(a.ziel);
      if (z.typ === "frage") {
        var t = 1 + maximaleTiefe(z.id, gesehen);
        if (t > tiefste) { tiefste = t; }
      }
    });
    delete gesehen[frageId];
    return tiefste;
  }

  var GESAMT = maximaleTiefe(R.start);

  /* ------------------------------------------------------------------ */
  /* Darstellung: Frage                                                  */
  /* ------------------------------------------------------------------ */
  function zeichneFrage(id) {
    var frage = R.fragen[id];
    var nr = verlauf.length + 1;

    var karte = el("div", "karte");

    /* Fortschritt */
    var fort = el("div", "fortschritt");
    var zaehler = el("span", "zaehler", "Frage " + nr + " von " + GESAMT);
    var schiene = el("div", "schiene");
    var fuellung = el("div", "fuellung");
    fuellung.style.width = Math.round((nr - 1) / GESAMT * 100) + "%";
    schiene.appendChild(fuellung);
    fort.appendChild(zaehler);
    fort.appendChild(schiene);
    karte.appendChild(fort);

    var block = el("div", "frage");

    var h2 = el("h2", null, frage.titel);
    h2.id = "frage-titel";
    h2.setAttribute("tabindex", "-1");
    block.appendChild(h2);

    if (frage.hinweis) { block.appendChild(el("p", "hinweis", frage.hinweis)); }

    var liste = el("div", "antworten");
    liste.setAttribute("role", "group");
    liste.setAttribute("aria-labelledby", "frage-titel");

    frage.antworten.forEach(function (a) {
      var knopf = el("button", "antwort");
      knopf.type = "button";
      knopf.appendChild(el("span", "marke"));
      var text = el("span", "text");
      text.appendChild(document.createTextNode(a.text));
      if (a.zusatz) { text.appendChild(el("small", null, a.zusatz)); }
      knopf.appendChild(text);
      knopf.addEventListener("click", function () { antworte(a.ziel); });
      liste.appendChild(knopf);
    });

    block.appendChild(liste);
    karte.appendChild(block);

    if (verlauf.length > 0) {
      var akt = el("div", "aktionen");
      var zurueck = el("button", null, "← Eine Frage zurück");
      zurueck.type = "button";
      zurueck.addEventListener("click", zurueckGehen);
      akt.appendChild(zurueck);
      karte.appendChild(akt);
    }

    setzeInhalt(karte, h2);
  }

  /* ------------------------------------------------------------------ */
  /* Darstellung: Ergebnis                                               */
  /* ------------------------------------------------------------------ */
  function zeichneErgebnis(id) {
    var e = R.ergebnisse[id];
    var behaelter = document.createDocumentFragment();

    /* Ergebniskasten */
    var kasten = el("div", "ergebnis e-" + e.art);
    kasten.setAttribute("role", "status");
    kasten.appendChild(el("span", "etikett", e.etikett));
    var h2 = el("h2", null, e.titel);
    h2.id = "ergebnis-titel";
    h2.setAttribute("tabindex", "-1");
    kasten.appendChild(h2);
    kasten.appendChild(el("p", "kern", e.kernsatz));
    (e.absaetze || []).forEach(function (t) { kasten.appendChild(el("p", null, t)); });
    behaelter.appendChild(kasten);

    /* Inhaltsblöcke */
    (e.bloecke || []).forEach(function (b) {
      var block = el("div", "block");
      block.appendChild(el("h3", null, b.titel));
      var ul = el("ul");
      b.punkte.forEach(function (p) { ul.appendChild(el("li", null, p)); });
      block.appendChild(ul);
      behaelter.appendChild(block);
    });

    /* Preis – nur wo das Ergebnis ihn vorsieht */
    if (e.preis) {
      var preis = el("div", "preis");
      preis.appendChild(el("span", "label", "Kosten"));
      preis.appendChild(el("span", "betrag", R.preis.betrag));
      preis.appendChild(el("p", null, R.preis.grundlage));
      preis.appendChild(el("p", null, "Preisstand: " + R.preis.stand + ". " +
        "Sie können bei Ihrer Krankenkasse einen Antrag auf Kostenübernahme " +
        "stellen; eine Bewilligung ist damit nicht gesagt."));
      behaelter.appendChild(preis);
    }

    /* Kontakt */
    if (e.termin) { behaelter.appendChild(terminblock()); }

    /* Quellen */
    if (e.quellen && e.quellen.length) {
      var q = el("div", "quellenkasten");
      q.appendChild(el("h3", null, "Worauf sich diese Auskunft stützt"));
      var ul = el("ul");
      e.quellen.forEach(function (k) {
        var quelle = R.quellen[k];
        var li = el("li");
        var a = el("a", null, quelle.kurz);
        a.href = quelle.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);
        li.appendChild(document.createTextNode(" – " + quelle.text));
        ul.appendChild(li);
      });
      q.appendChild(ul);
      behaelter.appendChild(q);
    }

    /* Aktionen */
    var akt = el("div", "aktionen");

    var zurueck = el("button", null, "← Eine Frage zurück");
    zurueck.type = "button";
    zurueck.addEventListener("click", zurueckGehen);
    akt.appendChild(zurueck);

    var drucken = el("button", null, "Ergebnis drucken");
    drucken.type = "button";
    drucken.addEventListener("click", function () { window.print(); });
    akt.appendChild(drucken);

    var neu = el("button", null, "Von vorn beginnen");
    neu.type = "button";
    neu.addEventListener("click", neustart);
    akt.appendChild(neu);

    var karte = el("div", "karte");
    karte.appendChild(behaelter);
    karte.appendChild(akt);

    setzeInhalt(karte, h2);
  }

  function terminblock() {
    var p = R.praxis;
    var block = el("div", "termin");
    block.appendChild(el("h3", null, "Termin und Beratung"));
    var ul = el("ul");

    var li1 = el("li");
    li1.appendChild(document.createTextNode("Telefonisch: "));
    var tel = el("a", null, p.telefonAnzeige);
    tel.href = p.telefonLink;
    li1.appendChild(tel);
    ul.appendChild(li1);

    var li2 = el("li");
    li2.appendChild(document.createTextNode("Online: "));
    var dl = el("a", null, "Termin über Doctolib buchen");
    dl.href = p.doctolib;
    dl.target = "_blank";
    dl.rel = "noopener noreferrer";
    li2.appendChild(dl);
    ul.appendChild(li2);

    var li3 = el("li");
    li3.appendChild(document.createTextNode("Per E-Mail: "));
    var mail = el("a", null, p.mail);
    mail.href = "mailto:" + p.mail;
    li3.appendChild(mail);
    li3.appendChild(document.createTextNode(
      " – bitte ohne Angaben zu Ihrer Erkrankung, E-Mail ist kein sicherer Weg für Gesundheitsdaten."));
    ul.appendChild(li3);

    block.appendChild(ul);
    return block;
  }

  /* ------------------------------------------------------------------ */
  /* Ablauf                                                              */
  /* ------------------------------------------------------------------ */
  function setzeInhalt(knoten, fokusZiel) {
    wurzel.textContent = "";
    wurzel.appendChild(knoten);
    /* Fokus auf die neue Überschrift: Screenreader lesen sie vor,
       Tastaturbedienung landet an der richtigen Stelle. Beim ersten Aufbau
       nicht – da würde die Seite den Fokus ungefragt an sich ziehen und
       über die Einleitung hinwegspringen. */
    if (fokusZiel && !ersterAufbau) { fokusZiel.focus(); }
    if (!ersterAufbau) { window.scrollTo({ top: 0, behavior: "smooth" }); }
    ersterAufbau = false;
  }

  function zeige(z) {
    aktuell = z;
    if (z.typ === "frage") { zeichneFrage(z.id); } else { zeichneErgebnis(z.id); }
  }

  function antworte(zielString) {
    verlauf.push(aktuell);
    zeige(ziel(zielString));
  }

  function zurueckGehen() {
    if (verlauf.length === 0) { return; }
    zeige(verlauf.pop());
  }

  function neustart() {
    verlauf = [];
    zeige({ typ: "frage", id: R.start });
  }

  /* ------------------------------------------------------------------ */
  /* Start                                                               */
  /* ------------------------------------------------------------------ */
  var standzeile = document.getElementById("standzeile");
  if (standzeile) { standzeile.textContent = "Stand: " + R.stand; }

  neustart();
})();
