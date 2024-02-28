import core from './core.js';
import Model from './model.js';
import type { ShapeType } from './shapes/factory.js';
import type { ContextImageData } from './context.js';

export type ArchaicContext =
  | typeof import('./context.js').default
  | typeof import('./browser-context.js').default;

export interface ArchaicOptions {
  context: ArchaicContext;
  target: ContextImageData;
  onStep?: (model: Model, step: number) => void;
  outputSize?: number;
  minEnergy?: number;
  shapeAlpha?: number;
  shapeType?: ShapeType;
  numCandidates?: number;
  numCandidateShapes?: number;
  numCandidateMutations?: number;
  numCandidateExtras?: number;
  log?: (message?: unknown, ...optionalParams: unknown[]) => void;
}

export default async ({
  context,
  target,
  onStep,

  // inputSize = undefined, // TODO: support resizing target
  outputSize = undefined,

  minEnergy = undefined,

  shapeAlpha = 128,
  shapeType = 'triangle',

  numCandidates = 1, // [ 1, 32 ]
  numCandidateShapes = 50, // [ 10, 300 ]
  numCandidateMutations = 100, // [ 10, 500 ]
  numCandidateExtras = 0, // [ 0, 16 ]

  log = () => {},
}: ArchaicOptions) => {
  const backgroundColor = core.getMeanColor(target);

  const model = new Model({
    context,
    target,
    backgroundColor,
    outputSize,
    numCandidates,
  });

  const step = async (index: number): Promise<boolean | number> => {
    await onStep?.(model, index);

    const candidates = model.step({
      shapeType,
      shapeAlpha,
      numCandidateShapes,
      numCandidateMutations,
      numCandidateExtras,
    });

    if (minEnergy && model.score <= minEnergy) {
      return false;
    }

    return candidates;
  };

  return {
    model,
    step,
  };
};
