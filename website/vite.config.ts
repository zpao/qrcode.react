import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import pkg from '../package.json' with {type: 'json'};

function homepageBase(homepage: string): string {
  const pathname = new URL(homepage).pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export default defineConfig({
  base: homepageBase(pkg.homepage),
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
