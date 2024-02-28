import { test, expect } from 'bun:test';
import path from 'node:path';
import archaic from './node.js';
import type { ShapeType } from './lib/shapes/factory.js';

const fixturesPath = path.join(__dirname, 'media');

const fixtures = ['monalisa.png', 'lena.png'];

const shapeTypes: ShapeType[] = [
  'triangle',
  'ellipse',
  'rotated-ellipse',
  'rectangle',
  'rotated-rectangle',
  'random',
];

fixtures.forEach((fixture) => {
  const input = path.join(fixturesPath, fixture);

  shapeTypes.forEach((shapeType) => {
    test(`${fixture} - ${shapeType}`, async () => {
      const model = await archaic({
        input,
        shapeType,
        numSteps: 10,
        numCandidateShapes: 5,
        numCandidateMutations: 30,
        log: console.log.bind(console),
      });

      expect(model.score).toBeLessThan(1);
    });
  });
});
