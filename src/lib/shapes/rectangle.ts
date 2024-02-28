import { int, normal } from '../random.js';
import Scanline from '../scanline.js';
import Shape, { ShapeBounds, ShapeOptions } from './shape.js';

export interface RectangleOptions extends ShapeOptions {}

export default class Rectangle extends Shape {
  public x1!: number;
  public y1!: number;
  public x2!: number;
  public y2!: number;

  constructor(opts?: RectangleOptions) {
    super(opts);

    if (!opts) {
      return;
    }

    this.x1 = int(0, this.width - 1);
    this.y1 = int(0, this.height - 1);

    this.x2 = Math.max(0, Math.min(this.width - 1, this.x1 + int(-16, 16)));
    this.y2 = Math.max(0, Math.min(this.height - 1, this.y1 + int(-16, 16)));
  }

  copy(): Rectangle {
    const shape = new Rectangle();
    shape.width = this.width;
    shape.height = this.height;
    shape.x1 = this.x1;
    shape.y1 = this.y1;
    shape.x2 = this.x2;
    shape.y2 = this.y2;
    return shape;
  }

  bounds(): ShapeBounds {
    let { x1, y1, x2, y2 } = this;
    let t: number;

    if (x1 > x2) {
      t = x1;
      x1 = x2;
      x2 = t;
    }

    if (y1 > y2) {
      t = y1;
      y1 = y2;
      y2 = t;
    }

    return { x1, y1, x2, y2 };
  }

  mutate(): Rectangle {
    const { width, height } = this;
    const shape = this.copy();
    const m = 16;

    switch (int(0, 1)) {
      case 0:
        shape.x1 = Math.max(0, Math.min(width - 1, shape.x1 + normal() * m));
        shape.y1 = Math.max(0, Math.min(height - 1, shape.y1 + normal() * m));
        break;

      case 1:
        shape.x2 = Math.max(0, Math.min(width - 1, shape.x2 + normal() * m));
        shape.y2 = Math.max(0, Math.min(height - 1, shape.y2 + normal() * m));
        break;
    }

    return shape;
  }

  rasterize(): Scanline[] {
    const { x1, y1, x2, y2 } = this.bounds();
    const lines: Scanline[] = [];

    for (let y = y1; y <= y2; ++y) {
      lines.push(new Scanline(y, x1, x2));
    }

    return lines;
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    throw new Error('TODO');
  }

  toSVG(attrs = ''): string {
    const { x1, y1, x2, y2 } = this.bounds();
    const w = x2 - x1 + 1;
    const h = y2 - y1 + 1;

    return `<rect ${attrs} x="${x1}" y="${y1}" width="${w}" height="${h}" />`;
  }
}
