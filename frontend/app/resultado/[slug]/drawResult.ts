import type { WorkoutResult } from './results';

// Dibuja la tarjeta de resultados sobre un canvas. Replica el diseño de
// ResultView (mismas proporciones, medidas en un lienzo de 375px de ancho).

const TEAL = '#17c3a5';
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const nf = new Intl.NumberFormat('es-CO');

const PW = 468; // ancho interno de la tarjeta (351 visibles / .75)

export type Frame = { source: CanvasImageSource; width: number; height: number };

function font(weight: number, size: number) {
  return `${weight} ${size}px ${FONT}`;
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { weight: number; size: number; color?: string; align?: CanvasTextAlign; alpha?: number; baseline?: CanvasTextBaseline }
) {
  ctx.save();
  ctx.font = font(opts.weight, opts.size);
  ctx.fillStyle = opts.color ?? '#fff';
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.baseline ?? 'top';
  ctx.fillText(value, x, y);
  ctx.restore();
}

function measure(ctx: CanvasRenderingContext2D, value: string, weight: number, size: number) {
  ctx.save();
  ctx.font = font(weight, size);
  const w = ctx.measureText(value).width;
  ctx.restore();
  return w;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBody(ctx: CanvasRenderingContext2D, x: number, y: number, back: boolean) {
  const k = 44 / 60;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#e9edf2';
  ctx.beginPath();
  ctx.arc(30, 9, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fill(new Path2D('M17 20h26l6 8-3 30H14l-3-30z'));
  ctx.fillStyle = '#cfd6df';
  ctx.fill(new Path2D('M8 26l7 2-5 30-6-2zM52 26l-7 2 5 30 6-2z'));
  ctx.fillStyle = '#e9edf2';
  ctx.fill(new Path2D('M17 58h26l1 14H16z'));
  ctx.fillStyle = TEAL;
  ctx.fill(new Path2D('M17 72h12l-2 40h-8zM31 72h12l-2 40h-8z'));
  ctx.fillStyle = '#e9edf2';
  ctx.fill(new Path2D('M19 112h8l-1 14h-8zM33 112h8l1 14h-8z'));
  if (back) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#2c6fe0';
    ctx.fill(new Path2D('M21 30h18l-2 22H23z'));
  }
  ctx.restore();
}

function drawColumn(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const k = 44 / 70;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#d9b183';
  ctx.fillRect(4, 6, 62, 10);
  ctx.fillStyle = '#b88d62';
  ctx.fillRect(12, 16, 46, 6);
  const g = ctx.createLinearGradient(17, 0, 53, 0);
  g.addColorStop(0, '#8a6a4a');
  g.addColorStop(0.45, '#f3c58a');
  g.addColorStop(1, '#7a5a3c');
  ctx.fillStyle = g;
  ctx.fill(new Path2D('M17 22h36l-3 92H20z'));
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.lineWidth = 1.2;
  for (const cx of [27, 35, 43]) ctx.stroke(new Path2D(`M${cx} 22l-1 92`));
  ctx.fillStyle = '#b88d62';
  ctx.fillRect(10, 114, 50, 8);
  ctx.fillStyle = '#d9b183';
  ctx.fillRect(4, 122, 62, 6);
  ctx.restore();
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  points: { label: string; kg: number }[]
) {
  const W = 190;
  const H = 90;
  const k = width / W;
  const px = (i: number) => 12 + (i * (W - 24)) / (points.length - 1);
  const py = (kg: number) => H - 8 - ((kg - 40) / 60) * (H - 16);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);

  for (const v of [40, 60, 80, 100]) {
    ctx.strokeStyle = 'rgba(255,255,255,.13)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, py(v));
    ctx.lineTo(W, py(v));
    ctx.stroke();
    text(ctx, `${v} kg`, 0, py(v) - 2, { weight: 400, size: 6, color: '#fff', alpha: 0.67, baseline: 'alphabetic' });
  }

  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(px(i), py(p.kg)) : ctx.moveTo(px(i), py(p.kg))));
  ctx.stroke();

  ctx.fillStyle = '#fff';
  for (const [i, r] of [[0, 2.2], [points.length - 1, 2.6]] as const) {
    ctx.beginPath();
    ctx.arc(px(i), py(points[i].kg), r, 0, Math.PI * 2);
    ctx.fill();
  }
  points.forEach((p, i) => {
    if (p.label) text(ctx, p.label, px(i), H + 8, { weight: 400, size: 6, alpha: 0.67, align: 'center', baseline: 'alphabetic' });
  });
  ctx.restore();
}

function drawPanel(ctx: CanvasRenderingContext2D, result: WorkoutResult) {
  const { exercise } = result;
  const padX = 14;

  // --- altura total ---
  const gridTop = 16 + 22 + 25 + 81.7 + 6 + 15 + 16 + 15;
  const gridH = 190.8;
  const panelH = gridTop + gridH + 16;

  roundRect(ctx, 0, 0, PW, panelH, 20);
  ctx.fillStyle = 'rgba(0,0,0,.68)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- encabezado ---
  let y = 16;
  text(ctx, result.routine.toUpperCase(), PW / 2, y, { weight: 800, size: 18, align: 'center' });
  y += 22;
  text(ctx, 'Levantaste un total de', PW / 2, y + 2, { weight: 400, size: 12, alpha: 0.85, align: 'center' });
  y += 25;

  const num = nf.format(result.totalKg);
  const numW = measure(ctx, num, 900, 52);
  const kgW = measure(ctx, ' kg', 700, 18);
  const rowW = 44 + 14 + numW + kgW;
  const rx = (PW - rowW) / 2;
  drawColumn(ctx, rx, y);
  const base = y + 81.7 / 2 + 18;
  text(ctx, num, rx + 58, base, { weight: 900, size: 52, baseline: 'alphabetic' });
  text(ctx, ' kg', rx + 58 + numW, base, { weight: 700, size: 18, baseline: 'alphabetic' });
  y += 81.7 + 6;
  text(ctx, result.comparison, PW / 2, y, { weight: 400, size: 12, alpha: 0.9, align: 'center' });

  // --- separador ---
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(padX, gridTop - 15, PW - padX * 2, 1);

  // --- columna izquierda ---
  const lx = padX;
  const lw = 198;
  const lcx = lx + lw / 2;
  text(ctx, result.routine.toUpperCase(), lcx, gridTop, { weight: 800, size: 13, align: 'center' });
  const by = gridTop + 24;
  drawBody(ctx, lcx - 48, by, false);
  drawBody(ctx, lcx + 4, by, true);

  const sy = by + 95.3 + 12;
  const items = [
    { v: result.duration, l: 'MIN', color: '#fff' },
    { v: nf.format(result.totalKg), l: 'KG', color: '#fff' },
    { v: `${result.records} 🏅`, l: 'RÉCORD', color: TEAL },
  ].map((it) => ({ ...it, w: Math.max(measure(ctx, it.v, 800, 15), measure(ctx, it.l, 700, 9)) }));
  const free = lw - items.reduce((a, it) => a + it.w, 0);
  let sx = lx;
  items.forEach((it, i) => {
    const cx = sx + it.w / 2;
    text(ctx, it.v, cx, sy, { weight: 800, size: 15, color: it.color, align: 'center' });
    text(ctx, it.l, cx, sy + 18, { weight: 700, size: 9, alpha: 0.7, align: 'center' });
    sx += it.w + free / (items.length - 1);
    void i;
  });

  // --- columna derecha ---
  const rcx0 = padX + lw + 14;
  const rw = PW - padX - rcx0;
  text(ctx, exercise.name.toUpperCase(), rcx0 + rw / 2, gridTop, { weight: 800, size: 13, align: 'center' });
  const cy = gridTop + 24;
  drawChart(ctx, rcx0, cy, rw, exercise.points);
  const dy = cy + 124.8 + 8;
  const a = `${exercise.from} kg → `;
  const b = `${exercise.to} kg`;
  const aw = measure(ctx, a, 800, 15);
  const bw = measure(ctx, b, 800, 15);
  const dx = rcx0 + (rw - aw - bw) / 2;
  text(ctx, a, dx, dy, { weight: 800, size: 15 });
  text(ctx, b, dx + aw, dy, { weight: 800, size: 15, color: TEAL });
  text(ctx, exercise.progress, rcx0 + rw / 2, dy + 20, { weight: 400, size: 11, alpha: 0.85, align: 'center' });
}

export function drawResult(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  frame: Frame,
  result: WorkoutResult
) {
  const s = W / 375;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Fondo: ancho completo, pegado abajo.
  const h = (frame.height * W) / frame.width;
  ctx.drawImage(frame.source, 0, H - h, W, h);

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#000');
  g.addColorStop(0.08, '#000');
  g.addColorStop(0.32, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(12 * s, 14 * s);
  ctx.scale(0.75 * s, 0.75 * s);
  drawPanel(ctx, result);
  ctx.restore();

  ctx.save();
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in c) c.letterSpacing = `${2.8 * s}px`;
  text(ctx, result.athlete.toUpperCase(), W / 2, H - 18 * s, {
    weight: 700,
    size: 14 * s,
    align: 'center',
    baseline: 'bottom',
  });
  ctx.restore();
}
