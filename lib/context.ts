import execa from 'execa';
import fs from 'fs';
import ndarray from 'ndarray';
import ow from 'ow';
import pify from 'pify';
import pump from 'pump-promise';
import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import type { RGBAColor } from './color.js';

export interface ContextImageData {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

const getPixelsP = pify(getPixels);

export const PARTIALS = true;
export const platform = 'node';

export const loadImage = async (input) => {
  ow(input, ow.string.label('input').nonEmpty);

  const result = await getPixelsP(input);
  const { data, shape } = result;

  return {
    data,
    width: shape[0],
    height: shape[1],
  };
};

export const createImage = (
  width: number,
  height: number,
  color?: RGBAColor,
): ContextImageData => {
  ow(width, ow.number.label('width').positive.integer);
  ow(height, ow.number.label('height').positive.integer);

  const data = new Uint8ClampedArray(width * height * 4);

  if (color) {
    for (let i = 0; i < width * height; ++i) {
      const o = i * 4;
      data[o + 0] = color.r;
      data[o + 1] = color.g;
      data[o + 2] = color.b;
      data[o + 3] = color.a;
    }
  }

  return {
    data,
    width,
    height,
  };
};

export const saveImage = async (
  image: ContextImageData,
  filename: string,
  _opts?: {},
): Promise<void> => {
  ow(image, ow.object.label('image').nonEmpty);
  ow(filename, ow.string.label('filename').nonEmpty);

  const pixels = ndarray(image.data, [image.height, image.width, 4]);
  const parts = filename.split('.');
  const format = parts[parts.length - 1];
  const stream = savePixels(pixels.transpose(1, 0, 2), format);
  return pump(stream, fs.createWriteStream(filename));
};

export const saveGIF = async (
  frames: string[],
  filename: string,
  opts: {
    gifski?: { fps?: number; quality?: number; fast?: boolean };
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  } = {},
): Promise<void> => {
  ow(frames, ow.array.label('frames'));
  ow(filename, ow.string.label('filename').nonEmpty);
  ow(opts, ow.object.label('opts').plain.nonEmpty);

  const {
    // gif output options
    gifski = {
      fps: 10,
      quality: 80,
      fast: false,
    },
  } = opts;

  const params = [
    '-o',
    filename,
    '--fps',
    gifski.fps,
    gifski.fast && '--fast',
    '--quality',
    gifski.quality,
    '-W',
    600, // TODO: make this configurable
    '--quiet',
  ]
    .concat(frames)
    .filter(Boolean) as (string | number | boolean)[];

  const executable = process.env.GIFSKI_PATH || 'gifski';
  const cmd = ([executable] as (string | number | boolean)[])
    .concat(params)
    .join(' ');
  if (opts.log) {
    opts.log(cmd);
  }

  await execa.shell(cmd);
};

export default {
  PARTIALS,
  platform,
  loadImage,
  createImage,
  saveImage,
  saveGIF,
};
