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

      const walkingMeters = totalSteps * 0.75;
      const walkingKm = walkingMeters / 1000;
      const totalMovementKm = walkingKm + totalBike;
      const earthCircumferenceKm = 40075;
      const marathonKm = 42.195;
      const stadiumLapMeters = 400;
      const sausageMeters = 0.15;
      const dartDistanceMeters = 2.37;
      const powerRepetitions = totalSquats + totalPushups;

      const travelDestinations = {
        "2026-02": { name: "Hamburg", roundTripKm: 580 },
        "2026-03": { name: "München", roundTripKm: 1170 },
        "2026-04": { name: "Rom", roundTripKm: 2360 },
        "2026-05": { name: "Mallorca", roundTripKm: 2700 },
        "2026-06": { name: "Istanbul", roundTripKm: 3480 },
        "2026-07": { name: "Nordkap", roundTripKm: 5000 },
        "2026-08": { name: "Paris", roundTripKm: 2100 },
        "2026-09": { name: "Wien", roundTripKm: 1360 },
        "2026-10": { name: "Kopenhagen", roundTripKm: 880 },
        "2026-11": { name: "Amsterdam", roundTripKm: 1300 },
        "2026-12": { name: "New York", roundTripKm: 12770 }
      };

      const travel = travelDestinations[currentMonthKey()] || {
        name: "Nordkap",
        roundTripKm: 5000
      };

      const box = document.getElementById("funFacts");
      if (!box) return;

      const cards = [
        {
          icon: "👣",
          value: `${fmt(walkingKm, 1)} km`,
          label: "Zurückgelegte Laufstrecke",
          note: "gerechnet mit durchschnittlich 0,75 m pro Schritt",
          image: "funfact-wursti-laufen.png"
        },
        {
          icon: "🌍",
          value: `${fmt((walkingKm / earthCircumferenceKm) * 100, 1)}%`,
          label: "Einmal um die Erde",
          note: `vom Erdumfang mit rund ${fmt(earthCircumferenceKm)} km`,
          image: "funfact-wursti-weltreise.png"
        },
        {
          icon: "🏃",
          value: fmt(walkingKm / marathonKm, 1),
          label: "Marathon-Distanzen",
          note: `je ${fmt(marathonKm, 3)} km – ohne Startnummernstress`,
          image: "funfact-wursti-laufen.png"
        },
        {
          icon: "🏟️",
          value: fmt(Math.floor(walkingMeters / stadiumLapMeters)),
          label: "Stadionrunden",
          note: "auf einer klassischen 400-Meter-Bahn",
          image: "funfact-wursti-laufen.png"
        },
        {
          icon: "🚴",
          value: `${fmt(totalMovementKm, 1)} km`,
          label: "Gesamte Bewegung",
          note: "Laufstrecke und Fahrradkilometer gemeinsam",
          image: "funfact-wursti-fahrrad.png"
        },
        {
          icon: "⚙️",
          value: fmt(powerRepetitions),
          label: "Wurstrand-Kraftwerk",
          note: "Kniebeugen und Liegestütze zusammen – Wursti schwitzt",
          image: "funfact-wurstrand-kraftwerk.png"
        },
        {
          icon: "🌭",
          value: fmt(Math.floor(walkingMeters / sausageMeters)),
          label: "Wurstlängen",
          note: "aneinandergereiht bei 15 cm pro Wurst",
          image: "funfact-bohne-wurstlaenge.png"
        },
        {
          icon: "🎯",
          value: fmt(Math.floor(walkingMeters / dartDistanceMeters)),
          label: "Dart-Abstände",
          note: "gerechnet mit 2,37 m bis zur Dartscheibe",
          image: "funfact-bohne-dartabstand.png"
        },
        {
          icon: "🧳",
          value: `${fmt(totalMovementKm / travel.roundTripKm, 1)}×`,
          label: `Berlin ↔ ${travel.name}`,
          note: `hin und zurück, ungefähr ${fmt(travel.roundTripKm)} km pro Reise`,
          image: "funfact-wursti-weltreise.png"
        }
      ];

      box.innerHTML = `
    <div class="funfact-grid-v2">
      ${cards.map(card => `
        <article class="funfact-card-v2">
          <div class="funfact-card-head-v2">
            <span class="funfact-icon-v2">${card.icon}</span>
            <img class="funfact-mascot-v2" src="${card.image}" alt="" aria-hidden="true">
          </div>
          <div class="funfact-value-v2">${card.value}</div>
          <div class="funfact-label-v2">${card.label}</div>
          <div class="funfact-note-v2">${card.note}</div>
        </article>
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
