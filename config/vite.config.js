import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
  publicDir: 'public',
  server: {
    port: 3600,
    open: false
  },
  build: {
    outDir: 'build/dist',
    sourcemap: false
  }
})
