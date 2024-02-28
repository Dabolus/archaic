import { float, int, normal } from '../random.js';
import rasterize, { Point } from '../rasterize.js';
import Scanline from '../scanline.js';
import Shape, { ShapeOptions } from './shape.js';

export interface RotatedEllipseOptions extends ShapeOptions {}

export default class RotatedEllipse extends Shape {
  public x!: number;
  public y!: number;
  public rx!: number;
  public ry!: number;
  public angle!: number;

  constructor(opts?: RotatedEllipseOptions) {
    super(opts);

    if (!opts) {
      return;
    }

    this.x = int(0, this.width - 1);
    this.y = int(0, this.height - 1);

    this.rx = int(1, 32);
    this.ry = int(1, 32);

    this.angle = float() * 360;
  }

  copy(): RotatedEllipse {
    const shape = new RotatedEllipse();
    shape.width = this.width;
    shape.height = this.height;
    shape.x = this.x;
    shape.y = this.y;
    shape.rx = this.rx;
    shape.ry = this.ry;
    shape.angle = this.angle;
    return shape;
  }

  mutate(): RotatedEllipse {
    const { width, height } = this;
    const shape = this.copy();
    const m = 16;

    switch (int(0, 2)) {
      case 0:
        shape.x = Math.max(0, Math.min(width - 1, shape.x + normal() * m));
        shape.y = Math.max(0, Math.min(height - 1, shape.y + normal() * m));
        break;

      case 1:
        shape.rx = Math.max(1, Math.min(width - 1, shape.rx + normal() * m));
        shape.ry = Math.max(1, Math.min(height - 1, shape.ry + normal() * m));
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

  getPoints(numPoints = 20): Point[] {
    const { x, y, rx, ry, angle } = this;
    const points: Point[] = [];
    const rads = (angle * Math.PI) / 180.0;
    const c = Math.cos(rads);
    const s = Math.sin(rads);

    for (let i = 0; i < numPoints; ++i) {
      const rot = (360.0 / numPoints) * i * (Math.PI / 180.0);
      const crx = rx * Math.cos(rot);
      const cry = ry * Math.sin(rot);

      const tx = (crx * c - cry * s + x) | 0;
      const ty = (crx * s + cry * c + y) | 0;

      points.push({ x: tx, y: ty });
    }

    return points;
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    throw new Error('TODO');
  }

  toSVG(attrs = ''): string {
    // TODO: native rotated ellipse will produce smaller and smoother results
    const points = this.getPoints()
      .map((point) => `${point.x} ${point.y}`)
      .join(' ');

    return `<polygon ${attrs} points="${points}" />`;
  }
}
