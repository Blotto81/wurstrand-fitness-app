(() => {
  const basePath = "modules/dart-caller/audio";
  const voigt = (score, count) => Array.from(
    { length: count },
    (_, index) => `${basePath}/score-${score}-voigt-${String(index + 1).padStart(2, "0")}.wav`
  );

  // Each score owns a list so further callers and alternative takes can be
  // appended without changing the game logic.
  const turnScores = {
    1: voigt(1, 1), 2: voigt(2, 1), 3: voigt(3, 1), 4: voigt(4, 1),
    5: voigt(5, 1), 6: voigt(6, 3), 7: voigt(7, 1), 8: voigt(8, 1),
    9: voigt(9, 3), 10: voigt(10, 1), 11: voigt(11, 1), 12: voigt(12, 3),
    13: voigt(13, 1), 14: voigt(14, 2), 15: voigt(15, 1), 16: voigt(16, 2),
    17: voigt(17, 2), 18: voigt(18, 3), 19: voigt(19, 1), 20: voigt(20, 3),
    21: voigt(21, 2), 22: voigt(22, 1), 24: voigt(24, 2), 26: voigt(26, 1),
    27: voigt(27, 1), 28: voigt(28, 1), 30: voigt(30, 2), 32: voigt(32, 1),
    33: voigt(33, 1), 36: voigt(36, 2), 39: voigt(39, 1), 42: voigt(42, 1),
    45: voigt(45, 1), 48: voigt(48, 1), 51: voigt(51, 2), 56: voigt(56, 1),
    60: voigt(60, 1), 89: voigt(89, 1)
  };

  const specialCalls = {
    zero: [`${basePath}/special-zero-voigt-01.wav`],
    winner: [`${basePath}/special-winner-voigt-01.wav`]
  };
  let currentAudio = null;
  let lastSource = "";

  function randomSource(sources) {
    if (!sources?.length) return "";
    const alternatives = sources.length > 1
      ? sources.filter(source => source !== lastSource)
      : sources;
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  function play(sources) {
    const source = randomSource(sources);
    if (!source) return Promise.resolve(false);
    currentAudio?.pause();
    currentAudio = new Audio(source);
    currentAudio.preload = "auto";
    lastSource = source;
    return currentAudio.play().then(() => true).catch(() => false);
  }

  window.WRCDartCallerAudio = {
    playTurnScore(score) {
      return play(Number(score) === 0 ? specialCalls.zero : turnScores[Number(score)]);
    },
    playSpecial(event) {
      return play(specialCalls[event]);
    },
    stop() {
      currentAudio?.pause();
      currentAudio = null;
    }
  };
})();
