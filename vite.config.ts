import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  base: '/RaheeMoneyTracker/', 
  // 🟢 Yeh niche ka hissa add kiya hai taaki component sahi se load ho jaye
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  }
})
