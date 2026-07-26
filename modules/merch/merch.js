(function () {
  "use strict";

  const PRODUCTS = [
    {
      id: "performance-hoodie",
      name: "Wursti Performance Hoodie",
      category: "Kleidung",
      icon: "🧥",
      image: "merch-assets/wrc-performance-hoodie.webp",
      price: "79,90 €",
      status: "Ausverkauft in Rekordzeit",
      tone: "hot",
      short: "Aerodynamisch beim Gang zum Kühlschrank.",
      intro: "Körper. Kopf. WRC. Mehr braucht ein Hoodie nicht zu erklären.",
      description: "Der tiefschwarze Performance Hoodie verbindet einen klaren WRC-Team-Look mit der Gelassenheit eines Kleidungsstücks, das Training, Spielabend und Sofa gleichermaßen ernst nimmt. Vorn bewusst reduziert, hinten mit dem dezenten Leitsatz „Körper. Kopf. WRC.“ – für alle, die Zusammenhalt lieber tragen als ausformulieren.",
      details: ["Schwerer, weicher Premium-Look", "Große Kapuze und klassische Kängurutasche", "WRC-Team-Print auf Vorder- und Rückseite"],
      tip: "Eine Nummer größer wählen, wenn nach dem Training noch Platz für Pizza bleiben soll.",
      notice: "Leistungssteigerung nicht messbar. Das entschlossene Auftreten ist jedoch sofort sichtbar.",
      comment: ["Wursti", "Ich trage Größe athletisch. Die Tabelle nennt es XL."],
      reviews: [["Thorsten", "Leider ausverkauft. Trotzdem fünf Sterne."], ["Basti", "Sieht beim Sport gut aus. Auf dem Sofa sogar noch besser."], ["Bertha", "Schwarz, schlicht und erstaunlich frei von Wurstflecken."]]
    },
    {
      id: "bertha-plush",
      name: "Bertha Bohne Plüschtier",
      category: "Lifestyle",
      icon: "🫘",
      image: "merch-assets/bertha-bohne-plueschtier.webp",
      price: "34,90 €",
      status: "Nur noch 0 verfügbar",
      tone: "rare",
      short: "Weich, klug und überraschend schlagfertig.",
      intro: "Die weichste Stimme der Vernunft in der gesamten WRC-Kollektion.",
      description: "Bertha Bohne kommt als hochwertiges Plüschtier mit freundlichem Blick, ausgesticktem WRC-Team-Logo und offizieller Namenskarte. Auf der Rückseite trägt sie ihre Haltung gut lesbar: „Keine Ausreden, nur Ergebnisse.“ Sie sagt nichts – schafft es aber trotzdem, einen Raum bemerkenswert effizient zu organisieren.",
      details: ["Weicher Plüsch mit gestickten Details", "Original Bertha-Bohne-Namensanhänger", "Motivationssatz auf der Rückseite"],
      tip: "Strategisch auf dem Sofa platzieren. Von dort aus behält Bertha Training und Snacks gleichzeitig im Blick.",
      notice: "Nicht als Hülsenfrucht verzehren. Auch längere Diskussionen über Ausreden verlaufen erfahrungsgemäß einseitig.",
      comment: ["Wursti", "Bertha wollte mir keine zweite verkaufen."],
      reviews: [["Wursti", "Bertha wollte mir keine zweite verkaufen."], ["Fabi", "Sitzt jetzt im Regal und wirkt kompetenter als wir alle."], ["Thorsten", "Sehr weich. Der Blick bleibt trotzdem streng."], ["Marian", "Hat beim Spielabend nichts gesagt und lag damit meistens richtig."]]
    },
    {
      id: "trinkflasche",
      name: "WRC Trinkflasche",
      category: "Lifestyle",
      icon: "🥤",
      image: "merch-assets/wrc-trinkflasche.webp",
      price: "24,90 €",
      status: "Fast lieferbar",
      tone: "fresh",
      short: "Für Wasser, Motivation und andere klare Flüssigkeiten.",
      intro: "Hydriert im Körper. Stark im Kopf. Sichtbar im WRC-Team.",
      description: "Die dunkelblaue WRC Trinkflasche verbindet einen robusten Sportverschluss mit gut lesbarer Füllskala und dem wichtigsten Vier-Schritte-Plan des Tages: trainieren, punkten, feiern, wiederholen. Wursti und Bertha übernehmen die optische Qualitätskontrolle auf der Vorderseite.",
      details: ["750 ml Fassungsvermögen mit Skala", "Klappbarer Sportverschluss und Tragegriff", "Mattes WRC-Team-Design in Dunkelblau und Orange"],
      tip: "Vor dem Training bis 750 ml füllen. Motivationsreden müssen nicht mit eingefüllt werden.",
      notice: "Geeignet für Wasser und übliche Sportgetränke. Flüssige Ausreden können den Verschluss verkleben.",
      comment: ["Bertha", "Regelmäßig trinken. Nein, Kaffee zählt hier nicht automatisch als Wasser."],
      reviews: [["Marian", "Hält Wasser. Produktversprechen vollständig erfüllt."], ["Fabi", "Die Skala zeigt zuverlässig, wie viel ich noch ignoriert habe."], ["Basti", "Dicht, stabil und deutlich sportlicher als meine alte Flasche."]]
    },
    {
      id: "anti-ausreden-spray",
      name: "Anti-Ausreden-Spray",
      category: "Lifestyle",
      icon: "🧴",
      image: "merch-assets/anti-ausreden-spray.webp",
      price: "12,99 €",
      status: "Wirkung unbestätigt",
      tone: "warning",
      short: "Ein Sprühstoß. Keine wissenschaftliche Grundlage.",
      intro: "Schütteln. Sprühen. Durchziehen. Zumindest steht es so auf der Dose.",
      description: "Das Anti-Ausreden-Spray wurde für akute Fälle von „morgen ganz bestimmt“ entwickelt. Die mattschwarze Dose mit orangefarbenen Details verspricht Sofortwirkung, Motivationsboost und Ausreden-Schutz – wissenschaftlich belegt ist davon vor allem die Existenz des Sprühkopfs. Wursti empfiehlt: mehr machen, weniger labern.",
      details: ["Präziser Sprühkopf mit sichtbarem Sprühnebel", "Duftnote: frischer Entschluss", "Für Training, Alltag und besonders kreative Begründungen"],
      tip: "Einmal in die Luft sprühen, kurz bedeutungsvoll nicken und dann tatsächlich anfangen.",
      notice: "Nicht auf Personen, Tiere oder besonders empfindliche Ausreden richten. Wirkung kann durch Eigeninitiative verstärkt werden.",
      comment: ["Bertha", "Der Sprühkopf funktioniert. Mehr habe ich nie behauptet."],
      reviews: [["Basti", "Meine Ausreden waren danach genauso schlecht wie vorher."], ["Fabi", "Riecht nach Tatendrang. Könnte aber auch Orange sein."], ["Thorsten", "Dose leer. Aufgabe trotzdem noch da. Fünf Sterne für Ehrlichkeit."]]
    },
    {
      id: "duftbaum",
      name: "WRC Duftbaum",
      category: "Lifestyle",
      icon: "🌲",
      image: "merch-assets/wrc-duftbaum.webp",
      price: "4,99 €",
      status: "Pizza-Aroma · Limited",
      tone: "rare",
      short: "Der Duft eines sehr speziellen Zieleinlaufs.",
      intro: "Frischer Ehrgeiz, ein Hauch Motivation und diskrete Spuren von Pizza.",
      description: "Der schwarze WRC Duftbaum bringt „Schweiß & Erfolg“ stilvoll an den Rückspiegel. Wursti wacht auf der Vorderseite über die Fahrerkabine, während die Rückseite ein bemerkenswert optimistisches Duftversprechen abgibt. Das Ergebnis ist weniger Waldspaziergang und mehr Zieleinlauf mit geöffnetem Pizzakarton.",
      details: ["Klassische Duftbaumform im WRC-Design", "Goldene Aufhängeschnur", "Duftedition „Schweiß & Erfolg“"],
      tip: "Mit Abstand zum Rückspiegel öffnen. Der Ehrgeiz entfaltet sich schrittweise.",
      notice: "Kann Hunger, Trainingspläne oder spontane Fahrten zur Pizzeria auslösen.",
      comment: ["Wursti", "Endlich riecht Erfolg so, wie ich ihn mir vorgestellt habe."],
      reviews: [["Thorsten", "Das Auto riecht jetzt schneller."], ["Marian", "Die Pizza-Note ist da. Der Wald eher in beratender Funktion."], ["Bertha", "Ich habe das Fenster nur vorsorglich geöffnet."]]
    },
    {
      id: "ich-haette-gewonnen-pokal",
      name: "„Ich hätte gewonnen“-Pokal",
      category: "Sammlerstücke",
      icon: "🏆",
      image: "merch-assets/ich-haette-gewonnen-pokal.webp",
      price: "29,90 €",
      status: "Bestseller ohne Bestand",
      tone: "gold",
      short: "Für Siege, die nur an den Umständen scheiterten.",
      intro: "Die offizielle Trophäe für epische Fast-Gewinner.",
      description: "Dieser goldfarbene WRC-Pokal würdigt Leistungen, deren tatsächlicher Sieg nur an Regeln, Mitspielern, Wind, Material oder der Ergebnisliste gescheitert ist. Die klare Gravur „Ich hätte gewonnen.“ steht auf einem standfesten schwarzen Sockel und verleiht jeder nachträglichen Spielanalyse sofort feierliche Autorität.",
      details: ["Goldfarbene WRC-Team-Trophäe", "Schwarzer Sockel mit Editionsplakette", "Rückseite mit Wursti, Bertha und passender Lebensweisheit"],
      tip: "Gut sichtbar aufstellen, bevor jemand nach dem Endstand fragt.",
      notice: "Begründungen, Beweise und nachträgliche Regeländerungen sind nicht im Lieferumfang enthalten.",
      comment: ["Wursti", "Ich brauche den nicht. Ich hätte sowieso gewonnen."],
      reviews: [["Fabi", "Endlich ein Titel, der zu meiner Argumentation passt."], ["Basti", "Der Pokal glänzt stärker als meine Beweisführung."], ["Thorsten", "Seitdem deutlich weniger gewonnen, aber wesentlich überzeugender erklärt."]]
    },
    {
      id: "power-socken",
      name: "WRC Power-Socken",
      category: "Kleidung",
      icon: "🧦",
      image: "merch-assets/wrc-power-socken.webp",
      price: "16,90 €",
      status: "Leistungssteigerung möglich",
      tone: "fresh",
      short: "Links schnell. Rechts ebenfalls ziemlich überzeugt.",
      intro: "Links gewinnt. Rechts diskutiert. Gemeinsam kommen beide ans Ziel.",
      description: "Die weißen WRC Power-Socken verbinden klassischen Sportsocken-Look mit orange-blauen Teamstreifen und einer klaren Rollenverteilung. Wursti übernimmt links den Siegeswillen, Bertha rechts die sachliche Nachbesprechung. Geliefert werden sie in einer hochwertigen WRC-Team-Box – damit bereits das Anziehen nach Vorbereitung aussieht.",
      details: ["Gerippter Sportsocken-Schnitt", "WRC-Team-Logo und Maskottchen-Stick", "Markierte linke und rechte Erfolgsstrategie"],
      tip: "Nicht vertauschen. Sonst diskutiert links und rechts gewinnt – dafür gibt es noch keine Taktik.",
      notice: "Das Paar ist atmungsaktiv. Diskussionen zwischen beiden Seiten lassen sich dennoch nicht vollständig ausschließen.",
      comment: ["Bertha", "Ich diskutiere nicht. Ich ergänze fehlende Fakten."],
      reviews: [["Basti", "Bin damit exakt gleich schnell. Sehe aber besser aus."], ["Marian", "Links und rechts erstmals ohne längere Verhandlung gefunden."], ["Wursti", "Meine Socke gewinnt. Damit ist eigentlich alles gesagt."]]
    },
    {
      id: "pizza-kochbuch",
      name: "Wursti Di Pizza Kochbuch",
      category: "Essen & Trinken",
      icon: "🍕",
      image: "merch-assets/wursti-di-pizza-kochbuch.webp",
      price: "27,50 €",
      status: "Vorbestellung geschlossen",
      tone: "hot",
      short: "42 Rezepte. Eins davon ist überraschend keine Pizza.",
      intro: "Mehr als Essen. Eine Einstellung – großzügig mit Käse ausgelegt.",
      description: "„Wursti Di Pizza“ ist das inoffizielle Kochbuch für Champions am Herd und auf der Strecke. Der hochwertig gebundene Band führt von Pizza über Pasta und Snacks bis zu Protein und Siegesfeiern. Bebilderte Rezepte, handschriftliche Randnotizen und Berthas gelegentliche Eingriffe sorgen dafür, dass aus guten Ideen wenigstens eine sehr gute Mahlzeit wird.",
      details: ["Hochwertiger Hardcover-Einband", "Kapitel zu Pizza, Pasta, Snacks, Protein und Siegen", "Bebilderte Rezepte mit Wursti-und-Bertha-Kommentaren"],
      tip: "Die Mengenangabe „für vier Personen“ gilt laut Wursti als unverbindliche Empfehlung.",
      notice: "Die Küche nach dem Kochen bitte sauberer verlassen als den letzten Platz der Monatswertung.",
      comment: ["Bertha", "Ich habe die Nährwerttabelle aus Gründen entfernt."],
      reviews: [["Wursti", "Ein wichtiges Buch. Objektiv betrachtet von mir."], ["Fabi", "Rezept befolgt. Käse verdoppelt. Offenbar alles richtig gemacht."], ["Thorsten", "Kapitel Pizza ist erstaunlich umfangreich. Kapitel Salat angenehm kurz."], ["Marian", "Gut gebunden. Noch besser belegt."]]
    },
    {
      id: "mystery-box",
      name: "WRC Mystery Box",
      category: "Sammlerstücke",
      icon: "🎁",
      image: "merch-assets/wrc-mystery-box.webp",
      price: "49,90 €",
      status: "Inhalt selbst uns unbekannt",
      tone: "rare",
      short: "Garantiert eine Box. Beim Rest bleiben wir spannend.",
      intro: "Versiegelt für Champions. Inhalt streng geheim – selbst Bertha weiß nicht alles.",
      description: "Die dunkelblaue WRC Mystery Box kommt mit orangefarbenem Champions-Siegel und einer Verpackung, die deutlich mehr weiß, als sie verrät. Laut Rückseite kann sie Motivation, Bohnen, Pizza, Ausreden oder Überraschungen enthalten. Im Inneren wartet zunächst eine weitere Botschaft: „Überraschung lädt …“ – ein technisch erstaunlich ehrlicher Moment.",
      details: ["Stabile Premium-Box mit Champions-Siegel", "Goldfarbenes Innenfutter", "Überraschung und leichte Verunsicherung inklusive"],
      tip: "Vor dem Öffnen vorsichtig schütteln. Oder gerade deshalb nicht.",
      notice: "Inhalt kann von Produktbild, Erwartung und Realität abweichen. Eine Box ist jedoch nahezu garantiert.",
      comment: ["Bertha", "Wursti hat gepackt. Ich würde die Erwartungen flexibel halten."],
      reviews: [["Marian", "Im Karton war Spannung. Sonst konnte ich nichts erkennen."], ["Basti", "Überraschung garantiert. Verfügbarkeit offenbar ebenfalls geheim."], ["Fabi", "Habe die Box geöffnet und eine kleinere Erwartung gefunden."]]
    },
    {
      id: "energy-drink",
      name: "WRC Energy Drink",
      category: "Essen & Trinken",
      icon: "⚡",
      image: "merch-assets/wrc-energy-drink.webp",
      price: "2,49 €",
      status: "Behördlich fast geprüft",
      tone: "warning",
      short: "Geschmack: Ziellinie mit einem Hauch Bohne.",
      intro: "Extra Motivation in einer Dose, deren Selbstvertrauen bereits vollständig aktiviert ist.",
      description: "Der WRC Energy Drink tritt in dunkelblauem Performance-Design mit orangefarbenen Akzenten und deutlich sichtbarem Champions-Anspruch auf. Er verspricht Power, Fokus und Teamgeist – erhältlich in Sorten wie Original, Citrus Kick und Berry Boost. Die Zutatenliste nennt unter anderem Ehrgeiz, Ausdauer, Disziplin und 100 Prozent Spaßfaktor.",
      details: ["Schlankes 500-ml-Dosendesign", "Drei theoretische Geschmacksrichtungen", "0 % Ausreden, 100 % Ehrgeiz laut Etikett"],
      tip: "Vor Gebrauch Daily öffnen. Danach Dose öffnen. Reihenfolge laut Wursti leistungsentscheidend.",
      notice: "Dieses Produkt ersetzt keine Ausreden – es kann Spuren von Liegestützen enthalten.",
      comment: ["Wursti", "Ich trinke ihn nur wegen des Geschmacks. Und wegen der 100 Prozent Ehrgeiz."],
      reviews: [["Fabi", "Die Dose war sehr energiegeladen."], ["Thorsten", "Nach dem Öffnen sofort wach. Das Geräusch war ziemlich laut."], ["Bertha", "Zutatenliste kreativ. Wasser wäre weiterhin eine solide Idee."]]
    },
    {
      id: "meistertorte",
      name: "Marian's Meistertorte – Mandel-Bienenstich",
      category: "Essen & Trinken",
      icon: "🍰",
      image: "merch-assets/marians-meistertorte.webp",
      price: "39,90 €",
      status: "Nur Selbstabholung bei Marian",
      tone: "gold",
      short: "Die einzige Legende im Shop, die nachweislich existiert.",
      intro: "Für Champions. Von Champions. Und bei WRC-Treffen längst weit mehr als nur Nachtisch.",
      description: "Marian bringt zu gemeinsamen WRC-Abenden so regelmäßig einen Coppenrath & Wiese Mandel-Bienenstich mit, dass aus einem Dessert inzwischen echte Tradition geworden ist. Die Kombination aus lockerem Boden, feiner Sahnecreme und knuspriger Mandelkruste gehört für uns zu einem gelungenen Spielabend wie Punkte, Diskussionen und mindestens eine überraschende Wendung. Ihren legendären Zustand erreicht die Meistertorte nach ungefähr zwei Stunden Auftauzeit. Alternativ greift die bewährte WRC-Regel: Sobald Marian seine unvermeidliche „Nachtischschwere“ erreicht hat, darf angeschnitten werden.",
      details: ["Mandel-Bienenstich mit Sahnecreme und knuspriger Decke", "750 g WRC-Tradition für ungefähr 8 Portionen", "Optimaler Anschnitt nach rund 2 Stunden Auftauzeit"],
      tip: "Rechtzeitig aus dem Tiefkühler nehmen – oder Marian aufmerksam beobachten. Beides führt zuverlässig zum richtigen Anschnittzeitpunkt.",
      notice: "Enthält Mandeln, Bienenhonig und hohe Erwartungen. Die angegebene Portionszahl sinkt bei Wursti-Anwesenheit erfahrungsgemäß.",
      comment: ["Bertha", "Zwei Stunden Auftauzeit sind eine Empfehlung. Marians Nachtischschwere ist ein Naturgesetz."],
      reviews: [["Marian", "Die Torte gibt es wirklich. Und ja, sie kommt wieder mit."], ["Wursti", "Ich prüfe seit Jahren regelmäßig die Qualität. Bislang ohne Beanstandung."], ["Thorsten", "Kein WRC-Abend ist vollständig, bevor jemand fragt, ob sie schon weit genug aufgetaut ist."], ["Fabi", "Zwei Stunden gewartet. Jede Minute war fachlich korrekt."]]
    }
  ];

  const CART_MESSAGES = [
    "Leider ausverkauft.",
    "Bertha hat das letzte Exemplar reserviert.",
    "Wursti testet es noch persönlich.",
    "Kommt direkt nach dem Weltfrieden wieder.",
    "Das Budget wurde vollständig in Pizza investiert.",
    "Im Lager gefunden … leider nur den Karton.",
    "Vielleicht im nächsten Update™.",
    "Gute Wahl. Schlechte Verfügbarkeit.",
    "Unsere Qualitätskontrolle diskutiert noch mit Bertha.",
    "Versand in 3–300 Werktagen.",
    "Der Warenkorb ist bereit. Das Produkt leider nicht.",
    "Wursti sagt, es sei unterwegs. Bertha sagt, es sei nie bestellt worden.",
    "Kurz verfügbar gewesen – vermutlich ein technischer Fehler.",
    "Dieser Artikel befindet sich im mentalen Zulauf.",
    "Die Lieferkette macht gerade Dehnübungen.",
    "Aus logistischen Gründen nur in unserer Fantasie erhältlich.",
    "Ein Mitarbeiter sucht noch. Es ist Wursti.",
    "Bestellung fast erfolgreich. Also emotional.",
    "Der Lagerbestand liegt stabil bei null.",
    "Heute bestellt, irgendwann darüber gesprochen.",
    "Wir haben den Artikel für dich vorgemerkt. Sehr weit hinten.",
    "Bertha prüft noch, ob du ihn wirklich brauchst.",
    "Dein Kaufwunsch wurde feierlich entgegengenommen.",
    "Zahlung abgelehnt – wir akzeptieren ausschließlich WRC-Ruhm."
  ];

  const CATEGORIES = ["Alle", "Kleidung", "Lifestyle", "Essen & Trinken", "Sammlerstücke"];
  let activeCategory = "Alle";
  let lastFocusedElement = null;
  let toastTimer = null;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);

  function productImage(product, detail) {
    if (product.image) {
      return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`;
    }

    return `
      <div class="merch-placeholder ${detail ? "merch-placeholder-detail" : ""}" aria-label="Platzhalter für ${escapeHtml(product.name)}">
        <span class="merch-placeholder-brand">WRC</span>
        <span class="merch-placeholder-icon" aria-hidden="true">${product.icon}</span>
        <span class="merch-placeholder-copy">Produktbild folgt</span>
      </div>
    `;
  }

  function productCard(product) {
    return `
      <article class="merch-product-card" role="button" tabindex="0"
        aria-label="${escapeHtml(product.name)} ansehen"
        onclick="WRCMerch.openProduct('${product.id}', this)"
        onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault(); WRCMerch.openProduct('${product.id}', this);}">
        <div class="merch-product-visual">
          ${productImage(product, false)}
          <span class="merch-status merch-status-${product.tone}">${escapeHtml(product.status)}</span>
        </div>
        <div class="merch-product-body">
          <span class="merch-product-category">${escapeHtml(product.category)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.short)}</p>
          <div class="merch-product-buy">
            <strong>${escapeHtml(product.price)}</strong>
            <button type="button" onclick="event.stopPropagation(); WRCMerch.addToCart('${product.id}')">🛒 In den Warenkorb</button>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const root = document.getElementById("merchRoot");
    if (!root) return;

    const visibleProducts = activeCategory === "Alle"
      ? PRODUCTS
      : PRODUCTS.filter(product => product.category === activeCategory);

    root.innerHTML = `
      <section class="merch-shell" aria-labelledby="merchTitle">
        <header class="merch-hero">
          <div class="merch-hero-copy">
            <span class="merch-eyebrow">Offiziell inoffiziell</span>
            <h1 id="merchTitle">WRC Merchandise</h1>
            <p>Elf bemerkenswerte Produkte. Kein einziges davon kannst du kaufen.</p>
          </div>
          <div class="merch-hero-mark" aria-hidden="true">
            <span>WRC</span>
            <small>SHOP</small>
          </div>
        </header>

        <div class="merch-toolbar">
          <div class="merch-filter" aria-label="Produktkategorien">
            ${CATEGORIES.map(category => `
              <button type="button" class="${category === activeCategory ? "active" : ""}"
                aria-pressed="${category === activeCategory}"
                onclick="WRCMerch.setCategory('${category.replace(/'/g, "\\'")}')">${escapeHtml(category)}</button>
            `).join("")}
          </div>
          <span class="merch-result-count">${visibleProducts.length} ${visibleProducts.length === 1 ? "Produkt" : "Produkte"}</span>
        </div>

        <div class="merch-grid">
          ${visibleProducts.map(productCard).join("")}
        </div>

        <footer class="merch-shop-note">
          <span aria-hidden="true">🫘</span>
          <p><strong>Hinweis der Geschäftsführung:</strong> Dieser Shop verkauft nichts. Beschwerden über Lieferzeiten nimmt Wursti trotzdem gern entgegen.</p>
        </footer>
      </section>
    `;
  }

  function setCategory(category) {
    if (!CATEGORIES.includes(category)) return;
    activeCategory = category;
    render();
  }

  function reviewsMarkup(product) {
    if (!product.reviews || !product.reviews.length) return "";
    return `
      <section class="merch-reviews">
        <div class="merch-section-heading">
          <h3>Kundenstimmen</h3>
          <span>${product.reviews.length} absolut unabhängige ${product.reviews.length === 1 ? "Meinung" : "Meinungen"}</span>
        </div>
        <div class="merch-review-grid">
          ${product.reviews.map(([author, review]) => `
            <blockquote>
              <div class="merch-stars" aria-label="5 von 5 Sternen">★★★★★</div>
              <p>„${escapeHtml(review)}“</p>
              <cite>– ${escapeHtml(author)}</cite>
            </blockquote>
          `).join("")}
        </div>
      </section>
    `;
  }

  function openProduct(productId, trigger) {
    const product = PRODUCTS.find(item => item.id === productId);
    if (!product) return;

    lastFocusedElement = trigger || document.activeElement;
    let modal = document.getElementById("merchModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "merchModal";
      modal.className = "merch-modal";
      modal.addEventListener("click", event => {
        if (event.target === modal) closeProduct();
      });
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="merch-dialog" role="dialog" aria-modal="true" aria-labelledby="merchDialogTitle">
        <button class="merch-modal-close" type="button" aria-label="Produktansicht schließen" onclick="WRCMerch.closeProduct()">×</button>
        <div class="merch-detail-top">
          <div class="merch-detail-visual">${productImage(product, true)}</div>
          <div class="merch-detail-info">
            <span class="merch-product-category">${escapeHtml(product.category)}</span>
            <h2 id="merchDialogTitle">${escapeHtml(product.name)}</h2>
            <div class="merch-detail-status">
              <span class="merch-status merch-status-${product.tone}">${escapeHtml(product.status)}</span>
            </div>
            <p class="merch-detail-intro">${escapeHtml(product.intro)}</p>
            <p class="merch-detail-description">${escapeHtml(product.description)}</p>
            <h3 class="merch-detail-label">Eigenschaften</h3>
            <ul class="merch-detail-list">
              ${product.details.map(detail => `<li><span>✓</span>${escapeHtml(detail)}</li>`).join("")}
            </ul>
            <div class="merch-detail-notes">
              <section class="merch-detail-note merch-detail-tip">
                <span aria-hidden="true">💡</span>
                <div><strong>WRC-Tipp</strong><p>${escapeHtml(product.tip)}</p></div>
              </section>
              <section class="merch-detail-note merch-detail-warning">
                <span aria-hidden="true">ⓘ</span>
                <div><strong>Hinweis</strong><p>${escapeHtml(product.notice)}</p></div>
              </section>
            </div>
            ${product.comment ? `
              <div class="merch-mascot-comment">
                <span aria-hidden="true">${product.comment[0] === "Wursti" ? "🌭" : "🫘"}</span>
                <p>„${escapeHtml(product.comment[1])}“<strong>– ${escapeHtml(product.comment[0])}</strong></p>
              </div>
            ` : ""}
            <div class="merch-detail-buy">
              <div><small>Preis inkl. 0 % Lieferchance</small><strong>${escapeHtml(product.price)}</strong></div>
              <button type="button" onclick="WRCMerch.addToCart('${product.id}')">🛒 In den Warenkorb</button>
            </div>
          </div>
        </div>
        ${reviewsMarkup(product)}
      </div>
    `;

    modal.classList.add("open");
    document.body.classList.add("merch-modal-open");
    requestAnimationFrame(() => modal.querySelector(".merch-modal-close")?.focus());
  }

  function closeProduct() {
    const modal = document.getElementById("merchModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.classList.remove("merch-modal-open");
    window.setTimeout(() => {
      modal.innerHTML = "";
      lastFocusedElement?.focus?.();
    }, 240);
  }

  function addToCart(productId) {
    const product = PRODUCTS.find(item => item.id === productId);
    if (!product) return;

    let toast = document.getElementById("merchToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "merchToast";
      toast.className = "merch-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    const message = CART_MESSAGES[Math.floor(Math.random() * CART_MESSAGES.length)];
    toast.innerHTML = `
      <span class="merch-toast-icon" aria-hidden="true">🛒</span>
      <div><strong>Fast im Warenkorb</strong><p>${escapeHtml(message)}</p></div>
    `;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.getElementById("merchModal")?.classList.contains("open")) {
      closeProduct();
    }
  });

  window.WRCMerch = {
    products: PRODUCTS,
    render,
    setCategory,
    openProduct,
    closeProduct,
    addToCart
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
