import ow from 'ow';
import core from './core.js';
import Model from './model.js';
import type { ShapeType } from './shapes/factory.js';

export type ArchaicContext =
  | typeof import('./context.js').default
  | typeof import('./browser-context.js').default;

export interface ArchaicOptions {
  context: ArchaicContext;
  target: {
    width: number;
    height: number;
    data: Uint8Array | Uint8ClampedArray;
  };
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
  // validate options
  ow(target, ow.object.label('target'));
  ow(target.width, ow.number.positive.integer.label('target.width'));
  ow(target.height, ow.number.positive.integer.label('target.height'));
  ow(target.data, ow.any(ow.uint8Array, ow.uint8ClampedArray));
  ow(
    shapeAlpha,
    ow.number.integer
      .greaterThanOrEqual(0)
      .lessThanOrEqual(255)
      .label('shapeAlpha'),
  );
  ow(shapeType, ow.string.nonEmpty.label('shapeType'));
  ow(numCandidates, ow.number.integer.positive.label('numCandidates'));
  ow(
    numCandidateShapes,
    ow.number.integer.positive.label('numCandidateShapes'),
  );
  ow(
    numCandidateMutations,
    ow.number.integer.positive.label('numCandidateMutations'),
  );
  ow(log, ow.function.label('log'));
  ow(onStep, ow.function.label('onStep'));

  const backgroundColor = core.getMeanColor(target);

  const model = new Model({
    context,
    target,
    backgroundColor,
    outputSize,
    numCandidates,
  });

  const step = async (index: number): Promise<boolean | number> => {
    await onStep?.(model, step);

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
