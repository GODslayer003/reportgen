import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",    // IMPORTANT for Vercel + React Router
  plugins: [react()],
})
