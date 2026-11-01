(function () {
  "use strict";
  let active = null;
  const candleCount = age => Math.min(8, Math.max(1, age));
  function artwork(age) {
    const count = candleCount(age);
    const candles = Array.from({length: count}, (_, i) => {
      const x = 180 + (i - (count - 1) / 2) * 19;
      return '<g class="wb-candle" transform="translate('+x+' 0)"><rect x="-6" y="112" width="12" height="34" rx="6" fill="#cd7049" stroke="#713f36"/><path d="m-4 121 8 3m-8 6 8 3" stroke="#f3ae72"/><path d="M0 112v-7" stroke="#4e3433" stroke-width="2"/><path class="wb-flame" d="M0 89C-1 97-8 99-5 104c4 8 14 1 9-5Z" fill="#ffd27a"/><path class="wb-smoke" d="M0 103q-7-7 0-13t0-13" fill="none" stroke="#e8d8c7" stroke-width="2"/></g>';
    }).join('');
    return '<svg viewBox="0 0 360 260" role="img" aria-label="Wursti und Bertha mit Geburtstagstorte und '+count+' Wurstkerzen"><defs><linearGradient id="wb-icing" x2="0" y2="1"><stop stop-color="#fff2d8"/><stop offset="1" stop-color="#e9c397"/></linearGradient></defs><ellipse cx="180" cy="233" rx="149" ry="16" fill="#070d19" opacity=".3"/><g class="wb-wursti" stroke="#573735" stroke-width="2" stroke-linecap="round"><path d="m44 211-9 17m26-17 10 17M34 164l-14 13m49-14 20-8" fill="none"/><rect x="31" y="130" width="39" height="83" rx="19" fill="#d8754c"/><path d="m34 132 14-33 18 33Z" fill="#eac572"/><path d="m40 119 16 4m-12-12 7 2" stroke="#b68cae"/><circle cx="43" cy="153" r="2"/><circle cx="58" cy="153" r="2"/><path class="wb-smile" d="M43 166q8 8 15 0" fill="none"/><ellipse class="wb-pout" cx="60" cy="166" rx="4" ry="5" fill="#713f36"/></g><g class="wb-bertha" stroke="#594238" stroke-width="2" stroke-linecap="round"><path d="m298 210-9 18m27-18 10 18m-32-56-16-11m47 9 15 10" fill="none"/><path d="M295 143c33-27 58 20 30 60-24 32-57-30-30-60Z" fill="#d1ac77"/><path d="m292 144 18-35 18 35Z" fill="#bba6d7"/><circle cx="303" cy="162" r="2"/><circle cx="319" cy="162" r="2"/><path class="wb-smile" d="M303 175q8 7 16-1" fill="none"/><path class="wb-brows" d="m299 154 9 4m6 0 9-5" fill="none"/></g><g class="wb-cake"><ellipse cx="180" cy="222" rx="92" ry="10" fill="#d6b77b"/><rect x="98" y="154" width="164" height="63" rx="12" fill="#bb7890"/><path d="M99 189h162M99 200h162" stroke="#ecc3b5" stroke-width="8"/><path d="M98 157q0-16 18-16h128q18 0 18 16v15q-8 14-15 0v-7q-7-9-14 0v12q-8 12-15 0v-13H147v9q-8 14-15 0v-8q-8-10-15 0v13q-12 6-19-9Z" fill="url(#wb-icing)"/><text x="180" y="185" text-anchor="middle" fill="#58384a" font-size="18" font-weight="800">'+age+'. WRC</text>'+candles+'</g><g class="wb-wind" fill="none" stroke="#d9f0eb" stroke-width="3" stroke-linecap="round"><path d="M76 159q50-20 99-7m-90 16q60-8 120 1m-100-28q42-12 80-7"/></g><g class="wb-confetti" fill="#eac572"><circle cx="110" cy="47" r="3"/><path d="m244 54 5 8-9 1Z"/><path d="m167 31 6 3-3 6-6-3Z"/><circle cx="274" cy="85" r="3"/><path d="m80 81 5 6-8 2Z"/></g></svg>';
  }
  function show(age, done) {
    if (active || !Number.isInteger(age) || age < 1) return false;
    const origin = document.activeElement, dialog = document.createElement('dialog');
    const timers = [];
    dialog.className = 'wb-dialog';
    dialog.setAttribute('aria-labelledby', 'wb-title');
    dialog.innerHTML = '<div class="wb-top"><span>WURSTI & BERTHA LADEN EIN</span><button type="button" data-wb-close aria-label="Geburtstagsszene schließen">Schließen</button></div><p class="wb-eyebrow">'+age+'. WRC-GEBURTSTAG · 1. FEBRUAR</p><h2 id="wb-title">🎉 Happy Wurstday, WRC!</h2><div class="wb-stage">'+artwork(age)+'</div><div class="wb-lines" aria-live="polite"><p data-wb-line>Eine Torte. Zwei Profis. Was soll schon schiefgehen?</p></div><button class="wb-next" type="button" data-wb-next>Überspringen</button>';
    const finish = reason => {
      if (active !== dialog) return;
      timers.forEach(clearTimeout);
      active = null;
      dialog.close(); dialog.remove();
      document.body.classList.remove('wrc-birthday-intro-active');
      document.removeEventListener('visibilitychange', hidden);
      if (origin?.isConnected) origin.focus();
      done(reason);
    };
    const hidden = () => { if (document.hidden) finish('close'); };
    const phase = (name, text) => {
      dialog.dataset.phase = name;
      dialog.querySelector('[data-wb-line]').textContent = text;
    };
    active = dialog; document.body.append(dialog);
    document.body.classList.add('wrc-birthday-intro-active');
    dialog.querySelector('[data-wb-close]').onclick = () => finish('close');
    dialog.querySelector('[data-wb-next]').onclick = () => finish('next');
    dialog.addEventListener('cancel', e => { e.preventDefault(); finish('close'); });
    document.addEventListener('visibilitychange', hidden);
    dialog.showModal(); dialog.querySelector('[data-wb-next]').focus();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      phase('static', 'Bertha: „Man muss nicht alles mit Gewalt lösen, Wursti.“ Wursti: „Ich wollte nur den Kalorienverbrauch erhöhen.“');
      const greeting = document.createElement('p');
      greeting.textContent = 'Alles Gute, WRC! Danke, dass du Teil dieser Geschichte bist.';
      dialog.querySelector('.wb-lines').append(greeting);
      dialog.querySelector('[data-wb-next]').textContent = 'Geburtstagsbrief öffnen';
    } else {
      phase('arrival', 'Eine Torte. Zwei Profis. Was soll schon schiefgehen?');
      [[1800,'inhale','Wursti: „Das übernehme ich. Ich habe trainiert.“'],
       [3000,'gust','Huuuu! — Bertha: „WURSTI!“'],
       [4500,'puff','Bertha: „Pff.“'],
       [5500,'out','Bertha: „Man muss nicht alles mit Gewalt lösen, Wursti.“'],
       [7200,'reply','Wursti: „Ich wollte nur den Kalorienverbrauch erhöhen.“']
      ].forEach(([ms,name,text])=>timers.push(setTimeout(()=>phase(name,text),ms)));
      timers.push(setTimeout(()=>finish('next'),9800));
    }
    return true;
  }
  window.WRCBirthdayScene = Object.freeze({show, candleCount, artwork});
})();
