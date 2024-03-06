import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  concurrency: 10,
  nodeResolve: true,
  esbuildTarget: 'auto',
  rootDir: './',
  files: ['src/entrypoints/browser.test.ts'],
  plugins: [esbuildPlugin({ ts: true })],
};
