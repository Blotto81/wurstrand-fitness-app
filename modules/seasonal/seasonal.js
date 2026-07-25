(function () {
  const dayOfYearKey = date =>
    (date.getMonth() + 1) * 100 + date.getDate();

  const between = (date, start, end) => {
    const key = dayOfYearKey(date);
    return start <= end
      ? key >= start && key <= end
      : key >= start || key <= end;
  };

  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day, 12);
  }

  const aroundEaster = date => {
    const easter = easterSunday(date.getFullYear());
    const start = new Date(easter);
    const end = new Date(easter);
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 2);
    return date >= start && date <= end;
  };

  const THEMES = Object.freeze([
    {
      id: "birthday",
      priority: 110,
      label: "Heute hat die WRC Geburtstag",
      icon: "🎂",
      accent: "#f4c768",
      accentSoft: "rgba(244, 199, 104, .17)",
      glow: "rgba(244, 199, 104, .26)",
      header: "rgba(67, 48, 79, .42)",
      accessory: "🥳",
      sidekick: "🎂",
      particles: ["✦", "●", "▴", "🎈"],
      motion: "spark",
      garland: ["#f4c768", "#70d6c4", "#f39ab5", "#8bb9ff"],
      matches: date => dayOfYearKey(date) === 201
    },
    {
      id: "newyear",
      priority: 100,
      label: "Neues Jahr, neue Runde",
      icon: "🎆",
      accent: "#f6c453",
      accentSoft: "rgba(246, 196, 83, .18)",
      glow: "rgba(246, 196, 83, .28)",
      header: "rgba(62, 52, 92, .42)",
      accessory: "🥳",
      sidekick: "✨",
      particles: ["✦", "·", "✧", "✦"],
      motion: "spark",
      garland: ["#f6c453", "#82d9ff", "#f49ac2", "#ffffff"],
      matches: date => between(date, 1231, 102)
    },
    {
      id: "valentine",
      priority: 95,
      label: "Gemeinsam schlägt weiter",
      icon: "❤️",
      accent: "#f08aa5",
      accentSoft: "rgba(240, 138, 165, .16)",
      glow: "rgba(240, 138, 165, .24)",
      header: "rgba(76, 37, 63, .38)",
      accessory: "💌",
      sidekick: "🎀",
      particles: ["♥", "♡", "♥"],
      motion: "rise",
      garland: ["#f08aa5", "#ffd3de", "#db6687"],
      matches: date => between(date, 212, 214)
    },
    {
      id: "easter",
      priority: 92,
      label: "Oster-Runde",
      icon: "🐰",
      accent: "#c8a7ff",
      accentSoft: "rgba(200, 167, 255, .16)",
      glow: "rgba(200, 167, 255, .23)",
      header: "rgba(48, 58, 76, .42)",
      accessory: "🐰",
      sidekick: "🥚",
      particles: ["🌼", "·", "🌸", "·"],
      motion: "float",
      garland: ["#f7c8dd", "#c8e5a3", "#c8a7ff", "#f6d88f"],
      matches: aroundEaster
    },
    {
      id: "halloween",
      priority: 90,
      label: "Spuk am Wurstrand",
      icon: "🎃",
      accent: "#f39a45",
      accentSoft: "rgba(243, 154, 69, .16)",
      glow: "rgba(243, 154, 69, .24)",
      header: "rgba(50, 29, 57, .48)",
      accessory: "🧛",
      sidekick: "🧙",
      particles: ["🦇", "·", "🦇"],
      motion: "glide",
      garland: ["#f39a45", "#9c71d9", "#e4c7ff"],
      matches: date => between(date, 1025, 1101)
    },
    {
      id: "christmas",
      priority: 85,
      label: "WRC-Weihnachtszeit",
      icon: "🎄",
      accent: "#e7b85a",
      accentSoft: "rgba(231, 184, 90, .16)",
      glow: "rgba(231, 184, 90, .24)",
      header: "rgba(28, 64, 55, .44)",
      accessory: "🎅",
      sidekick: "🧣",
      particles: ["❄", "·", "✦", "❄"],
      motion: "fall",
      garland: ["#ef6f6c", "#ffd166", "#62d2a2", "#8ecae6"],
      matches: date => between(date, 1201, 1226)
    },
    {
      id: "spring",
      priority: 20,
      label: "Frischer Wind",
      icon: "🌸",
      accent: "#79d6aa",
      accentSoft: "rgba(121, 214, 170, .14)",
      glow: "rgba(121, 214, 170, .2)",
      header: "rgba(30, 65, 66, .36)",
      accessory: "🌱",
      sidekick: "🌼",
      particles: ["🌸", "·", "❀"],
      motion: "float",
      garland: ["#79d6aa", "#f4b8cc", "#f4dc8c"],
      matches: date => between(date, 301, 531)
    },
    {
      id: "summer",
      priority: 20,
      label: "WRC-Sommermodus",
      icon: "☀️",
      accent: "#65cde8",
      accentSoft: "rgba(101, 205, 232, .14)",
      glow: "rgba(101, 205, 232, .2)",
      header: "rgba(23, 66, 82, .38)",
      accessory: "😎",
      sidekick: "⛱️",
      particles: ["✦", "·", "☁"],
      motion: "float",
      garland: ["#65cde8", "#f2ce62", "#7ee0b5"],
      matches: date => between(date, 601, 831)
    },
    {
      id: "autumn",
      priority: 20,
      label: "Goldene Runde",
      icon: "🍂",
      accent: "#d99a58",
      accentSoft: "rgba(217, 154, 88, .15)",
      glow: "rgba(217, 154, 88, .2)",
      header: "rgba(64, 42, 35, .4)",
      accessory: "🧢",
      sidekick: "🍁",
      particles: ["🍂", "·", "🍁"],
      motion: "drift",
      garland: ["#d99a58", "#c86b4a", "#e2bd68"],
      matches: date => between(date, 901, 1130)
    },
    {
      id: "winter",
      priority: 20,
      label: "Winter am Wurstrand",
      icon: "❄️",
      accent: "#9cccf3",
      accentSoft: "rgba(156, 204, 243, .14)",
      glow: "rgba(156, 204, 243, .2)",
      header: "rgba(36, 53, 79, .42)",
      accessory: "🧢",
      sidekick: "🧣",
      particles: ["❄", "·", "❅"],
      motion: "fall",
      garland: ["#9cccf3", "#d8edff", "#a9bce8"],
      matches: date => between(date, 1227, 228)
    }
  ]);

  function resolveTheme(date = new Date()) {
    const preview = new URLSearchParams(window.location.search).get("season");
    const birthdayPreview = new URLSearchParams(window.location.search).get("birthday") === "1";
    const localPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (birthdayPreview && localPreview) {
      return THEMES.find(theme => theme.id === "birthday") || null;
    }

    if (preview && localPreview) {
      return THEMES.find(theme => theme.id === preview) || null;
    }

    return [...THEMES]
      .sort((a, b) => b.priority - a.priority)
      .find(theme => theme.matches(date)) || null;
  }

  function createParticles(theme) {
    const layer = document.createElement("div");
    layer.className = "wrc-season-particles";
    layer.dataset.motion = theme.motion;
    layer.setAttribute("aria-hidden", "true");

    const count = window.matchMedia("(max-width: 600px)").matches ? 5 : 8;
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      particle.className = "wrc-season-particle";
      particle.textContent = theme.particles[index % theme.particles.length];
      particle.style.setProperty("--x", `${8 + ((index * 19) % 86)}%`);
      particle.style.setProperty("--delay", `${-((index * 2.7) % 13)}s`);
      particle.style.setProperty("--duration", `${12 + (index % 4) * 3}s`);
      particle.style.setProperty("--drift", `${index % 2 ? 34 : -28}px`);
      particle.style.setProperty("--size", `${12 + (index % 3) * 3}px`);
      particle.style.setProperty("--y", `${12 + ((index * 11) % 58)}%`);
      layer.appendChild(particle);
    }

    document.body.appendChild(layer);
  }

  function createHeaderDetails(theme) {
    const header = document.querySelector(".app-header");
    const logoHeader = document.querySelector(".logo-header");
    if (!header || !logoHeader) return;

    const badge = document.createElement("div");
    badge.className = "wrc-season-badge";
    badge.innerHTML = `<span aria-hidden="true">${theme.icon}</span><span>${theme.label}</span>`;
    logoHeader.querySelector("div")?.appendChild(badge);

    const accessories = document.createElement("div");
    accessories.className = "wrc-season-accessories";
    accessories.setAttribute("aria-hidden", "true");
    accessories.innerHTML = `<span>${theme.accessory}</span><span>${theme.sidekick}</span>`;
    logoHeader.appendChild(accessories);

    const garland = document.createElement("div");
    garland.className = "wrc-season-garland";
    garland.setAttribute("aria-hidden", "true");
    theme.garland.forEach((color, index) => {
      const light = document.createElement("i");
      light.style.setProperty("--bulb", color);
      light.style.setProperty("--bulb-delay", `${index * 260}ms`);
      garland.appendChild(light);
    });
    header.appendChild(garland);
  }

  function applyTheme(theme) {
    if (!theme) return;

    document.documentElement.style.setProperty("--season-accent", theme.accent);
    document.documentElement.style.setProperty("--season-accent-soft", theme.accentSoft);
    document.documentElement.style.setProperty("--season-glow", theme.glow);
    document.documentElement.style.setProperty("--season-header", theme.header);
    document.body.classList.add("wrc-season-active", `wrc-season-${theme.id}`);
    document.body.dataset.wrcSeason = theme.id;

    createHeaderDetails(theme);
    createParticles(theme);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(resolveTheme());
  });

  window.WRCSeason = Object.freeze({
    resolveTheme,
    themes: THEMES
  });
})();
