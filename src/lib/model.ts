import core from './core.js';
import optimize, { type GetStateOptions } from './optimize.js';
import Worker from './worker.js';
import type { ContextImageData } from './context.js';
import type Shape from './shapes/shape.js';
import type State from './state.js';
import type { ShapeType } from './shapes/factory.js';
import { hex, type RGBAColor } from './color.js';

export type ModelContext =
  | typeof import('./context.js').default
  | typeof import('./browser-context.js').default;

export interface ModelOptions {
  context: ModelContext;
  target: ContextImageData;
  backgroundColor: RGBAColor;
  outputSize?: number;
  numCandidates?: number;
}

export interface ModelStepOptions {
  shapeType: ShapeType;
  shapeAlpha: number;
  numCandidateShapes: number;
  numCandidateMutations: number;
  numCandidateExtras?: number;
}

export default class Model {
  public context: ModelContext;
  public target: ContextImageData;
  public backgroundColor: RGBAColor;
  public sw: number;
  public sh: number;
  public scale: number;
  public current: ContextImageData;
  public score: number;
  public shapes: Shape[];
  public colors: RGBAColor[];
  public scores: number[];
  public workers: Worker[];
  public before!: ContextImageData;

  constructor({
    context,
    target,
    backgroundColor,
    outputSize,
    numCandidates = 1,
  }: ModelOptions) {
    const { width, height } = target;
    const aspect = width / height;

    if (outputSize) {
      if (aspect >= 1) {
        this.sw = outputSize;
        this.sh = (outputSize / aspect) | 0;
        this.scale = outputSize / width;
      } else {
        this.sw = (outputSize * aspect) | 0;
        this.sh = outputSize;
        this.scale = outputSize / height;
      }
    } else {
      this.sw = width;
      this.sh = height;
      this.scale = 1;
    }

    this.context = context;
    this.target = target;
    this.backgroundColor = backgroundColor;

    this.current = this.createImage();
    this.score = core.difference(this.target, this.current);

    this.shapes = [];
    this.colors = [];
    this.scores = [];
    this.workers = [];

    for (let i = 0; i < numCandidates; ++i) {
      this.workers.push(
        new Worker({
          context,
          target,
        }),
      );
    }

    if (this.context.PARTIALS) {
      this.before = this.context.createImage(width, height);
    }
  }

  createImage(): ContextImageData {
    const { width, height } = this.target;
    return this.context.createImage(width, height, this.backgroundColor);
  }

  add(shape: Shape, alpha: number): void {
    const lines = shape.rasterize();
    const color = core.computeColor(this.target, this.current, lines, alpha);
    let score: number;

    if (this.context.PARTIALS) {
      this.before.data.set(this.current.data);
      core.drawLines(this.current, color, lines);
      score = core.differencePartial(
        this.target,
        this.before,
        this.current,
        this.score,
        lines,
      );
    } else {
      core.drawLines(this.current, color, lines);
      score = core.difference(this.target, this.current);
    }

    this.score = score;
    this.shapes.push(shape);
    this.colors.push(color);
    this.scores.push(score);
  }

  step(opts: ModelStepOptions): number {
    let state = this._getBestCandidateState(opts);
    this.add(state.shape, state.alpha);

    if (opts.numCandidateExtras) {
      for (let i = 0; i < opts.numCandidateExtras; ++i) {
        state.worker.init(this.current, this.score);
        const a = state.energy();
        state = optimize.hillClimb(state, opts.numCandidateMutations);
        const b = state.energy();
        if (b <= a) {
          break;
        }

        this.add(state.shape, state.alpha);
      }
    }

    return this.workers.reduce((sum, worker) => sum + worker.counter, 0);
  }

  _getBestCandidateState(opts: GetStateOptions): State {
    const states = this.workers.map((worker) => {
      worker.init(this.current, this.score);
      return optimize.getBestHillClimbState(worker, opts);
    });

    let bestEnergy: number | null = null;
    let bestState: State | null = null;

    for (let i = 0; i < states.length; ++i) {
      const state = states[i];
      const energy = state.energy();

      if (!i || energy < bestEnergy!) {
        bestEnergy = energy;
        bestState = state;
      }
    }

    return bestState!;
  }

  toSVG(): string {
    const bg = hex(this.backgroundColor);
    const body = this.shapes
      .map((shape, index) => {
        const color = this.colors[index];
        const fill = hex(color);
        const attrs = `fill="${fill}" fill-opacity="${color.a / 255}"`;
        return shape.toSVG(attrs);
      })
      .join('\n');

    return `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${this.sw}" height="${this.sh}">
  <rect x="0" y="0" width="${this.sw}" height="${this.sh}" fill="${bg}" />
  <g transform="scale(${this.scale}) translate(0.5 0.5)">
    ${body}
  </g>
</svg>
`;
  }

  toFrames(scoreDelta = 0) {
    throw new Error('TODO');

    /*
    for (let i = 0; i < this.shapes.length; ++i) {
      const shape = this.shapes[i]
      const color = this.colors[i]
    }
    */
  }
}
