import State from './state.js';
import type { ShapeType } from './shapes/factory.js';
import type Worker from './worker.js';

export const hillClimb = (state: State, maxAge: number) => {
  let bestState = state;
  let bestEnergy = state.energy();

  for (let age = 0; age < maxAge; ++age) {
    const newState = bestState.mutate();
    const newEnergy = newState.energy();

    if (newEnergy < bestEnergy) {
      bestEnergy = newEnergy;
      bestState = newState;
      age = -1;
    }
  }

  return bestState;
};

export interface GetStateOptions {
  numCandidateShapes: number;
  numCandidateMutations: number;
  shapeType: ShapeType;
  shapeAlpha: number;
}

export const getBestHillClimbState = (
  worker: Worker,
  opts: GetStateOptions,
) => {
  const state = getBestRandomState(worker, opts);
  return hillClimb(state, opts.numCandidateMutations);
};

export const getBestRandomState = (
  worker: Worker,
  {
    numCandidateShapes,
    shapeType,
    shapeAlpha,
  }: Omit<GetStateOptions, 'numCandidateMutations'>,
): State => {
  let bestEnergy: number | null = null;
  let bestState: State | null = null;

  for (let i = 0; i < numCandidateShapes; ++i) {
    const state = State.create(worker, shapeType, shapeAlpha);
    const energy = state.energy();

    if (!i || energy < bestEnergy!) {
      bestEnergy = energy;
      bestState = state;
    }
  }

  return bestState!;
};

export default {
  hillClimb,
  getBestHillClimbState,
  getBestRandomState,
};
