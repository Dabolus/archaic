import type { RGBAColor } from './color.js';
import type { ContextImageData } from './context.js';
import type Scanline from './scanline.js';

export const getMeanColor = (image: ContextImageData): RGBAColor => {
  const { data, width, height } = image;

  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const o = (i * width + j) * 4;
      r += data[o + 0];
      g += data[o + 1];
      b += data[o + 2];
    }
  }

  r = (r / (width * height)) | 0;
  g = (g / (width * height)) | 0;
  b = (b / (width * height)) | 0;

  return { r, g, b, a: 255 };
};

export const computeColor = (
  target: ContextImageData,
  current: ContextImageData,
  lines: Scanline[],
  alpha: number,
) => {
  const { width } = target;
  const dataT = target.data;
  const dataC = current.data;

  const a = 255.0 / alpha;

  let count = 0;
  let r = 0.0;
  let g = 0.0;
  let b = 0.0;

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    for (let j = line.x1; j <= line.x2; ++j) {
      const o = (line.y * width + j) * 4;

      const tr = dataT[o + 0];
      const tg = dataT[o + 1];
      const tb = dataT[o + 2];

      const cr = dataC[o + 0];
      const cg = dataC[o + 1];
      const cb = dataC[o + 2];

      r += (tr - cr) * a + cr;
      g += (tg - cg) * a + cg;
      b += (tb - cb) * a + cb;

      ++count;
    }
  }

  if (count > 0) {
    r = Math.max(0, Math.min(255, r / count)) | 0;
    g = Math.max(0, Math.min(255, g / count)) | 0;
    b = Math.max(0, Math.min(255, b / count)) | 0;
  }

  return { r, g, b, a: alpha };
};

export const difference = (
  imageA: ContextImageData,
  imageB: ContextImageData,
): number => {
  const { width, height } = imageA;
  const dataA = imageA.data;
  const dataB = imageB.data;

  if (dataA.length !== dataB.length) {
    throw new Error('image.difference incompatible images');
  }

  let sum = 0.0;

  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const o = (i * width + j) * 4;

      const ar = dataA[o + 0];
      const ag = dataA[o + 1];
      const ab = dataA[o + 2];

      const br = dataB[o + 0];
      const bg = dataB[o + 1];
      const bb = dataB[o + 2];

      const dr = ar - br;
      const dg = ag - bg;
      const db = ab - bb;

      sum += dr * dr + dg * dg + db * db;
    }
  }

  return Math.sqrt(sum / (width * height * 3)) / 255;
};

export const differencePartial = (
  target: ContextImageData,
  before: ContextImageData,
  after: ContextImageData,
  score: number,
  lines: Scanline[],
): number => {
  const { width, height } = target;
  const dataT = target.data;
  const dataB = before.data;
  const dataA = after.data;

  if (dataT.length !== dataB.length || dataT.length !== dataA.length) {
    throw new Error('image.differencePartial incompatible images');
  }

  let sum = Math.pow(score * 255, 2) * width * height * 3;

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    for (let j = line.x1; j <= line.x2; ++j) {
      const o = (line.y * width + j) * 4;

      const tr = dataT[o + 0];
      const tg = dataT[o + 1];
      const tb = dataT[o + 2];

      const br = dataB[o + 0];
      const bg = dataB[o + 1];
      const bb = dataB[o + 2];

      const ar = dataA[o + 0];
      const ag = dataA[o + 1];
      const ab = dataA[o + 2];

      const dr1 = tr - br;
      const dg1 = tg - bg;
      const db1 = tb - bb;

      const dr2 = tr - ar;
      const dg2 = tg - ag;
      const db2 = tb - ab;

      sum -= dr1 * dr1 + dg1 * dg1 + db1 * db1;
      sum += dr2 * dr2 + dg2 * dg2 + db2 * db2;
    }
  }

  return Math.sqrt(sum / (width * height * 3)) / 255;
};

export const copyLines = (
  dest: ContextImageData,
  src: ContextImageData,
  lines: Scanline[],
): void => {
  const { width, height } = src;
  const m = width * height * 4;

  if (dest.data.length !== src.data.length) {
    throw new Error('image.copyLines incompatible images');
  }

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const o1 = Math.min(m, (line.y * width + line.x1) * 4);
    const o2 = Math.min(m, (line.y * width + line.x2) * 4);
    dest.data.set(src.data.slice(o1, o2), o1);
  }
};

export const drawLines = (
  image: ContextImageData,
  color: RGBAColor,
  lines: Scanline[],
): void => {
  const { data, width } = image;

  const sr = color.r;
  const sg = color.g;
  const sb = color.b;
  const sa = color.a;

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const ma = sa / 255;
    const a = 1.0 - ma;

    for (let j = line.x1; j <= line.x2; ++j) {
      const o = (line.y * width + j) * 4;

      const dr = data[o + 0];
      const dg = data[o + 1];
      const db = data[o + 2];

      data[o + 0] = (dr * a + sr * ma) | 0;
      data[o + 1] = (dg * a + sg * ma) | 0;
      data[o + 2] = (db * a + sb * ma) | 0;
    }
  }
};

export default {
  getMeanColor,
  computeColor,
  difference,
  differencePartial,
  copyLines,
  drawLines,
};
