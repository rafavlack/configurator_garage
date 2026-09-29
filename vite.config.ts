import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  base: '/configurator_garage/',

  build: {
    target: 'baseline-widely-available',
    cssCodeSplit: true,
    sourcemap: false,
  },
})