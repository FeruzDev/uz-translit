import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', react: 'src/react/index.tsx' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2018',
  external: ['react'],
});
