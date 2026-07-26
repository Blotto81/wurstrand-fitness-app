(function () {
  "use strict";

  const PRODUCTS = [
    {
      id: "performance-hoodie",
      name: "Wursti Performance Hoodie",
      category: "Kleidung",
      icon: "🧥",
      price: "79,90 €",
      status: "Ausverkauft in Rekordzeit",
      tone: "hot",
      short: "Aerodynamisch beim Gang zum Kühlschrank.",
      description: "Der offizielle Hoodie für Training, Sofa und hochprofessionelles Herumstehen am Spielfeldrand. Mit unsichtbarer Pizza-Innentasche – vermutlich.",
      details: ["100 % gefühlte Performance", "Kapuze für taktischen Rückzug", "Waschbar bei vernünftigen Ausreden"],
      comment: ["Wursti", "Ich trage Größe athletisch. Die Tabelle nennt es XL."],
      reviews: [["Thorsten", "Leider ausverkauft. Trotzdem fünf Sterne."]]
    },
    {
      id: "bertha-plush",
      name: "Bertha Bohne Plüschtier",
      category: "Lifestyle",
      icon: "🫘",
      price: "34,90 €",
      status: "Nur noch 0 verfügbar",
      tone: "rare",
      short: "Weich, klug und überraschend schlagfertig.",
      description: "Die einzige Bohne, die auf dem Sofa Platz nimmt und trotzdem den Überblick behält. Schweigt zuverlässig – urteilt aber möglicherweise mit den Augen.",
      details: ["Handliche Bertha-Größe", "Blickt Ausreden direkt ins Gewissen", "Nicht als Hülsenfrucht deklariert"],
      comment: ["Wursti", "Bertha wollte mir keine zweite verkaufen."],
      reviews: [["Wursti", "Bertha wollte mir keine zweite verkaufen."], ["Fabi", "Sitzt jetzt im Regal und wirkt kompetenter als wir alle."]]
    },
    {
      id: "trinkflasche",
      name: "WRC Trinkflasche",
      category: "Lifestyle",
      icon: "🥤",
      price: "24,90 €",
      status: "Fast lieferbar",
      tone: "fresh",
      short: "Für Wasser, Motivation und andere klare Flüssigkeiten.",
      description: "Bleibt dicht – im Gegensatz zu manchen Trainingsplänen. Das große WRC-Logo sorgt dafür, dass niemand versehentlich vernünftige Erwartungen an den Inhalt stellt.",
      details: ["750 ml Fassungsvermögen", "BPA-frei, ausredenarm", "Passt in fast jeden Fahrradhalter"],
      reviews: [["Marian", "Hält Wasser. Produktversprechen vollständig erfüllt."]]
    },
    {
      id: "anti-ausreden-spray",
      name: "Anti-Ausreden-Spray",
      category: "Lifestyle",
      icon: "🧴",
      price: "12,99 €",
      status: "Wirkung unbestätigt",
      tone: "warning",
      short: "Ein Sprühstoß. Keine wissenschaftliche Grundlage.",
      description: "Für akute Fälle von „morgen ganz bestimmt“. Einfach in die Luft sprühen, kurz bedeutungsvoll nicken und trotzdem selbst entscheiden, was als Nächstes passiert.",
      details: ["Duftnote: frischer Entschluss", "Homöopathisch wenig Ausreden", "Laborprüfung durch Bertha abgebrochen"],
      comment: ["Bertha", "Der Sprühkopf funktioniert. Mehr habe ich nie behauptet."],
      reviews: [["Basti", "Meine Ausreden waren danach genauso schlecht wie vorher."]]
    },
    {
      id: "duftbaum",
      name: "WRC Duftbaum",
      category: "Lifestyle",
      icon: "🌲",
      price: "4,99 €",
      status: "Pizza-Aroma · Limited",
      tone: "rare",
      short: "Der Duft eines sehr speziellen Zieleinlaufs.",
      description: "Verleiht jedem Auto die unverwechselbare Atmosphäre einer Pizza, die gerade knapp außerhalb der Reichweite steht. Nicht hungrig öffnen.",
      details: ["Duft: Pizza nach dem Training", "Hält 2–40 Fahrten", "Kann spontane Umwege verursachen"],
      reviews: [["Thorsten", "Das Auto riecht jetzt schneller."]]
    },
    {
      id: "ich-haette-gewonnen-pokal",
      name: "„Ich hätte gewonnen“-Pokal",
      category: "Sammlerstücke",
      icon: "🏆",
      price: "29,90 €",
      status: "Bestseller ohne Bestand",
      tone: "gold",
      short: "Für Siege, die nur an den Umständen scheiterten.",
      description: "Die angemessene Würdigung für alle ungeprüften Konjunktiv-Meisterschaften. Macht sich hervorragend zwischen echten Pokalen – oder ganz allein.",
      details: ["Gravur: Hätte, wäre, wenn", "Sockel aus massivem Selbstvertrauen", "Ergebnislisten nicht enthalten"],
      comment: ["Wursti", "Ich brauche den nicht. Ich hätte sowieso gewonnen."],
      reviews: [["Fabi", "Endlich ein Titel, der zu meiner Argumentation passt."]]
    },
    {
      id: "power-socken",
      name: "WRC Power-Socken",
      category: "Kleidung",
      icon: "🧦",
      price: "16,90 €",
      status: "Leistungssteigerung möglich",
      tone: "fresh",
      short: "Links schnell. Rechts ebenfalls ziemlich überzeugt.",
      description: "Zwei Socken, ein gemeinsames Ziel und keinerlei belastbare Leistungsdaten. Der gerippte Bund hält sogar bei dramatischen Endspurts.",
      details: ["Paarweise geliefert", "Kompressionsgefühl nach Tagesform", "Unsichtbar unter langen Ausreden"],
      reviews: [["Basti", "Bin damit exakt gleich schnell. Sehe aber besser aus."]]
    },
    {
      id: "pizza-kochbuch",
      name: "Wursti Di Pizza Kochbuch",
      category: "Essen & Trinken",
      icon: "🍕",
      price: "27,50 €",
      status: "Vorbestellung geschlossen",
      tone: "hot",
      short: "42 Rezepte. Eins davon ist überraschend keine Pizza.",
      description: "Wurstis kulinarisches Standardwerk zwischen Sporternährung und sehr großzügiger Käseauslegung. Jede Mengenangabe wurde nach Gefühl verdoppelt.",
      details: ["42 streng geheime Rezepte", "Vorwort von Wursti selbst", "Kapitel 7: Salat als Beilage erkennen"],
      comment: ["Bertha", "Ich habe die Nährwerttabelle aus Gründen entfernt."],
      reviews: [["Wursti", "Ein wichtiges Buch. Objektiv betrachtet von mir."]]
    },
    {
      id: "mystery-box",
      name: "WRC Mystery Box",
      category: "Sammlerstücke",
      icon: "🎁",
      price: "49,90 €",
      status: "Inhalt selbst uns unbekannt",
      tone: "rare",
      short: "Garantiert eine Box. Beim Rest bleiben wir spannend.",
      description: "Das exklusivste Nichts, das wir je in einen Karton gepackt haben. Möglich sind Raritäten, Bohnen oder ein zweiter kleinerer Karton.",
      details: ["Professionell verschlossen", "Gewicht variiert mit Erwartung", "Rascheln kein Qualitätsmerkmal"],
      comment: ["Bertha", "Wursti hat gepackt. Ich würde die Erwartungen flexibel halten."],
      reviews: [["Marian", "Im Karton war Spannung. Sonst konnte ich nichts erkennen."]]
    },
    {
      id: "energy-drink",
      name: "WRC Energy Drink",
      category: "Essen & Trinken",
      icon: "⚡",
      price: "2,49 €",
      status: "Behördlich fast geprüft",
      tone: "warning",
      short: "Geschmack: Ziellinie mit einem Hauch Bohne.",
      description: "Die prickelnde Antwort auf eine Frage, die niemand gestellt hat. Macht die Dose beim Öffnen schnell – beim Nutzer liegen noch keine Daten vor.",
      details: ["Geschmacksrichtung: Blitz-Bohne", "Koffeingehalt: lieber hinsetzen", "Pfand nur in WRC-Punkten"],
      reviews: [["Fabi", "Die Dose war sehr energiegeladen."]]
    },
    {
      id: "meistertorte",
      name: "Marian's Meistertorte – Mandel-Bienenstich",
      category: "Essen & Trinken",
      icon: "🍰",
      price: "39,90 €",
      status: "Nur Selbstabholung bei Marian",
      tone: "gold",
      short: "Die einzige Legende im Shop, die nachweislich existiert.",
      description: "Mandel-Bienenstich in bewährter Treffen-Frequenz. Außen meisterlich, innen Torte und meistens schneller verschwunden als jeder Monatsrückstand.",
      details: ["Original nach Marian-Art", "Enthält Mandeln und Gruppendynamik", "Stückzahl endet stets überraschend"],
      comment: ["Wursti", "Ich prüfe seit Jahren regelmäßig die Qualität."],
      reviews: [["Marian", "Die Torte gibt es wirklich."], ["Bertha", "Zum ersten Mal stimmt eine Produktbeschreibung vollständig."]]
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
            <p class="merch-detail-description">${escapeHtml(product.description)}</p>
            <ul class="merch-detail-list">
              ${product.details.map(detail => `<li><span>✓</span>${escapeHtml(detail)}</li>`).join("")}
            </ul>
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
