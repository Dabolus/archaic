import { exec } from 'node:child_process';
import { promises as stream, type Readable } from 'node:stream';
import fs from 'fs';
import ndarray, { type NdArray } from 'ndarray';
import ow from 'ow';
import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import type { RGBAColor } from './color.js';

const execPromise = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) =>
    exec(cmd, (error, stdout, stderr) =>
      error ? reject(error) : resolve(stdout || stderr),
    ),
  );

const getPixelsPromise = (path: string): Promise<NdArray<Uint8Array>> =>
  new Promise((resolve, reject) =>
    getPixels(path, (err, pixels) => (err ? reject(err) : resolve(pixels))),
  );

export interface ContextImageData {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

export const PARTIALS = true;
export const platform = 'node';

export const loadImage = async (input: string): Promise<ContextImageData> => {
  ow(input, 'input', ow.string.nonEmpty);

  const result = await getPixelsPromise(input);
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
  ow(width, 'width', ow.number.positive.integer);
  ow(height, 'height', ow.number.positive.integer);

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
  ow(image, 'image', ow.object.nonEmpty);
  ow(filename, 'filename', ow.string.nonEmpty);

  const pixels = ndarray(image.data, [image.height, image.width, 4]);
  const parts = filename.split('.');
  const format = parts[parts.length - 1] as 'png';
  const pixelsStream = savePixels(
    pixels.transpose(1, 0, 2),
    format,
  ) as Readable;
  return stream.pipeline(pixelsStream, fs.createWriteStream(filename));
};

export const saveGIF = async (
  frames: string[],
  filename: string,
  opts: {
    gifski?: { fps?: number; quality?: number; fast?: boolean };
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  } = {},
): Promise<void> => {
  ow(frames, 'frames', ow.array);
  ow(filename, 'filename', ow.string.nonEmpty);
  ow(opts, 'opts', ow.object.plain.nonEmpty);

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

  await execPromise(cmd);
};

export default {
  PARTIALS,
  platform,
  loadImage,
  createImage,
  saveImage,
  saveGIF,
};
