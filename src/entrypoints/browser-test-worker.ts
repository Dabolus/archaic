import { setupWorkerServer } from '@easy-worker/core';
import archaic, { type ArchaicBrowserOptions } from './browser.js';

export interface ArchaicWorker extends Worker {
  getScore: (opts: ArchaicBrowserOptions) => Promise<number>;
}

setupWorkerServer<ArchaicWorker>({
  getScore: async (opts) => {
    const { score } = await archaic({
      ...opts,
      log: console.log.bind(console),
    });
    return score;
  },
});
