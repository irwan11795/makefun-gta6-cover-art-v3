// Vice Cover Studio v4.4 — editor wiring.
// Owns the state, the photo library, the controls and the PNG export.
// All drawing lives in cover.js; this file only drives it.

import { GRADES, LAYOUTS, drawCover, gradeById, layoutPanels, panelCountFor } from './cover.js';
import { applyShotMode } from './shots.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const sctx = stage.getContext('2d');

const ASPECTS = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  wide: { w: 1920, h: 1080 },
};

const DEFAULT_TAGS = ['MARINA', 'DANTE', 'SOFIA', 'RICO'];

// The four sample-photo sets. The police set is loaded in this order so
// each cast tag matches the person shown: police-1 is the chief, police-4
// the young rookie, police-3 the detective, police-2 the patrol officer.
// All four police officers are women (v3.3). The mafia set (v3.4) is
// loaded in file order — mafia-1 is the Don in the big first panel of the
// Family lineup, mafia-2 to mafia-5 follow in strip order — and every
// member wears visible gold jewellery: chains, rings, watches, earrings.
// The hero set (v3.5) is loaded in file order — hero-1 is the Leader in
// the big centre panel of the Spotlight layout, hero-2 to hero-4 are the
// Driver, the Lookout and the Muscle in the corners — and its fifth tag,
// VICE CITY, shows the Vice City establishing shot (v3.6): a dusk skyline
// over the port, streets and neon signs, with no people in frame, so no
// face repeats anywhere on the cover. All four are new faces, none of
// them Marina, Dante, Sofia or Rico from the heist set.
// The coast set (v4.0) is the Poster mosaic's crew — five candid,
// laughing faces shot at golden hour, all new faces again: Lucia
// laughing in the convertible, Marco on the boat, the beach-party crew,
// Nina dancing on the neon street, and Dario on the rooftop at dusk.
// v4.2: the Vice Coast shot puts Nina's direct-to-camera frame in the
// big centre panel (via ?photoN=) and Lucia's laugh on a side panel —
// the set order below is the editor default, the shot reorders it.
const SETS = {
  heist: {
    label: 'Sunset Heist crew',
    files: ['samples/sample-1.jpg', 'samples/sample-2.jpg', 'samples/sample-3.jpg', 'samples/sample-4.jpg'],
    names: ['sample-1', 'sample-2', 'sample-3', 'sample-4'],
    tags: ['MARINA', 'DANTE', 'SOFIA', 'RICO'],
  },
  coast: {
    label: 'Coast crew',
    files: ['samples/media-generation-coast-1-0-2f357962-bb90-4dba-8012-e4188e5e6d60.jpg', 'samples/media-generation-coast-2-0-eaa1168a-fba2-4243-96ab-d323a8f14be7.jpg', 'samples/media-generation-coast-3-0-d5b13a58-e34d-49f8-a993-a370c1002eec.jpg', 'samples/media-generation-coast-4-0-80cf050a-9a91-40a0-bc05-20a05403f8a0.jpg', 'samples/media-generation-coast-5-0-9b80c26f-52a1-4b32-bc20-30a33553971e.jpg'],
    names: ['coast-1', 'coast-2', 'coast-3', 'coast-4', 'coast-5'],
    tags: ['LUCIA', 'MARCO', 'THE CREW', 'NINA', 'DARIO'],
  },
  police: {
    label: 'Police crew',
    files: ['samples/police-1.jpg', 'samples/police-4.jpg', 'samples/police-3.jpg', 'samples/police-2.jpg'],
    names: ['police-1', 'police-4', 'police-3', 'police-2'],
    tags: ['THE CHIEF', 'THE ROOKIE', 'THE DETECTIVE', 'THE PATROL'],
  },
  mafia: {
    label: 'Family crew',
    files: ['samples/mafia-1.jpg', 'samples/mafia-2.jpg', 'samples/mafia-3.jpg', 'samples/mafia-4.jpg', 'samples/mafia-5.jpg'],
    names: ['mafia-1', 'mafia-2', 'mafia-3', 'mafia-4', 'mafia-5'],
    tags: ['THE DON', 'THE ENFORCER', 'THE BRUISER', 'THE VIXEN', 'THE SIREN'],
  },
  hero: {
    label: 'Vice Heroes crew',
    files: ['samples/hero-1.jpg', 'samples/hero-2.jpg', 'samples/hero-3.jpg', 'samples/hero-4.jpg', 'samples/vice-city.jpg'],
    names: ['hero-1', 'hero-2', 'hero-3', 'hero-4', 'vice-city'],
    tags: ['THE LEADER', 'THE DRIVER', 'THE LOOKOUT', 'THE MUSCLE', 'VICE CITY'],
  },
};

let currentSet = 'heist';

function freshPanels(tags = DEFAULT_TAGS) {
  // The collage's wide bottom panel anchors its photo near the top (ay),
  // so the face stays in frame instead of the chin.
  return tags.map((tag, i) => ({ photo: i, zoom: 1, ox: 0, oy: 0, ay: i === 3 ? 0.37 : 0.5, tag }));
}

export const state = {
  layout: 'collage',
  grade: 'sunset',
  gradeIntensity: 0.8,
  title: 'SUNSET HEIST',
  subtitle: 'a vice city story',
  billing: '',
  release: 'NOW PLAYING · SUMMER 2026',
  seal: 'VICE COVER STUDIO',
  quote: 'PURE SUNSET CHAOS, FRAME AFTER FRAME',
  quoteSource: 'THE PALM PRESS',
  badge: 'VOLUME ONE',
  tagline: 'EVERY SUNSET HIDES A GETAWAY',
  photoMode: 'per-panel',
  outline: true,
  shadow: true,
  italic: true,
  stars: true,
  // v4.3: the edge-to-edge family/lineup rendering is the default —
  // the strips run to the bottom edge with the title over the art.
  // ?bleed=0 in a shot URL opts back out to the classic inset.
  bleed: true,
  aspect: 'square',
  images: [],
  panels: freshPanels(),
};

let selectedPanel = 0;
let drag = null;

function setStatus(msg) {
  $('statusText').textContent = msg;
}

export function render() {
  const a = ASPECTS[state.aspect];
  if (stage.width !== a.w || stage.height !== a.h) {
    stage.width = a.w;
    stage.height = a.h;
  }
  drawCover(sctx, a.w, a.h, state);
  syncPanelControls();
}

function loadImage(src, name) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, name });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadSet(name) {
  const set = SETS[name] ?? SETS.heist;
  currentSet = SETS[name] ? name : 'heist';
  setStatus('Loading sample photos…');
  const loaded = (await Promise.all(
    set.files.map((f, i) => loadImage(f, set.names[i])),
  )).filter(Boolean);
  state.images = loaded;
  state.panels = freshPanels(set.tags);
  // Every layout uses at most five panels, so a set with fewer tags
  // (heist, police) still needs a fifth panel entry — otherwise picking
  // a five-panel layout (Family, Spotlight) would read an undefined
  // panel. The filler repeats the first photo with a VICE CITY chip.
  while (state.panels.length < 5) {
    state.panels.push({ photo: 0, zoom: 1, ox: 0, oy: 0, ay: 0.5, tag: 'VICE CITY' });
  }
  selectedPanel = 0;
  const chipId = currentSet === 'police' ? 'setPolice' : currentSet === 'mafia' ? 'setMafia' : currentSet === 'hero' ? 'setHero' : currentSet === 'coast' ? 'setCoast' : 'setHeist';
  document.querySelectorAll('.set-chip').forEach((x) => {
    x.classList.toggle('is-active', x.id === chipId);
  });
  if (state.images.length === 0) {
    setStatus('Sample photos did not load — add your own photos below.');
  } else {
    setStatus(`Ready — ${state.images.length} sample photos loaded (${set.label}). Add your own or export.`);
  }
  renderPhotoStrip();
  renderPanelChips();
  render();
}

// The first load honours ?set=police, ?set=mafia, ?set=hero or
// ?set=coast in the URL (the Police Crew, Family, Vice Heroes and
// Coast cover shots use it); later reloads keep whichever set is showing.
let initialSetLoaded = false;

async function loadSamples() {
  if (!initialSetLoaded) {
    initialSetLoaded = true;
    const set = new URLSearchParams(window.location.search).get('set');
    await loadSet(set === 'police' ? 'police' : set === 'mafia' ? 'mafia' : set === 'hero' ? 'hero' : set === 'coast' ? 'coast' : 'heist');
    return;
  }
  await loadSet(currentSet);
}

function renderPhotoStrip() {
  const strip = $('photoStrip');
  strip.innerHTML = '';
  if (state.images.length === 0) {
    const d = document.createElement('div');
    d.className = 'empty';
    d.textContent = 'No photos yet.';
    strip.appendChild(d);
    return;
  }
  state.images.forEach((p, i) => {
    const el = document.createElement('img');
    el.src = p.img.src;
    el.alt = p.name;
    el.title = p.name;
    const picked = state.photoMode === 'one'
      ? i === 0
      : state.panels[selectedPanel] && state.panels[selectedPanel].photo === i;
    if (picked) el.classList.add('is-picked');
    el.addEventListener('click', () => {
      if (state.photoMode === 'one') {
        // Move the picked photo to the front so every panel uses it.
        const [photo] = state.images.splice(i, 1);
        state.images.unshift(photo);
      } else {
        state.panels[selectedPanel].photo = i;
      }
      renderPhotoStrip();
      render();
    });
    strip.appendChild(el);
  });
}

function renderGradeRow() {
  const row = $('gradeRow');
  row.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-swatch' + (state.grade === g.id ? ' is-active' : '');
    b.title = g.name;
    b.setAttribute('aria-label', g.name);
    b.style.background = `linear-gradient(135deg, ${g.sky[1]}, ${g.sky[2]} 55%, ${g.sky[3]})`;
    b.addEventListener('click', () => {
      state.grade = g.id;
      renderGradeRow();
      render();
    });
    row.appendChild(b);
  });
}

function renderPanelChips() {
  const box = $('panelChips');
  box.innerHTML = '';
  const n = panelCountFor(state.layout);
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (selectedPanel === i ? ' is-active' : '');
    b.textContent = `Panel ${i + 1} · ${state.panels[i].tag}`;
    b.addEventListener('click', () => {
      selectedPanel = i;
      renderPanelChips();
      renderPhotoStrip();
      render();
    });
    box.appendChild(b);
  }
}

function syncPanelControls() {
  const spec = state.panels[selectedPanel] || state.panels[0];
  $('zoomRange').value = Math.round(spec.zoom * 100);
  $('zoomVal').textContent = `${Math.round(spec.zoom * 100)}%`;
  $('oxRange').value = Math.round(spec.ox * 100);
  $('oyRange').value = Math.round(spec.oy * 100);
  $('tagInput').value = spec.tag || '';
}

function bindControls() {
  document.querySelectorAll('.layout-chip').forEach((b) => {
    b.addEventListener('click', () => {
      state.layout = b.dataset.layout;
      selectedPanel = 0;
      document.querySelectorAll('.layout-chip').forEach((x) => x.classList.toggle('is-active', x === b));
      renderPanelChips();
      render();
    });
  });

  document.querySelectorAll('.aspect-chip').forEach((b) => {
    b.addEventListener('click', () => {
      state.aspect = b.dataset.aspect;
      document.querySelectorAll('.aspect-chip').forEach((x) => x.classList.toggle('is-active', x === b));
      render();
    });
  });

  $('photoModeOne').addEventListener('click', () => {
    state.photoMode = 'one';
    $('photoModeOne').classList.add('is-active');
    $('photoModePer').classList.remove('is-active');
    renderPhotoStrip();
    render();
  });
  $('photoModePer').addEventListener('click', () => {
    state.photoMode = 'per-panel';
    $('photoModePer').classList.add('is-active');
    $('photoModeOne').classList.remove('is-active');
    renderPhotoStrip();
    render();
  });

  $('photoFiles').addEventListener('change', (e) => {
    const files = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    let done = 0;
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      loadImage(url, f.name.replace(/\.[^.]+$/, '')).then((p) => {
        if (p) state.images.push(p);
        done++;
        if (done === files.length) {
          setStatus(`${state.images.length} photos loaded.`);
          renderPhotoStrip();
          render();
        }
      });
    });
    e.target.value = '';
  });

  $('btnSamples').addEventListener('click', loadSamples);

  $('setHeist').addEventListener('click', () => loadSet('heist'));
  $('setPolice').addEventListener('click', () => loadSet('police'));
  $('setMafia').addEventListener('click', () => loadSet('mafia'));
  $('setHero').addEventListener('click', () => loadSet('hero'));
  $('setCoast').addEventListener('click', () => loadSet('coast'));

  $('zoomRange').addEventListener('input', (e) => {
    state.panels[selectedPanel].zoom = Number(e.target.value) / 100;
    render();
  });
  $('oxRange').addEventListener('input', (e) => {
    state.panels[selectedPanel].ox = Number(e.target.value) / 100;
    render();
  });
  $('oyRange').addEventListener('input', (e) => {
    state.panels[selectedPanel].oy = Number(e.target.value) / 100;
    render();
  });
  $('btnCenterPanel').addEventListener('click', () => {
    const p = state.panels[selectedPanel];
    p.zoom = 1;
    p.ox = 0;
    p.oy = 0;
    render();
  });

  $('tagInput').addEventListener('input', (e) => {
    state.panels[selectedPanel].tag = e.target.value.toUpperCase().slice(0, 12);
    renderPanelChips();
    render();
  });

  const textBindings = [
    ['titleInput', 'title'],
    ['subtitleInput', 'subtitle'],
    ['billingInput', 'billing'],
    ['releaseInput', 'release'],
    ['sealInput', 'seal'],
    ['quoteInput', 'quote'],
    ['quoteSourceInput', 'quoteSource'],
    ['badgeInput', 'badge'],
    ['taglineInput', 'tagline'],
  ];
  textBindings.forEach(([id, key]) => {
    $(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      render();
    });
  });

  $('chkOutline').addEventListener('change', (e) => { state.outline = e.target.checked; render(); });
  $('chkShadow').addEventListener('change', (e) => { state.shadow = e.target.checked; render(); });
  $('chkItalic').addEventListener('change', (e) => { state.italic = e.target.checked; render(); });

  $('gradeIntensity').addEventListener('input', (e) => {
    state.gradeIntensity = Number(e.target.value) / 100;
    $('gradeVal').textContent = `${e.target.value}%`;
    render();
  });

  $('btnShuffle').addEventListener('click', () => {
    const layouts = Object.keys(LAYOUTS);
    state.layout = layouts[Math.floor(Math.random() * layouts.length)];
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    document.querySelectorAll('.layout-chip').forEach((x) => x.classList.toggle('is-active', x.dataset.layout === state.layout));
    selectedPanel = 0;
    renderGradeRow();
    renderPanelChips();
    render();
    setStatus(`Shuffled — ${LAYOUTS[state.layout].name} · ${gradeById(state.grade).name}.`);
  });

  $('btnRandomGrade').addEventListener('click', () => {
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    renderGradeRow();
    render();
    setStatus(`Grade: ${gradeById(state.grade).name}.`);
  });

  $('btnExpSquare').addEventListener('click', () => exportPNG(1080, 1080, 'vice-cover-1080x1080.png'));
  $('btnExpPortrait').addEventListener('click', () => exportPNG(1080, 1350, 'vice-cover-1080x1350.png'));
  $('btnExpWide').addEventListener('click', () => exportPNG(1920, 1080, 'vice-cover-1920x1080.png'));
  $('btnExpAll').addEventListener('click', exportAll);

  bindCanvasPointer();
}

function panelAtPoint(clientX, clientY) {
  const r = stage.getBoundingClientRect();
  const x = ((clientX - r.left) / r.width) * stage.width;
  const y = ((clientY - r.top) / r.height) * stage.height;
  const panels = layoutPanels(state.layout, stage.width, stage.height, state.bleed);
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    const s = p.slant * p.w;
    // Hit test against the (possibly slanted) panel quad.
    const topX = x - s * (1 - (y - p.y) / p.h);
    if (topX >= p.x && topX <= p.x + p.w && y >= p.y && y <= p.y + p.h) return { index: i, x, y };
  }
  return null;
}

function bindCanvasPointer() {
  stage.addEventListener('pointerdown', (e) => {
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    selectedPanel = hit.index;
    renderPanelChips();
    renderPhotoStrip();
    const spec = state.panels[selectedPanel];
    drag = { x: hit.x, y: hit.y, ox: spec.ox, oy: spec.oy };
    stage.setPointerCapture(e.pointerId);
    render();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    const spec = state.panels[selectedPanel];
    spec.ox = Math.max(-1, Math.min(1, drag.ox + ((hit.x - drag.x) / stage.width) * 2.4));
    spec.oy = Math.max(-1, Math.min(1, drag.oy + ((hit.y - drag.y) / stage.height) * 2.4));
    render();
  });
  const endDrag = () => { drag = null; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('wheel', (e) => {
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    e.preventDefault();
    const spec = state.panels[hit.index];
    const next = spec.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
    spec.zoom = Math.max(1, Math.min(3, next));
    selectedPanel = hit.index;
    renderPanelChips();
    render();
  }, { passive: false });
}

function renderToCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCover(c.getContext('2d'), w, h, state);
  return c;
}

export function exportPNG(w, h, filename) {
  return new Promise((resolve) => {
    const c = renderToCanvas(w, h);
    c.toBlob((blob) => {
      if (!blob) {
        setStatus('Export failed in this browser.');
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus(`Exported ${filename} (${w} × ${h}).`);
      resolve(true);
    }, 'image/png');
  });
}

async function exportAll() {
  setStatus('Exporting all 3 sizes…');
  await exportPNG(1080, 1080, 'vice-cover-1080x1080.png');
  await new Promise((r) => setTimeout(r, 250));
  await exportPNG(1080, 1350, 'vice-cover-1080x1350.png');
  await new Promise((r) => setTimeout(r, 250));
  await exportPNG(1920, 1080, 'vice-cover-1920x1080.png');
  setStatus('All 3 sizes exported.');
}

export const api = {
  state,
  render,
  renderToCanvas,
  exportPNG,
  loadSamples,
  loadSet,
  renderPhotoStrip,
  renderGradeRow,
  renderPanelChips,
  setStatus,
  ASPECTS,
};

window.__vice = api;

bindControls();
renderGradeRow();
renderPanelChips();
loadSamples().then(() => {
  applyShotMode(api);
  render();
});
