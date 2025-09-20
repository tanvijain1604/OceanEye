import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    watch: {
      // Exclude the backend directory from file watching
      ignored: ['./backend/**'],
    },
    open: true, // Automatically open in browser
  },
})