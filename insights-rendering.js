    function renderFunFacts() {
      const totalSteps =
        HISTORIC_TOTALS.steps +
        allEntries.reduce((sum, e) => sum + (+e.steps || 0), 0);

      const totalBike =
        HISTORIC_TOTALS.bike +
        allEntries.reduce((sum, e) => sum + (+e.bike || 0), 0);

      const totalSquats =
        HISTORIC_TOTALS.squats +
        allEntries.reduce((sum, e) => sum + (+e.squats || 0), 0);

      const totalPushups =
        HISTORIC_TOTALS.pushups +
        allEntries.reduce((sum, e) => sum + (+e.pushups || 0), 0);

      const meters = totalSteps * 0.75;
      const km = meters / 1000;
      const stadion = Math.floor(meters / 400);
      const marathons = (km / 42.195).toFixed(1);
      const fernsehturm = Math.floor(meters / 368);
      const pizzas = Math.floor((totalSteps * 0.04) / 900);
      const pizzaStack = (pizzas * 4 / 100).toFixed(2);
      const bohnen = Math.floor((totalSteps * 0.04) / 500);
      const tour = ((totalBike / 3500) * 100).toFixed(1);

      const box = document.getElementById("funFacts");
      if (!box) return;

      const cards = [
        ["🏟", fmt(stadion), "Stadionrunden", "auf einer 400m-Bahn"],
        ["🏃", marathons, "Marathons", "seit Februar gelaufen"],
        ["🗼", fmt(fernsehturm) + "×", "Fernsehturm", "so hoch wären eure Schritte gestapelt"],
        ["🚴", tour + "%", "Tour de France", "mit euren Fahrrad-km geschafft"],
        ["🍕", fmt(pizzas), "Pizzen verbrannt", "0,04 kcal pro Schritt · 900 kcal pro Pizza"],
        ["📦", pizzaStack + " m", "Pizzastapel", "1 Pizza im Karton = ca. 4 cm"],
        ["🫘", fmt(bohnen), "Portionen Dicke Bohnen", "ca. 500 kcal pro Portion"],
        ["💪", fmt(totalPushups), "Liegestütze", "Wurstrand-Arme in Arbeit"],
        ["🦵", fmt(totalSquats), "Kniebeugen", "Beine sagen: Joa, läuft."]
      ];

      box.innerHTML = `
    <div class="funfact-grid">
      ${cards.map(c => `
        <div class="funfact-card">
          <div class="funfact-emoji">${c[0]}</div>
          <div class="funfact-value">${c[1]}</div>
          <div class="funfact-label">${c[2]}</div>
          <div class="funfact-note">${c[3]}</div>
        </div>
      `).join("")}
    </div>
  `;
    }
    function renderAchievements() {
      const totals = {
        steps: HISTORIC_TOTALS.steps + allEntries.reduce((s, e) => s + (+e.steps || 0), 0),
        bike: HISTORIC_TOTALS.bike + allEntries.reduce((s, e) => s + (+e.bike || 0), 0),
        squats: HISTORIC_TOTALS.squats + allEntries.reduce((s, e) => s + (+e.squats || 0), 0),
        pushups: HISTORIC_TOTALS.pushups + allEntries.reduce((s, e) => s + (+e.pushups || 0), 0),
        exercises: HISTORIC_TOTALS.exercises + allEntries.filter(e => e.exercise).length
      };

      const groups = [
        {
          key: "steps",
          icon: "👣",
          title: "Schritte",
          unit: "Schritte",
          decimals: 0,
          value: totals.steps,
          milestones: [
            [3000000, "Millionen-Marsch"],
            [5000000, "Legendenlauf"],
            [7500000, "Siebeneinhalb-Marsch"],
            [10000000, "Unfassbare 10 Millionen"],
            [12500000, "Wurstrand-Wanderung Deluxe"],
            [15000000, "15-Millionen-Meile"],
            [17500000, "Siebzehneinhalb-Sprint"],
            [20000000, "20-Millionen-Monster"],
            [25000000, "Viertelhundert-Millionen"],
            [30000000, "30-Millionen-Legende"]
          ]
        },
        {
          key: "bike",
          icon: "🚴",
          title: "Fahrrad",
          unit: "km",
          decimals: 1,
          value: totals.bike,
          milestones: [
            [1500, "Tour-Anwärter"],
            [2500, "Ketten-Kilometer"],
            [3500, "Tour de France"],
            [5000, "Ketten-Könige"],
            [7500, "Pedal-Patriarchen"],
            [10000, "10.000-km-Titanen"],
            [12500, "Zwölf-Fünf-Zünder"],
            [15000, "Sattel-Superstars"],
            [20000, "20.000-km-Radrebellen"],
            [25000, "Wurstrand-Weltreise"]
          ]
        },
        {
          key: "squats",
          icon: "🦵",
          title: "Kniebeugen",
          unit: "Kniebeugen",
          decimals: 0,
          value: totals.squats,
          milestones: [
            [500, "Bein-Warmup"],
            [1000, "Knie-Kommando"],
            [2500, "Bein-Beben"],
            [5000, "Stahlstelzen"],
            [7500, "Schenkel-Sturm"],
            [10000, "Oberschenkel-Orkan"],
            [15000, "Kniebeuge-Kaiser"],
            [20000, "20.000-Bein-Boss"],
            [25000, "Quadrizeps-Queen-Kings"],
            [30000, "30.000-Bein-Legenden"]
          ]
        },
        {
          key: "pushups",
          icon: "💪",
          title: "Liegestütze",
          unit: "Liegestütze",
          decimals: 0,
          value: totals.pushups,
          milestones: [
            [500, "Arm-Alarm"],
            [1000, "Liegestütz-Legion"],
            [2500, "Gorilla-Modus"],
            [5000, "Brustpanzer-Brigade"],
            [7500, "Arm-Arena"],
            [10000, "Push-up-Panik"],
            [15000, "Armageddon-Arme"],
            [20000, "20.000-Drücker"],
            [25000, "Oberkörper-Orkan"],
            [30000, "30.000-Push-Legende"]
          ]
        },
        {
          key: "exercises",
          icon: "🧘",
          title: "Übungen",
          unit: "Übungen",
          decimals: 0,
          value: totals.exercises,
          milestones: [
            [50, "Routine-Funken"],
            [100, "Disziplin-Dämonen"],
            [250, "Ritual-Riesen"],
            [365, "Jahres-Mönche"],
            [500, "Routine-Rakete"],
            [750, "Übungs-Ultras"],
            [1000, "Tausend-Tage-Titanen"],
            [1250, "Ritual-Rekordler"],
            [1500, "Disziplin-Deluxe"],
            [2000, "Übungs-Universum"]
          ]
        }
      ];

      const box = document.getElementById("achievements");
      if (!box) return;

      const fmtUnit = (value, unit, decimals) => {
        return `${fmt(value, decimals)} ${unit}`;
      };

      const newAchievementKeys = new Set();

      box.innerHTML = groups.map(group => {
        const reached = group.milestones.filter(m => group.value >= m[0]);
        const next = group.milestones.find(m => group.value < m[0]);

        reached.forEach(m => {
          const storageKey = `achievement_${group.key}_${m[0]}`;

          if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, "true");
            newAchievementKeys.add(storageKey);
            showBigPop(group.icon, "Achievement freigeschaltet!", `${m[1]} · ${fmtUnit(m[0], group.unit, group.decimals)}`);
          }
        });

        const reachedHtml = reached.length
          ? reached.map(m => {
            const storageKey = `achievement_${group.key}_${m[0]}`;
            const newClass = newAchievementKeys.has(storageKey) ? " achievement-new" : "";

            return `
        <div class="achievement-mini-line${newClass}">
          <div>${group.icon} ${m[1]}</div>
          <div>✓ ${fmtUnit(m[0], group.unit, group.decimals)}</div>
        </div>
      `;
          }).join("")
          : `<div class="achievement-mini-line muted">Noch nichts freigeschaltet</div>`;

        const nextHtml = next
          ? `
        <div class="achievement-next">
          <b>🎯 Als Nächstes ${group.icon} ${next[1]}</b>
          <div>${fmtUnit(group.value, group.unit, group.decimals)} / ${fmtUnit(next[0], group.unit, group.decimals)}</div>
        </div>
      `
          : `
        <div class="achievement-next">
          <b>🏆 Alles erreicht!</b>
          <div>${fmtUnit(group.value, group.unit, group.decimals)}</div>
        </div>
      `;

        const hiddenCount = group.milestones.length - reached.length - (next ? 1 : 0);
        const hasNewAchievement = reached.some(m =>
          newAchievementKeys.has(`achievement_${group.key}_${m[0]}`)
        );

        return `
      <div class="achievement-group-card${hasNewAchievement ? " achievement-group-new" : ""}">
        <div class="achievement-group-head">
          <div class="achievement-group-title">
            <span class="achievement-group-icon">${group.icon}</span>
            <span>${group.title}</span>
          </div>
          <div class="achievement-group-count">${reached.length}/${group.milestones.length}</div>
        </div>

        <div class="achievement-section-label">✅ Erreicht</div>
        <div class="achievement-reached-list">
          ${reachedHtml}
        </div>

        ${nextHtml}

        <div class="achievement-hidden-note">
          ${hiddenCount > 0 ? `${hiddenCount} weitere Ziele schlummern noch im Hintergrund.` : `Keine weiteren Ziele im Hintergrund.`}
        </div>
      </div>
    `;
      }).join("");
    }
