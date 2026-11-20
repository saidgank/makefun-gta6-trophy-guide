// Leonida Legend — boot and rendering. Loads the trophy list, restores progress, and draws the four views:
// checklist with guide pane, platinum roadmap, missables, and save & data. All state changes re-render from
// the store, and every change is saved to localStorage at once.

import { GRADE_LABEL, GRADE_ORDER, KIND_LABEL, STAGES, loadTrophies } from './data.js';
import { exportProgress, loadProgress, parseImportedProgress, saveProgress } from './store.js';
import { filterState, isSpoiled, nextUp, trophyMatches } from './filters.js';

const state = {
  trophies: [],
  progress: loadProgress(),
  selectedId: null,
  view: 'checklist',
};

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function byId(id) {
  return state.trophies.find((t) => t.id === id) ?? null;
}

function earnedCount() {
  return state.trophies.filter((t) => state.progress.earned[t.id] === true).length;
}

function persistAndRender() {
  saveProgress(state.progress);
  renderProgressCard();
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

// ---------- header progress ----------

function renderProgressCard() {
  const earned = earnedCount();
  document.getElementById('earned-count').textContent = String(earned);
  document.getElementById('progress-fill').style.width = `${(earned / state.trophies.length) * 100}%`;
  const tallies = GRADE_ORDER.map((grade) => {
    const total = state.trophies.filter((t) => t.grade === grade).length;
    const got = state.trophies.filter((t) => t.grade === grade && state.progress.earned[t.id] === true).length;
    return `<span class="tally"><span class="swatch swatch-${grade}"></span>${GRADE_LABEL[grade]} <b>${got}/${total}</b></span>`;
  });
  document.getElementById('grade-tallies').innerHTML = tallies.join('');
}

// ---------- checklist ----------

function badgeRow(trophy) {
  const badges = [`<span class="badge badge-grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>`];
  if (trophy.missable) badges.push('<span class="badge badge-missable">MISSABLE</span>');
  if (trophy.target) {
    const count = state.progress.counts[trophy.id] ?? 0;
    badges.push(`<span class="badge badge-count">${count.toLocaleString('en-US')} / ${trophy.target.toLocaleString('en-US')}</span>`);
  }
  return badges.join('');
}

function rowHtml(trophy) {
  const earned = state.progress.earned[trophy.id] === true;
  const spoiled = isSpoiled(trophy, state.progress);
  const name = spoiled ? 'Hidden story trophy' : trophy.name;
  const desc = spoiled ? 'Name and description hidden by spoiler mode until you earn it.' : trophy.description;
  const selected = state.selectedId === trophy.id ? ' is-selected' : '';
  const classes = `trophy-row${selected}${earned ? ' is-earned' : ''}${spoiled ? ' is-spoiled' : ''}`;
  return `<li>
    <div class="${classes}" data-trophy-id="${trophy.id}" role="button" tabindex="0">
      <input type="checkbox" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(name)} as earned">
      <span class="trophy-main">
        <span class="trophy-name">${esc(name)}</span><br>
        <span class="trophy-desc">${esc(desc)}</span>
      </span>
      <span class="row-badges">${badgeRow(trophy)}</span>
    </div>
  </li>`;
}

function renderChecklist() {
  const visible = state.trophies.filter((t) => trophyMatches(t, state.progress));
  const list = document.getElementById('trophy-list');
  list.innerHTML = visible.length
    ? visible.map(rowHtml).join('')
    : '<li class="empty-note">No trophies match these filters.</li>';

  const next = nextUp(state.trophies, state.progress);
  const names = next.map((t) => `<span class="next-name">${esc(isSpoiled(t, state.progress) ? 'a hidden story trophy' : t.name)}</span>`);
  document.getElementById('next-up').innerHTML = next.length
    ? `<b>Next up</b> (roadmap order): ${names.join(' · ')}`
    : '<b>All 55 earned — you are a Leonida Legend.</b>';

  renderDetail();
}

function counterHtml(trophy) {
  if (!trophy.target) return '';
  const count = state.progress.counts[trophy.id] ?? 0;
  const done = count >= trophy.target
    ? '<span class="counter-done">Target reached — tick it off above.</span>'
    : '';
  return `<div class="counter-box">
    <button type="button" data-count-delta="-1" aria-label="Decrease counter">−</button>
    <input type="number" id="counter-input" min="0" max="${trophy.target}" value="${count}" aria-label="Your count">
    <button type="button" data-count-delta="1" aria-label="Increase counter">+</button>
    <span class="counter-label">of ${trophy.target.toLocaleString('en-US')} — ${esc(trophy.targetLabel ?? '')}</span>
    ${done}
  </div>`;
}

function renderDetail() {
  const pane = document.getElementById('detail-pane');
  const trophy = byId(state.selectedId) ?? state.trophies[0];
  if (!trophy) {
    pane.innerHTML = '<p class="empty-note">Loading the trophy list…</p>';
    return;
  }
  const earned = state.progress.earned[trophy.id] === true;
  const spoiled = isSpoiled(trophy, state.progress);
  const badges = [
    `<span class="badge badge-grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>`,
    `<span class="badge">${KIND_LABEL[trophy.kind] ?? trophy.kind}</span>`,
    `<span class="badge">Roadmap stage ${trophy.stage}</span>`,
  ];
  if (trophy.missable) badges.push('<span class="badge badge-missable">MISSABLE</span>');
  if (trophy.hidden) badges.push('<span class="badge">Hidden on PSN until earned</span>');

  if (spoiled) {
    pane.innerHTML = `<h2>Hidden story trophy</h2>
      <p class="detail-desc">Spoiler mode is on: this story trophy's name, description and guide stay hidden until you earn it.</p>
      <div class="detail-badges">${badges.join('')}</div>
      <p class="detail-guide">Turn spoiler mode off in the toolbar if you would rather read ahead.</p>
      <div class="detail-actions">
        <button type="button" class="earn-btn${earned ? ' is-earned' : ''}" data-toggle-earn="${trophy.id}">${earned ? 'Earned ✓ — tap to undo' : 'Mark as earned'}</button>
      </div>`;
    return;
  }

  pane.innerHTML = `<h2>${esc(trophy.name)}</h2>
    <p class="detail-desc">“${esc(trophy.description)}”</p>
    <div class="detail-badges">${badges.join('')}</div>
    ${counterHtml(trophy)}
    <p class="detail-guide">${esc(trophy.guide)}</p>
    <p class="detail-sources">${esc(trophy.sources)}</p>
    <div class="detail-actions">
      <button type="button" class="earn-btn${earned ? ' is-earned' : ''}" data-toggle-earn="${trophy.id}">${earned ? 'Earned ✓ — tap to undo' : 'Mark as earned'}</button>
    </div>`;
}

// ---------- roadmap ----------

function renderRoadmap() {
  const wrap = document.getElementById('roadmap-stages');
  wrap.innerHTML = STAGES.map((stage) => {
    const members = state.trophies.filter((t) => t.stage === stage.n);
    const got = members.filter((t) => state.progress.earned[t.id] === true).length;
    const chips = members.map((t) => {
      const earned = state.progress.earned[t.id] === true;
      const label = isSpoiled(t, state.progress) ? 'Hidden story trophy' : t.name;
      return `<button type="button" class="stage-chip${earned ? ' is-earned' : ''}" data-open-trophy="${t.id}">${earned ? '✓ ' : ''}${esc(label)}${t.missable ? ' ⚠' : ''}</button>`;
    });
    return `<article class="stage-card">
      <h3>${esc(stage.title)}</h3>
      <p>${esc(stage.text)}</p>
      <div class="stage-progress">${got} of ${members.length} earned</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${members.length ? (got / members.length) * 100 : 0}%"></div></div>
      <div class="stage-trophies">${chips.join('')}</div>
    </article>`;
  }).join('');
}

// ---------- missables ----------

function renderMissables() {
  const wrap = document.getElementById('missable-cards');
  const missables = state.trophies.filter((t) => t.missable === true);
  wrap.innerHTML = missables.map((t) => `<article class="missable-card">
    <h3>${esc(t.name)} <span class="badge badge-grade-${t.grade}">${GRADE_LABEL[t.grade]}</span> <span class="badge badge-missable">MISSABLE</span></h3>
    <p>“${esc(t.description)}” — roadmap stage ${t.stage}</p>
    <p class="detail-guide">${esc(t.guide)}</p>
    <p class="detail-sources">${esc(t.sources)}</p>
    <button type="button" class="action-btn" data-open-trophy="${t.id}">Open in the checklist</button>
  </article>`).join('');
}

// ---------- view switching ----------

function showView(view) {
  state.view = view;
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.view === view));
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('is-active', section.id === `view-${view}`));
}

function openTrophy(id) {
  state.selectedId = id;
  filterState.kind = 'all';
  filterState.grade = 'all';
  filterState.query = '';
  filterState.hideEarned = false;
  document.getElementById('search').value = '';
  document.getElementById('grade-filter').value = 'all';
  document.getElementById('hide-earned-toggle').checked = false;
  document.querySelectorAll('#kind-chips .chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.kind === 'all'));
  showView('checklist');
  renderChecklist();
}

// ---------- actions ----------

function toggleEarned(id) {
  if (state.progress.earned[id] === true) delete state.progress.earned[id];
  else state.progress.earned[id] = true;
  state.selectedId = id;
  persistAndRender();
}

function setCount(id, value) {
  const trophy = byId(id);
  if (!trophy || !trophy.target) return;
  const clamped = Math.max(0, Math.min(trophy.target, Math.floor(Number(value) || 0)));
  state.progress.counts[id] = clamped;
  persistAndRender();
}

function wireEvents() {
  document.getElementById('tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('[data-view]');
    if (tab) showView(tab.dataset.view);
  });

  document.getElementById('search').addEventListener('input', (event) => {
    filterState.query = event.target.value;
    renderChecklist();
  });

  document.getElementById('kind-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    filterState.kind = chip.dataset.kind;
    document.querySelectorAll('#kind-chips .chip').forEach((c) => c.classList.toggle('is-active', c === chip));
    renderChecklist();
  });

  document.getElementById('grade-filter').addEventListener('change', (event) => {
    filterState.grade = event.target.value;
    renderChecklist();
  });

  document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
    state.progress.spoilers = event.target.checked;
    persistAndRender();
  });

  document.getElementById('hide-earned-toggle').addEventListener('change', (event) => {
    filterState.hideEarned = event.target.checked;
    renderChecklist();
  });

  document.getElementById('trophy-list').addEventListener('click', (event) => {
    const earnBox = event.target.closest('[data-earn]');
    if (earnBox) {
      toggleEarned(Number(earnBox.dataset.earn));
      return;
    }
    const row = event.target.closest('[data-trophy-id]');
    if (row) {
      state.selectedId = Number(row.dataset.trophyId);
      renderChecklist();
    }
  });

  document.getElementById('detail-pane').addEventListener('click', (event) => {
    const earnBtn = event.target.closest('[data-toggle-earn]');
    if (earnBtn) {
      toggleEarned(Number(earnBtn.dataset.toggleEarn));
      return;
    }
    const deltaBtn = event.target.closest('[data-count-delta]');
    if (deltaBtn && state.selectedId != null) {
      const current = state.progress.counts[state.selectedId] ?? 0;
      setCount(state.selectedId, current + Number(deltaBtn.dataset.countDelta));
    }
  });

  document.getElementById('detail-pane').addEventListener('change', (event) => {
    if (event.target.id === 'counter-input' && state.selectedId != null) {
      setCount(state.selectedId, event.target.value);
    }
  });

  document.querySelector('main').addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-trophy]');
    if (opener) openTrophy(Number(opener.dataset.openTrophy));
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([exportProgress(state.progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-legend-progress.json';
    link.click();
    URL.revokeObjectURL(url);
    document.getElementById('save-note').textContent = 'Progress exported — keep the file somewhere safe.';
  });

  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state.progress = parseImportedProgress(await file.text());
      document.getElementById('spoiler-toggle').checked = state.progress.spoilers;
      persistAndRender();
      document.getElementById('save-note').textContent = 'Progress imported.';
    } catch {
      document.getElementById('save-note').textContent = 'That file could not be read as Leonida Legend progress.';
    }
    event.target.value = '';
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!window.confirm('Erase every earned trophy, counter and setting saved in this browser?')) return;
    state.progress = { earned: {}, counts: {}, spoilers: true };
    document.getElementById('spoiler-toggle').checked = true;
    persistAndRender();
    document.getElementById('save-note').textContent = 'All progress erased.';
  });
}

// ---------- boot ----------

async function boot() {
  try {
    state.trophies = await loadTrophies();
  } catch (error) {
    document.getElementById('trophy-list').innerHTML = `<li class="empty-note">The trophy list failed to load (${esc(error.message)}). Serve the app/ folder over HTTP and reload.</li>`;
    return;
  }
  state.selectedId = 37; // open on the missable VCIA trophy: the guide at its most useful
  document.getElementById('spoiler-toggle').checked = state.progress.spoilers;
  wireEvents();
  renderProgressCard();
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

boot();
