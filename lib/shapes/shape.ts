import Scanline from '../scanline.js';

export interface ShapeBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ShapeOptions {
  width?: number;
  height?: number;
}

export default abstract class Shape {
  public width: number;
  public height: number;

  constructor({ width = 0, height = 0 }: ShapeOptions = {}) {
    this.width = width;
    this.height = height;
  }

  abstract copy(): Shape;
  abstract mutate(): void;
  abstract rasterize(): Scanline[];
  abstract draw(ctx: CanvasRenderingContext2D, scale: number): void;
  abstract toSVG(): string;
}
