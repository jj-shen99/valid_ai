import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '..'),
  publicDir: path.resolve(__dirname, '../public'),
  server: {
    port: 3600,
    open: true
  },
  build: {
    outDir: path.resolve(__dirname, '../build/dist'),
    sourcemap: false
  }
})
