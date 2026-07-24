const MASCOT_FAQ_IMAGE = "wurstrand-logo.png";

const MASCOT_FAQ_ITEMS = [
  {
    question: "Wer seid ihr eigentlich?",
    answers: [
      {
        speaker: "Wursti",
        text: "Wir sind die offiziellen Maskottchen der Wurstrand Challenge!"
      },
      {
        speaker: "Bertha",
        text: "Unsere Mission: motivieren, unterhalten und für gute Laune sorgen. Sport darf schließlich Spaß machen!"
      }
    ]
  },
  {
    question: 'Warum heißt Wursti "Di Pizza"?',
    answers: [
      {
        speaker: "Wursti",
        text: "Weil die Wurstrand-Pizza einfach legendär ist. Mehr muss man dazu eigentlich nicht sagen. 🍕"
      },
      {
        speaker: "Bertha",
        text: "Er behauptet übrigens, sie schmeckt mit Extrapunkten besser."
      }
    ]
  },
  {
    question: "Warum heißt Bertha eigentlich Bohne?",
    answers: [
      {
        speaker: "Bertha",
        text: "Ich komme ursprünglich aus einer griechischen Taverne. Dort gibt's die berühmten dicken Bohnen – und seitdem trägt meine Familie den Namen Bohne."
      },
      {
        speaker: "Wursti",
        text: "Sie behauptet außerdem steif und fest, dass alle dicken Bohnen dort ihre Cousinen sind."
      }
    ]
  },
  {
    question: "Seid ihr verwandt?",
    answers: [
      {
        speaker: "Bertha",
        text: "Nein. Wir sind eher wie Vor- und Hauptspeise."
      },
      {
        speaker: "Wursti",
        text: "Zusammen gehören wir einfach auf den Tisch."
      }
    ]
  },
  {
    question: "Wer von euch ist der Chef?",
    answers: [
      {
        speaker: "Wursti",
        text: "Ich bin der Chef."
      },
      {
        speaker: "Bertha",
        text: "...und ich sorge dafür, dass der Laden läuft."
      }
    ]
  },
  {
    question: "Was passiert, wenn jemand Erster wird?",
    answers: [
      {
        speaker: "Wursti",
        text: "Er darf sich einen Monat lang feiern lassen. Danach starten wir alle wieder gemeinsam bei null."
      },
      {
        speaker: "Bertha",
        text: "In der WRC gewinnt einer – aber bewegt haben sich alle."
      }
    ]
  },
  {
    question: "Warum zählt ihr keine Ausreden?",
    answers: [
      {
        speaker: "Wursti",
        text: "Weil jeder mal einen schlechten Tag hat."
      },
      {
        speaker: "Bertha",
        text: "Wir feiern lieber jeden kleinen Schritt, den du geschafft hast, statt über die zu sprechen, die gefehlt haben."
      }
    ]
  },
  {
    question: "Was ist wichtiger – Gewinnen oder Mitmachen?",
    answers: [
      {
        speaker: "Wursti",
        text: "Gewinnen macht Spaß."
      },
      {
        speaker: "Bertha",
        text: "Aber gemeinsam aktiv zu sein, ist der eigentliche Sieg."
      }
    ]
  }
];

function renderMascotFaq() {
  const panel = document.getElementById("mascotsPanel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="card mascot-faq-page">
      <div class="mascot-faq-hero">
        <img
          class="mascot-faq-image"
          src="${MASCOT_FAQ_IMAGE}"
          alt="Wursti Di Pizza und Bertha Bohne"
        >
        <div>
          <div class="badge">Die WRC-Maskottchen</div>
          <h2>Wursti &amp; Bertha</h2>
          <p class="sub">Lerne die beiden Maskottchen der Wurstrand Challenge kennen.</p>
        </div>
      </div>

      <div class="mascot-faq-list">
        ${MASCOT_FAQ_ITEMS.map((item, index) => `
          <article class="mascot-faq-item">
            <button
              type="button"
              class="mascot-faq-question"
              aria-expanded="false"
              aria-controls="mascotFaqAnswer${index}"
            >
              <span>❓ ${item.question}</span>
              <span class="mascot-faq-chevron" aria-hidden="true">⌄</span>
            </button>

            <div
              id="mascotFaqAnswer${index}"
              class="mascot-faq-answer"
            >
              <div class="mascot-faq-answer-inner">
                ${item.answers.map(answer => `
                  <div class="mascot-faq-voice mascot-faq-voice-${answer.speaker.toLowerCase()}">
                    <strong>${answer.speaker}:</strong>
                    <p>${answer.text}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  const questions = Array.from(panel.querySelectorAll(".mascot-faq-question"));

  questions.forEach(question => {
    question.addEventListener("click", () => {
      const item = question.closest(".mascot-faq-item");
      const shouldOpen = !item.classList.contains("open");

      questions.forEach(otherQuestion => {
        otherQuestion.setAttribute("aria-expanded", "false");
        otherQuestion.closest(".mascot-faq-item").classList.remove("open");
      });

      if (shouldOpen) {
        question.setAttribute("aria-expanded", "true");
        item.classList.add("open");
      }
    });
  });
}

renderMascotFaq();
