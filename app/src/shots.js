// Vice Cover Studio v4.4 — screenshot scenes.
// ?shot=editor shows the editor with photos loaded.
// ?shot=cover shows the cover art full-frame (the app's own drawing of it).
// Both set window.__shotReady once the frame has been painted.
// v3.4: ?set=mafia loads the Family crew, ?layout=family / leader pick the
// new five-strip and leader layouts, and ?tag0=… overrides a panel's cast
// tag — the Vice Heroes shot renames the heist crew THE LEADER, THE DRIVER,
// THE LOOKOUT, THE MUSCLE without touching the editor's own tags.
// v3.5: ?set=hero loads the Vice Heroes crew (whose tags already are the
// hero roles, so the shot needs no tag overrides), ?layout=spotlight picks
// the big-centre-panel layout.
// v3.6: the hero set carries a fifth photo, the Vice City establishing
// shot, for the last corner — the shot no longer tightens a repeated
// Leader photo there, so it names no ?zoom4 or ?ay4.
// v4.0: ?set=coast loads the Coast crew (five candid golden-hour faces)
// and ?layout=poster picks the full-bleed Poster mosaic — the Golden
// Coast cover shot is wide 16:9, and its ?ayN values frame each face
// (the boat and rooftop faces sit high in their photos, so they need
// small ay values to stay whole).
// v4.3: the edge-to-edge family/lineup variant is now the DEFAULT
// (bleed: true in main.js), so shots no longer need ?bleed=1 —
// ?bleed=0 opts a shot back out to the classic inset rendering.
// ?stars=0 drops the five gold stars from the quote strip, ?photoN=
// reassigns a panel to a different photo of the loaded set (the Vice
// Coast shot puts Nina's direct-to-camera frame in the centre panel),
// and naming a text param with an empty value (?release=) clears that
// line — the Vice Coast, Family and Vice Squad shots drop the release
// pill that way. ayN values follow the PHOTO, so when photoN moves a
// face to another panel its ay moves with it in shots.json.

import { drawCover } from './cover.js';

function pickSample(api, name) {
  if (!name) return;
  const idx = api.state.images.findIndex((p) => p.name === name);
  if (idx > 0) {
    const [photo] = api.state.images.splice(idx, 1);
    api.state.images.unshift(photo);
  }
}

function applyParams(api, params) {
  const photo = params.get('photo');
  if (photo) pickSample(api, photo);
  const caption = params.get('caption');
  if (caption) {
    api.state.title = caption.toUpperCase();
    const input = document.getElementById('titleInput');
    if (input) input.value = api.state.title;
  }
  // The rest of the poster furniture, same pattern as the caption: set
  // the state, and the matching editor input when it exists. A param
  // named with an empty value (?release=) CLEARS its line — that is
  // how a shot drops a pill instead of filling it.
  const textParams = [
    ['subtitle', 'subtitle', 'subtitleInput'],
    ['tagline', 'tagline', 'taglineInput'],
    ['quote', 'quote', 'quoteInput'],
    ['quotesource', 'quoteSource', 'quoteSourceInput'],
    ['badge', 'badge', 'badgeInput'],
    ['release', 'release', 'releaseInput'],
    ['seal', 'seal', 'sealInput'],
    // Billing is wired like the rest: a shot may name its own billing
    // line instead of the auto line built from the cast tags. The
    // Family shot does — five tags plus STARRING plus the Vice City
    // suffix is wider than the canvas, so its first letters would hide
    // behind the seal badge in the bottom-left corner.
    ['billing', 'billing', 'billingInput'],
  ];
  textParams.forEach(([param, key, inputId]) => {
    if (!params.has(param)) return;
    const value = params.get(param) ?? '';
    api.state[key] = value;
    const input = document.getElementById(inputId);
    if (input) input.value = value;
  });
  // Edge-to-edge variant (?bleed=1 / ?bleed=0): a flag, not text —
  // the default is ON for family/lineup since v4.3, so only the shots
  // that name ?bleed=0 change it.
  if (params.get('bleed') === '1') api.state.bleed = true;
  if (params.get('bleed') === '0') api.state.bleed = false;
  if (params.get('stars') === '0') api.state.stars = false;
  const layout = params.get('layout');
  if (layout) {
    api.state.layout = layout;
    document.querySelectorAll('.layout-chip').forEach((x) => {
      x.classList.toggle('is-active', x.dataset.layout === layout);
    });
    api.renderPanelChips();
  }
  const grade = params.get('grade');
  if (grade) {
    api.state.grade = grade;
    api.renderGradeRow();
  }
  const aspect = params.get('aspect');
  if (aspect && api.ASPECTS[aspect]) {
    api.state.aspect = aspect;
    document.querySelectorAll('.aspect-chip').forEach((x) => {
      x.classList.toggle('is-active', x.dataset.aspect === aspect);
    });
  }
  const mode = params.get('mode');
  if (mode === 'one' || mode === 'per-panel') {
    api.state.photoMode = mode;
    document.getElementById('photoModeOne').classList.toggle('is-active', mode === 'one');
    document.getElementById('photoModePer').classList.toggle('is-active', mode === 'per-panel');
  }
  // Per-panel vertical anchor (?ay0=0.34 …): a smaller ay frames the top
  // of that panel's photo, so a face whose crown is cut by the default
  // centred crop shows whole — forehead to chin inside the panel. Only
  // the shots that name an ayN change; every other shot keeps ay 0.5.
  // The Family shot names ay0–ay4 for its five strips; the Vice Heroes
  // shot names ay3 for the Muscle panel. The ay loop runs over the panels
  // the set actually loaded, so a five-panel shot on a four-tag set still
  // reaches its fifth panel through the filler entry loadSet appends.
  for (let i = 0; i < api.state.panels.length; i++) {
    // params.get returns null when absent — Number(null) is 0, so only
    // touch a panel when its ayN is actually named in the URL.
    const raw = params.get(`ay${i}`);
    if (raw === null) continue;
    const ay = Number(raw);
    if (Number.isFinite(ay) && ay >= 0 && ay <= 1) api.state.panels[i].ay = ay;
  }
  // Per-panel zoom (?zoom0=1.3 …): same pattern as the anchors — only
  // the shots that name a zoomN zoom that panel. A zoom above 1 tightens
  // the crop, so one panel can frame a closer detail of its photo.
  for (let i = 0; i < api.state.panels.length; i++) {
    const raw = params.get(`zoom${i}`);
    if (raw === null) continue;
    const zoom = Number(raw);
    if (Number.isFinite(zoom) && zoom >= 0.5 && zoom <= 3) api.state.panels[i].zoom = zoom;
  }
  // Per-panel photo assignment (?photo0=3 …): same pattern as the
  // anchors — only the shots that name a photoN move that panel to a
  // different photo of the loaded set, so one shot can put a direct-
  // to-camera face in the centre panel without touching the editor's
  // default panel order. Out-of-range values are ignored.
  for (let i = 0; i < api.state.panels.length; i++) {
    const raw = params.get(`photo${i}`);
    if (raw === null) continue;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n < api.state.images.length) api.state.panels[i].photo = n;
  }
  // Per-panel cast-tag override (?tag0=THE%20LEADER …): same pattern as
  // the anchors — only the shots that name a tagN rename that panel, so
  // the heist crew can play hero roles on one cover while the editor
  // keeps their names everywhere else. Tags are capped at 12 characters,
  // like the tag input in the editor.
  for (let i = 0; i < api.state.panels.length; i++) {
    const tag = params.get(`tag${i}`);
    if (tag === null) continue;
    const clean = tag.toUpperCase().slice(0, 12);
    if (clean) api.state.panels[i].tag = clean;
  }
  // The tag/photo overrides above rename panels, so refresh the panel
  // chips — otherwise the editor shot would show the set's default
  // tags on panels that now carry other faces.
  api.renderPanelChips();
}

function markReady() {
  // Two animation frames: let the canvas paint before the screenshot lands.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}

export function applyShotMode(api) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) {
    window.__shotReady = true;
    return;
  }
  applyParams(api, params);

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Full-bleed cover at the window's own size: the screenshot's window size
    // is the cover size, so the drawing fills the frame exactly.
    const stage = document.getElementById('stage');
    const w = Math.max(320, window.innerWidth);
    const h = Math.max(320, window.innerHeight);
    stage.width = w;
    stage.height = h;
    drawCover(stage.getContext('2d'), w, h, api.state);
    markReady();
    return;
  }

  // Editor scene: the normal editor, photos loaded, caption applied.
  api.render();
  markReady();
}
