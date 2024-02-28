export const float = (): number => {
  const [rand] = crypto.getRandomValues(new Uint32Array(1));
  // Rand is an integer between 0 and 2^32 - 1
  // We divide it by 2^32 to get a float between 0 and 1
  return rand / 2 ** 32;
};

export const int = (min = 0, max = 1): number =>
  Math.floor(float() * (max - min + 1)) + min;

export const normalFactory =
  (mu = 0, sigma = 1) =>
  (): number => {
    let x: number;
    let y: number;
    let r: number;

    do {
      x = float() * 2 - 1;
      y = float() * 2 - 1;
      r = x * x + y * y;
    } while (!r || r > 1);

    return mu + sigma * y * Math.sqrt((-2 * Math.log(r)) / r);
  };

export const normal = normalFactory();
