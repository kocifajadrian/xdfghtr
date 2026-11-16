import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// MapLibre starts its worker from a file next to its own module, which the bundler does not emit.
const maplibreWorker = (): Plugin => ({
  name: 'maplibre-worker',
  apply: 'build',
  closeBundle() {
    mkdirSync('dist/assets', { recursive: true })
    copyFileSync('node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', 'dist/assets/maplibre-gl-worker.mjs')
  },
})

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), maplibreWorker()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // MapLibre starts its worker from files next to its own module, which pre-bundling would move.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
