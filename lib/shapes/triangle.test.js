import { test, expect } from 'bun:test';

import context from '../context';
import Triangle from './triangle';

test('new Triangle()', async () => {
  const image = context.createImage(512, 512);

  for (let i = 0; i < 10000; ++i) {
    const shape = new Triangle(image);

    expect(shape.x1).toBeGreaterThanOrEqual(-16);
    expect(shape.x1).toBeLessThan(512 + 16);
    expect(shape.y1).toBeGreaterThanOrEqual(-16);
    expect(shape.y1).toBeLessThan(512 + 16);

    expect(shape.x2).toBeGreaterThanOrEqual(-16);
    expect(shape.x2).toBeLessThan(512 + 16);
    expect(shape.y2).toBeGreaterThanOrEqual(-16);
    expect(shape.y2).toBeLessThan(512 + 16);

    expect(shape.x3).toBeGreaterThanOrEqual(-16);
    expect(shape.x3).toBeLessThan(512 + 16);
    expect(shape.y3).toBeGreaterThanOrEqual(-16);
    expect(shape.y3).toBeLessThan(512 + 16);

    expect(shape.isValid()).toBe(true);

    const shape2 = shape.copy();
    expect(shape2).toEqual(shape);
  }
});

test('Triangle.mutate', async () => {
  const image = context.createImage(512, 512);

  for (let i = 0; i < 10000; ++i) {
    const base = new Triangle(image);
    Object.freeze(base);
    const shape = base.mutate();

    expect(base.width).toBe(shape.width);
    expect(base.height).toBe(shape.height);

    expect(shape.x1).toBeGreaterThanOrEqual(-16);
    expect(shape.x1).toBeLessThan(512 + 16);
    expect(shape.y1).toBeGreaterThanOrEqual(-16);
    expect(shape.y1).toBeLessThan(512 + 16);

    expect(shape.x2).toBeGreaterThanOrEqual(-16);
    expect(shape.x2).toBeLessThan(512 + 16);
    expect(shape.y2).toBeGreaterThanOrEqual(-16);
    expect(shape.y2).toBeLessThan(512 + 16);

    expect(shape.x3).toBeGreaterThanOrEqual(-16);
    expect(shape.x3).toBeLessThan(512 + 16);
    expect(shape.y3).toBeGreaterThanOrEqual(-16);
    expect(shape.y3).toBeLessThan(512 + 16);

    expect(shape.isValid()).toBe(true);
  }
});
