// GTA VI trophy guide & tracker: checklist saved in localStorage, filters by kind,
// search, a spoiler setting for story trophies, a roadmap to the platinum, and a
// guide panel with sources for every trophy. Offline: the only fetch is trophies.json.
const KEY = 'gta6-trophy-guide-progress';
const DEMO_EARNED = [2, 3, 4, 5, 8, 15, 16, 19, 21, 28, 35, 42, 44, 53];
const ROADMAP = [
  { title: 'Stage 1 — First playthrough: the story, in order', text: 'Play Chapters 1–4 and the final mission in order. Do the mission trophies as you reach each named mission, and grab the partner and one-time moments when they come up — they are the missables.', ids: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 33, 34, 37, 44, 45, 47, 48, 49, 50, 7] },
  { title: 'Stage 2 — Strangers & side stories', text: 'Finish the stranger mission strands and the final mission for each contact. Eight stranger strands earns “Strangers & Freaks”.', ids: [25, 22, 23, 24, 26, 27, 29] },
  { title: 'Stage 3 — Activities & skills', text: 'Work through the activities: stunts, shooting range, races, fishing, arcade games and challenges. These are all repeatable, so there is no rush.', ids: [15, 16, 17, 18, 19, 20, 21, 32, 36, 46, 51] },
  { title: 'Stage 4 — Heists & the underworld', text: 'Rob banks, armored trucks and gang operations, and launder your marked bills. Bring your best loadout and a fast getaway car.', ids: [38, 39, 40, 41, 43, 52] },
  { title: 'Stage 5 — Collectibles & exploration', text: 'Sweep the map once it is fully open: meditation spots, card sets, WAiNK locations, vehicles, garages and every corner of Leonida.', ids: [28, 30, 31, 35, 42, 54, 55, 53] },
  { title: 'Stage 6 — Finish line', text: 'Reach 100% completion for the gold “A Long Road”, and the platinum “Vice Got a Price!” follows automatically.', ids: [14, 1] },
];

const params = new URLSearchParams(location.search);
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
if (params.get('demo') === '1') {
  earned = new Set(DEMO_EARNED);
  save();
}
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

const rows = document.getElementById('rows');
const search = document.getElementById('search');
const gradeSel = document.getElementById('grade');
const spoilers = document.getElementById('spoilers');
const unearnedOnly = document.getElementById('unearnedOnly');
let kind = params.get('kind') ?? 'all';
let selectedId = Number(params.get('trophy') ?? 0) || null;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCountsText() {
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + (earned.has(t.id) ? 1 : 0);
  return ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${counts[g] ?? 0} ${g}`)
    .join(' · ');
}

function renderProgress() {
  document.getElementById('progressText').textContent = `${earned.size} of ${trophies.length} earned`;
  document.getElementById('progressPct').textContent = `${Math.round((earned.size / trophies.length) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  document.getElementById('gradeCounts').textContent = gradeCountsText();
}

function trophyKind(t) {
  return t.missable ? 'missable' : t.kind;
}

function matches(t) {
  if (kind !== 'all' && trophyKind(t) !== kind && !(kind === 'missable' && t.missable)) {
    if (kind === 'missable' ? !t.missable : t.kind !== kind) return false;
  }
  if (gradeSel.value !== 'all' && t.grade !== gradeSel.value) return false;
  if (unearnedOnly.checked && earned.has(t.id)) return false;
  const q = search.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  return true;
}

function renderRows() {
  rows.replaceChildren();
  const shown = trophies.filter(matches);
  document.getElementById('listMeta').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies` +
    (kind === 'online' ? ' — the official list has no online trophies.' : '') +
    (kind === 'all' ? '.' : ` — kind: ${kind}.`);
  if (!shown.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'empty-note';
    td.textContent = kind === 'online'
      ? 'No online trophies: every trophy in the official PS5 list is earned in single-player.'
      : 'No trophies match these filters.';
    tr.append(td);
    rows.append(tr);
    return;
  }
  for (const t of shown) {
    const tr = document.createElement('tr');
    if (earned.has(t.id)) tr.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderProgress();
      renderRows();
      if (selectedId === t.id) renderDetail();
    });
    const boxTd = document.createElement('td');
    boxTd.append(box);
    const nameTd = document.createElement('td');
    if (spoilers.checked && t.kind === 'story' && !earned.has(t.id)) {
      const name = document.createElement('div');
      name.className = 'spoiler';
      name.textContent = 'Hidden story trophy — earn it to reveal';
      const desc = document.createElement('div');
      desc.className = 'trophy-desc spoiler';
      desc.textContent = 'Spoilers hidden. Untick “Hide story spoilers” to see it, or earn it first.';
      nameTd.append(name, desc);
    } else {
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = t.name;
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      nameTd.append(name, desc);
    }
    const gradeTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = t.grade;
    gradeTd.append(badge);
    const kindTd = document.createElement('td');
    const kindChip = document.createElement('span');
    kindChip.className = 'chip';
    kindChip.textContent = t.kind;
    kindTd.append(kindChip);
    if (t.missable) {
      const miss = document.createElement('span');
      miss.className = 'chip missable';
      miss.textContent = '⚠ Missable';
      kindTd.append(miss);
    }
    const guideTd = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-btn';
    btn.textContent = 'Guide';
    btn.addEventListener('click', () => {
      selectedId = t.id;
      renderDetail();
      document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    guideTd.append(btn);
    tr.append(boxTd, nameTd, gradeTd, kindTd, guideTd);
    rows.append(tr);
  }
}

function renderDetail() {
  const body = document.getElementById('detailBody');
  const empty = document.getElementById('detailEmpty');
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    body.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.hidden = false;
  body.replaceChildren();
  if (spoilers.checked && t.kind === 'story' && !earned.has(t.id)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.textContent = 'Spoilers are hidden. Earn this trophy to reveal its guide, or untick “Hide story spoilers”.';
    body.append(h, p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const gradeLine = document.createElement('p');
  gradeLine.className = 'grade-line';
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade;
  gradeLine.append(badge, ` — ${t.description}`);
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide;
  body.append(h, gradeLine, guide);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-warn';
    warn.textContent = '⚠ Missable: this is tied to one specific mission or moment. Do it on your first pass — whether missions can be replayed is not yet confirmed.';
    body.append(warn);
  }
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources';
  const list = document.createElement('ul');
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    list.append(li);
  }
  const earnBtn = document.createElement('button');
  earnBtn.type = 'button';
  earnBtn.className = 'earn-btn' + (earned.has(t.id) ? ' earned' : '');
  earnBtn.textContent = earned.has(t.id) ? '✓ Earned — click to untick' : 'Mark as earned';
  earnBtn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderProgress();
    renderRows();
    renderDetail();
  });
  body.append(srcH, list, earnBtn);
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapStages');
  ol.replaceChildren();
  for (const stage of ROADMAP) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('p');
    chips.className = 'trophy-chips';
    for (const id of stage.ids) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `${earned.has(id) ? '✓ ' : ''}${t.name} (${t.grade})`;
      chips.append(chip, ' ');
    }
    li.append(h, p, chips);
    ol.append(li);
  }
}

function setView(view) {
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('active', b.dataset.view === view);
  document.getElementById('view-checklist').hidden = view !== 'checklist';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-about').hidden = view !== 'about';
  document.getElementById('detail').style.display = view === 'checklist' ? '' : 'none';
  document.querySelector('.controls').style.display = view === 'checklist' ? '' : 'none';
}
for (const b of document.querySelectorAll('.tab')) {
  b.addEventListener('click', () => setView(b.dataset.view));
}
for (const b of document.querySelectorAll('.kind')) {
  b.addEventListener('click', () => {
    kind = b.dataset.kind;
    for (const x of document.querySelectorAll('.kind')) x.classList.toggle('active', x === b);
    renderRows();
  });
}
document.querySelector(`.kind[data-kind="${kind}"]`)?.classList.add('active');
document.querySelectorAll('.kind').forEach((b) => b.classList.toggle('active', b.dataset.kind === kind));
search.addEventListener('input', renderRows);
gradeSel.addEventListener('change', renderRows);
spoilers.addEventListener('change', renderRows);
unearnedOnly.addEventListener('change', renderRows);

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = JSON.parse(await file.text());
  const ids = Array.isArray(data) ? data : data.earned;
  earned = new Set(ids.filter((id) => byId.has(id)));
  save();
  renderProgress();
  renderRows();
  renderDetail();
});
document.getElementById('demo').addEventListener('click', () => {
  earned = new Set(DEMO_EARNED);
  save();
  renderProgress();
  renderRows();
  renderDetail();
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  renderProgress();
  renderRows();
  renderDetail();
});

renderProgress();
renderRows();
renderRoadmap();
renderDetail();
const view = params.get('view');
if (view === 'roadmap' || view === 'about') setView(view);
else if (params.get('kind') === 'missable') setView('checklist');
