import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import context from '../lib/context.js';
import archaic from '../lib/archaic.js';
import type { ShapeType } from '../lib/shapes/factory.js';
import type Model from '../lib/model.js';

export type { ShapeType } from '../lib/shapes/factory.js';
export type { default as Shape } from '../lib/shapes/shape.js';
export type {
  ContextImageData,
  default as ArchaicContext,
  default as ModelContext,
  default as WorkerContext,
} from '../lib/context.js';
export type {
  default as Model,
  ModelOptions,
  ModelStepOptions,
} from '../lib/model.js';
export type { default as Worker } from '../lib/worker.js';
export type { RGBAColor } from '../lib/color.js';

const supportedOutputFormats = new Set(['png', 'jpg', 'svg', 'gif']);

const getTempDirectory = async () => {
  const systemTempDir = await fs.realpath(os.tmpdir());
  const tempDir = path.join(systemTempDir, randomUUID());
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
};

export interface ArchaicNodeOptions {
  input: string;
  output?: string;
  numSteps?: number;
  nthFrame?: number;
  minEnergy?: number;
  shapeAlpha?: number;
  shapeType?: ShapeType;
  numCandidates?: number;
  numCandidateShapes?: number;
  numCandidateMutations?: number;
  numCandidateExtras?: number;
  onStep?: (model: Model, step: number) => Promise<void>;
  log?: (message?: unknown, ...optionalParams: unknown[]) => void;
}

/**
 * Reproduces the given input image using geometric primitives.
 *
 * Returns a Promise for the generated model.
 *
 * Available output formats:
 * - png
 * - jpg
 * - svg
 * - gif
 *
 * @name archaic
 * @function
 *
 * @param {Object} opts - Configuration options
 * @param {string} opts.input - Input image to process (can be a local path, http url, or data url)
 * @param {string} [opts.output] - Path to generate output image
 * @param {number} [opts.numSteps=200] - Number of steps to process [1, 1000]
 * @param {number} [opts.nthFrame=0] - Save every nth frame [0, 1000]
 * @param {number} [opts.minEnergy] - Minimum energy to stop processing early [0, 1]
 * @param {number} [opts.shapeAlpha=128] - Alpha opacity of shapes [0, 255]
 * @param {string} [opts.shapeType=traingle] - Type of shapes to use
 * @param {number} [opts.numCandidates=1] - Number of top-level candidates per step [1, 32]
 * @param {number} [opts.numCandidateShapes=50] - Number of random candidate shapes per step [10, 1000]
 * @param {number} [opts.numCandidateMutations=100] - Number of candidate mutations per step [10, 500]
 * @param {number} [opts.numCandidateExtras=0] - Number of extra candidate shapes per step [0, 16]
 * @param {function} [opts.onStep] - Optional async function taking in the model and step index
 * @param {function} [opts.log=noop] - Optional logging function (console.log to enable logging)
 *
 * @return {Promise}
 */
export default async (opts: ArchaicNodeOptions) => {
  const { input, output, onStep, numSteps = 200, nthFrame = 0, ...rest } = opts;

  const ext = output && path.extname(output).slice(1).toLowerCase();
  const isGIF = ext === 'gif';

  if (output && !supportedOutputFormats.has(ext as string)) {
    throw new Error(`unsupported output format "${ext}"`);
  }

  const target = await context.loadImage(input);

  const tempDir = isGIF && (await getTempDirectory());
  const tempOutput = tempDir && path.join(tempDir, 'frame-%d.png');
  const frames: string[] = [];

  const { model, step } = await archaic({
    ...rest,
    context,
    target,
    onStep: async (model, step) => {
      if (onStep) {
        await onStep(model, step);
      }

      if (isGIF && tempOutput) {
        if (nthFrame <= 0 || (step - 1) % nthFrame === 0) {
          const frame = tempOutput.replace('%d', frames.length.toString());
          await context.saveImage(model.current, frame, opts);
          frames.push(frame);
        }
      } else if (output) {
        if (nthFrame > 0 && (step - 1) % nthFrame === 0) {
          const frame = output.replace('.', `-${step - 1}.`);
          await context.saveImage(model.current, frame, opts);
        }
      }
    },
  });

  for (let s = 1; s <= numSteps; ++s) {
    performance.mark(`step ${s} start`);
    const candidates = await step(s);
    performance.mark(`step ${s} end`);

    console.log(`${s})`, {
      time: performance.measure(`step ${s}`, `step ${s} start`, `step ${s} end`)
        .duration,
      candidates,
      score: model.score,
    });

    if (!candidates) {
      break;
    }
  }
  performance.clearMarks();
  performance.clearMeasures();

  if (output) {
    if (isGIF && tempDir) {
      await context.saveGIF(frames, output, opts);
      await fs.rm(tempDir, { recursive: true, force: true });
    } else {
      await context.saveImage(model.current, output, opts);
    }
  }

  return model;
};
