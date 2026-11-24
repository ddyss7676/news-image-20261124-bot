// THE WORLD LEDGER — front page for Tuesday 24 November 2026.
// make.fun competition news-image-20261124. Draws the whole page in code
// (no photographs, no network, no copied art) and writes /output/entry.png.
// Node 22, standard library only. Deterministic: same bytes every run.

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join } from 'node:path';

// ---------------------------------------------------------------- font --
// One 5x7 bitmap font, uppercase only (a newspaper front page sets its
// decks in caps). '#' is ink, '.' is empty. Drawn by hand for this entry.
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  ';': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '"': ['.#.#.', '.#.#.', '.#.#.', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '&': ['.###.', '#...#', '#...#', '.#...', '#.#.#', '#..#.', '.##.#'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '#.#.#', '#..##'],
  $: ['..#..', '.####', '#.#.#', '.###.', '..#.#', '####.', '..#..'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '*': ['.....', '.#.#.', '..#..', '#####', '..#..', '.#.#.', '.....'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.'],
  _: ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  '<': ['...#.', '..#..', '.#...', '#....', '.#...', '..#..', '...#.'],
  '>': ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  '[': ['.###.', '.#...', '.#...', '.#...', '.#...', '.#...', '.###.'],
  ']': ['.###.', '...#.', '...#.', '...#.', '...#.', '...#.', '.###.'],
  '·': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  '•': ['.....', '.....', '.###.', '#####', '#####', '.###.', '.....'],
  '°': ['.###.', '#...#', '#...#', '.###.', '.....', '.....', '.....'],
  '×': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  '→': ['.....', '..#..', '...#.', '#####', '...#.', '..#..', '.....'],
};

// ---------------------------------------------------------------- canvas --
const W = 1024;
const H = 1024;

const PAPER: [number, number, number] = [247, 243, 232]; // warm newsprint
const INK: [number, number, number] = [26, 26, 26];
const RED: [number, number, number] = [179, 32, 44];
const BLUE: [number, number, number] = [31, 58, 95];
const GREY: [number, number, number] = [107, 107, 107];
const LIGHT: [number, number, number] = [200, 214, 223]; // map sea
const LAND: [number, number, number] = [214, 206, 178];
const GOLD: [number, number, number] = [176, 124, 32];
const GREEN: [number, number, number] = [46, 110, 66];
const WHITE: [number, number, number] = [255, 255, 255];

type RGB = [number, number, number];

class Canvas {
  buf = new Uint8Array(W * H * 3);
  constructor() {
    for (let i = 0; i < W * H; i++) {
      this.buf[i * 3] = PAPER[0];
      this.buf[i * 3 + 1] = PAPER[1];
      this.buf[i * 3 + 2] = PAPER[2];
    }
  }
  px(x: number, y: number, c: RGB) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGB) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.px(i, j, c);
  }
  rect(x: number, y: number, w: number, h: number, c: RGB, t = 1) {
    this.fillRect(x, y, w, t, c);
    this.fillRect(x, y + h - t, w, t, c);
    this.fillRect(x, y, t, h, c);
    this.fillRect(x + w - t, y, t, h, c);
  }
  hline(x: number, y: number, w: number, c: RGB, t = 1) {
    this.fillRect(x, y, w, t, c);
  }
  vline(x: number, y: number, h: number, c: RGB, t = 1) {
    this.fillRect(x, y, t, h, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;
    for (;;) {
      for (let a = 0; a < t; a++)
        for (let b = 0; b < t; b++) this.px(x + a, y + b, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }
  circle(cx: number, cy: number, r: number, c: RGB, fill = true) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (fill ? d <= r * r : d <= r * r && d >= (r - 1) * (r - 1))
          this.px(cx + x, cy + y, c);
      }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB) {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1)
          this.px(cx + x, cy + y, c);
  }
  triangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB) {
    const minX = Math.min(x0, x1, x2);
    const maxX = Math.max(x0, x1, x2);
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    if (d === 0) return;
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) {
        const a = ((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x)) / d;
        const b = ((x2 - x) * (y0 - y) - (y2 - y) * (x0 - x)) / d;
        const g = 1 - a - b;
        if (a >= 0 && b >= 0 && g >= 0) this.px(x, y, c);
      }
  }
}

// ------------------------------------------------------------------- text --
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale;
}

function drawChar(cv: Canvas, ch: string, x: number, y: number, scale: number, c: RGB) {
  const g = FONT[ch] ?? FONT['?'];
  for (let r = 0; r < 7; r++)
    for (let col = 0; col < 5; col++)
      if (g[r][col] === '#')
        cv.fillRect(x + col * scale, y + r * scale, scale, scale, c);
}

function drawText(cv: Canvas, s: string, x: number, y: number, scale: number, c: RGB, bold = false) {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    drawChar(cv, ch, cx, y, scale, c);
    if (bold) drawChar(cv, ch, cx + 1, y, scale, c);
    cx += 6 * scale;
  }
}

function drawTextCentered(cv: Canvas, s: string, cx: number, y: number, scale: number, c: RGB, bold = false) {
  drawText(cv, s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c, bold);
}

function wrapText(s: string, maxW: number, scale: number): string[] {
  const words = s.toUpperCase().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (textWidth(test, scale) <= maxW) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawBlock(cv: Canvas, s: string, x: number, y: number, maxW: number, scale: number, c: RGB, lh: number, maxLines = 99) {
  const lines = wrapText(s, maxW, scale).slice(0, maxLines);
  lines.forEach((ln, i) => drawText(cv, ln, x, y + i * lh, scale, c));
  return lines.length;
}

// -------------------------------------------------------------------- png --
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePNG(cv: Canvas): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    Buffer.from(cv.buf.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------- illustrations --
// Every picture on the page is drawn here in code — original art, no photos.

function drawChip(cv: Canvas, x: number, y: number, w: number, h: number) {
  // microchip under a magnifier
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const cx = x + Math.floor(w * 0.42);
  const cy = y + Math.floor(h * 0.5);
  const s = Math.min(w, h) - 24;
  const bx = cx - Math.floor(s / 2);
  const by = cy - Math.floor(s / 2);
  cv.fillRect(bx, by, s, s, INK);
  cv.fillRect(bx + 6, by + 6, s - 12, s - 12, [42, 42, 42]);
  cv.fillRect(bx + 12, by + 12, s - 24, s - 24, GOLD);
  for (let i = 0; i < 4; i++) {
    cv.fillRect(bx - 6, by + 8 + i * 9, 6, 3, INK);
    cv.fillRect(bx + s, by + 8 + i * 9, 6, 3, INK);
    cv.fillRect(bx + 8 + i * 9, by - 6, 3, 6, INK);
    cv.fillRect(bx + 8 + i * 9, by + s, 3, 6, INK);
  }
  // circuit traces
  cv.line(bx + s + 6, by + 12, x + w - 8, by + 12, BLUE, 2);
  cv.line(bx + s + 6, by + s - 12, x + w - 8, by + s - 12, BLUE, 2);
  // magnifier
  const mx = x + w - 26;
  const my = y + 22;
  cv.circle(mx, my, 13, RED, false);
  cv.circle(mx, my, 13, RED, false);
  cv.line(mx + 9, my + 9, mx + 20, my + 20, RED, 3);
  cv.circle(mx, my, 9, WHITE, false);
}

function drawChart(cv: Canvas, x: number, y: number, w: number, h: number) {
  // rising market bars + arrow
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const base = y + h - 12;
  const bars = [0.25, 0.4, 0.32, 0.55, 0.48, 0.72, 0.95];
  const bw = Math.floor((w - 16) / bars.length);
  bars.forEach((v, i) => {
    const bh = Math.floor((h - 30) * v);
    cv.fillRect(x + 8 + i * bw, base - bh, bw - 4, bh, i === bars.length - 1 ? GREEN : BLUE);
  });
  cv.line(x + 8, base - Math.floor((h - 30) * 0.25), x + w - 8, base - Math.floor((h - 30) * 0.95), RED, 3);
  cv.line(x + w - 8, base - Math.floor((h - 30) * 0.95), x + w - 20, base - Math.floor((h - 30) * 0.95), RED, 3);
  cv.line(x + w - 8, base - Math.floor((h - 30) * 0.95), x + w - 8, base - Math.floor((h - 30) * 0.95) + 12, RED, 3);
  cv.circle(x + w - 16, y + 14, 7, GOLD);
}

function drawSchool(cv: Canvas, x: number, y: number, w: number, h: number) {
  // schoolhouse under a hot sun, dry ground
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  cv.circle(x + w - 18, y + 16, 10, GOLD);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    cv.line(x + w - 18 + Math.floor(Math.cos(a) * 13), y + 16 + Math.floor(Math.sin(a) * 13),
      x + w - 18 + Math.floor(Math.cos(a) * 17), y + 16 + Math.floor(Math.sin(a) * 17), GOLD, 2);
  }
  const hx = x + 14;
  const hy = y + h - 34;
  const hw = Math.floor(w * 0.55);
  cv.fillRect(hx, hy, hw, 26, [196, 164, 120]);
  cv.triangle(hx - 6, hy, hx + Math.floor(hw / 2), hy - 20, hx + hw + 6, hy, RED);
  cv.fillRect(hx + Math.floor(hw / 2) - 5, hy + 12, 10, 14, INK);
  cv.fillRect(hx + 6, hy + 6, 8, 8, WHITE);
  cv.fillRect(hx + hw - 14, hy + 6, 8, 8, WHITE);
  // flag pole + flag
  cv.vline(hx + Math.floor(hw / 2), hy - 34, 16, INK, 2);
  cv.fillRect(hx + Math.floor(hw / 2) + 2, hy - 34, 14, 9, BLUE);
  // cracked dry ground
  cv.line(x + 6, y + h - 6, x + 24, y + h - 12, [150, 110, 60], 1);
  cv.line(x + 24, y + h - 12, x + 40, y + h - 6, [150, 110, 60], 1);
  cv.line(x + w - 40, y + h - 6, x + w - 22, y + h - 12, [150, 110, 60], 1);
}

function drawIsland(cv: Canvas, x: number, y: number, w: number, h: number) {
  // atoll island with one palm, waves
  cv.fillRect(x, y, w, h, [214, 228, 236]);
  cv.ellipse(x + Math.floor(w / 2), y + h - 16, Math.floor(w * 0.32), 8, [232, 214, 160]);
  const px = x + Math.floor(w / 2);
  const py = y + h - 22;
  cv.line(px, py, px + 2, py - 18, [110, 80, 40], 2);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.5;
    cv.line(px + 2, py - 18, px + 2 + Math.floor(Math.cos(a) * 14), py - 18 + Math.floor(Math.sin(a) * 10), GREEN, 2);
  }
  for (let i = 0; i < 3; i++) {
    const wy = y + h - 8 + i * 3;
    cv.line(x + 4, wy, x + w - 4, wy, BLUE, 1);
  }
}

function drawCoral(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [214, 228, 236]);
  const bx = x + Math.floor(w * 0.3);
  const by = y + h - 6;
  cv.line(bx, by, bx, by - 18, [200, 90, 90], 3);
  cv.line(bx, by - 10, bx - 10, by - 24, [200, 90, 90], 2);
  cv.line(bx, by - 12, bx + 11, by - 26, [220, 110, 110], 2);
  cv.line(bx - 10, by - 24, bx - 14, by - 30, [200, 90, 90], 2);
  cv.line(bx + 11, by - 26, bx + 16, by - 32, [220, 110, 110], 2);
  const bx2 = x + Math.floor(w * 0.7);
  cv.line(bx2, by, bx2 + 3, by - 14, [190, 70, 120], 3);
  cv.line(bx2 + 3, by - 8, bx2 + 12, by - 18, [190, 70, 120], 2);
  // small fish
  cv.ellipse(x + w - 14, y + 12, 6, 3, GOLD);
  cv.triangle(x + w - 20, y + 12, x + w - 26, y + 8, x + w - 26, y + 16, GOLD);
}

function drawFish(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [214, 228, 236]);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  cv.ellipse(cx, cy, Math.floor(w * 0.28), Math.floor(h * 0.22), BLUE);
  cv.triangle(cx + Math.floor(w * 0.28), cy, cx + Math.floor(w * 0.42), cy - 8, cx + Math.floor(w * 0.42), cy + 8, BLUE);
  cv.circle(cx - 6, cy - 2, 2, WHITE);
  cv.line(cx - 2, cy - 6, cx + 6, cy + 6, BLUE, 1);
  cv.line(cx - 2, cy + 6, cx + 6, cy - 6, BLUE, 1);
  for (let i = 0; i < 3; i++) {
    const wy = y + h - 6 - i * 3;
    cv.line(x + 4 + i * 3, wy, x + w - 4 - i * 3, wy, [150, 180, 200], 1);
  }
}

function drawFlame(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const cx = x + Math.floor(w / 2);
  const cy = y + h - 8;
  cv.triangle(cx - 12, cy, cx, cy - 26, cx + 12, cy, [220, 90, 30]);
  cv.triangle(cx - 7, cy, cx + 2, cy - 16, cx + 9, cy, GOLD);
  cv.fillRect(x + 6, y + 6, Math.floor(w * 0.4), 10, INK);
  cv.fillRect(x + 6, y + 6, Math.floor(w * 0.4), 3, [90, 160, 200]);
  drawText(cv, 'IFIRE', x + 6, y + 20, 1, INK);
}

function drawCar(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) + 2;
  cv.fillRect(cx - 20, cy - 4, 40, 10, RED);
  cv.fillRect(cx - 13, cy - 12, 26, 9, RED);
  cv.fillRect(cx - 10, cy - 10, 8, 6, [180, 220, 235]);
  cv.fillRect(cx + 2, cy - 10, 8, 6, [180, 220, 235]);
  cv.circle(cx - 12, cy + 8, 5, INK);
  cv.circle(cx + 12, cy + 8, 5, INK);
  cv.circle(cx - 12, cy + 8, 2, WHITE);
  cv.circle(cx + 12, cy + 8, 2, WHITE);
  // tracking signal arcs
  for (let r = 6; r <= 14; r += 4) {
    cv.circle(cx + 22, cy - 12, r, BLUE, false);
  }
  cv.circle(cx + 22, cy - 12, 2, BLUE);
}

function drawPokie(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const bx = x + Math.floor(w / 2) - 14;
  const by = y + 6;
  cv.fillRect(bx, by, 28, h - 12, [120, 40, 60]);
  cv.fillRect(bx + 3, by + 4, 22, 10, WHITE);
  drawText(cv, '777', bx + 5, by + 6, 1, RED, true);
  cv.fillRect(bx + 3, by + 18, 22, 6, GOLD);
  cv.line(bx + 28, by + 4, bx + 34, by - 2, INK, 2);
  cv.circle(bx + 35, by - 3, 3, RED);
}

function drawRugby(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  cv.ellipse(cx, cy, 18, 11, [140, 90, 40]);
  cv.line(cx - 18, cy, cx + 18, cy, WHITE, 1);
  cv.line(cx - 8, cy - 8, cx - 8, cy + 8, WHITE, 1);
  cv.line(cx + 8, cy - 8, cx + 8, cy + 8, WHITE, 1);
  // goalposts
  cv.vline(x + w - 12, y + 6, 22, INK, 2);
  cv.vline(x + w - 4, y + 6, 22, INK, 2);
  cv.hline(x + w - 12, y + 26, 10, INK, 2);
}

function drawTalks(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  // two flags over a table
  cv.vline(x + 12, y + 8, 20, INK, 2);
  cv.fillRect(x + 14, y + 8, 14, 9, RED);
  cv.vline(x + w - 14, y + 8, 20, INK, 2);
  cv.fillRect(x + w - 28, y + 8, 14, 9, BLUE);
  cv.hline(x + 6, y + h - 12, w - 12, INK, 2);
  cv.vline(x + 10, y + h - 12, 8, INK, 2);
  cv.vline(x + w - 12, y + h - 12, 8, INK, 2);
  // handshake arcs
  cv.circle(x + Math.floor(w / 2), y + 20, 5, INK, false);
  cv.circle(x + Math.floor(w / 2), y + 20, 2, INK);
}

function drawMail(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  const ex = x + 8;
  const ey = y + Math.floor(h / 2) - 10;
  const ew = w - 16;
  const eh = 20;
  cv.fillRect(ex, ey, ew, eh, WHITE);
  cv.rect(ex, ey, ew, eh, INK, 1);
  cv.line(ex, ey, ex + Math.floor(ew / 2), ey + 12, INK, 1);
  cv.line(ex + ew, ey, ex + Math.floor(ew / 2), ey + 12, INK, 1);
  drawText(cv, '@', x + w - 16, y + 6, 1, BLUE, true);
}

function drawElders(cv: Canvas, x: number, y: number, w: number, h: number) {
  // three elders speaking: heads + speech lines
  cv.fillRect(x, y, w, h, [232, 226, 205]);
  for (let i = 0; i < 3; i++) {
    const hx = x + 10 + i * 14;
    const hy = y + h - 14;
    cv.circle(hx, hy - 8, 6, [190, 150, 110]);
    cv.fillRect(hx - 7, hy - 2, 14, 8, BLUE);
  }
  cv.fillRect(x + 8, y + 6, 26, 8, WHITE);
  cv.rect(x + 8, y + 6, 26, 8, INK, 1);
  drawText(cv, 'NO', x + 13, y + 7, 1, RED, true);
  cv.line(x + 20, y + 14, x + 16, y + 20, INK, 1);
}

// -------------------------------------------------------------------- map --
// Schematic world map: land blobs on a sea panel, numbered pins 1-13.
function drawMap(cv: Canvas, x: number, y: number, w: number, h: number, pins: { lon: number; lat: number; n: number }[]) {
  cv.fillRect(x, y, w, h, LIGHT);
  cv.rect(x, y, w, h, INK, 1);
  const toXY = (lon: number, lat: number): [number, number] => [
    x + Math.floor(((lon + 180) / 360) * w),
    y + Math.floor(((90 - lat) / 180) * h),
  ];
  // continents as blobs (approximate equirectangular positions)
  const blobs: [number, number, number, number][] = [
    [0.16, 0.22, 0.11, 0.13], // north america
    [0.24, 0.62, 0.045, 0.16], // south america
    [0.485, 0.2, 0.045, 0.09], // europe
    [0.51, 0.48, 0.05, 0.17], // africa
    [0.68, 0.22, 0.15, 0.15], // asia
    [0.84, 0.68, 0.055, 0.08], // australia
  ];
  for (const [fx, fy, frx, fry] of blobs)
    cv.ellipse(x + Math.floor(fx * w), y + Math.floor(fy * h), Math.floor(frx * w), Math.floor(fry * h), LAND);
  drawText(cv, 'PACIFIC', x + Math.floor(0.78 * w), y + h - 14, 1, BLUE);
  drawText(cv, 'ATLANTIC', x + Math.floor(0.3 * w), y + h - 14, 1, BLUE);
  for (const p of pins) {
    const [px, py] = toXY(p.lon, p.lat);
    cv.circle(px, py, 7, RED);
    cv.circle(px, py, 7, RED, false);
    const label = String(p.n);
    drawText(cv, label, px - (label.length === 1 ? 3 : 6), py - 3, 1, WHITE, true);
  }
}

// ------------------------------------------------------------- the page ---
const MX = 28; // left margin
const CW = 968; // content width

function drawRule(cv: Canvas, y: number, c: RGB = INK, t = 1) {
  cv.hline(MX, y, CW, c, t);
}

function badge(cv: Canvas, x: number, y: number, n: number) {
  cv.fillRect(x, y, 16, 16, RED);
  const s = String(n);
  drawText(cv, s, x + (s.length === 1 ? 5 : 2), y + 4, 1, WHITE, true);
}

function drawMasthead(cv: Canvas) {
  cv.hline(MX, 8, CW, RED, 3);
  cv.hline(MX, 13, CW, INK, 1);
  drawTextCentered(cv, "THE WORLD'S NEWS - ONE DAY, ONE PAGE", 512, 19, 1, RED, true);
  drawTextCentered(cv, 'THE WORLD LEDGER', 512, 30, 6, INK, true);
  drawTextCentered(cv, 'TUESDAY 24 NOVEMBER 2026', 512, 80, 3, INK, true);
  drawTextCentered(cv, '31 STORIES · 5 CONTINENTS · 10 FIELDS', 512, 108, 2, BLUE, true);
  drawRule(cv, 130);
}

function drawTimeline(cv: Canvas) {
  drawText(cv, 'THE DAY IN UTC - WHEN THE NEWS BROKE', MX, 136, 1, INK, true);
  drawText(cv, 'ALL TIMES UTC', 1024 - MX - textWidth('ALL TIMES UTC', 1), 136, 1, GREY);
  const items: [string, string][] = [
    ['00:16', 'SEOUL NAMES NEW FOREIGN MINISTER, INTEL CHIEF'],
    ['00:25', 'KOSPI JUMPS 5.9% AT THE SEOUL OPEN'],
    ['00:38', "ESTONIA ANSWERS RUSSIA'S AIRSPACE CLAIM"],
    ['00:54', 'STRIKES LEAVE ODESA WITHOUT POWER, HEAT, WATER'],
    ['01:27', 'QATAR PM: REVIVE THE US-IRAN TALKS'],
    ['02:58', "SEOUL PRESS: SK HYNIX'S US SHARES UP 20%"],
    ['MORNING', 'CANBERRA: WONG VOWS TO KEEP PROBING MEGASPEED'],
  ];
  const colW = Math.floor(CW / 7);
  items.forEach(([t, s], i) => {
    const x = MX + i * colW + (i === 0 ? 0 : 4);
    drawText(cv, t, x, 150, 1, RED, true);
    drawBlock(cv, s, x, 161, colW - 8, 1, INK, 9, 3);
  });
  drawRule(cv, 198);
}

type Hero = { n: number; kicker: string; head: string; body: string; art: (cv: Canvas, x: number, y: number, w: number, h: number) => void };

const HEROES: Hero[] = [
  {
    n: 1,
    kicker: 'CHIPS · SINGAPORE',
    head: 'SINGAPORE KEEPS THE CHIP PROBE',
    body: 'WONG, IN CANBERRA, SAYS SINGAPORE WILL KEEP PROBING MEGASPEED WITH THE US TO STOP REROUTED CHIPS.',
    art: drawChip,
  },
  {
    n: 2,
    kicker: 'MARKETS · SEOUL',
    head: 'SEOUL SURGES ON THE AI RALLY',
    body: 'KOSPI JUMPS 5.9% TO 4,987.99 AS ASIAN MARKETS RALLY. SK HYNIX UP 8.1% IN SEOUL; SAMSUNG 6.8%.',
    art: drawChart,
  },
  {
    n: 3,
    kicker: 'DROUGHT · FIJI',
    head: 'FIJI SHUTS ITS SCHOOLS',
    body: 'ALL SCHOOLS CLOSE 30 NOV TO 4 DEC AS EL NINO DROUGHT DEEPENS. DISASTER DECLARED 18 NOV.',
    art: drawSchool,
  },
];

function drawHeroes(cv: Canvas) {
  const y0 = 204;
  const colW = 313;
  HEROES.forEach((h, i) => {
    const x = MX + i * (colW + 14);
    h.art(cv, x, y0, colW, 92);
    badge(cv, x + 4, y0 + 4, h.n);
    drawText(cv, h.kicker, x, y0 + 98, 1, RED, true);
    drawBlock(cv, h.head, x, y0 + 110, colW, 3, INK, 22, 2);
    drawBlock(cv, h.body, x, y0 + 156, colW, 2, INK, 15, 4);
  });
  drawRule(cv, 430);
}

type Small = { n: number; head: string; body: string; art: (cv: Canvas, x: number, y: number, w: number, h: number) => void };

const SMALLS: Small[] = [
  { n: 4, head: 'ELDERS ACCUSE AUSTRALIA', body: "PACIFIC ELDERS' VOICE SAYS AUSTRALIA UNDERMINED PACIFIC INTERESTS AT COP31", art: drawElders },
  { n: 5, head: 'KANTON ISLAND EVACUATED', body: "ALL RESIDENTS OF REMOTE KANTON ISLAND, KIRIBATI, MOVE WITH A DAY'S NOTICE.", art: drawIsland },
  { n: 6, head: 'SIX NATIONS JOIN REEF PACT', body: 'SIX NEW COUNTRIES JOIN THE GLOBAL EFFORT TO PROTECT CORAL REEFS AT COP31.', art: drawCoral },
  { n: 7, head: 'TUNA COUNT PASSES TEST', body: 'A NEW METHOD FOR ESTIMATING BIEYE TUNA STOCKS PASSES A KEY SCIENTIFIC TEST.', art: drawFish },
  { n: 8, head: 'MEGAFIRE SIMULATOR', body: 'UNSW AND FIRE AND RESCUE NSW UNVEIL IFIRE 2.3, A WORLD-FIRST MEGAFIRE SIM.', art: drawFlame },
  { n: 9, head: 'CARS THAT TRACK', body: 'CONNECTED CARS CAN HAND ABUSERS NEW TOOLS TO TRACK AND CONTROL VICTIMS.', art: drawCar },
  { n: 10, head: 'NSW COUNCILS VS POKIES', body: 'NSW COUNCILS PUT THE MINNS GOVERNMENT ON NOTICE OVER POKER MACHINE REFORM.', art: drawPokie },
  { n: 11, head: 'HUDSON YOUNG TO PNG', body: 'NSW ORIGIN BACK-ROWER SIGNS WITH PNG CHIEFS FOR THE INAUGURAL SEASON.', art: drawRugby },
  { n: 12, head: 'THAI-CAMBODIA TALKS OPEN', body: 'THIRD TALKS ON THE MARITIME BORDER OPEN IN KUALA LUMPUR, TO 27 NOV.', art: drawTalks },
  { n: 13, head: 'KAGI TAKES ON EMAIL', body: 'GOOGLE ALTERNATIVE KAGI LAUNCHES AN EMAIL SERVICE.', art: drawMail },
];

function drawSmalls(cv: Canvas) {
  const colW = 185;
  const gap = 10;
  SMALLS.forEach((s, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = MX + col * (colW + gap);
    const y = 436 + row * 96;
    s.art(cv, x, y, colW, 32);
    badge(cv, x + 3, y + 3, s.n);
    const hl = drawBlock(cv, s.head, x, y + 36, colW, 2, INK, 14, 2);
    drawBlock(cv, s.body, x, y + 36 + hl * 14 + 3, colW, 1, INK, 9, 3);
  });
  drawRule(cv, 628);
}

function drawNumbers(cv: Canvas) {
  drawText(cv, 'THE DAY IN NUMBERS', MX, 634, 1, INK, true);
  const nums: [string, string][] = [
    ['+5.93%', 'KOSPI RISES'],
    ['4,987.99', 'KOSPI CLOSE'],
    ['+8.11%', 'SK HYNIX, SEOUL'],
    ['5', 'DAYS FIJI SCHOOLS SHUT'],
    ['6', 'NATIONS JOIN REEF PACT'],
    ['2.3', 'IFIRE VERSION'],
  ];
  const colW = Math.floor(CW / 6);
  nums.forEach(([v, l], i) => {
    const x = MX + i * colW;
    drawText(cv, v, x, 648, 3, RED, true);
    drawBlock(cv, l, x, 680, colW - 8, 1, INK, 9, 2);
  });
  drawRule(cv, 704);
}

const BRIEFS: string[] = [
  'SEOUL NAMES NEW FOREIGN MINISTER, INTEL CHIEF',
  "ESTONIA ANSWERS RUSSIA'S AIRSPACE CLAIM",
  'ODESA WITHOUT POWER, HEAT OR WATER AFTER STRIKES',
  'QATAR PM: REVIVE THE US-IRAN TALKS',
  'SUDAN: WOMEN ENDURE WAR AND UPHEAVAL ALONE',
  'PANAMA, FIRST QUANTUM RESUME COBRE PANAMA TALKS',
  'BALTIC STATES ROLL OUT NEW MEASURES VS RUSSIA',
  'FRANCE CONDEMNS SETTLER ATTACKS ON PALESTINIANS',
  'UK NAMES ENERGY CHIEF TO LEAD REVIVAL',
  'DENMARK ACADEMIES GET BOMB ALERTS; ALL CLEAR',
  'EU ACADEMY HIT BY CYBER INCIDENT; DATA EXPOSED',
  'RUSSIA FLOATS RENEWING TALKS WITH US, UKRAINE',
  'LION ON THE LOOSE NEAR ISTANBUL; SEARCH ON',
  'THAI PROTESTERS MARCH ON BANGCHAK REFINERY',
  'THAI MP ICE RAKCHANOK FREED ON BAIL',
  'SHENZHEN TURNS TRASH TRUCKS INTO POWER GRID',
  'SPACE42, MICROSOFT UAE PUBLISH AI REPORT',
  'LA SKINS FEST CLOSES 20TH YEAR OF INDIGENOUS ART',
];

function drawMapAndBriefs(cv: Canvas) {
  const mapX = MX;
  const mapY = 710;
  const mapW = 400;
  const mapH = 146;
  drawMap(cv, mapX, mapY, mapW, mapH, [
    { lon: 103.8, lat: 1.35, n: 1 },
    { lon: 127, lat: 37.5, n: 2 },
    { lon: 178, lat: -17.7, n: 3 },
    { lon: 140, lat: -28, n: 4 },
    { lon: -171.7, lat: -2.8, n: 5 },
    { lon: 175, lat: -30, n: 6 },
    { lon: 155, lat: 15, n: 7 },
    { lon: 151.2, lat: -33.9, n: 8 },
    { lon: 145, lat: -37.8, n: 9 },
    { lon: 162, lat: -40, n: 10 },
    { lon: 147, lat: -6.7, n: 11 },
    { lon: 101.7, lat: 3.1, n: 12 },
    { lon: -122.4, lat: 37.8, n: 13 },
  ]);
  const bx = 436;
  drawText(cv, 'ALSO TODAY', bx, 710, 2, INK, true);
  const colW = 270;
  BRIEFS.forEach((b, i) => {
    const col = Math.floor(i / 9);
    const row = i % 9;
    const x = bx + col * (colW + 8);
    const y = 734 + row * 13;
    drawText(cv, '•', x, y, 1, RED, true);
    drawText(cv, b, x + 10, y, 1, INK);
  });
  drawRule(cv, 862);
}

function drawDateCheck(cv: Canvas) {
  drawText(cv, 'NOT TODAY - LEFT OUT ON PURPOSE', MX, 868, 1, RED, true);
  drawText(
    cv,
    'THESE ARE MONDAY 23 NOVEMBER STORIES (OR EARLIER), NOT TUESDAY:',
    MX + textWidth('NOT TODAY - LEFT OUT ON PURPOSE  ', 1),
    868,
    1,
    INK,
  );
  drawBlock(
    cv,
    'NVIDIA REINSTATES HUANG · US BLACKLISTS MEGASPEED · IRAN SANCTIONS · DYMER TOLL RISES TO 11 · GAZA UNRWA WORKER KILLED · TRUMP DEATH-PENALTY SPEECH · HUSH-MONEY RULING · FLYDUBAI APPROVAL · SPAIN FINAL POLLS · CANADA GALA ROAST (SAT) · COP31 COLLAPSE (SUN) · ICJ MYANMAR RULING (THU 19 NOV) · DELTA OUTAGE (SUN) · VANUATU QUAKE (MON) · EL CHAPO CAPTURE (FRI) · UKRAINE WARSHIP CLAIM (MON) · EU SANCTIONS PACKAGE (MON) · RUSSIAN JETS IN SK ZONE (MON)',
    MX,
    882,
    CW,
    1,
    GREY,
    9,
    4,
  );
  drawRule(cv, 922);
}

function drawFooter(cv: Canvas) {
  drawText(
    cv,
    'SOURCES: REUTERS · AFP · AP · AL JAZEERA · PINA · SEOUL ECONOMIC DAILY · KOREA JOONGANG DAILY · NEWSHUB',
    MX,
    928,
    1,
    GREY,
  );
  drawTextCentered(
    cv,
    'EVERY STORY HAPPENED, OR WAS FIRST REPORTED, ON TUESDAY 24 NOVEMBER 2026.',
    512,
    946,
    2,
    INK,
    true,
  );
  drawTextCentered(cv, 'THE WORLD LEDGER · DRAWN ENTIRELY BY CODE · NO PHOTOGRAPHS', 512, 968, 1, GREY);
  cv.hline(MX, 990, CW, INK, 1);
}

// -------------------------------------------------------------------- main --
function main() {
  const cv = new Canvas();
  drawMasthead(cv);
  drawTimeline(cv);
  drawHeroes(cv);
  drawSmalls(cv);
  drawNumbers(cv);
  drawMapAndBriefs(cv);
  drawDateCheck(cv);
  drawFooter(cv);
  const png = encodePNG(cv);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'entry.png');
  writeFileSync(outPath, png);
  const sha = createHash('sha256').update(png).digest('hex');
  console.log(`wrote ${outPath} ${png.length} bytes sha256=${sha}`);
}

main();
