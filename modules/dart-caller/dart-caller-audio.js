(() => {
  const basePath = "modules/dart-caller/audio";
  const audioVersion = "46";
  const asset = filename => `${basePath}/${filename}?v=${audioVersion}`;
  const voigt = (score, takes = [1]) => takes.map(
    take => asset(`score-${score}-voigt-${String(take).padStart(2, "0")}.wav`)
  );
  const judith = score => asset(`score-${score}-judith-01.wav`);
  const marco = score => asset(`score-${score}-marco-01.wav`);

  // Each score owns a list so further callers and alternative takes can be
  // appended without changing the game logic.
  const turnScores = {
    1: voigt(1), 2: voigt(2), 3: voigt(3), 4: voigt(4), 5: voigt(5),
    6: voigt(6, [1, 2]), 7: voigt(7), 8: voigt(8), 9: voigt(9, [1, 2]),
    10: voigt(10), 11: voigt(11), 12: voigt(12), 13: voigt(13), 14: voigt(14),
    15: voigt(15), 16: voigt(16), 17: voigt(17, [1, 2]), 18: voigt(18),
    19: voigt(19), 20: voigt(20, [1, 2]), 21: voigt(21, [1, 2]), 22: voigt(22),
    24: voigt(24), 26: voigt(26), 28: voigt(28), 30: voigt(30), 32: voigt(32),
    33: voigt(33), 36: voigt(36, [1, 2]), 39: voigt(39), 42: voigt(42),
    45: voigt(45), 48: voigt(48), 51: voigt(51, [1, 2, 3]),
    56: voigt(56, [2]), 89: voigt(89)
  };
  for (let score = 1; score <= 180; score += 1) {
    // Judith accidentally repeated 45 in place of 46 in the source recording.
    // Keep 46 on the verified caller pool until a correct take is available.
    if (score !== 46) {
      turnScores[score] = [...(turnScores[score] || []), judith(score)];
    }
  }
  [5, 6, 11, 18, 29, 69].forEach(score => {
    turnScores[score] = [...(turnScores[score] || []), marco(score)];
  });
  turnScores[7] = [...turnScores[7], asset("score-7-fun-seven-days-01.wav")];
  turnScores[20] = [...turnScores[20], asset("score-20-fun-20cm-01.wav")];
  turnScores[51] = [...turnScores[51], asset("score-51-fun-playboy-01.wav")];

  const specialCalls = {
    zero: [
      asset("special-zero-voigt-01.wav"),
      asset("special-zero-judith-01.wav")
    ],
    winner: [
      asset("special-winner-voigt-01.wav"),
      asset("special-winner-judith-01.wav"),
      asset("special-winner-judith-02.wav")
    ],
    bust: [
      asset("special-bust-judith-01.wav"),
      asset("special-bust-judith-02.wav"),
      asset("special-bust-judith-03.wav")
    ]
  };
  const bonusCalls = [
    asset("bonus-judith-neutral-01.wav"),
    asset("bonus-judith-positive-01.wav"),
    asset("bonus-judith-tease-01.wav")
  ];
  let currentAudio = null;
  let lastSource = "";
  let playbackToken = 0;

  function callerName(source) {
    if (source.includes("-fun-")) return "fun";
    return source.match(/-(voigt|judith|marco)-/)?.[1] || "wrc";
  }

  function randomSource(sources) {
    if (!sources?.length) return "";
    const alternatives = sources.length > 1
      ? sources.filter(source => source !== lastSource)
      : sources;
    const pool = alternatives.length ? alternatives : sources;
    const callerGroups = new Map();
    pool.forEach(source => {
      const caller = callerName(source);
      callerGroups.set(caller, [...(callerGroups.get(caller) || []), source]);
    });
    const groups = [...callerGroups.entries()].map(([caller, takes]) => ({
      caller,
      takes,
      weight: caller === "marco" ? 1.25 : caller === "fun" ? 0.35 : 1
    }));
    const totalWeight = groups.reduce((sum, group) => sum + group.weight, 0);
    let draw = Math.random() * totalWeight;
    const selectedGroup = groups.find(group => {
      draw -= group.weight;
      return draw <= 0;
    }) || groups[groups.length - 1];
    return selectedGroup.takes[Math.floor(Math.random() * selectedGroup.takes.length)];
  }

  function play(sources, onEnded) {
    const source = randomSource(sources);
    if (!source) return Promise.resolve(false);
    playbackToken += 1;
    const token = playbackToken;
    currentAudio?.pause();
    currentAudio = new Audio(source);
    currentAudio.preload = "auto";
    lastSource = source;
    currentAudio.addEventListener("ended", () => {
      if (token === playbackToken) onEnded?.();
    }, { once: true });
    return currentAudio.play().then(() => true).catch(() => false);
  }

  function maybePlayBonus() {
    if (Math.random() >= 0.12) return;
    play(bonusCalls);
  }

  function speakFallback(score) {
    if (!("speechSynthesis" in window)) return Promise.resolve(false);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(score));
    utterance.lang = "de-DE";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
    return Promise.resolve(true);
  }

  window.WRCDartCallerAudio = {
    playTurnScore(score) {
      const numericScore = Number(score);
      const sources = numericScore === 0 ? specialCalls.zero : turnScores[numericScore];
      if (!sources?.length) return speakFallback(numericScore);
      return play(
        sources,
        numericScore === 0 ? undefined : maybePlayBonus
      );
    },
    playSpecial(event) {
      return play(specialCalls[event]);
    },
    playCricketTurn(closedTargets, points) {
      const closed = Array.isArray(closedTargets) ? closedTargets.filter(Boolean) : [];
      const numericPoints = Number(points) || 0;
      if (!closed.length && numericPoints <= 0) return Promise.resolve(false);
      if (!closed.length) return this.playTurnScore(numericPoints);
      if (!("speechSynthesis" in window)) return numericPoints > 0 ? this.playTurnScore(numericPoints) : Promise.resolve(false);
      playbackToken += 1;
      currentAudio?.pause();
      window.speechSynthesis.cancel();
      const closureText = `${closed.join(" und ")} geschlossen`;
      const utterance = new SpeechSynthesisUtterance(numericPoints > 0 ? `${closureText}, ${numericPoints} Punkte` : closureText);
      utterance.lang = "de-DE";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
      return Promise.resolve(true);
    },
    stop() {
      playbackToken += 1;
      currentAudio?.pause();
      currentAudio = null;
      window.speechSynthesis?.cancel();
    }
  };
})();
