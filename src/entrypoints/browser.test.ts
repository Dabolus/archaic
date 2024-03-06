import { expect } from '@esm-bundle/chai';
import archaic from './browser.js';
import type { ShapeType } from '../lib/shapes/factory.js';

declare const it: typeof import('bun:test').test;

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
  const input = `/media/${fixture}`;

  shapeTypes.forEach((shapeType) => {
    it(`${fixture} - ${shapeType}`, async () => {
      const model = await archaic({
        input,
        shapeType,
        numSteps: 10,
        numCandidateShapes: 5,
        numCandidateMutations: 30,
        log: console.log.bind(console),
      });

      expect(model.score).to.be.lessThan(1);
    });
  });
});
