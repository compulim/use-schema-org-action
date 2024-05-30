import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'use-schema-org-action': './src/index.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true
  }
]);
