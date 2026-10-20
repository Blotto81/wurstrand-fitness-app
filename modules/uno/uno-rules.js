(function () {
  'use strict';
  const host = document.getElementById('unoPanel');
  const anchor = host && host.querySelector('.uno-submenu');
  const data = window.WRCUnoRules;
  if (!anchor || !data || document.getElementById('unoRulesLaunch')) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const launch = document.createElement('button');
  launch.type = 'button'; launch.id = 'unoRulesLaunch'; launch.className = 'ur-launch';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.innerHTML = '<span class="ur-launch-icon" aria-hidden="true">📖</span><span><strong>Unsere UNO-Regeln</strong><small>Classic & Flip · Hausregeln, Karten und Punkte</small></span><span aria-hidden="true">↗</span>';
  anchor.after(launch);
  const book = document.createElement('dialog');
  book.id = 'unoRulesDialog'; book.className = 'ur-dialog'; book.setAttribute('aria-labelledby', 'urTitle');
  book.innerHTML = `
    <div class="ur-topbar"><span>WRC <b>/</b> UNO-Regelwerk</span><button type="button" data-ur-close>← Zur UNO-Übersicht</button></div>
    <div class="ur-scroll">
      <header class="ur-hero"><span class="ur-eyebrow">UNSERE RUNDE. UNSERE REGELN.</span><h2 id="urTitle">🃏 Die heiligen UNO-Gesetze der WRC</h2><p>Amtlich beschlossen. Heiß diskutiert.<br>Mit Strafkarten durchgesetzt.</p><span class="ur-seal" aria-hidden="true">WRC<br><small>HAUSRECHT</small></span></header>
      <div class="ur-body">
        <div class="ur-variants" aria-label="UNO-Variante">${Object.entries(data.variants).map(([id, v]) => `<button type="button" class="ur-variant" data-ur-variant="${id}" aria-pressed="${id === 'classic'}"><span class="ur-variant-icon" aria-hidden="true">${id === 'classic' ? '♠' : '◐'}</span><span><strong>${v.name}</strong><small>${v.subtitle}</small></span><span class="ur-selected" aria-hidden="true">✓</span></button>`).join('')}</div>
        <section class="ur-quick-section" aria-labelledby="urQuickTitle"><div class="ur-section-heading"><h3 id="urQuickTitle">Kurz nachschlagen. Weiterspielen.</h3><span>DER SCHNELLZUGRIFF</span></div><div class="ur-quick" id="urQuick"></div></section>
        <div class="ur-search"><label for="urSearch">Regel oder Karte finden</label><div class="ur-search-field"><span aria-hidden="true">⌕</span><input id="urSearch" type="search" placeholder="Welche Regel suchst du?" autocomplete="off"><button type="button" id="urClear" aria-label="Suche löschen" hidden>×</button></div><p id="urSearchStatus" role="status" aria-live="polite"></p><div id="urResults" class="ur-results" hidden></div></div>
        <section aria-labelledby="urRulesTitle"><div class="ur-section-heading"><h3 id="urRulesTitle">Das Hausrecht</h3><span>VERBINDLICH BEI UNS</span></div><div id="urRules" class="ur-rules"></div></section>
        <section class="ur-gallery-section" aria-labelledby="urGalleryTitle"><div class="ur-section-heading"><div><h3 id="urGalleryTitle">Karten unter der Lupe</h3><p>Antippen für Funktion und Punktwert.</p></div><span id="urCardCount"></span></div><div class="ur-gallery-tools"><div id="urSides" class="ur-segment" aria-label="Flip-Kartenseite" hidden><button type="button" data-ur-side="light" aria-pressed="true">☀ Helle Seite</button><button type="button" data-ur-side="dark" aria-pressed="false">☾ Dunkle Seite</button></div><div class="ur-segment" aria-label="Kartentyp"><button type="button" data-ur-filter="special" aria-pressed="true">Besondere Karten</button><button type="button" data-ur-filter="all" aria-pressed="false">Alle Karten</button></div></div><div id="urGallery" class="ur-gallery"></div><p class="ur-photo-note">Originalfotos sind dort hinterlegt, wo sie bereits vorliegen. Weitere Karten behalten ihren reservierten Platz.</p></section>
        <footer class="ur-footer"><strong>WRC-Hausregeln haben hier das letzte Wort.</strong><p>Unsere Abweichungen stehen oben. Für die fotografierten Flip-Karten gelten die Punkte aus unserer WRC-Kartenübersicht. Übrige Kartenfunktionen und Punktwerte basieren auf den Mattel-Anleitungen für <a href="https://service.mattel.com/instruction_sheets/UNO%20Basic%20IS.pdf" target="_blank" rel="noopener noreferrer">UNO Classic</a> und <a href="https://service.mattel.com/instruction_sheets/GDR44-English.pdf" target="_blank" rel="noopener noreferrer">UNO Flip</a>.</p></footer>
      </div>
    </div>`;
  document.body.append(book);
  const detail = document.createElement('dialog');
  detail.className = 'ur-dialog ur-card-dialog'; detail.setAttribute('aria-labelledby', 'urDetailTitle');
  document.body.append(detail);
  let variant = 'classic', side = 'light', filter = 'special', previousOverflow = '', previousRootOverflow = '', cardOpener;
  const $ = selector => book.querySelector(selector);
  function photo(card, large = false) {
    const src = data.images[card.id];
    const rotated = data.photoCatalog[card.id]?.rotation === 90;
    return `<div class="ur-photo${src ? ' ur-photo-original' : ''}${large ? ' ur-photo-large' : ''}"><div class="ur-photo-placeholder"${src ? ' hidden' : ''}><span aria-hidden="true">▧</span><small>WRC · KARTENARCHIV</small><strong>Originalfoto<br>folgt</strong></div>${src ? `<span class="ur-photo-media${rotated ? ' ur-photo-rotated' : ''}"><img src="${esc(src)}" alt="Originalfoto: ${esc(card.name)}" loading="lazy" decoding="async"></span>` : ''}</div>`;
  }
  function bindImageFallback(parent) {
    parent.querySelectorAll('.ur-photo img').forEach(img => img.addEventListener('error', () => { img.parentElement.hidden = true; img.closest('.ur-photo').querySelector('.ur-photo-placeholder').hidden = false; }, { once: true }));
  }
  const chain = values => `<div class="ur-chain">${values.map((value, i) => `${i ? '<span class="ur-arrow" aria-hidden="true">→</span>' : ''}<span class="ur-chain-chip">${esc(value)}</span>`).join('')}</div>`;
  function renderRules() {
    $('#urRules').innerHTML = data.getRules(variant).map((r, index) => `<details id="ur-rule-${r.id}"><summary><span class="ur-rule-index">${String(index + 1).padStart(2, '0')}</span><span>${esc(r.title)}</span><span class="ur-chevron" aria-hidden="true">+</span></summary><div class="ur-rule-content"><p>${esc(r.text)}</p>${r.chain ? chain(r.chain) : ''}${r.chains ? r.chains.map(chain).join('') : ''}${r.note ? `<p class="ur-note">${esc(r.note)}</p>` : ''}${r.cases ? `<div class="ur-cases">${r.cases.map(c => `<div class="ur-case ur-${c.tone}"><strong>${esc(c.label)}</strong><p>${esc(c.text)}</p></div>`).join('')}</div>` : ''}</div></details>`).join('');
    const quick = [
      ['jump','↻','Zwischenwerfen','Gleiche Farbe. Gleiche Zahl.'],
      ['swap','⇄','Kartentausch',`Die ${data.variants[variant].swap} tauscht. Immer.`],
      ['penalty','!','Strafkarten','Vergessen kann teuer werden.'],
      ['stack','+','Abwehren',variant === 'flip' ? 'Die Kette wird länger.' : 'Was feststeht. Was offen ist.'],
      ['end','⚑','Spielende','Über 1.000? Verloren.']
    ];
    $('#urQuick').innerHTML = quick.map(([id, icon, name, desc]) => `<button type="button" data-ur-rule="${id}"><span class="ur-quick-icon" aria-hidden="true">${icon}</span><strong>${name}</strong><small>${desc}</small><span class="ur-quick-arrow" aria-hidden="true">↗</span></button>`).join('');
  }
  function renderGallery() {
    $('#urSides').hidden = variant !== 'flip';
    const shown = data.getCards(variant, variant === 'flip' ? side : '').filter(c => filter === 'all' || !c.number || c.symbol === String(data.variants[variant].swap));
    $('#urCardCount').textContent = `${shown.length} KARTEN`;
    $('#urGallery').innerHTML = shown.map(c => `<button type="button" class="ur-card" data-ur-card="${c.id}" aria-label="${esc(c.name)}, ${c.points} Punkte – Details">${photo(c)}<span class="ur-card-meta"><strong>${esc(c.name)}</strong><span class="ur-points">${c.points}<small>PKT</small></span></span><span class="ur-card-description">${esc(c.description)}</span><span class="ur-card-more">Karte ansehen <span aria-hidden="true">↗</span></span></button>`).join('');
    book.dataset.variant = variant; book.dataset.side = variant === 'flip' ? side : 'classic';
    bindImageFallback($('#urGallery'));
  }
  function renderSearch() {
    const q = $('#urSearch').value.trim();
    $('#urClear').hidden = !q; $('#urResults').hidden = !q;
    const matches = data.search(variant, q);
    $('#urSearchStatus').textContent = !q ? '' : matches.length ? `${matches.length} Treffer in ${data.variants[variant].name}` : 'Keine Treffer. Versuch es mit „Tauschen“, „Punkte“ oder einer Kartenzahl.';
    $('#urResults').innerHTML = matches.map(m => `<button type="button" data-ur-${m.kind}="${m.id}"><span><strong>${esc(m.name)}</strong><small>${m.kind === 'rule' ? 'Hausregel' : `${m.side ? (m.side === 'light' ? 'Helle Seite · ' : 'Dunkle Seite · ') : ''}${m.points} Punkte`}</small></span><span aria-hidden="true">↗</span></button>`).join('');
  }
  function openRule(id) {
    const rule = document.getElementById(`ur-rule-${id}`);
    if (!rule) return;
    rule.open = true;
    rule.querySelector('summary').focus({ preventScroll: true });
    rule.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function openCard(id, opener) {
    const card = data.cards.find(c => c.id === id && c.variant === variant);
    if (!card) return;
    cardOpener = opener;
    detail.innerHTML = `<div class="ur-topbar"><span>KARTENARCHIV</span><button type="button" data-ur-detail-close aria-label="Kartendetails schließen">Schließen ×</button></div><div class="ur-detail-body">${photo(card, true)}<div><span class="ur-eyebrow">${data.variants[variant].name}${card.side ? ' · ' + (card.side === 'light' ? 'Helle Seite' : 'Dunkle Seite') : ''}</span><h3 id="urDetailTitle">${esc(card.name)}</h3><span class="ur-detail-points">${card.points} <small>Punkte</small></span>${card.pointSource ? `<small class="ur-point-source">${esc(card.pointSource)}</small>` : ''}<p>${esc(card.detail)}</p>${card.symbol === String(data.variants[variant].swap) ? '<div class="ur-note">WRC-Hausregel · Pflichttausch</div>' : ''}</div></div>`;
    bindImageFallback(detail); detail.showModal();
  }
  function openBook(push = true) {
    if (book.open) return;
    previousOverflow = document.body.style.overflow;
    previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    book.showModal();
    if (push) history.pushState({ ...history.state, unoRules: true }, '');
    $('[data-ur-close]').focus();
  }
  function closeBook() { if (detail.open) detail.close(); if (book.open) book.close(); }
  launch.addEventListener('click', () => openBook());
  book.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    document.documentElement.style.overflow = previousRootOverflow;
    if (history.state && history.state.unoRules) history.back();
    launch.focus({ preventScroll: true });
  });
  window.addEventListener('popstate', () => {
    if (history.state && history.state.unoRules) openBook(false); else closeBook();
  });
  detail.addEventListener('close', () => { if (cardOpener && cardOpener.isConnected && book.open) cardOpener.focus({ preventScroll: true }); });
  detail.addEventListener('click', e => { if (e.target.closest('[data-ur-detail-close]') || e.target === detail) detail.close(); });
  book.addEventListener('click', e => {
    const target = e.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-ur-close')) closeBook();
    if (target.dataset.urVariant && target.dataset.urVariant !== variant) {
      variant = target.dataset.urVariant;
      book.querySelectorAll('[data-ur-variant]').forEach(b => b.setAttribute('aria-pressed', String(b === target)));
      renderRules(); renderGallery(); renderSearch();
    }
    if (target.dataset.urSide) {
      side = target.dataset.urSide;
      book.querySelectorAll('[data-ur-side]').forEach(b => b.setAttribute('aria-pressed', String(b === target))); renderGallery();
    }
    if (target.dataset.urFilter) {
      filter = target.dataset.urFilter;
      book.querySelectorAll('[data-ur-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === target))); renderGallery();
    }
    if (target.dataset.urRule) openRule(target.dataset.urRule);
    if (target.dataset.urCard) openCard(target.dataset.urCard, target);
  });
  $('#urSearch').addEventListener('input', renderSearch);
  $('#urClear').addEventListener('click', () => { $('#urSearch').value = ''; renderSearch(); $('#urSearch').focus(); });
  renderRules(); renderGallery();
})();
