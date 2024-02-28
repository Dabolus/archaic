export default class Scanline {
  public y: number;
  public x1: number;
  public x2: number;

  constructor(y: number, x1: number, x2: number) {
    if (x1 > x2) {
      let t = x1;
      x1 = x2;
      x2 = t;
    }

    this.y = y | 0;
    this.x1 = x1 | 0;
    this.x2 = x2 | 0;
  }

  static filter(lines: Scanline[], width: number, height: number): Scanline[] {
    return lines.filter((line) => {
      if (line.y < 0 || line.y >= height) {
        return false;
      }
      if (line.x1 >= width || line.x2 < 0) {
        return false;
      }

      line.x1 = Math.max(0, Math.min(width - 1, line.x1));
      line.x2 = Math.max(0, Math.min(width - 1, line.x2));

      return line.x1 < line.x2;
    });
  }
}
