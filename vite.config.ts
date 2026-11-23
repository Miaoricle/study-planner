import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base: './' makes the build work on GitHub Pages (any repo name) and any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
