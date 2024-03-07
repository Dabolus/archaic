import { test, expect } from 'bun:test';
import path from 'node:path';
import { setupWorkerClient } from '@easy-worker/core';
import archaic from './node.js';
import { Worker } from 'node:worker_threads';
import type { ShapeType } from '../lib/shapes/factory.js';
import type { ArchaicWorker } from './node-test-worker.js';

const fixturesPath = path.resolve(import.meta.dir, '..', '..', 'media');

const fixtures = ['monalisa.png', 'lena.png'];

const shapeTypes: ShapeType[] = [
  'triangle',
  'ellipse',
  'rotated-ellipse',
  'rectangle',
  'rotated-rectangle',
  'random',
];

const nodejsWorker = new Worker(
  new URL('./node-test-worker.ts', import.meta.url),
);

const workerAdapter = {
  postMessage: (data: any) => nodejsWorker.postMessage(data),
  addEventListener: (_, eh) => {
    const l = (data: any) => {
      if ('handleEvent' in eh) {
        eh.handleEvent({ data } as MessageEvent);
      } else {
        eh({ data } as MessageEvent);
      }
    };
    nodejsWorker.on('message', l);
  },
} as globalThis.Worker;

const archaicWorker = setupWorkerClient<ArchaicWorker>(workerAdapter, [
  'getScore',
]);

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

    test(`worker - ${fixture} - ${shapeType}`, async () => {
      const score = await archaicWorker.getScore({
        input,
        shapeType,
        numSteps: 10,
        numCandidateShapes: 5,
        numCandidateMutations: 30,
      });

      expect(score).toBeLessThan(1);
    });
  });
});
