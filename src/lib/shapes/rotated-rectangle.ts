import { float, int, normal } from '../random.js';
import rasterize, { Point } from '../rasterize.js';
import Scanline from '../scanline.js';
import Shape, { ShapeOptions } from './shape.js';

export interface RotatedRectangleOptions extends ShapeOptions {}

export default class RotatedRectangle extends Shape {
  public x1!: number;
  public y1!: number;
  public x2!: number;
  public y2!: number;
  public angle!: number;

  constructor(opts?: RotatedRectangleOptions) {
    super(opts);

    if (!opts) {
      return;
    }

    this.x1 = int(0, this.width - 1);
    this.y1 = int(0, this.height - 1);

    this.x2 = Math.max(0, Math.min(this.width - 1, this.x1 + int(-16, 16)));
    this.y2 = Math.max(0, Math.min(this.height - 1, this.y1 + int(-16, 16)));

    this.angle = float() * 360;
  }

  copy(): RotatedRectangle {
    const shape = new RotatedRectangle();
    shape.width = this.width;
    shape.height = this.height;
    shape.x1 = this.x1;
    shape.y1 = this.y1;
    shape.x2 = this.x2;
    shape.y2 = this.y2;
    shape.angle = this.angle;
    return shape;
  }

  mutate(): RotatedRectangle {
    const { width, height } = this;
    const shape = this.copy();
    const m = 16;

    switch (int(0, 2)) {
      case 0:
        shape.x1 = Math.max(0, Math.min(width - 1, shape.x1 + normal() * m));
        shape.y1 = Math.max(0, Math.min(height - 1, shape.y1 + normal() * m));
        break;

      case 1:
        shape.x2 = Math.max(0, Math.min(width - 1, shape.x2 + normal() * m));
        shape.y2 = Math.max(0, Math.min(height - 1, shape.y2 + normal() * m));
        break;

      case 2:
        shape.angle = shape.angle + normal() * m;
        break;
    }

    return shape;
  }

  rasterize(): Scanline[] {
    const points = this.getPoints();
    const lines = rasterize(points);
    return Scanline.filter(lines, this.width, this.height);
  }

  getPoints(): Point[] {
    const { x1, y1, x2, y2, angle } = this;

    const xm1 = Math.min(x1, x2);
    const xm2 = Math.max(x1, x2);
    const ym1 = Math.min(y1, y2);
    const ym2 = Math.max(y1, y2);

    const cx = (xm1 + xm2) / 2;
    const cy = (ym1 + ym2) / 2;

    const ox1 = xm1 - cx;
    const ox2 = xm2 - cx;
    const oy1 = ym1 - cy;
    const oy2 = ym2 - cy;

    const rads = (angle * Math.PI) / 180.0;
    const c = Math.cos(rads);
    const s = Math.sin(rads);

    const ulx = (ox1 * c - oy1 * s + cx) | 0;
    const uly = (ox1 * s + oy1 * c + cy) | 0;
    const blx = (ox1 * c - oy2 * s + cx) | 0;
    const bly = (ox1 * s + oy2 * c + cy) | 0;
    const urx = (ox2 * c - oy1 * s + cx) | 0;
    const ury = (ox2 * s + oy1 * c + cy) | 0;
    const brx = (ox2 * c - oy2 * s + cx) | 0;
    const bry = (ox2 * s + oy2 * c + cy) | 0;

    return [
      {
        x: ulx,
        y: uly,
      },
      {
        x: urx,
        y: ury,
      },
      {
        x: brx,
        y: bry,
      },
      {
        x: blx,
        y: bly,
      },
    ];
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    throw new Error('TODO');
  }

  toSVG(attrs = ''): string {
    const points = this.getPoints()
      .map((point) => `${point.x} ${point.y}`)
      .join(' ');

    return `<polygon ${attrs} points="${points}" />`;
  }
}
