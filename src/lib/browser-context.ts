import { type RGBAColor, cssrgba } from './color.js';
import type { ContextImageData } from './context.js';

export const PARTIALS = true;
export const platform = 'browser';

export const loadImage = async (
  input: string | ImageData | HTMLImageElement,
): Promise<ContextImageData> => {
  if (typeof input === 'string') {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = img.onabort = () =>
        reject(new Error('image failed to load'));
      img.src = input;
    });

    return loadImage(img);
  } else if (input instanceof ImageData) {
    return input;
  } else if (input instanceof Image) {
    input.crossOrigin = 'anonymous';
    const canvas = document.createElement('canvas');
    canvas.width = input.naturalWidth;
    canvas.height = input.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(input, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    throw new Error('invalid input image');
  }
};

export const loadCanvas = async (
  value: string | HTMLCanvasElement,
  label = 'canvas',
): Promise<HTMLCanvasElement> => {
  if (typeof value === 'string') {
    const canvas = document.querySelector(value);

    if (!canvas) {
      throw new Error(`invalid ${label} selector "${value}" not found`);
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(
        `invalid ${label} selector "${value}" is not a canvas element`,
      );
    }

    return canvas;
  } else {
    return value;
  }
};

export const enableContextAntialiasing = (
  ctx: CanvasRenderingContext2D,
): void => {
  ctx.imageSmoothingQuality = 'high';
  ctx.imageSmoothingEnabled = true;
};

export const createImage = (
  width: number,
  height: number,
  fillColor?: RGBAColor,
): ContextImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (fillColor) {
    ctx.fillStyle = cssrgba(fillColor);
    ctx.fillRect(0, 0, width, height);
  }
  return ctx.getImageData(0, 0, width, height);
};

export default {
  PARTIALS,
  platform,
  loadImage,
  loadCanvas,
  enableContextAntialiasing,
  createImage,
};
