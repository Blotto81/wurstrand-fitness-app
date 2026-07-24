const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Erwartet: ${expected}, erhalten: ${actual}`);
  }
}

test("formatDate gibt für ein leeres Datum einen Strich zurück", () => {
  assertEqual(formatDate(""), "-");
});

test("formatDate formatiert ein Datum auf Deutsch", () => {
  assertEqual(formatDate("2026-07-24"), "24.7.2026");
});

test("escapeHtml entschärft HTML-Sonderzeichen", () => {
  assertEqual(
    escapeHtml(`<script>"Test" & 'Text'</script>`),
    "&lt;script&gt;&quot;Test&quot; &amp; &#039;Text&#039;&lt;/script&gt;"
  );
});

test("calcPoints verwendet vor Juli die alte Rundungsregel", () => {
  const result = calcPoints({
    date: "2026-06-30",
    steps: 3000,
    bike: 3,
    squats: 14,
    pushups: 0,
    exercise: false
  });

  assertEqual(result.squatPts, 2);
  assertEqual(result.bonus, 4);
  assertEqual(result.total, 12);
  assertEqual(result.bonusRule, "alte Bonus-Regel");
});

test("calcPoints verwendet ab Juli die neue Rundungsregel", () => {
  const result = calcPoints({
    date: "2026-07-01",
    steps: 3000,
    bike: 3,
    squats: 14,
    pushups: 0,
    exercise: false
  });

  assertEqual(result.squatPts, 2.8);
  assertEqual(result.bonus, 0);
  assertEqual(result.total, 8.8);
  assertEqual(result.bonusRule, "3er-Regel");
});

test("calcPoints vergibt ab Juli Bonus bei drei erfüllten Bereichen", () => {
  const result = calcPoints({
    date: "2026-07-01",
    steps: 3000,
    bike: 3,
    squats: 15,
    pushups: 0,
    exercise: false
  });

  assertEqual(result.bonusCats, 3);
  assertEqual(result.bonus, 4);
  assertEqual(result.total, 13);
});

test("mergeEntries behält vorhandene Werte bei leeren neuen Feldern", () => {
  const result = mergeEntries(
    {
      date: "2026-07-24",
      person: "Basti",
      steps: 5000,
      bike: 10,
      squats: 20,
      pushups: 15,
      exercise: false
    },
    {
      steps: 0,
      bike: 0,
      squats: 0,
      pushups: 0,
      exercise: true
    }
  );

  assertEqual(result.steps, 5000);
  assertEqual(result.bike, 10);
  assertEqual(result.squats, 20);
  assertEqual(result.pushups, 15);
  assertEqual(result.exercise, true);
});

test("mergeEntries übernimmt nach Bestätigung einen neuen Wert", () => {
  const originalConfirm = window.confirm;
  window.confirm = () => true;

  try {
    const result = mergeEntries(
      {
        date: "2026-07-24",
        person: "Basti",
        steps: 5000,
        bike: 0,
        squats: 0,
        pushups: 0,
        exercise: false
      },
      {
        steps: 6000,
        bike: 0,
        squats: 0,
        pushups: 0,
        exercise: false
      }
    );

    assertEqual(result.steps, 6000);
  } finally {
    window.confirm = originalConfirm;
  }
});

test("mergeEntries behält nach Abbruch den vorhandenen Wert", () => {
  const originalConfirm = window.confirm;
  window.confirm = () => false;

  try {
    const result = mergeEntries(
      {
        date: "2026-07-24",
        person: "Basti",
        steps: 5000,
        bike: 0,
        squats: 0,
        pushups: 0,
        exercise: false
      },
      {
        steps: 6000,
        bike: 0,
        squats: 0,
        pushups: 0,
        exercise: false
      }
    );

    assertEqual(result.steps, 5000);
  } finally {
    window.confirm = originalConfirm;
  }
});

const results = document.getElementById("testResults");
let passed = 0;

tests.forEach(({ name, run }) => {
  const line = document.createElement("p");

  try {
    run();
    passed++;
    line.textContent = `✅ ${name}`;
  } catch (error) {
    line.textContent = `❌ ${name}: ${error.message}`;
  }

  results.appendChild(line);
});

const summary = document.createElement("strong");
summary.textContent = `${passed}/${tests.length} Tests erfolgreich`;
results.prepend(summary);
