(() => {
  const STORAGE_KEY = "wrc_wursti_walk_last";
  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
  const START_CHANCE = 0.015;

  function canAppear(force = false) {
    if (document.querySelector(".wursti-walk-stage")) return false;
    if (!document.getElementById("dashboard")?.classList.contains("active")) return false;
    if (document.body.classList.contains("menu-open")) return false;
    if (document.querySelector('[role="dialog"][style*="display: flex"]')) return false;
    if (document.activeElement?.matches("input, select, textarea")) return false;
    if (force) return true;

    const lastShown = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return Date.now() - lastShown >= COOLDOWN_MS && Math.random() < START_CHANCE;
  }

  function play({ force = false } = {}) {
    if (!canAppear(force)) return false;

    const stage = document.createElement("div");
    const actor = document.createElement("div");
    const sprite = document.createElement("div");

    stage.className = "wursti-walk-stage";
    stage.setAttribute("aria-hidden", "true");
    actor.className = "wursti-walk-actor";
    sprite.className = "wursti-walk-sprite";
    actor.appendChild(sprite);
    stage.appendChild(actor);
    document.body.appendChild(stage);

    if (!force) localStorage.setItem(STORAGE_KEY, String(Date.now()));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      setTimeout(() => actor.classList.add("is-waving"), 4200);
      setTimeout(() => actor.classList.remove("is-waving"), 5400);
    }

    setTimeout(() => stage.remove(), reduceMotion ? 2500 : 7400);
    return true;
  }

  function schedule() {
    const delay = 2600 + Math.random() * 2200;
    setTimeout(() => play(), delay);
  }

  window.WRCWurstiWalk = { play };
  window.addEventListener("load", schedule, { once: true });
})();
