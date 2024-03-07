import { expect } from '@esm-bundle/chai';
import { setupWorkerClient } from '@easy-worker/core';
import archaic from './browser.js';
import { loadImage } from '../lib/browser-context.js';
import type { ShapeType } from '../lib/shapes/factory.js';
import type { ArchaicWorker } from './browser-test-worker.js';

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

const archaicWorker = setupWorkerClient<ArchaicWorker>(
  new Worker(new URL('./browser-test-worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['getScore'],
);

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

    it(`worker - ${fixture} - ${shapeType}`, async () => {
      const inputImageData = (await loadImage(input)) as ImageData;
      const score = await archaicWorker.getScore({
        input: inputImageData,
        shapeType,
        numSteps: 10,
        numCandidateShapes: 5,
        numCandidateMutations: 30,
      });

      expect(score).to.be.lessThan(1);
    });
  });
});
