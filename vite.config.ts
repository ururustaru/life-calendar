import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Делаем пути к ассетам относительными, чтобы билд работал и в корне,
  // и во вложенной папке
  base: './',
})