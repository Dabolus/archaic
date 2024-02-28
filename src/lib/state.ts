import { int } from './random.js';
import shapeFactory, { ShapeType } from './shapes/factory.js';
import type Shape from './shapes/shape.js';
import type Worker from './worker.js';

export interface StateOptions {
  worker: Worker;
  shape: Shape;
  alpha?: number;
}

export default class State {
  public worker: Worker;
  public shape: Shape;
  public score: number;
  public alpha: number;
  public mutateAlpha: boolean;

  constructor({ worker, shape, alpha }: StateOptions) {
    this.worker = worker;
    this.shape = shape;
    this.score = -1;

    if (!alpha) {
      this.alpha = 128;
      this.mutateAlpha = true;
    } else {
      this.alpha = alpha;
      this.mutateAlpha = false;
    }
  }

  copy(): State {
    const state = new State({
      worker: this.worker,
      shape: this.shape, // .copy()
    });
    state.score = this.score;
    state.alpha = this.alpha;
    state.mutateAlpha = this.mutateAlpha;
    return state;
  }

  energy(): number {
    if (this.score < 0) {
      this.score = this.worker.energy(this.shape, this.alpha);
    }

    return this.score;
  }

  mutate(): State {
    const state = this.copy();
    state.shape = state.shape.mutate();
    if (state.mutateAlpha) {
      state.alpha = Math.max(
        1,
        Math.min(255, (state.alpha + int(-10, 10)) | 0),
      );
    }
    state.score = -1;
    return state;
  }

  static create(worker: Worker, shapeType: ShapeType, alpha: number): State {
    const shape = shapeFactory(shapeType, {
      width: worker.width,
      height: worker.height,
    });

    return new State({
      worker,
      shape,
      alpha,
    });
  }
}
