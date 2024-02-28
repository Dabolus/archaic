import { int } from '../random.js';
import Ellipse, { type EllipseOptions } from './ellipse.js';
import Rectangle, { RectangleOptions } from './rectangle.js';
import RotatedEllipse, {
  type RotatedEllipseOptions,
} from './rotated-ellipse.js';
import RotatedRectangle, {
  type RotatedRectangleOptions,
} from './rotated-rectangle.js';
import Triangle, { type TriangleOptions } from './triangle.js';

export type ShapeType =
  | 'rectangle'
  | 'rect'
  | 'rotated-rectangle'
  | 'rotated-rect'
  | 'circle'
  | 'ellipse'
  | 'rotated-ellipse'
  | 'triangle'
  | 'random';

const SHAPES: ShapeType[] = [
  // ellipse, rectangle and circle are redundant when chosing a random shape
  // 'ellipse',
  // 'rectangle',
  'rotated-ellipse',
  'rotated-rectangle',
  'triangle',
];

interface ShapeTypeToOptions {
  rect: RectangleOptions;
  rectangle: RectangleOptions;
  'rotated-rect': RotatedRectangleOptions;
  'rotated-rectangle': RotatedRectangleOptions;
  circle: Omit<EllipseOptions, 'circle'>;
  ellipse: EllipseOptions;
  'rotated-ellipse': RotatedEllipseOptions;
  triangle: TriangleOptions;
  random:
    | RectangleOptions
    | RotatedRectangleOptions
    | Omit<EllipseOptions, 'circle'>
    | EllipseOptions
    | RotatedEllipseOptions
    | TriangleOptions;
}

const randomShapeType = () => SHAPES[int(SHAPES.length - 1)];

const factory = <T extends ShapeType>(
  shapeType: T,
  opts: ShapeTypeToOptions[T],
) => {
  switch (shapeType) {
    case 'rectangle':
    case 'rect':
      return new Rectangle(opts);

    case 'rotated-rectangle':
    case 'rotated-rect':
      return new RotatedRectangle(opts);

    case 'circle':
      return new Ellipse({
        circle: true,
        ...opts,
      });

    case 'ellipse':
      return new Ellipse(opts);

    case 'rotated-ellipse':
      return new RotatedEllipse(opts);

    case 'triangle':
      return new Triangle(opts);

    default:
      return factory(randomShapeType(), opts);
  }
};

export default factory;
