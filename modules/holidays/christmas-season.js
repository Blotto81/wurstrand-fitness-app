(function () {
  "use strict";
  const C = WRCHolidayCalendar, seen = new Set();
  function ignition(state) {
    if (!state?.ignition) return false;
    const key = "wrcAdventIgnition:" + (C.preview ? "preview:" : "live:") + state.date;
    if (seen.has(key)) return false;
    seen.add(key);
    try { if (localStorage.getItem(key)) return false; localStorage.setItem(key, "1"); } catch { /* Once per page if storage is unavailable. */ }
    return true;
  }
  function pizza(state, light) {
    const candles = [[63,60],[113,57],[49,83],[132,85]];
    return '<svg viewBox="0 0 180 150" role="img" aria-label="Adventspizza: ' + state.lit + ' von 4 Wurstkerzen brennen"><defs><linearGradient id="wh-crust" x2="0" y2="1"><stop stop-color="#f9ce7b"/><stop offset="1" stop-color="#bc642e"/></linearGradient><linearGradient id="wh-sausage" x2="1" y2="0"><stop stop-color="#9b412b"/><stop offset=".48" stop-color="#e98b56"/><stop offset="1" stop-color="#ab4a2e"/></linearGradient></defs><ellipse cx="90" cy="128" rx="76" ry="12" fill="#000" opacity=".16"/><ellipse cx="90" cy="105" rx="78" ry="34" fill="url(#wh-crust)" stroke="#9c542b" stroke-width="2"/><ellipse cx="90" cy="99" rx="72" ry="30" fill="#c94c35" stroke="#f4b96a" stroke-width="7"/><ellipse cx="90" cy="99" rx="64" ry="24" fill="#f5ce72"/><g fill="#bf4e36" stroke="#a33e2f" stroke-width="1.5"><ellipse cx="72" cy="111" rx="8" ry="5"/><ellipse cx="110" cy="94" rx="8" ry="5"/><ellipse cx="36" cy="95" rx="7" ry="4"/><ellipse cx="121" cy="113" rx="8" ry="5"/></g><g fill="#52834a"><path d="M83 94q-14-13-17-3q7 6 17 3M99 116q-3-14-10-9q0 9 10 9M144 100q-9-9-12-2q6 4 12 2"/></g>' + candles.map(([x,y], i) => '<g transform="translate(' + x + ' ' + y + ')"><ellipse cy="23" rx="11" ry="4" fill="#91462b" opacity=".22"/><rect x="-8" y="-21" width="16" height="46" rx="8" fill="url(#wh-sausage)" stroke="#91462b" stroke-width="1.5"/><path d="M-4-11l7 3m-7 9l7 3m-7 9l7 3" stroke="#f3b17b" stroke-width="2" stroke-linecap="round"/><path d="M0-22v-6" stroke="#543a2a" stroke-width="2" stroke-linecap="round"/>' + (i < state.lit ? '<g class="wh-flame-wrap ' + (light && i === state.lit - 1 ? 'wh-ignite' : '') + '"><g class="wh-flame"><path d="M0-29c-12-2-9-14 0-24-2 11 13 15 0 24" fill="#ffba4b"/><path d="M0-29c-6-2-4-8 0-13 4 6 5 10 0 13" fill="#fff1b0"/></g></g>' : '') + '</g>').join('') + '</svg>';
  }
  function renderAdvent() {
    const header = document.querySelector(".app-header"), logo = header?.querySelector(".logo-header");
    if (!logo) return;
    const state = C.advent(WRCHolidayData.today());
    let mount = document.getElementById("wrcAdventPizza");
    header.classList.toggle("wh-advent-header", !!state);
    if (!state) { mount?.remove(); return; }
    if (!mount) { mount = document.createElement("div"); mount.id = "wrcAdventPizza"; mount.className = "wh-advent-pizza"; logo.prepend(mount); }
    if (mount.dataset.date === state.date) return;
    mount.dataset.date = state.date;
    mount.innerHTML = pizza(state, ignition(state));
  }
  function gift() {
    return '<div class="wh-gift-scene" aria-hidden="true"><svg viewBox="0 0 240 190"><defs><radialGradient id="wh-gift-light"><stop stop-color="#fff2b3" stop-opacity=".85"/><stop offset="1" stop-color="#ffd56a" stop-opacity="0"/></radialGradient><linearGradient id="wh-gold"><stop stop-color="#bd7c23"/><stop offset=".45" stop-color="#ffe4a0"/><stop offset="1" stop-color="#d99933"/></linearGradient></defs><ellipse cx="120" cy="176" rx="72" ry="9" fill="#000" opacity=".18"/><g class="wh-gift-box"><ellipse class="wh-gift-light" cx="120" cy="95" rx="95" ry="80" fill="url(#wh-gift-light)"/><g class="wh-gift-wurst"><path d="M88 91c-5-30 40-37 57-17" fill="none" stroke="#ab7329" stroke-width="22" stroke-linecap="round"/><path d="M88 88c-3-23 36-31 55-15" fill="none" stroke="url(#wh-gold)" stroke-width="17" stroke-linecap="round"/><path d="m86 91-7 8 11-1m54-26 10-3-4 11" fill="#e7b34e"/><path d="m107 66 3 9m11-12 2 9m12-6-1 9" stroke="#ad752a" stroke-width="2"/><path d="m76 51 3-7 3 7 7 3-7 3-3 7-3-7-7-3zm81 43 2-5 2 5 5 2-5 2-2 5-2-5-5-2z" fill="#fff0ba"/></g><rect x="61" y="112" width="118" height="59" rx="6" fill="#315d50" stroke="#63917a" stroke-width="2"/><path d="M66 122h108M66 158h108" stroke="#83a488" opacity=".25"/><rect x="110" y="112" width="20" height="59" fill="url(#wh-gold)"/><g class="wh-gift-lid"><rect x="54" y="100" width="132" height="20" rx="5" fill="#477663" stroke="#82a78b" stroke-width="2"/><rect x="109" y="100" width="22" height="20" fill="url(#wh-gold)"/><g class="wh-gift-bow" fill="none" stroke="#edcc7d" stroke-width="6"><path d="M120 99C63 93 85 57 120 96c35-39 57-3 0 3Z"/><path d="m117 99-16 16m22-16 17 16"/></g></g></g></svg></div>';
  }
  function shoe() { return '<div class="wh-shoe" aria-hidden="true"><span class="wh-shoe-cookie">🍪</span><span class="wh-shoe-mandarin">🍊</span><svg viewBox="0 0 180 130"><path d="M57 31h59v52c8 6 20 10 35 11 13 1 17 20 2 24H36c-9 0-12-9-8-17L52 66Z" fill="#a94e3f" stroke="#713e35" stroke-width="3"/><path d="M50 32q34-8 70 0v19q-36-7-70 0Z" fill="#f0e5cf" stroke="#d8c7ab" stroke-width="2"/><path d="M29 111h126" stroke="#e7bf78" stroke-width="8" stroke-linecap="round"/><path d="m77 63 23 4m-26 7 26 4m-27 7 24 3" stroke="#f3cc8a" stroke-width="3" stroke-linecap="round"/></svg></div>'; }
  window.WRCChristmasSeason = Object.freeze({ renderAdvent, ignition, pizza, gift, shoe });
})();
