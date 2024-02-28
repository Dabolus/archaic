import { test, expect } from 'bun:test';
import path from 'node:path';
import context from './context.js';
import core from './core.js';
import Scanline from './scanline.js';

const fixtures = path.resolve(import.meta.dir, '..', '..', 'media');

test('difference', async () => {
  const image = await context.loadImage(path.join(fixtures, 'monalisa.png'));
  const color = core.getMeanColor(image);
  const blank = context.createImage(image.width, image.height);
  const current = context.createImage(image.width, image.height, color);

  const diff0 = core.difference(image, blank);
  expect(diff0).toBeGreaterThan(0);

  const diff1 = core.difference(image, current);
  expect(diff1).toBeGreaterThan(0);
  expect(diff0).toBeGreaterThan(diff1);

  const diff2 = core.difference(image, image);
  expect(diff2).toBe(0);

  let diff = diff0;
  for (let i = 0; i < image.height; ++i) {
    const o = i * image.width * 4;
    blank.data.set(image.data.slice(o, o + image.width * 4), o);
    const diff3 = core.difference(image, blank);
    expect(diff3).toBeLessThan(diff);
    diff = diff3;
  }
  expect(diff).toBe(0);
});

test('drawLines', async () => {
  const image = await context.loadImage(path.join(fixtures, 'monalisa.png'));
  const color = core.getMeanColor(image);
  const current = context.createImage(image.width, image.height, color);

  const diff0 = core.difference(image, current);
  expect(diff0).toBeGreaterThan(0);

  const lines: Scanline[] = [];
  const c = { r: 255, g: 0, b: 0, a: 255 };
  const m = (image.width / 2) | 0;

  for (let i = 0; i < 16; ++i) {
    lines.push(new Scanline(i, 5, m));
  }

  expect(lines.length).toBe(
    Scanline.filter(lines, image.width, image.height).length,
  );

  core.drawLines(current, c, lines);

  for (let i = 0; i < 16; ++i) {
    for (let j = 5; j < m; ++j) {
      const o = (i * image.width + j) * 4;
      expect(current.data[o + 0]).toBe(255);
      expect(current.data[o + 1]).toBe(0);
      expect(current.data[o + 2]).toBe(0);
      expect(current.data[o + 3]).toBe(255);
    }
  }

  const diff1 = core.difference(image, current);
  expect(diff1).toBeGreaterThan(0);
  expect(diff1).toBeGreaterThan(diff0);
});
