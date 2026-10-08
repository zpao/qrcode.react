import {defineConfig} from 'tsdown';

export default defineConfig([
  {
    name: 'lib',
    entry: ['src/index.tsx'],
    outDir: 'lib',
    format: 'esm',
    platform: 'browser',
    target: 'es2017',
    dts: true,
    clean: true,
  },
  {
    name: 'examples',
    entry: ['examples/demo.tsx'],
    outDir: 'examples/iife',
    format: 'iife',
    platform: 'browser',
    target: 'es2017',
    minify: process.env.NODE_ENV !== 'development',
    clean: false,
    dts: false,
    outputOptions: {entryFileNames: '[name].js'},
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV === 'development' ? 'development' : 'production'
      ),
    },
    deps: {alwaysBundle: [/.*/], onlyBundle: false},
  },
]);
