// Vice Cover Studio v3.6 — cover renderer.
// Draws the whole poster on a 2D canvas: sunset sky, skyline, palms, photo
// panels, big lettering, billing block and seal. Everything here is original
// art drawn with canvas paths; no external images, fonts or logos are used.
// v3.4 adds the Family lineup (five strips, one per Family member), the
// Leader + crew layout (one dominant panel for the gang's leader), and the
// Mafia Gold and Sunset Hero grades.
// v3.5 adds the Spotlight layout: one big centre panel for the leader with
// four small panels in the corners for the crew, the composition the Vice
// Heroes cover now uses.
// v3.6: the hero set carries a fifth photo, the Vice City establishing
// shot, for the last corner — so the cover shows four different faces
// plus the city, and no face repeats.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    sky: ['#2b1055', '#ff5da2', '#ff9a3d', '#ffd166'],
    sun: '#fff3b0',
    tint: '#ff7a3d',
    titleTop: '#fffbe0',
    titleBottom: '#ff5da2',
    accent: '#ffd166',
    ink: '#1c0f2e',
  },
  {
    id: 'neon',
    name: 'Neon Night',
    sky: ['#050514', '#1b0f4b', '#ff2e88', '#37e0c8'],
    sun: '#ff9ad5',
    tint: '#b44dff',
    titleTop: '#eafffb',
    titleBottom: '#37e0c8',
    accent: '#ff5da2',
    ink: '#060614',
  },
  {
    id: 'noir',
    name: 'Palm Noir',
    sky: ['#0c0c0c', '#2a2a2e', '#6b6b70', '#d8d8d8'],
    sun: '#f2f2f2',
    tint: '#8a8a8a',
    titleTop: '#ffffff',
    titleBottom: '#c9c9c9',
    accent: '#ffd166',
    ink: '#0a0a0a',
  },
  {
    id: 'dawn',
    name: 'Pastel Dawn',
    sky: ['#8ec9ee', '#f7b8d8', '#ffd9a0', '#fff6d8'],
    sun: '#fffdf0',
    tint: '#ffb3d1',
    titleTop: '#ffffff',
    titleBottom: '#ff8fb8',
    accent: '#7c3aed',
    ink: '#3d2358',
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    sky: ['#3d1a00', '#b3541e', '#ff9a3d', '#ffe08a'],
    sun: '#fff8d0',
    tint: '#ff8a2a',
    titleTop: '#fffbe0',
    titleBottom: '#ff7a1a',
    accent: '#fff3b0',
    ink: '#2a1400',
  },
  {
    id: 'mafia',
    name: 'Mafia Gold',
    // Dark-gold noir for the Family cover: near-black browns, brass and
    // old gold, so the gold chains in the photos pick up the grade
    // instead of fighting it. Distinct from Palm Noir (grey) and
    // Golden Hour (bright orange daylight).
    sky: ['#0a0805', '#241a08', '#8a6d2f', '#ffd166'],
    sun: '#ffe9a8',
    tint: '#c9a227',
    titleTop: '#fff6d8',
    titleBottom: '#d4af37',
    accent: '#ffd166',
    ink: '#0a0600',
  },
  {
    id: 'hero',
    name: 'Sunset Hero',
    // Heroic red-gold sunset for the Vice Heroes cover: a deep violet
    // night giving way to a burning red-orange horizon. Warmer and
    // redder than Vice Sunset (pink) and Mafia Gold (dark brass), so
    // the leader's panel reads as a rescue at dusk, not a heist.
    sky: ['#160a2e', '#d92b1f', '#ff9a3d', '#ffe08a'],
    sun: '#fff8d0',
    tint: '#ff5a2a',
    titleTop: '#fffbe0',
    titleBottom: '#ff3d2e',
    accent: '#ffd166',
    ink: '#1c0f2e',
  },
];

export const LAYOUTS = {
  hero: { name: 'Hero + two', panels: 3 },
  trio: { name: 'Triple vertical', panels: 3 },
  grid: { name: 'Grid 2 x 2', panels: 4 },
  lineup: { name: 'Lineup', panels: 4 },
  slant: { name: 'Slanted duo', panels: 2 },
  collage: { name: 'Four-photo collage', panels: 4 },
  family: { name: 'Family lineup', panels: 5 },
  leader: { name: 'Leader + crew', panels: 4 },
  spotlight: { name: 'Spotlight centre', panels: 5 },
};

export function panelCountFor(layoutId) {
  return (LAYOUTS[layoutId] ?? LAYOUTS.hero).panels;
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

// Deterministic pseudo-random: same seed, same poster, every run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Panel rectangles for a layout inside the cover of size W x H. */
export function layoutPanels(layoutId, W, H) {
  const x0 = W * 0.045;
  const y0 = H * 0.05;
  const pw = W * 0.91;
  const ph = H * 0.62;
  const gap = Math.max(6, W * 0.018);
  const rect = (x, y, w, h, slant = 0) => ({ x, y, w, h, slant });
  switch (layoutId) {
    case 'collage': {
      // Four-photo collage: three across the top with the middle panel
      // biggest, one wide panel along the bottom. One photo per panel,
      // each with its own cast tag. Starts below the quote strip.
      const cy0 = H * 0.09;
      const cph = H * 0.58;
      const topH = (cph - gap) * 0.62;
      const botH = cph - gap - topH;
      const sideW = (pw - gap * 2) * 0.27;
      const midW = pw - sideW * 2 - gap * 2;
      return [
        rect(x0, cy0, sideW, topH),
        rect(x0 + sideW + gap, cy0, midW, topH),
        rect(x0 + sideW + gap + midW + gap, cy0, sideW, topH),
        rect(x0, cy0 + topH + gap, pw, botH),
      ];
    }
    case 'lineup': {
      // Police lineup: four equal vertical strips, shoulder to shoulder,
      // each with its own cast tag — the whole crew in one row.
      const w = (pw - gap * 3) / 4;
      return [0, 1, 2, 3].map((i) => rect(x0 + i * (w + gap), y0, w, ph));
    }
    case 'family': {
      // Family lineup: five equal vertical strips, shoulder to shoulder —
      // the Don first, then the crew. A strip is narrow and tall, so a
      // portrait photo fills it top to bottom: the face stays whole
      // forehead to chin AND the gold chain at the chest stays in frame,
      // which a wide-short panel could never show together.
      const w = (pw - gap * 4) / 5;
      return [0, 1, 2, 3, 4].map((i) => rect(x0 + i * (w + gap), y0, w, ph));
    }
    case 'spotlight': {
      // Spotlight centre: one big panel in the middle for the leader —
      // more than three times the area of any corner panel, so he is
      // unmistakably the one in charge — and four small panels around
      // him, one in each corner, for the crew. Panel 0 is the leader;
      // panels 1–3 are the crew in set order, panel 4 the Vice City
      // establishing shot (the hero set carries a fifth photo for it, so
      // no face repeats). Starts below the quote strip, like the collage.
      const cy0 = H * 0.085;
      const cph = H * 0.56;
      const centerW = pw * 0.44;
      const colW = (pw - centerW - gap * 2) / 2;
      const rowH = (cph - gap) / 2;
      const cx = x0 + colW + gap;
      const rx = cx + centerW + gap;
      return [
        rect(cx, cy0, centerW, cph),
        rect(x0, cy0, colW, rowH),
        rect(rx, cy0, colW, rowH),
        rect(x0, cy0 + rowH + gap, colW, rowH),
        rect(rx, cy0 + rowH + gap, colW, rowH),
      ];
    }
    case 'leader': {
      // Leader + crew: one big panel on the left for the leader — more
      // than twice the area of any other panel, so she is unmistakably
      // the one in charge — and three small panels stacked on the right
      // for the rest of the gang. Panel 0 is the leader; panels 1–3
      // are the crew in set order.
      const bigW = pw * 0.58;
      const smallW = pw - bigW - gap;
      const smallH = (ph - gap * 2) / 3;
      return [
        rect(x0, y0, bigW, ph),
        rect(x0 + bigW + gap, y0, smallW, smallH),
        rect(x0 + bigW + gap, y0 + smallH + gap, smallW, smallH),
        rect(x0 + bigW + gap, y0 + (smallH + gap) * 2, smallW, smallH),
      ];
    }
    case 'trio': {
      const w = (pw - gap * 2) / 3;
      return [0, 1, 2].map((i) => rect(x0 + i * (w + gap), y0, w, ph));
    }
    case 'grid': {
      const w = (pw - gap) / 2;
      const h = (ph - gap) / 2;
      return [
        rect(x0, y0, w, h),
        rect(x0 + w + gap, y0, w, h),
        rect(x0, y0 + h + gap, w, h),
        rect(x0 + w + gap, y0 + h + gap, w, h),
      ];
    }
    case 'slant': {
      const w = (pw - gap) / 2;
      return [rect(x0, y0, w, ph, 0.09), rect(x0 + w + gap, y0, w, ph, -0.09)];
    }
    case 'hero':
    default: {
      const bigW = pw * 0.58;
      const smallW = pw - bigW - gap;
      const smallH = (ph - gap) / 2;
      return [
        rect(x0, y0, bigW, ph),
        rect(x0 + bigW + gap, y0, smallW, smallH),
        rect(x0 + bigW + gap, y0 + smallH + gap, smallW, smallH),
      ];
    }
  }
}

function panelPath(ctx, p) {
  const s = p.slant * p.w;
  ctx.beginPath();
  ctx.moveTo(p.x + s, p.y);
  ctx.lineTo(p.x + p.w + s, p.y);
  ctx.lineTo(p.x + p.w - s, p.y + p.h);
  ctx.lineTo(p.x - s, p.y + p.h);
  ctx.closePath();
}

function drawPhotoCover(ctx, img, p, zoom, ox, oy, ay = 0.5) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(p.w / iw, p.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = p.x + (p.w - dw) / 2 + ox * p.w * 0.25;
  // ay anchors the photo vertically: 0.5 centres it (the default), a
  // smaller value frames the top of the photo — what a very wide panel
  // needs to keep a face in frame instead of a chin.
  const dy = p.y + p.h / 2 - ay * dh + oy * p.h * 0.25;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawSkyline(ctx, W, H, color, seed) {
  const rnd = mulberry32(seed);
  const base = H * 0.62;
  const top = H * 0.42;
  ctx.fillStyle = color;
  let x = -W * 0.02;
  while (x < W * 1.02) {
    const bw = W * (0.05 + rnd() * 0.09);
    const bh = top + rnd() * (base - top);
    ctx.fillRect(x, bh, bw, base - bh + H * 0.02);
    // A lit antenna on some towers.
    if (rnd() > 0.6) {
      ctx.fillRect(x + bw / 2 - 1, bh - H * 0.03, 2, H * 0.03);
    }
    // Lit windows.
    ctx.fillStyle = 'rgba(255, 209, 102, 0.85)';
    const cols = Math.max(1, Math.floor(bw / (W * 0.022)));
    const rows = Math.max(1, Math.floor((base - bh) / (H * 0.035)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd() > 0.55) {
          ctx.fillRect(x + W * 0.008 + c * W * 0.022, bh + H * 0.012 + r * H * 0.035, W * 0.008, H * 0.014);
        }
      }
    }
    ctx.fillStyle = color;
    x += bw + W * 0.008;
  }
}

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Trunk: a gentle curve.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 4, -150);
  ctx.stroke();
  // Fronds: arcs fanning from the crown.
  const crownX = 4;
  const crownY = -150;
  for (let i = 0; i < 7; i++) {
    const a = (-165 + i * 30) * (Math.PI / 180);
    const len = 95 - Math.abs(i - 3) * 10;
    const ex = crownX + Math.cos(a) * len;
    const ey = crownY + Math.sin(a) * len * 0.55;
    const mx = crownX + Math.cos(a) * len * 0.55;
    const my = crownY + Math.sin(a) * len * 0.28 - 22;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(crownX - 6, crownY + 8, 6, 0, Math.PI * 2);
  ctx.arc(crownX + 7, crownY + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r, text, accent) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(10, 5, 20, 0.82)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.stroke();
  // Curved text around the top of the ring.
  const label = (text || 'VICE COVER STUDIO').toUpperCase();
  ctx.fillStyle = accent;
  ctx.font = `700 ${r * 0.22}px "Arial Black", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const span = Math.PI * 0.95;
  for (let i = 0; i < label.length; i++) {
    const a = -Math.PI / 2 - span / 2 + (span * (i + 0.5)) / label.length;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.8);
    ctx.fillText(label[i], 0, 0);
    ctx.restore();
  }
  // Star in the middle.
  ctx.fillStyle = accent;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r * 0.34 : r * 0.15;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCastChip(ctx, x, y, h, tag, grade) {
  const label = (tag || 'VICE').toUpperCase();
  ctx.save();
  ctx.font = `700 ${h * 0.52}px "Arial Black", Impact, sans-serif`;
  const tw = ctx.measureText(label).width;
  const pad = h * 0.45;
  ctx.fillStyle = 'rgba(8, 4, 16, 0.85)';
  ctx.beginPath();
  ctx.roundRect(x, y, tw + pad * 2, h, h / 2);
  ctx.fill();
  ctx.fillStyle = grade.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + pad, y + h / 2 + h * 0.04);
  ctx.restore();
}

function drawBadge(ctx, rightX, topY, text, accent) {
  // Ticket-style season badge for the top-right corner: cream ticket,
  // dark lettering, slight tilt.
  const label = (text || 'VOLUME ONE').toUpperCase();
  ctx.save();
  const h = Math.max(18, Math.min(ctx.canvas.width, ctx.canvas.height) * 0.034);
  ctx.font = `700 ${h * 0.52}px "Arial Black", Impact, sans-serif`;
  const tw = ctx.measureText(label).width;
  const pad = h * 0.7;
  const w = tw + pad * 2;
  const x = rightX - w;
  const y = topY;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.035);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, h * 0.28);
  ctx.fill();
  ctx.strokeStyle = '#1c0f2e';
  ctx.lineWidth = Math.max(1.5, h * 0.07);
  ctx.stroke();
  ctx.setLineDash([h * 0.22, h * 0.18]);
  ctx.lineWidth = Math.max(1, h * 0.045);
  ctx.beginPath();
  ctx.roundRect(h * 0.22, h * 0.22, w - h * 0.44, h - h * 0.44, h * 0.2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1c0f2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2 + h * 0.04);
  ctx.restore();
}

function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
  while (size > 20 && ctx.measureText(text).width > maxWidth) {
    size *= 0.92;
    ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
  }
  return size;
}

/**
 * Draw the cover for `state` on `ctx` at W x H.
 * state: { images, layout, grade, gradeIntensity, title, subtitle, billing,
 *          release, seal, panels, photoMode, outline, shadow, italic,
 *          quote, quoteSource, badge, tagline }
 * panels[i]: { photo, zoom, ox, oy, ay, tag } — ay is the vertical
 *          anchor of the photo inside its panel (0.5 = centred).
 */
export function drawCover(ctx, W, H, state) {
  const grade = gradeById(state.grade);
  const k = Math.max(0, Math.min(1, state.gradeIntensity ?? 0.8));
  const panels = layoutPanels(state.layout, W, H);
  const used = panels.length;
  // Photos arrive as { img, name } library entries (or bare images).
  const images = (state.images || []).map((e) => (e && e.img ? e.img : e)).filter(Boolean);

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun with a soft glow.
  const sunX = W * 0.74;
  const sunY = H * 0.27;
  const sunR = H * 0.17;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.6);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(0.35, grade.sun + '55');
  glow.addColorStop(1, grade.sun + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Skyline behind the panels.
  drawSkyline(ctx, W, H, grade.ink, 20261120);

  // Panels.
  const border = Math.max(4, W * 0.006);
  panels.forEach((p, i) => {
    const spec = state.panels[i] || { photo: 0, zoom: 1, ox: 0, oy: 0, tag: '' };
    let img = null;
    if (images.length > 0) {
      if (state.photoMode === 'per-panel') img = images[spec.photo % images.length];
      else img = images[0];
    }
    ctx.save();
    // Drop shadow behind the panel.
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = W * 0.02;
    ctx.shadowOffsetY = H * 0.008;
    panelPath(ctx, p);
    ctx.fillStyle = '#241335';
    ctx.fill();
    ctx.restore();

    ctx.save();
    panelPath(ctx, p);
    ctx.clip();
    if (img) drawPhotoCover(ctx, img, p, spec.zoom || 1, spec.ox || 0, spec.oy || 0, spec.ay ?? 0.5);
    else {
      ctx.fillStyle = '#3a2358';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    // Grade wash over the photo.
    ctx.globalAlpha = 0.22 * k;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grade.tint;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    // Bottom shade so the cast chip reads.
    const shade = ctx.createLinearGradient(0, p.y + p.h * 0.6, 0, p.y + p.h);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = shade;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.restore();

    // Frame.
    ctx.save();
    panelPath(ctx, p);
    ctx.lineWidth = border;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // Cast tag chip.
    const chipH = Math.max(18, H * 0.028);
    drawCastChip(ctx, p.x + border + 4, p.y + p.h - chipH - border - 6, chipH, spec.tag, grade);
  });

  // Palm silhouettes in front of the panels' lower corners.
  ctx.save();
  ctx.globalAlpha = 0.9;
  drawPalm(ctx, W * 0.02, H * 0.72, H / 620, grade.ink);
  drawPalm(ctx, W * 0.99, H * 0.74, H / 760, grade.ink);
  ctx.restore();

  // Critic-quote strip across the very top: quote, five gold stars,
  // source. Panels start below it, so it never covers a photo.
  const quote = (state.quote || '').trim();
  const quoteSource = (state.quoteSource || '').trim();
  if (quote || quoteSource) {
    let qSize = Math.max(13, Math.min(W, H) * 0.019);
    const qFont = (sz) => `italic 700 ${sz}px Georgia, "Times New Roman", serif`;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const partA = quote ? `\u201c${quote.toUpperCase()}\u201d  ` : '';
    const stars = '\u2605'.repeat(5);
    const partB = quoteSource ? `  \u2014  ${quoteSource.toUpperCase()}` : '';
    ctx.font = qFont(qSize);
    const wA = ctx.measureText(partA).width;
    const wS = ctx.measureText(stars).width;
    const wB = ctx.measureText(partB).width;
    while (qSize > 10 && wA + wS + wB > W * 0.62) {
      qSize *= 0.94;
      ctx.font = qFont(qSize);
    }
    const total = ctx.measureText(partA).width + ctx.measureText(stars).width + ctx.measureText(partB).width;
    let qx = W / 2 - total / 2;
    const qy = H * 0.026;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText(partA, qx, qy);
    qx += ctx.measureText(partA).width;
    ctx.fillStyle = grade.accent;
    ctx.fillText(stars, qx, qy);
    qx += ctx.measureText(stars).width;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(partB, qx, qy);
    ctx.restore();
  }

  // Season badge, top-right corner, above the panels.
  drawBadge(ctx, W * 0.955, H * 0.008, state.badge, grade.accent);

  // Title block.
  const titleY = H * 0.76;
  const titleText = (state.title || 'SUNSET HEIST').toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = W * 0.012;
    ctx.shadowOffsetY = H * 0.01;
  }
  // Big title with a sunset gradient fill. The size is capped against the
  // shorter side, so a wide canvas keeps room for the lines below it.
  const titleSize = fitTitleFont(ctx, titleText, W * 0.94, Math.min(W * 0.115, H * 0.13));
  const tg = ctx.createLinearGradient(0, titleY - titleSize * 0.55, 0, titleY + titleSize * 0.55);
  tg.addColorStop(0, grade.titleTop);
  tg.addColorStop(1, grade.titleBottom);
  if (state.italic) {
    // Slant around the title's own centre, so the shear never shifts the
    // whole line sideways (a shear about the origin would).
    ctx.translate(W / 2, titleY);
    ctx.transform(1, 0, -0.1, 1, 0, 0);
    ctx.translate(-W / 2, -titleY);
  }
  if (state.outline) {
    ctx.lineWidth = Math.max(2, titleSize * 0.07);
    ctx.strokeStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.strokeText(titleText, W / 2, titleY);
  }
  ctx.fillStyle = tg;
  ctx.fillText(titleText, W / 2, titleY);
  ctx.restore();

  // Subtitle in a script-ish italic.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const subSize = Math.max(16, Math.min(W, H) * 0.032);
  ctx.font = `italic 700 ${subSize}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = grade.accent;
  if (state.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = W * 0.008;
    ctx.shadowOffsetY = H * 0.005;
  }
  const sub = state.subtitle || '';
  if (sub) ctx.fillText(sub, W / 2, titleY + titleSize * 0.62);
  ctx.restore();

  // Neon rule under the subtitle: a short gradient bar that ties the
  // title block together.
  const ruleW = W * 0.3;
  const ruleY = titleY + titleSize * 0.62 + subSize * 0.95;
  const rule = ctx.createLinearGradient(W / 2 - ruleW / 2, 0, W / 2 + ruleW / 2, 0);
  rule.addColorStop(0, grade.accent + '00');
  rule.addColorStop(0.5, grade.accent);
  rule.addColorStop(1, grade.accent + '00');
  ctx.save();
  ctx.fillStyle = rule;
  ctx.fillRect(W / 2 - ruleW / 2, ruleY, ruleW, Math.max(3, H * 0.004));
  ctx.restore();

  // Tagline under the neon rule, small caps.
  const tag = (state.tagline || '').trim();
  if (tag) {
    const tagSize = Math.max(12, Math.min(W, H) * 0.019);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${tagSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(tag.toUpperCase(), W / 2, ruleY + tagSize * 1.7);
    ctx.restore();
  }

  // Release line: gold small-caps on a dark pill above the billing block,
  // so it reads on any grade's sky.
  const relSize = Math.max(13, Math.min(W, H) * 0.02);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${relSize}px Arial, sans-serif`;
  const rel = (state.release || '').toUpperCase();
  if (rel) {
    const rw = ctx.measureText(rel).width;
    const pad = relSize * 1.1;
    const rh = relSize * 2.1;
    ctx.fillStyle = 'rgba(8,4,16,0.55)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - rw / 2 - pad, H * 0.925 - rh / 2, rw + pad * 2, rh, rh / 2);
    ctx.fill();
    ctx.fillStyle = grade.accent;
    ctx.fillText(rel, W / 2, H * 0.925 + relSize * 0.04);
  }
  ctx.restore();

  // Billing block.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const billSize = Math.max(11, W * 0.0165);
  ctx.font = `700 ${billSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  let billing = (state.billing || '').trim();
  if (!billing) {
    const tags = [];
    for (let i = 0; i < used; i++) {
      const t = (state.panels[i] && state.panels[i].tag) || '';
      if (t) tags.push(t.toUpperCase());
    }
    billing = tags.length > 0
      ? `STARRING ${tags.join('  ·  ')}   —   A VICE CITY STORY`
      : 'A VICE CITY STORY';
  }
  ctx.fillText(billing.toUpperCase(), W / 2, H * 0.965);
  ctx.restore();

  // Seal badge, bottom-left, clear of the centred billing line.
  const sealR = Math.max(24, Math.min(W, H) * 0.05);
  drawSeal(ctx, sealR * 1.15, H - sealR * 1.35, sealR, state.seal, grade.accent);

  // Grain + vignette for a printed-poster feel.
  const rnd = mulberry32(77);
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
  ctx.restore();
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}
