import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022'
  },
  test: {
    environment: 'jsdom'
  },
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})