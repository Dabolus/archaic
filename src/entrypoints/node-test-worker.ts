import { setupWorkerServer, type WorkerServerTarget } from '@easy-worker/core';
import { parentPort } from 'node:worker_threads';
import archaic, { type ArchaicNodeOptions } from './node.js';

export interface ArchaicWorker extends Worker {
  getScore: (opts: ArchaicNodeOptions) => Promise<number>;
}

setupWorkerServer<ArchaicWorker>(
  {
    getScore: async (opts) => {
      const { score } = await archaic({
        ...opts,
        log: console.log.bind(console),
      });
      return score;
    },
  },
  {
    target: {
      postMessage: (data: any) => parentPort?.postMessage(data),
      addEventListener: (_, eh) => {
        const l = (data: any) => {
          if ('handleEvent' in eh) {
            eh.handleEvent({ data } as MessageEvent);
          } else {
            eh({ data } as MessageEvent);
          }
        };
        parentPort?.on('message', l);
      },
    } satisfies WorkerServerTarget,
  },
);
