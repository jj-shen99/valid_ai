import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '..'),
  publicDir: path.resolve(__dirname, '../public'),
  server: {
    port: 3600,
    open: false
  },
  build: {
    outDir: path.resolve(__dirname, '../build/dist'),
    sourcemap: false
  }
})
