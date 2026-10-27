// Genera los SVG del perfil en tema claro y oscuro: node scripts/build-assets.mjs
// Colores y datos copiados del landing (src/styles/tokens.css, src/scripts/app.js, sección Log).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../profile/assets/', import.meta.url));

const THEMES = {
  dark: {
    bg: '#06080F', bg2: '#0A0E18', surface: '#10162A', surface2: '#182038',
    fg: '#F2F4FA', muted: '#A6AEC4', line: '#1C2440', accent: '#7A9FEB', accentSolid: '#4064C6',
    ops: '#8FE3DA', ok: '#72D9A0', warn: '#FCC04D', comb: '#4064C6', combOpacity: 0.1
  },
  light: {
    bg: '#F3F4F8', bg2: '#E9EBF2', surface: '#FFFFFF', surface2: '#E7EAF3',
    fg: '#0B1020', muted: '#4A5468', line: '#D5D9E6', accent: '#4064C6', accentSolid: '#4064C6',
    ops: '#127A70', ok: '#13804B', warn: '#8A5A00', comb: '#4064C6', combOpacity: 0.07
  }
};

const SANS = "Inter, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, Consolas, 'SFMono-Regular', monospace";

/* La celda Hexalis: punta arriba, proporción 1 : 1,1547, esquinas suavizadas */
const HEX_PATH = 'M57.8 4.5 L92.2 24.4 Q100 28.9 100 37.9 L100 77.6 Q100 86.6 92.2 91.1 L57.8 111 Q50 115.5 42.2 111 L7.8 91.1 Q0 86.6 0 77.6 L0 37.9 Q0 28.9 7.8 24.4 L42.2 4.5 Q50 0 57.8 4.5Z';
const HEX_RATIO = 1.1547;

const TEAM = [
  { label: 'Diseño', initials: 'JR', color: '#3987E5' },
  { label: 'Frontend', initials: 'FE', color: '#9085E9' },
  { label: 'Datos', initials: 'DA', color: '#1BAF7A' },
  { label: 'Docs', initials: 'DO', color: '#EDA100' },
  { label: 'Comunidad', initials: 'CO', color: '#E87BA4' },
  { label: 'Investigación', initials: 'RE', color: '#EB6834' }
];

const PALETTES = [
  ['Espectral', '#7A9FEB', '#4064C6', '#2E4383', '#6B5BD6'],
  ['Laguna', '#4AA8F0', '#0B6FB3', '#062F52', '#15A3A6'],
  ['Aurora', '#2BB8A3', '#0C7A6C', '#073F3B', '#5B6FD6'],
  ['Ciruela', '#B07CF2', '#8A3FD1', '#331A68', '#D4547E'],
  ['Magma', '#FF7A52', '#C2401F', '#3A1310', '#F08C2E'],
  ['Campo', '#8FB0FF', '#1B47B8', '#0D1A3D', '#1B47B8']
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const hex = (x, y, w, attrs = '') => `<use href="#hex" x="${x}" y="${y}" width="${w}" height="${(w * HEX_RATIO).toFixed(2)}" ${attrs}/>`;
const text = (x, y, s, { size = 14, weight = 400, fill, anchor = 'start', font = SANS, spacing, cls, opacity } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}${cls ? ` class="${cls}"` : ''}${opacity != null ? ` opacity="${opacity}"` : ''}>${esc(s)}</text>`;
// pseudoaleatorio estable: el SVG no cambia entre ejecuciones
const rand = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/* Lo animado parte desde oculto con fill-mode backwards: sin movimiento, todo se ve en su estado final */
const BASE_CSS = `
.rise{animation:rise .9s cubic-bezier(.23,1,.32,1) backwards}
.pop{animation:pop .7s cubic-bezier(.23,1,.32,1) backwards;transform-box:fill-box;transform-origin:center}
.fade{animation:fade 1.2s ease backwards}
.draw{stroke-dasharray:1;animation:draw 2.4s cubic-bezier(.77,0,.175,1) backwards}
.pulse{animation:pulse 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.float{animation:float 6s ease-in-out infinite}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}
@keyframes pop{from{opacity:0;transform:scale(.6)}}
@keyframes fade{from{opacity:0}}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes pulse{0%,100%{opacity:.45;transform:scale(.96)}50%{opacity:1;transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const svg = (w, h, title, desc, defs, body, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${BASE_CSS}${css}</style>
<defs>
<symbol id="hex" viewBox="0 0 100 115.47"><path d="${HEX_PATH}"/></symbol>
<symbol id="cube" viewBox="0 0 34 34"><path d="M17 2 30 9.5 17 17 4 9.5Z" fill="#7A9FEB"/><path d="M4 9.5 17 17v15L4 24.5Z" fill="#2E4383"/><path d="M30 9.5 17 17v15l13-7.5Z" fill="#4064C6"/></symbol>
${defs}
</defs>
${body}
</svg>
`;

const delay = s => `style="animation-delay:${s.toFixed(2)}s"`;

/* Panal de fondo: celdas que se encienden de a poco */
function comb(t, { x0, y0, cols, rows, w, gap, seed, lit = 0.18 }) {
  const r = rand(seed);
  const h = w * HEX_RATIO;
  const dx = w + gap, dy = h * 0.75 + gap * 0.866;
  let out = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = x0 + col * dx + (row % 2 ? dx / 2 : 0);
      const y = y0 + row * dy;
      const on = r() < lit;
      out += hex(x.toFixed(1), y.toFixed(1), w, on
        ? `fill="${t.comb}" class="twinkle" style="animation-delay:${(r() * 6).toFixed(2)}s" opacity="${t.combOpacity * 2.4}"`
        : `fill="none" stroke="${t.comb}" stroke-opacity="${t.combOpacity * 2.2}" stroke-width="1.2"`);
    }
  }
  return out;
}
const TWINKLE_CSS = `
.twinkle{animation:twinkle 6s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.05}50%{opacity:.32}}`;

/* 1. Portada */
function hero(t, mode) {
  const W = 1280, H = 440;
  const defs = `
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg2}"/><stop offset="1" stop-color="${t.bg}"/></linearGradient>
<radialGradient id="glow" cx=".72" cy=".42" r=".55"><stop offset="0" stop-color="${t.accentSolid}" stop-opacity="${mode === 'dark' ? 0.32 : 0.16}"/><stop offset="1" stop-color="${t.accentSolid}" stop-opacity="0"/></radialGradient>
<linearGradient id="fadeL" x1="0" x2="1"><stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="combMask"><rect width="${W}" height="${H}" fill="url(#fadeL)"/></mask>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

  // las seis celdas del equipo y la celda libre, armadas como un panal a la derecha
  const cw = 96, ch = cw * HEX_RATIO, cx = 930, cy = 120;
  const dx = cw + 8, dy = ch * 0.75 + 7;
  const spots = [[0, 0], [1, 0], [-0.5, 1], [0.5, 1], [1.5, 1], [0, 2]];
  const cells = TEAM.map((m, i) => {
    const [c, r] = spots[i];
    const x = cx + c * dx, y = cy + r * dy;
    return `<g class="pop" ${delay(0.5 + i * 0.12)}>${hex(x, y, cw, `fill="${m.color}"`)}
${text(x + cw / 2, y + ch / 2 + 9, m.initials, { size: 24, weight: 700, fill: '#0D121D', anchor: 'middle' })}</g>`;
  }).join('\n');
  const fx = cx + dx, fy = cy + 2 * dy;
  const free = `<g class="pop" ${delay(1.35)}><g class="pulse">${hex(fx, fy, cw, `fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-dasharray="7 6"`)}</g>
${text(fx + cw / 2, fy + ch / 2 + 7, 'Tú', { size: 20, weight: 700, fill: t.accent, anchor: 'middle' })}</g>`;

  const chips = ['sin fines de lucro', 'open source', 'MIT + CC BY 4.0', 'hecho en Nicaragua'];
  let chipX = 96;
  const chipEls = chips.map((c, i) => {
    const w = c.length * 7.6 + 34;
    const el = `<g class="rise" ${delay(1 + i * 0.1)}><rect x="${chipX}" y="318" width="${w}" height="34" rx="17" fill="${t.surface}" stroke="${t.line}"/>
${text(chipX + w / 2, 340, c, { size: 13, fill: t.muted, anchor: 'middle' })}</g>`;
    chipX += w + 10;
    return el;
  }).join('\n');

  const body = `
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g mask="url(#combMask)">${comb(t, { x0: -20, y0: -40, cols: 22, rows: 9, w: 56, gap: 6, seed: 7 })}</g>
${cells}
${free}
<g transform="translate(96 62)"><g class="float"><use href="#cube" width="56" height="56"/></g></g>
<g class="rise" ${delay(0.1)}>${text(96, 210, 'Hexalis', { size: 92, weight: 800, fill: t.fg, spacing: '-0.035em' })}</g>
<g class="rise" ${delay(0.25)}>${text(168, 98, 'ORGANIZACIÓN OPEN SOURCE', { size: 13, weight: 600, fill: t.accent, spacing: '0.28em' })}</g>
<g class="rise" ${delay(0.4)}>${text(98, 258, 'El conocimiento es universal.', { size: 28, weight: 600, fill: t.fg })}</g>
<g class="rise" ${delay(0.55)}>${text(98, 290, 'Knowledge is universal.', { size: 18, fill: t.muted, font: SANS })}<rect x="300" y="274" width="2" height="20" fill="${t.accent}" class="blink"/></g>
${chipEls}`;
  return svg(W, H, 'Hexalis', 'El conocimiento es universal. Organización open source sin fines de lucro, hecha en Nicaragua. Seis celdas del equipo y una celda libre: la tuya.', defs, body, TWINKLE_CSS);
}

/* 2. Cifras de las dos librerías */
function stats(t) {
  const W = 1280, H = 250;
  const groups = [
    { name: 'Hexalis Design System', ver: 'v1.0.0', color: t.accent, x: 0, items: [['85', 'componentes'], ['6', 'paletas'], ['1.614', 'variantes']] },
    { name: 'Hexalis Design Ops Toolkit', ver: 'v1.0.0', color: t.ops, x: 650, items: [['16', 'plantillas'], ['6', 'kits'], ['112', 'componentes']] }
  ];
  let i = 0;
  const body = groups.map(g => {
    const head = `<g class="rise" ${delay(i * 0.1)}>${hex(g.x + 4, 14, 18, `fill="${g.color}"`)}
${text(g.x + 32, 32, g.name, { size: 17, weight: 700, fill: t.fg })}
${text(g.x + 32 + g.name.length * 9.6 + 10, 32, g.ver, { size: 13, fill: g.color, font: MONO })}</g>`;
    const cards = g.items.map(([n, label], k) => {
      const x = g.x + k * 210, d = 0.2 + i++ * 0.12;
      return `<g class="rise" ${delay(d)}><clipPath id="c${x}"><rect x="${x}" y="56" width="196" height="170" rx="20"/></clipPath>
<rect x="${x}" y="56" width="196" height="170" rx="20" fill="${t.surface}" stroke="${t.line}"/>
<g opacity=".14" clip-path="url(#c${x})">${hex(x + 120, 70, 110, `fill="${g.color}"`)}</g>
${text(x + 24, 150, n, { size: 58, weight: 800, fill: t.fg, spacing: '-0.03em' })}
<rect x="${x + 24}" y="168" width="28" height="3" rx="1.5" fill="${g.color}"/>
${text(x + 24, 198, label, { size: 16, fill: t.muted })}</g>`;
    }).join('\n');
    return head + cards;
  }).join('\n');
  return svg(W, H, 'Las dos librerías en cifras', 'Hexalis Design System v1.0.0: 85 componentes, 6 paletas, 1.614 variantes. Hexalis Design Ops Toolkit v1.0.0: 16 plantillas, 6 kits, 112 componentes.', '', body);
}

/* 3. Las seis paletas */
function palettes(t) {
  const W = 1280, H = 230;
  const body = PALETTES.map(([name, ...colors], i) => {
    const x0 = i * 213 + 6, w = 58, h = w * HEX_RATIO, dx = w + 4, dy = h * 0.75 + 3.5;
    const spots = [[0, 0], [1, 0], [0.5, 1], [1.5, 1]];
    const cells = colors.map((c, k) => `<g class="pop" ${delay(i * 0.12 + k * 0.08)}>${hex(x0 + 30 + spots[k][0] * dx, 10 + spots[k][1] * dy, w, `fill="${c}"`)}</g>`).join('');
    return `${cells}
<g class="rise" ${delay(0.4 + i * 0.1)}>${text(x0 + 30, 184, name, { size: 18, weight: 700, fill: t.fg })}
${text(x0 + 30, 208, colors.slice(0, 2).join(' · '), { size: 12, fill: t.muted, font: MONO })}</g>`;
  }).join('\n');
  return svg(W, H, 'Seis paletas', 'Las seis paletas de Hexalis Design System: Espectral, Laguna, Aurora, Ciruela, Magma y Campo.', '', body);
}

/* 4. Bitácora: dos ideas, una organización (fechas del historial de cambios) */
function timeline(t) {
  const W = 1280, H = 470;
  const day = d => (d === 3 ? 96 : 330 + (d - 11) * 82.5);
  const NOW = 1190, Y = { ops: 150, org: 250, ds: 350 };
  const col = { ops: t.ops, ds: t.accent, org: t.fg };
  const ev = [
    { lane: 'org', d: 3, date: '3 oct', title: 'Nace Hexalis en GitHub', tag: '', ly: 300, anchor: 'start' },
    { lane: 'ops', d: 11, date: '11 oct', title: 'Primera versión del kit', tag: 'v1.0.0', ly: 58 },
    { lane: 'ops', d: 12, date: '12 oct', title: 'Cuatro versiones en un día', tag: '1.3 → 2.2', ly: 104 },
    { lane: 'ds', d: 12, date: '12 oct', title: 'Arranca el sistema', tag: '0.1 → 0.3', ly: 398 },
    { lane: 'ds', d: 14, date: '14 oct', title: 'Componentes avanzados', tag: '0.4 → 1.0', ly: 444 },
    { lane: 'ds', d: 15, date: '15 oct', title: 'Plan v2: fundamentos', tag: '1.1 → 2.0', ly: 398 },
    { lane: 'ops', d: 18, date: '18 oct', title: 'El kit cambia de nombre', tag: '3.0.0', ly: 58, anchor: 'end' },
    { lane: 'org', d: 19, date: '19 oct', title: 'Se vuelven Hexalis', tag: 'v1.0.0', ly: 300, strong: true },
    { lane: 'org', x: NOW, date: 'ahora', title: 'Space Apps y el portal', tag: '', ly: 206, anchor: 'end', now: true }
  ];
  const mx = day(19);
  const lanes = `
<path d="M${day(3)} ${Y.org} H${mx}" stroke="${t.muted}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" fill="none" class="fade"/>
<path d="M${day(11)} ${Y.ops} H${day(18) + 20} C${mx - 30} ${Y.ops} ${mx - 40} ${Y.org} ${mx} ${Y.org}" pathLength="1" stroke="${t.ops}" stroke-width="4" stroke-linecap="round" fill="none" class="draw" ${delay(0.2)}/>
<path d="M${day(12)} ${Y.ds} H${day(15) + 120} C${mx - 60} ${Y.ds} ${mx - 40} ${Y.org} ${mx} ${Y.org}" pathLength="1" stroke="${t.accent}" stroke-width="4" stroke-linecap="round" fill="none" class="draw" ${delay(0.4)}/>
<path d="M${mx} ${Y.org} H${NOW}" pathLength="1" stroke="${t.fg}" stroke-width="6" stroke-linecap="round" fill="none" class="draw" ${delay(2.2)}/>
<g class="fade" ${delay(0.3)}>${text(day(3) + 120, Y.org - 14, '8 días después…', { size: 12, fill: t.muted, font: MONO, anchor: 'middle' })}</g>`;
  const nodes = ev.map((e, i) => {
    const x = e.x ?? day(e.d), y = Y[e.lane], c = col[e.lane];
    const d = 0.3 + i * 0.22;
    const lx = e.anchor === 'end' ? x + 8 : x - 8;
    const anchor = e.anchor === 'end' ? 'end' : 'start';
    const up = e.ly < y;
    const leader = `<path d="M${x} ${y + (up ? -12 : 12)} V${up ? e.ly + 26 : e.ly - 30}" stroke="${t.line}" stroke-width="1.5"/>`;
    const node = e.now
      ? `<g class="pulse">${hex(x - 16, y - 18.5, 32, `fill="none" stroke="${t.accent}" stroke-width="3"`)}</g>`
      : hex(x - (e.strong ? 15 : 10), y - (e.strong ? 17.3 : 11.5), e.strong ? 30 : 20, `fill="${c}" stroke="${t.bg}" stroke-width="10"`);
    const labelY = up ? e.ly - 20 : e.ly - 14;
    const tag = e.tag ? text(lx, labelY + 38, e.tag, { size: 12, fill: c === t.fg ? t.accent : c, font: MONO, anchor }) : '';
    return `<g class="pop" ${delay(d)}>${node}</g>
<g class="rise" ${delay(d + 0.1)}>${leader}${text(lx, labelY, e.date.toUpperCase(), { size: 11, weight: 600, fill: t.muted, font: MONO, anchor, spacing: '0.12em' })}
${text(lx, labelY + 20, e.title, { size: 16, weight: e.strong || e.now ? 700 : 600, fill: t.fg, anchor })}${tag}</g>`;
  }).join('\n');
  const legend = [['Design Ops Toolkit', t.ops], ['Design System', t.accent], ['Organización', t.fg]].map(([n, c], i) =>
    `<g class="fade">${hex(96, 382 + i * 26, 12, `fill="${c}"`)}${text(116, 394 + i * 26, n, { size: 13, fill: t.muted })}</g>`).join('');
  return svg(W, H, 'Bitácora: 16 días', 'Del 3 al 19 de octubre de 2026, dos librerías que nacieron por separado se volvieron Hexalis. Fechas tomadas del historial de cambios de cada librería.', '', legend + lanes + nodes);
}

/* 5. El equipo: seis celdas alrededor del logo y una celda libre */
function team(t) {
  const W = 1280, H = 360;
  const w = 112, h = w * HEX_RATIO, dx = w + 10, dy = h * 0.75 + 9;
  const cx = 470, cy = 30;
  const ring = [[0, 0], [1, 0], [1.5, 1], [1, 2], [0, 2], [-0.5, 1]];
  const cells = TEAM.map((m, i) => {
    const [c, r] = ring[i];
    const x = cx + c * dx, y = cy + r * dy;
    return `<g class="pop" ${delay(0.2 + i * 0.12)}>${hex(x, y, w, `fill="${m.color}"`)}
${text(x + w / 2, y + h / 2 + 4, m.initials, { size: 28, weight: 800, fill: '#0D121D', anchor: 'middle' })}
${text(x + w / 2, y + h / 2 + 26, m.label, { size: 12, weight: 600, fill: '#0D121D', anchor: 'middle', opacity: 0.8 })}</g>`;
  }).join('\n');
  const mx = cx + 0.5 * dx, my = cy + dy;
  const center = `<g class="pop">${hex(mx, my, w, `fill="${t.surface}" stroke="${t.line}" stroke-width="2"`)}
<g transform="translate(${mx + w / 2 - 26} ${my + h / 2 - 26})"><g class="float"><use href="#cube" width="52" height="52"/></g></g></g>`;
  const fx = cx + 2.5 * dx + 30, fy = cy + dy;
  const free = `<g class="pop" ${delay(1.1)}><g class="pulse">${hex(fx, fy, w, `fill="none" stroke="${t.accent}" stroke-width="3" stroke-dasharray="8 7"`)}</g>
${text(fx + w / 2, fy + h / 2 + 4, 'Tú', { size: 28, weight: 800, fill: t.accent, anchor: 'middle' })}
${text(fx + w / 2, fy + h / 2 + 26, 'celda libre', { size: 12, weight: 600, fill: t.accent, anchor: 'middle' })}</g>
<path d="M${cx + 2.5 * dx - 6} ${fy + h / 2} H${fx - 4}" stroke="${t.accent}" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round" class="fade" ${delay(1.2)}/>`;
  const side = `<g class="rise">${text(96, 150, 'Seis personas,', { size: 34, weight: 800, fill: t.fg, spacing: '-0.02em' })}
${text(96, 192, 'un mismo panal.', { size: 34, weight: 800, fill: t.fg, spacing: '-0.02em' })}
${text(96, 232, 'Cada celda es alguien del equipo.', { size: 16, fill: t.muted })}
${text(96, 256, 'Al final queda una libre: la tuya.', { size: 16, fill: t.muted })}</g>`;
  return svg(W, H, 'El equipo', 'Seis celdas de colores alrededor del logo de Hexalis, una por disciplina: diseño, frontend, datos, docs, comunidad e investigación. Al lado, una celda libre con la palabra Tú.', '', side + center + cells + free);
}

/* 6. El recorrido: de una idea a tu celda */
function journey(t) {
  const W = 1280, H = 210;
  const steps = ['Una idea', 'Seis personas', 'El sistema', 'El ciclo', 'Los proyectos', 'Tu celda'];
  const w = 84, h = w * HEX_RATIO, gap = (W - 120 - w * 6) / 5;
  const xs = steps.map((_, i) => 60 + i * (w + gap));
  const yc = 20 + h / 2;
  const line = `<path id="route" d="M${xs[0] + w / 2} ${yc} H${xs[5] + w / 2}" stroke="${t.line}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" fill="none"/>
<circle r="7" fill="${t.accent}" class="travel"/>`;
  const cells = steps.map((s, i) => {
    const last = i === steps.length - 1, x = xs[i];
    const shape = last
      ? `<g class="pulse">${hex(x, 20, w, `fill="${t.bg}" stroke="${t.accent}" stroke-width="3" stroke-dasharray="7 6"`)}</g>`
      : hex(x, 20, w, `fill="${t.surface}" stroke="${t.line}" stroke-width="2"`);
    return `<g class="pop" ${delay(i * 0.15)}>${shape}
${text(x + w / 2, yc + 9, String(i + 1).padStart(2, '0'), { size: 24, weight: 800, fill: last ? t.accent : t.fg, anchor: 'middle', font: MONO })}</g>
<g class="rise" ${delay(0.2 + i * 0.15)}>${text(x + w / 2, 160, s, { size: 17, weight: 700, fill: last ? t.accent : t.fg, anchor: 'middle' })}</g>`;
  }).join('\n');
  const css = `
.travel{offset-path:path('M${xs[0] + w / 2} ${yc} H${xs[5] + w / 2}');animation:travel 7s cubic-bezier(.77,0,.175,1) infinite}
@keyframes travel{0%{offset-distance:0%;opacity:0}8%{opacity:1}85%{offset-distance:100%;opacity:1}100%{offset-distance:100%;opacity:0}}`;
  return svg(W, H, 'De una idea a tu celda', 'El recorrido de Hexalis en seis pasos: una idea, seis personas, el sistema, el ciclo, los proyectos y tu celda.', '', line + cells, css);
}

/* 7. Separador */
function divider(t) {
  const W = 1280, H = 28;
  const body = `<path d="M40 14 H600 M680 14 H1240" stroke="${t.line}" stroke-width="1.5"/>
${hex(611, 4, 16, `fill="${t.accent}" class="pop"`)}${hex(632, 2, 20, `fill="${t.ops}" class="pop" ${delay(0.1)}`)}${hex(657, 4, 16, `fill="none" stroke="${t.accent}" stroke-width="3" class="pulse"`)}`;
  return svg(W, H, '', '', '', body);
}

/* 8. Cierre */
function footer(t, mode) {
  const W = 1280, H = 300;
  const defs = `<radialGradient id="g2" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="${t.accentSolid}" stop-opacity="${mode === 'dark' ? 0.35 : 0.14}"/><stop offset="1" stop-color="${t.accentSolid}" stop-opacity="0"/></radialGradient>
<linearGradient id="fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="m2"><rect width="${W}" height="${H}" fill="url(#fadeV)"/></mask>`;
  const body = `<rect width="${W}" height="${H}" rx="28" fill="${t.bg2}"/>
<rect width="${W}" height="${H}" rx="28" fill="url(#g2)"/>
<g mask="url(#m2)">${comb(t, { x0: -10, y0: 30, cols: 24, rows: 5, w: 50, gap: 6, seed: 11, lit: 0.22 })}</g>
<g class="rise">${text(W / 2, 112, 'La siguiente pieza puede ser tuya.', { size: 40, weight: 800, fill: t.fg, anchor: 'middle', spacing: '-0.02em' })}</g>
<g class="rise" ${delay(0.15)}>${text(W / 2, 150, 'Usa lo que ya hicimos, mejóralo o propón un proyecto nuevo.', { size: 18, fill: t.muted, anchor: 'middle' })}</g>
<g class="rise" ${delay(0.3)}><rect x="${W / 2 - 92}" y="184" width="184" height="46" rx="23" fill="${t.accent}"/>
${text(W / 2, 213, 'hexalis.org  →', { size: 17, weight: 700, fill: mode === 'dark' ? '#06080F' : '#FFFFFF', anchor: 'middle' })}</g>`;
  return svg(W, H, 'La siguiente pieza puede ser tuya', 'Usa lo que ya hicimos, mejóralo o propón un proyecto nuevo. hexalis.org', defs, body, TWINKLE_CSS);
}

mkdirSync(OUT, { recursive: true });
const BUILDERS = { hero, stats, palettes, timeline, team, journey, divider, footer };
for (const [mode, t] of Object.entries(THEMES)) {
  for (const [name, build] of Object.entries(BUILDERS)) {
    writeFileSync(`${OUT}${name}-${mode}.svg`, build(t, mode));
  }
}
console.log(`SVG listos en ${OUT}`);
