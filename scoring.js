function calcPoints(e) {
  const isJulyOrLater = (e.date || "") >= "2026-07-01";

  const steps = +e.steps || 0;
  const bike = +e.bike || 0;
  const squats = +e.squats || 0;
  const pushups = +e.pushups || 0;

  const stepPts = Math.round((steps / 1000) * 10) / 10;
  const bikePts = Math.round(bike * 10) / 10;

  const squatPts = isJulyOrLater
    ? Math.round((squats / 5) * 10) / 10
    : Math.floor(squats / 5);

  const pushPts = isJulyOrLater
    ? Math.round((pushups / 3) * 10) / 10
    : Math.floor(pushups / 3);

  const powerPts = Math.round((squatPts + pushPts) * 10) / 10;
  const exercisePts = e.exercise ? 5 : 0;

  let bonusChecks;

  if (isJulyOrLater) {
    bonusChecks = {
      steps: steps >= 3000,
      bike: bike >= 3,
      power: pushPts >= 3 || squatPts >= 3,
      exercise: !!e.exercise
    };
  } else {
    bonusChecks = {
      steps: stepPts > 0,
      bike: bikePts > 0,
      power: powerPts > 0,
      exercise: !!e.exercise
    };
  }

  const cats = Object.values(bonusChecks).filter(Boolean).length;
  const bonus = cats >= 3 ? 4 : 0;

  return {
    total: Math.round((stepPts + bikePts + powerPts + exercisePts + bonus) * 10) / 10,
    stepPts,
    bikePts,
    powerPts,
    squatPts,
    pushPts,
    exercisePts,
    bonus,
    bonusChecks,
    bonusCats: cats,
    bonusRule: isJulyOrLater ? "3er-Regel" : "alte Bonus-Regel"
  };
}
