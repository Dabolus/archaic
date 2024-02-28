import ow from 'ow';
import context from '../lib/browser-context.js';
import archaic from '../lib/archaic.js';
import type { ShapeType } from '../lib/shapes/factory.js';
import type Model from '../lib/model.js';

export interface ArchaicBrowserOptions {
  input: string | HTMLImageElement | ImageData;
  output?: string | HTMLCanvasElement;
  numSteps?: number;
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
 * Optionally draws the results to an HTML canvas.
 *
 * Returns a Promise for the generated model.
 *
 * @name archaic
 * @function
 *
 * @param {Object} opts - Configuration options
 * @param {string|Image|ImageData} opts.input - URL, Image, or ImageData of input image to process
 * @param {string|HTMLCanvasElement} [opts.output] - Selector or DOM Element of HTMLCanvas to draw results
 * @param {number} [opts.numSteps=200] - Number of steps to process [1, 1000]
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
export default async ({
  input,
  output,
  onStep,
  numSteps = 200,
  log = () => {},
  ...rest
}: ArchaicBrowserOptions) => {
  ow(
    input,
    'input',
    ow.any(
      ow.string.nonEmpty,
      ow.object.instanceOf(ImageData),
      ow.object.instanceOf(Image),
    ),
  );
  ow(numSteps, 'numSteps', ow.number.integer.positive);

  if (output) {
    ow(
      output,
      'output',
      ow.any(ow.string.nonEmpty, ow.object.instanceOf(HTMLCanvasElement)),
    );
  }

  const target = await context.loadImage(input);
  const canvas = (output &&
    (await context.loadCanvas(output, 'output'))) as HTMLCanvasElement;
  const ctx = (canvas && canvas.getContext('2d')) as CanvasRenderingContext2D;
  const scratch = (canvas &&
    document.createElement('canvas')) as HTMLCanvasElement;
  if (ctx) {
    context.enableContextAntialiasing(ctx);
  }

  const { model, step } = await archaic({
    ...rest,
    context,
    target,
    onStep: async (model, step) => {
      if (onStep) {
        await onStep(model, step);
      }

      if (ctx) {
        const { width, height } = model.current;

        if (canvas.width === width && canvas.height === height) {
          // output canvas is the same size as current working buffer,
          // so just copy data over (efficient)
          ctx.putImageData(model.current as ImageData, 0, 0);
        } else {
          // output canvas is different size than current working buffer,
          // so resize into temp canvas before drawing (less efficient)
          scratch.width = width;
          scratch.height = height;
          const ctx2 = scratch.getContext('2d')!;
          ctx2.putImageData(model.current as ImageData, 0, 0);
          ctx.drawImage(scratch, 0, 0, canvas.width, canvas.height);
        }
      }
    },
  });

  // TODO: clean this iteration up and use web workers
  const rafStep = (curr: number): Promise<number | boolean> =>
    new Promise((resolve, reject) =>
      requestAnimationFrame(() => step(curr).then(resolve).catch(reject)),
    );

  for (let s = 1; s <= numSteps; ++s) {
    performance.mark(`step ${s} start`);
    const candidates = await rafStep(s);
    performance.mark(`step ${s} end`);

    log(`${s})`, {
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

  return model;
};
