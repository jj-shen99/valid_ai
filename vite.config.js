import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3600,
    open: false,
    middlewareMode: false
  },
  build: {
    outDir: 'build/dist',
    sourcemap: false
  }
})
