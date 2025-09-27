import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/content-script': resolve(__dirname, 'src/content/content-script.ts'),
        'content/world-script': resolve(__dirname, 'src/content/world-script.ts'),
        'popup/popup': resolve(__dirname, 'src/popup/popup.ts'),
        'options/options': resolve(__dirname, 'src/options/options.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    minify: true,
    sourcemap: true,
    target: 'es2020',
  },
  plugins: [
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json to dist directory
        const manifestSrc = resolve(__dirname, 'manifest.json');
        const manifestDest = resolve(__dirname, 'dist/manifest.json');

        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, manifestDest);
          console.log('✓ Copied manifest.json to dist/');
        }

        // Also copy popup, options, and icons files
        const filesToCopy = [
          { src: 'popup/popup.html', dest: 'dist/popup/popup.html' },
          { src: 'popup/popup.css', dest: 'dist/popup/popup.css' },
          { src: 'options/options.html', dest: 'dist/options/options.html' },
          { src: 'options/options.css', dest: 'dist/options/options.css' },
          { src: 'icons/icon-16.png', dest: 'dist/icons/icon-16.png' },
          { src: 'icons/icon-32.png', dest: 'dist/icons/icon-32.png' },
          { src: 'icons/icon-48.png', dest: 'dist/icons/icon-48.png' },
          { src: 'icons/icon-128.png', dest: 'dist/icons/icon-128.png' },
        ];

        filesToCopy.forEach(({ src, dest }) => {
          const srcPath = resolve(__dirname, src);
          const destPath = resolve(__dirname, dest);
          const destDir = resolve(__dirname, dest.split('/').slice(0, -1).join('/'));

          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }

          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
            console.log(`✓ Copied ${src} to ${dest}`);
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
