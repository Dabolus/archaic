import core from './core.js';
import type { ContextImageData } from './context.js';
import type Shape from './shapes/shape.js';

export type WorkerContext =
  | typeof import('./context.js')
  | typeof import('./browser-context.js');

export interface WorkerOptions {
  context: WorkerContext;
  target: ContextImageData;
}

export default class Worker {
  public context: WorkerContext;
  public target: ContextImageData;
  public width: number;
  public height: number;
  public counter: number;
  public current: ContextImageData | null;
  public score: number;
  public buffer: ContextImageData;

  constructor({ context, target }: WorkerOptions) {
    this.context = context;
    this.target = target;
    this.width = target.width;
    this.height = target.height;

    this.counter = 0;
    this.current = null;
    this.score = 0;

    this.buffer = context.createImage(this.width, this.height);
  }

  init(current: ContextImageData | null, score: number) {
    this.current = current;
    this.score = score;
    this.counter = 0;
  }

  energy(shape: Shape, alpha: number) {
    this.counter++;

    const lines = shape.rasterize();
    const color = core.computeColor(this.target, this.current!, lines, alpha);
    let score: number;

    if (this.context.PARTIALS) {
      core.copyLines(this.buffer, this.current!, lines);
      core.drawLines(this.buffer, color, lines);
      score = core.differencePartial(
        this.target,
        this.current!,
        this.buffer,
        this.score,
        lines,
      );
    } else {
      this.buffer.data.set(this.current!.data);
      core.drawLines(this.buffer, color, lines);
      score = core.difference(this.target, this.buffer);
    }

    // console.log('worker.energy', this.counter, score)
    return score;
  }
}
