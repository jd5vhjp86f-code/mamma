/*
 * Entscheidungshilfe MRT der Brust – Regelwerk und Texte
 *
 * Diese Datei enthält den gesamten fachlichen Inhalt: den Fragebaum, die
 * Ergebnisse und die Quellen. app.js enthält nur die Ablauflogik und kennt
 * keinen einzigen medizinischen Satz. Wer eine Indikation nachträgt oder einen
 * Text ändert, fasst ausschließlich diese Datei an.
 *
 * Grundsatz: Es wird nur behauptet, was belegt ist. Jedes Ergebnis nennt die
 * Quelle, auf die es sich stützt. Wo die Rechtslage eine Einzelfallprüfung
 * verlangt, sagt das Ergebnis das, statt eine Zusage zu erfinden.
 *
 * Kodierung: UTF-8. index.html lädt diese Datei mit charset="UTF-8".
 */
window.MAMMA_REGELN = (function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Stammdaten der Praxis – an einer Stelle, damit Nummern nicht        *
   * auseinanderlaufen.                                                  *
   * ------------------------------------------------------------------ */
  var PRAXIS = {
    name: "Radiologie Dammtor",
    telefonAnzeige: "040 3500484-54",
    telefonLink: "tel:+4940350048454",
    mail: "info@radiologie-dammtor.de",
    doctolib: "https://www.doctolib.de/gemeinschaftspraxis/hamburg/mrtdiagnostik-dammtorwall?pid=practice-79030",
    web: "https://www.radiologie-dammtor.de"
  };

  /* ------------------------------------------------------------------ *
   * Preis der Selbstzahlerleistung. Von der Praxis bestätigt.           *
   *                                                                     *
   * PFLEGEHINWEIS: Bei jeder Änderung des Untersuchungsumfangs oder des  *
   * GOÄ-Steigerungssatzes neu festzulegen und "stand" mitzuziehen.       *
   * ------------------------------------------------------------------ */
  var PREIS = {
    betrag: "ca. 460 Euro",
    grundlage: "Abgerechnet wird nach der Gebührenordnung für Ärzte (GOÄ). " +
               "Der genaue Betrag hängt vom Untersuchungsumfang ab; Sie erhalten " +
               "vorab einen schriftlichen Kostenvoranschlag.",
    stand: "September 2026"
  };

  /* ------------------------------------------------------------------ *
   * Quellen                                                             *
   * ------------------------------------------------------------------ */
  var QUELLEN = {
    ebm34431: {
      kurz: "EBM Nr. 34431 (Abschnitt 34.4.3)",
      text: "Einheitlicher Bewertungsmaßstab, GOP 34431 – MRT-Untersuchung der Mamma. " +
            "Abrechnung nur bei den dort abschließend genannten Indikationen und nur " +
            "mit Genehmigung nach der Kernspintomographie-Vereinbarung (§ 135 Abs. 2 SGB V).",
      url: "https://www.kbv.de/html/ebm.php"
    },
    kvGenehmigung: {
      kurz: "Kernspintomographie-Vereinbarung (§ 135 Abs. 2 SGB V)",
      text: "Qualitätssicherungsvereinbarung zur Kernspintomographie; die MRT der Mamma " +
            "(MRM) setzt eine gesonderte Abrechnungsgenehmigung der Kassenärztlichen " +
            "Vereinigung voraus.",
      url: "https://www.kbv.de/html/qualitaetssicherung.php"
    },
    konsortium: {
      kurz: "Deutsches Konsortium Familiärer Brust- und Eierstockkrebs",
      text: "Intensivierte Früherkennung an zertifizierten Zentren, abgebildet in " +
            "Krankenkassenverträgen zur besonderen Versorgung nach § 140a SGB V.",
      url: "https://www.konsortium-familiaerer-brustkrebs.de/"
    },
    s3: {
      kurz: "S3-Leitlinie Mammakarzinom",
      text: "Leitlinienprogramm Onkologie: Früherkennung, Diagnostik, Therapie und " +
            "Nachsorge des Mammakarzinoms, Langversion 5.x.",
      url: "https://www.leitlinienprogramm-onkologie.de/leitlinien/mammakarzinom/"
    },
    igelMonitor: {
      kurz: "IGeL-Monitor, MRT der Brust zur Krebsfrüherkennung",
      text: "Bewertung „unklar“ (Stand 26.06.2025; zuvor „tendenziell negativ“). " +
            "Für Frauen ohne erhöhtes Risiko fand sich keine Studie, die zeigt, ob " +
            "die MRT Brustkrebs-Todesfälle verhindert. Genannte Kostenspanne: 230 bis 600 Euro.",
      url: "https://www.igel-monitor.de/igel-a-z/igel/show/mrt-der-brust-zur-krebsfrueherkennung.html"
    },
    gbaScreening: {
      kurz: "G-BA, Mammographie-Screening-Programm",
      text: "Anspruch auf Mammographie alle zwei Jahre für Frauen von 50 bis 75 Jahren. " +
            "Über eine Absenkung der unteren Altersgrenze auf 45 Jahre berät der G-BA; " +
            "eine Entscheidung wird für Oktober 2026 erwartet.",
      url: "https://www.g-ba.de/themen/methodenbewertung/ambulant/frueherkennung-krankheiten/erwachsene/krebsfrueherkennung/mammographie-screening/"
    },
    bmvae: {
      kurz: "§ 18 Abs. 8 Bundesmantelvertrag-Ärzte",
      text: "Verlangt für Leistungen außerhalb des Leistungskatalogs der gesetzlichen " +
            "Krankenversicherung eine vorherige schriftliche Vereinbarung mit der " +
            "oder dem Versicherten.",
      url: "https://www.kbv.de/html/bundesmantelvertrag.php"
    },
    vvg192: {
      kurz: "§ 192 Abs. 1 VVG",
      text: "Die private Krankenversicherung erstattet Aufwendungen für medizinisch " +
            "notwendige Heilbehandlung. Was der Tarif darüber hinaus vorsieht, regelt " +
            "der jeweilige Vertrag.",
      url: "https://www.gesetze-im-internet.de/vvg_2008/__192.html"
    }
  };

  /* ------------------------------------------------------------------ *
   * Fragen                                                              *
   *                                                                     *
   * Jede Antwort verweist entweder auf eine weitere Frage (frage:) oder  *
   * auf ein Ergebnis (ergebnis:). Andere Sprünge gibt es nicht; das      *
   * Prüfwerkzeug in tools/pruefe.mjs erzwingt das.                       *
   * ------------------------------------------------------------------ */
  var FRAGEN = {
    versicherung: {
      titel: "Wie sind Sie versichert?",
      hinweis: "Die Regeln der gesetzlichen und der privaten Krankenversicherung " +
               "unterscheiden sich grundlegend.",
      antworten: [
        {
          text: "Gesetzlich versichert",
          zusatz: "Sie legen eine elektronische Gesundheitskarte vor.",
          ziel: "frage:situation"
        },
        {
          text: "Privat versichert oder beihilfeberechtigt",
          zusatz: "Sie erhalten eine Rechnung und reichen sie selbst ein.",
          ziel: "ergebnis:pkv"
        },
        {
          text: "Ich möchte die Untersuchung ohnehin selbst bezahlen",
          zusatz: "Zum Beispiel ohne Versicherungsschutz in Deutschland.",
          ziel: "ergebnis:selbstzahler"
        }
      ]
    },

    situation: {
      titel: "Welche Situation trifft auf Sie zu?",
      hinweis: "Wählen Sie den Punkt, der Ihrer Lage am nächsten kommt. " +
               "Trifft mehreres zu, wählen Sie den obersten zutreffenden Punkt.",
      antworten: [
        {
          text: "Ich hatte Brustkrebs und wurde brusterhaltend operiert, bestrahlt " +
                "oder wieder aufgebaut – jetzt besteht der Verdacht auf ein Rezidiv",
          zusatz: "Es soll geklärt werden, ob es sich um Narbengewebe oder um " +
                  "erneuten Tumor handelt.",
          ziel: "frage:rezidivFrist"
        },
        {
          text: "Bei mir wurde eine Lymphknotenmetastase eines Brustkrebses " +
                "festgestellt, der Ursprungstumor ist aber nicht auffindbar",
          zusatz: "Feingeweblich gesichert, Ursprungsort unbekannt (CUP-Situation).",
          ziel: "frage:cupBildgebung"
        },
        {
          text: "Bei mir ist eine krankheitsverursachende Genveränderung bekannt " +
                "(zum Beispiel BRCA1, BRCA2, PALB2, TP53)",
          zusatz: "Oder eine ärztliche Risikoberechnung hat ein hohes Erkrankungsrisiko ergeben.",
          ziel: "ergebnis:zentrumGen"
        },
        {
          text: "In meiner Familie gibt es Brust- oder Eierstockkrebs, eine " +
                "Genveränderung ist aber nicht bekannt",
          zusatz: "Eine genetische Beratung hat noch nicht stattgefunden.",
          ziel: "ergebnis:zentrumFamilie"
        },
        {
          text: "Mammographie oder Ultraschall haben einen unklaren oder " +
                "verdächtigen Befund ergeben, der abgeklärt werden soll",
          zusatz: "Zum Beispiel BI-RADS 0, 3, 4 oder 5.",
          ziel: "ergebnis:abklaerung"
        },
        {
          text: "Ein Brustkrebs ist bereits gesichert, jetzt geht es um die " +
                "Planung der Operation",
          zusatz: "Ausbreitungsdiagnostik vor dem Eingriff.",
          ziel: "ergebnis:staging"
        },
        {
          text: "Ich habe Brustimplantate und es besteht der Verdacht auf einen Defekt",
          zusatz: "Zum Beispiel Verdacht auf eine Ruptur des Implantats.",
          ziel: "ergebnis:implantat"
        },
        {
          text: "Ich habe keine Beschwerden und möchte die MRT zur Früherkennung",
          zusatz: "Auch bei sehr dichtem Brustgewebe.",
          ziel: "ergebnis:frueherkennung"
        },
        {
          text: "Nichts davon trifft zu oder ich bin unsicher",
          ziel: "ergebnis:beratung"
        }
      ]
    },

    rezidivFrist: {
      titel: "Wie lange liegt die Behandlung zurück?",
      hinweis: "Für die Kassenleistung gibt der EBM eine Wartezeit vor. Sie soll " +
               "verhindern, dass frische Heilungsvorgänge als Tumor fehlgedeutet werden.",
      antworten: [
        {
          text: "Die Operation ist mehr als 6 Monate her, beziehungsweise die " +
                "Bestrahlung ist seit mehr als 12 Monaten abgeschlossen",
          ziel: "frage:rezidivBildgebung"
        },
        {
          text: "Nein, die Behandlung liegt kürzer zurück",
          ziel: "ergebnis:rezidivFrist"
        },
        {
          text: "Das weiß ich nicht genau",
          ziel: "ergebnis:beratung"
        }
      ]
    },

    rezidivBildgebung: {
      titel: "Wurden Mammographie und Ultraschall bereits durchgeführt?",
      hinweis: "Die MRT ist als Kassenleistung nur vorgesehen, wenn diese beiden " +
               "Untersuchungen den Verdacht nicht klären konnten.",
      antworten: [
        {
          text: "Ja, beide wurden gemacht und konnten den Verdacht nicht klären",
          ziel: "ergebnis:gkvRezidiv"
        },
        {
          text: "Nein, noch nicht – oder ich weiß es nicht",
          ziel: "ergebnis:vorbefundeRezidiv"
        }
      ]
    },

    cupBildgebung: {
      titel: "Wurde nach dem Ursprungstumor bereits gesucht?",
      hinweis: "Die Kassenleistung setzt voraus, dass der Ursprungstumor weder in " +
               "der körperlichen Untersuchung noch in Mammographie und Ultraschall " +
               "darstellbar war.",
      antworten: [
        {
          text: "Ja, Mammographie und Ultraschall wurden durchgeführt und zeigten " +
                "keinen Ursprungstumor",
          ziel: "ergebnis:gkvCup"
        },
        {
          text: "Nein, noch nicht – oder ich weiß es nicht",
          ziel: "ergebnis:vorbefundeCup"
        }
      ]
    }
  };

  /* ------------------------------------------------------------------ *
   * Ergebnisse                                                          *
   *                                                                     *
   * art: "kasse"    – Kostenübernahme durch die GKV zu erwarten          *
   *      "weg"      – Leistung der GKV, aber über einen anderen Weg      *
   *      "schritt"  – erst ein Zwischenschritt, dann neu bewerten        *
   *      "selbst"   – Selbstzahlerleistung                               *
   *      "offen"    – Einzelfall, ohne Beratung nicht zu beantworten     *
   * ------------------------------------------------------------------ */
  var ERGEBNISSE = {
    gkvRezidiv: {
      art: "kasse",
      etikett: "Kassenleistung",
      titel: "Die Krankenkasse übernimmt die Untersuchung",
      kernsatz: "Der Rezidivausschluss nach brusterhaltender Therapie ist eine der " +
                "beiden Indikationen, für die der EBM die MRT der Brust ausdrücklich " +
                "als Leistung der gesetzlichen Krankenversicherung vorsieht.",
      absaetze: [
        "Voraussetzung ist zusätzlich, dass die Praxis eine Abrechnungsgenehmigung " +
        "für die MRT der Mamma besitzt. Diese liegt uns vor."
      ],
      bloecke: [
        {
          titel: "Was Sie zum Termin mitbringen",
          punkte: [
            "Eine Überweisung, auf der die Indikation „Rezidivausschluss nach " +
            "brusterhaltender Therapie“ ausdrücklich vermerkt ist. Ohne diesen " +
            "Vermerk kann die Leistung nicht über die Krankenkasse abgerechnet werden.",
            "Ihre elektronische Gesundheitskarte.",
            "Vorbefunde und Bilder der letzten Mammographie und des Ultraschalls, " +
            "am besten auf CD. Der Vergleich mit den Voraufnahmen ist für die " +
            "Beurteilung entscheidend.",
            "Den Operations- und gegebenenfalls den Bestrahlungsbericht."
          ]
        }
      ],
      quellen: ["ebm34431", "kvGenehmigung"],
      termin: true
    },

    gkvCup: {
      art: "kasse",
      etikett: "Kassenleistung",
      titel: "Die Krankenkasse übernimmt die Untersuchung",
      kernsatz: "Die Suche nach dem Ursprungstumor bei gesicherter Lymphknotenmetastase " +
                "eines Mammakarzinoms ist die zweite Indikation, für die der EBM die " +
                "MRT der Brust als Kassenleistung vorsieht.",
      absaetze: [
        "Voraussetzung ist zusätzlich, dass die Praxis eine Abrechnungsgenehmigung " +
        "für die MRT der Mamma besitzt. Diese liegt uns vor."
      ],
      bloecke: [
        {
          titel: "Was Sie zum Termin mitbringen",
          punkte: [
            "Eine Überweisung mit dem ausdrücklichen Vermerk der Indikation " +
            "„Primärtumorsuche bei axillärer Lymphknotenmetastase“.",
            "Ihre elektronische Gesundheitskarte.",
            "Den feingeweblichen Befund der Lymphknotenmetastase.",
            "Die Bilder und Befunde von Mammographie und Ultraschall, am besten auf CD."
          ]
        }
      ],
      quellen: ["ebm34431", "kvGenehmigung"],
      termin: true
    },

    rezidivFrist: {
      art: "schritt",
      etikett: "Zeitpunkt noch zu früh",
      titel: "Für die Kassenleistung ist es noch zu früh",
      kernsatz: "Der EBM sieht die MRT zum Rezidivausschluss frühestens 6 Monate nach " +
                "der Operation und frühestens 12 Monate nach Abschluss der Bestrahlung vor.",
      absaetze: [
        "Das ist keine Formalie. In den Monaten nach Operation und Bestrahlung reichert " +
        "heilendes Gewebe Kontrastmittel an und sieht im MRT einem Tumor sehr ähnlich. " +
        "Eine zu frühe Untersuchung führt deshalb häufig zu Befunden, die sich am Ende " +
        "als harmlos herausstellen – nach Wochen der Ungewissheit und oft nach einer " +
        "zusätzlichen Gewebeentnahme.",
        "Bei einem dringenden Verdacht ist die MRT davon unberührt medizinisch möglich. " +
        "Sie ist dann aber keine Leistung der gesetzlichen Krankenversicherung, sondern " +
        "eine Selbstzahlerleistung. Diese Entscheidung sollten Sie gemeinsam mit Ihrer " +
        "behandelnden Ärztin oder Ihrem behandelnden Arzt treffen."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Sprechen Sie mit der Praxis, die Sie nachsorgt: Mammographie und Ultraschall " +
            "klären viele Verdachtsfälle auch in dieser Phase.",
            "Ist die Frist abgelaufen, wird die MRT bei fortbestehendem Verdacht zur " +
            "Kassenleistung. Rufen Sie uns dann gerne an.",
            "Bei dringendem Verdacht: Rücksprache mit uns, wir besprechen Nutzen und " +
            "Grenzen einer früheren Untersuchung offen mit Ihnen."
          ]
        }
      ],
      quellen: ["ebm34431"],
      termin: false
    },

    vorbefundeRezidiv: {
      art: "schritt",
      etikett: "Ein Schritt fehlt noch",
      titel: "Zuerst Mammographie und Ultraschall",
      kernsatz: "Die MRT ist zum Rezidivausschluss erst dann Kassenleistung, wenn " +
                "Mammographie und Ultraschall den Verdacht nicht klären konnten.",
      absaetze: [
        "Das ist medizinisch sinnvoll: Ein Teil der Rezidivverdachtsfälle klärt sich " +
        "mit diesen beiden Untersuchungen abschließend. Wo sie nicht weiterhelfen, ist " +
        "die MRT das richtige nächste Mittel – und dann auch Kassenleistung."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Lassen Sie Mammographie und Ultraschall durchführen, falls das nicht " +
            "bereits geschehen ist.",
            "Bleibt der Verdacht danach bestehen, ist die MRT eine Kassenleistung. " +
            "Lassen Sie sich dann eine Überweisung mit dem Vermerk „Rezidivausschluss“ ausstellen.",
            "Sind die Untersuchungen bereits gelaufen und Sie wissen es nur nicht sicher: " +
            "Ein Anruf in der behandelnden Praxis klärt das in wenigen Minuten."
          ]
        }
      ],
      quellen: ["ebm34431"],
      termin: false
    },

    vorbefundeCup: {
      art: "schritt",
      etikett: "Ein Schritt fehlt noch",
      titel: "Zuerst Mammographie und Ultraschall",
      kernsatz: "Die MRT zur Suche nach dem Ursprungstumor ist erst dann Kassenleistung, " +
                "wenn der Tumor weder tastbar noch in Mammographie und Ultraschall " +
                "darstellbar war.",
      absaetze: [
        "In dieser Situation ist die Abklärung in aller Regel bereits in Gang und wird " +
        "von einem Brustzentrum oder einer onkologischen Praxis gesteuert. Dort ist auch " +
        "bekannt, welche Untersuchungen schon gelaufen sind."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Fragen Sie in der behandelnden Praxis nach, ob Mammographie und Ultraschall " +
            "bereits erfolgt sind.",
            "Sind sie erfolgt und ohne Ergebnis geblieben, ist die MRT eine Kassenleistung. " +
            "Nötig ist eine Überweisung mit dem Vermerk der Indikation.",
            "Rufen Sie uns an, wenn Sie den Ablauf gemeinsam durchgehen möchten."
          ]
        }
      ],
      quellen: ["ebm34431"],
      termin: false
    },

    zentrumGen: {
      art: "weg",
      etikett: "Kassenleistung über ein spezialisiertes Zentrum",
      titel: "Ihre Früherkennung zahlt die Kasse – aber über einen anderen Weg",
      kernsatz: "Bei nachgewiesener Genveränderung oder hohem berechnetem Risiko " +
                "gehört die jährliche MRT der Brust zum intensivierten " +
                "Früherkennungsprogramm. Abgerechnet wird sie nicht über den EBM, " +
                "sondern über Verträge der Krankenkassen mit den Zentren des " +
                "Deutschen Konsortiums Familiärer Brust- und Eierstockkrebs.",
      absaetze: [
        "Praktisch heißt das: Die Untersuchung ist für Sie eine Kassenleistung, sie " +
        "läuft aber über die Anbindung an ein solches Zentrum. Dort werden Intervalle, " +
        "Altersgrenzen und die Kombination aus MRT, Mammographie und Ultraschall " +
        "individuell festgelegt – abhängig von Ihrem Risiko, Ihrem Alter und der " +
        "Gewebedichte.",
        "Ohne diese Anbindung können wir die MRT hier nur als Selbstzahlerleistung " +
        "durchführen. Das wäre der schlechtere Weg für Sie: Sie zahlten dann für eine " +
        "Leistung, auf die Sie vermutlich Anspruch haben."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Falls noch nicht geschehen: Lassen Sie sich an ein Zentrum des Deutschen " +
            "Konsortiums überweisen. In Hamburg besteht ein solches Zentrum am " +
            "Universitätsklinikum Eppendorf.",
            "Sind Sie bereits an ein Zentrum angebunden, klären Sie dort, wo die " +
            "MRT durchgeführt werden soll.",
            "Wir beraten Sie gerne, auch wenn die Untersuchung am Ende woanders stattfindet."
          ]
        }
      ],
      quellen: ["konsortium", "s3"],
      termin: false
    },

    zentrumFamilie: {
      art: "weg",
      etikett: "Erst Risikoberechnung, dann Entscheidung",
      titel: "Lassen Sie Ihr Risiko berechnen, bevor Sie selbst zahlen",
      kernsatz: "Familiäre Belastung allein macht die MRT nicht zur Kassenleistung. " +
                "Ob Sie Anspruch auf die intensivierte Früherkennung haben, hängt von " +
                "einer Risikoberechnung ab – und die ist selbst eine Kassenleistung.",
      absaetze: [
        "An den Zentren des Deutschen Konsortiums wird anhand Ihres Stammbaums " +
        "berechnet, wie hoch Ihr Risiko tatsächlich ist. Fällt die Berechnung " +
        "entsprechend aus, werden genetische Beratung, gegebenenfalls eine Genanalyse " +
        "und die jährliche MRT von der Krankenkasse übernommen.",
        "Deshalb unser Rat: Klären Sie das zuerst. Es wäre ungünstig, jetzt eine " +
        "Untersuchung selbst zu bezahlen, auf die Sie nach der Beratung Anspruch hätten."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Sprechen Sie Ihre frauenärztliche oder hausärztliche Praxis auf eine " +
            "Überweisung zur genetischen Beratung an.",
            "Bringen Sie mit, wer in der Familie wann an Brust- oder Eierstockkrebs " +
            "erkrankt ist – Verwandtschaftsgrad und Alter bei Erkrankung sind die " +
            "entscheidenden Angaben.",
            "Bis dahin bleibt die MRT bei uns eine Selbstzahlerleistung. Wir führen sie " +
            "durch, wenn Sie das nach der Beratung noch möchten."
          ]
        }
      ],
      quellen: ["konsortium", "s3"],
      termin: false
    },

    abklaerung: {
      art: "selbst",
      etikett: "Selbstzahlerleistung",
      titel: "Zur Abklärung eines unklaren Befundes zahlt die Kasse die MRT nicht",
      kernsatz: "Das überrascht viele. Der EBM nennt für die MRT der Brust " +
                "abschließend zwei Indikationen – der unklare Befund nach Mammographie " +
                "oder Ultraschall gehört nicht dazu. Auch bei klarer medizinischer " +
                "Begründung ist sie in der ambulanten Versorgung keine Kassenleistung.",
      absaetze: [
        "Wichtiger als die Kostenfrage ist hier aber etwas anderes: Bei einem " +
        "abklärungsbedürftigen Befund ist die MRT meist gar nicht der richtige nächste " +
        "Schritt. Der Standardweg ist die gezielte Gewebeentnahme unter Ultraschall- " +
        "oder Mammographiekontrolle. Sie ist schnell, ambulant, wird von der Kasse " +
        "bezahlt und liefert die sichere Antwort, die eine MRT gerade nicht geben kann: " +
        "Die MRT kann einen Befund nicht als gutartig beweisen.",
        "Eine MRT an dieser Stelle verschiebt die Klärung häufig nur und findet dabei " +
        "zusätzliche Auffälligkeiten, die ihrerseits abgeklärt werden müssen. Deshalb " +
        "raten wir in dieser Situation zunächst zum Gespräch mit der Praxis, die den " +
        "Befund erhoben hat."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Besprechen Sie mit der befundenden Praxis, ob eine Gewebeentnahme der " +
            "klarere Weg ist. In den allermeisten Fällen ist sie es.",
            "Bei BI-RADS 0 fehlen schlicht noch Aufnahmen: Oft klären Zusatzaufnahmen " +
            "oder ein ergänzender Ultraschall den Befund vollständig – beides Kassenleistung.",
            "Wenn Sie sich nach diesem Gespräch für die MRT entscheiden, führen wir sie " +
            "als Selbstzahlerleistung durch und besprechen vorher Nutzen und Grenzen mit Ihnen."
          ]
        }
      ],
      preis: true,
      quellen: ["ebm34431", "s3"],
      termin: true
    },

    staging: {
      art: "weg",
      etikett: "Läuft über das Brustzentrum",
      titel: "Die Operationsplanung läuft über Ihr Brustzentrum",
      kernsatz: "Bei gesichertem Brustkrebs ist die MRT zur Ausbreitungsdiagnostik in " +
                "der ambulanten Versorgung keine Leistung der gesetzlichen " +
                "Krankenversicherung – der EBM sieht sie dafür nicht vor.",
      absaetze: [
        "Das bedeutet nicht, dass Sie sie selbst bezahlen müssen. Wenn die MRT zur " +
        "Operationsplanung nötig ist, veranlasst sie das behandelnde Brustzentrum im " +
        "Rahmen Ihrer Behandlung. Dort wird sie über andere Wege vergütet als über die " +
        "ambulante Abrechnung einer radiologischen Praxis.",
        "Ob sie in Ihrem Fall nötig ist, entscheidet das Zentrum: Die Leitlinie empfiehlt " +
        "sie nicht pauschal, sondern für bestimmte Konstellationen – etwa bei lobulären " +
        "Karzinomen oder wenn die bisherige Bildgebung die Ausdehnung nicht sicher zeigt."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Sprechen Sie das Thema in Ihrem Brustzentrum an. Dort liegen alle Befunde " +
            "vor, und dort wird die Operation geplant.",
            "Warten Sie mit einer selbst bezahlten Untersuchung, bis dieses Gespräch " +
            "stattgefunden hat.",
            "Wird die MRT veranlasst, führen wir sie gerne durch – nach Absprache mit " +
            "dem Zentrum."
          ]
        }
      ],
      quellen: ["ebm34431", "s3"],
      termin: false
    },

    implantat: {
      art: "selbst",
      etikett: "Selbstzahlerleistung",
      titel: "Die Implantatkontrolle ist eine Selbstzahlerleistung",
      kernsatz: "Der EBM sieht die MRT der Brust für die Beurteilung von " +
                "Brustimplantaten nicht vor. Sie ist damit in der ambulanten " +
                "Versorgung keine Kassenleistung.",
      absaetze: [
        "Fachlich ist die MRT hier das genaueste Verfahren: Sie zeigt Risse der " +
        "Implantathülle zuverlässiger als Ultraschall und Mammographie und kommt ohne " +
        "Röntgenstrahlen aus.",
        "Bevor Sie selbst zahlen, lohnt allerdings ein Anruf: Wurde das Implantat nach " +
        "einer Krebsbehandlung eingesetzt oder liegen Beschwerden vor, kommt " +
        "gelegentlich eine Kostenübernahme im Einzelfall in Betracht. Liegt ein " +
        "Produktfehler nahe, ist außerdem die Klinik zuständig, die das Implantat " +
        "eingesetzt hat."
      ],
      bloecke: [
        {
          titel: "Was jetzt sinnvoll ist",
          punkte: [
            "Fragen Sie bei Ihrer Krankenkasse nach einer Kostenübernahme im Einzelfall, " +
            "insbesondere bei Beschwerden oder nach einer Brustkrebsbehandlung.",
            "Legen Sie dem Antrag eine ärztliche Begründung bei. Ohne sie wird er " +
            "regelmäßig abgelehnt.",
            "Bringen Sie den Implantatpass zum Termin mit."
          ]
        }
      ],
      preis: true,
      quellen: ["ebm34431"],
      termin: true
    },

    frueherkennung: {
      art: "selbst",
      etikett: "Selbstzahlerleistung",
      titel: "Zur Früherkennung ohne erhöhtes Risiko ist die MRT eine Selbstzahlerleistung",
      kernsatz: "Die gesetzliche Krankenversicherung übernimmt die MRT der Brust nicht " +
                "zur Früherkennung. Dafür ist das Mammographie-Screening vorgesehen: " +
                "alle zwei Jahre für Frauen von 50 bis 75 Jahren.",
      absaetze: [
        "Wir möchten Ihnen die Studienlage offen sagen, weil sie für Ihre Entscheidung " +
        "wichtiger ist als der Preis. Der IGeL-Monitor des Medizinischen Dienstes hat die " +
        "MRT zur Früherkennung im Juni 2025 mit „unklar“ bewertet. Es gibt bis heute " +
        "keine Studie, die zeigt, ob die MRT bei Frauen ohne erhöhtes Risiko " +
        "Brustkrebs-Todesfälle verhindert.",
        "Belegt ist dagegen, dass die MRT sehr empfindlich ist und mehr Veränderungen " +
        "findet als Mammographie und Ultraschall. Ein Teil dieser Funde ist harmlos, " +
        "führt aber zu weiteren Untersuchungen, zu Gewebeentnahmen und zu Wochen der " +
        "Ungewissheit. Dieser Nachteil ist sicher, der Nutzen ist es nicht.",
        "Das ist kein Abraten. Es gibt gute persönliche Gründe für diese Untersuchung, " +
        "und wir führen sie durch. Aber wir möchten, dass Sie sie in Kenntnis dieser " +
        "Lage wählen."
      ],
      bloecke: [
        {
          titel: "Bevor Sie sich entscheiden",
          punkte: [
            "Nehmen Sie am Mammographie-Screening teil, wenn Sie zwischen 50 und 75 " +
            "Jahre alt sind. Für dieses Programm ist der Nutzen belegt, und es kostet " +
            "Sie nichts.",
            "Prüfen Sie, ob eine familiäre Belastung vorliegt. Dann führt der Weg über " +
            "eine genetische Beratung – und die Früherkennung wird zur Kassenleistung.",
            "Sehr dichtes Brustgewebe ist ein Grund, das Thema ärztlich zu besprechen, " +
            "aber kein Grund für eine schnelle Entscheidung."
          ]
        }
      ],
      preis: true,
      quellen: ["igelMonitor", "gbaScreening", "ebm34431"],
      termin: true
    },

    beratung: {
      art: "offen",
      etikett: "Das lässt sich hier nicht beantworten",
      titel: "Sprechen wir kurz darüber",
      kernsatz: "Ihre Situation passt in keine der Fallgruppen, die diese " +
                "Entscheidungshilfe abbildet – oder es fehlt eine Angabe, ohne die die " +
                "Frage nicht zu beantworten ist.",
      absaetze: [
        "Das ist kein schlechtes Zeichen. Diese Seite bildet bewusst nur die klaren " +
        "Fälle ab und rät lieber zum Gespräch, als eine Zusage zu machen, die am Ende " +
        "nicht hält.",
        "Ein kurzer Anruf klärt das meist in wenigen Minuten. Hilfreich ist, wenn Sie " +
        "Ihre Vorbefunde zur Hand haben."
      ],
      bloecke: [
        {
          titel: "Was uns hilft",
          punkte: [
            "Welche Untersuchungen der Brust bereits gelaufen sind und wann.",
            "Ob eine Brustkrebserkrankung vorliegt oder vorlag, und wie sie behandelt wurde.",
            "Ob es in der Familie Brust- oder Eierstockkrebs gibt.",
            "Ob Ihnen eine Ärztin oder ein Arzt die MRT empfohlen hat – und mit welcher Begründung."
          ]
        }
      ],
      quellen: [],
      termin: true
    },

    pkv: {
      art: "offen",
      etikett: "Private Krankenversicherung",
      titel: "Die Erstattung richtet sich nach Ihrem Tarif",
      kernsatz: "Private Versicherungen erstatten Aufwendungen für medizinisch " +
                "notwendige Heilbehandlung. Eine pauschale Zusage für die MRT der Brust " +
                "gibt es nicht – entscheidend sind die medizinische Begründung und Ihr " +
                "Tarif.",
      absaetze: [
        "In der Praxis heißt das: Liegt eine ärztliche Indikation vor – Rezidivverdacht, " +
        "Suche nach einem Ursprungstumor, Abklärung eines Befundes, erhöhtes familiäres " +
        "Risiko –, wird die MRT in aller Regel erstattet.",
        "Anders sieht es bei reiner Früherkennung ohne Beschwerden und ohne erhöhtes " +
        "Risiko aus. Hier lehnen Versicherungen die Erstattung häufiger ab, weil die " +
        "medizinische Notwendigkeit strittig ist. Das gilt ebenso für die Beihilfe.",
        "Unabhängig davon: Ihr Vertrag kann einen Selbstbehalt vorsehen, und eine " +
        "eingereichte Rechnung kann sich auf eine Beitragsrückerstattung auswirken. " +
        "Beides wissen nur Sie und Ihre Versicherung."
      ],
      bloecke: [
        {
          titel: "So gehen Sie sicher",
          punkte: [
            "Holen Sie vor dem Termin eine schriftliche Kostenzusage ein. Das ist der " +
            "einzige Weg zu Sicherheit – besonders bei Früherkennung ohne Beschwerden.",
            "Wir stellen Ihnen dafür gerne einen Kostenvoranschlag aus. Rufen Sie uns an " +
            "oder schreiben Sie uns.",
            "Beihilfeberechtigte reichen den Kostenvoranschlag zusätzlich bei der " +
            "Beihilfestelle ein; beide Stellen entscheiden getrennt.",
            "Die Abrechnung erfolgt nach der Gebührenordnung für Ärzte. Sie erhalten die " +
            "Rechnung von uns und reichen sie selbst ein."
          ]
        }
      ],
      quellen: ["vvg192"],
      termin: true
    },

    selbstzahler: {
      art: "selbst",
      etikett: "Selbstzahlerleistung",
      titel: "Wir führen die Untersuchung als Selbstzahlerleistung durch",
      kernsatz: "Sie erhalten vorab einen schriftlichen Kostenvoranschlag und nach der " +
                "Untersuchung eine Rechnung nach der Gebührenordnung für Ärzte.",
      absaetze: [
        "Bevor wir einen Termin vereinbaren, klären wir mit Ihnen, ob die MRT in Ihrer " +
        "Situation überhaupt das richtige Verfahren ist. Es kommt vor, dass Mammographie " +
        "und Ultraschall die Frage besser und günstiger beantworten."
      ],
      bloecke: [
        {
          titel: "Ablauf",
          punkte: [
            "Vorgespräch und schriftlicher Kostenvoranschlag.",
            "Schriftliche Vereinbarung vor der Untersuchung – das ist bei Leistungen " +
            "außerhalb des Kassenkatalogs vorgeschrieben und schützt beide Seiten.",
            "Untersuchung, Dauer etwa 30 Minuten, mit Kontrastmittel über eine Vene.",
            "Befundbesprechung und Rechnung nach GOÄ."
          ]
        }
      ],
      preis: true,
      quellen: ["bmvae"],
      termin: true
    }
  };

  return {
    praxis: PRAXIS,
    preis: PREIS,
    quellen: QUELLEN,
    fragen: FRAGEN,
    ergebnisse: ERGEBNISSE,
    start: "versicherung",
    stand: "22. September 2026"
  };
})();
