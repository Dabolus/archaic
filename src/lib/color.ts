export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const hex = (color: RGBAColor): string =>
  [
    '#',
    color.r.toString(16).padStart(2, '0'),
    color.g.toString(16).padStart(2, '0'),
    color.b.toString(16).padStart(2, '0'),
  ].join('');

export const cssrgba = (color: RGBAColor): string => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
};
