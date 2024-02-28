import { test, expect } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { temporaryFile } from 'tempy';
import context from './context.js';

const fixtures = path.resolve(import.meta.dir, '..', '..', 'media');

test('monalisa.png', async () => {
  const img0 = await context.loadImage(path.join(fixtures, 'monalisa.png'));
  const temp = temporaryFile({ extension: 'png' });
  await context.saveImage(img0, temp);
  const img1 = await context.loadImage(temp);

  expect(img0.data).toEqual(img1.data);
  await fs.rm(temp, { recursive: true, force: true });
});

test('flower.jpg', async () => {
  const img0 = await context.loadImage(path.join(fixtures, 'flower.jpg'));
  const temp = temporaryFile({ extension: 'png' });
  await context.saveImage(img0, temp);
  const img1 = await context.loadImage(temp);

  expect(fs.exists(temp)).resolves.toBe(true);
  expect(img0.width).toBe(img1.width);
  expect(img0.height).toBe(img1.height);
  await fs.rm(temp, { recursive: true, force: true });
});
