import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O build vai para static/app (servido pelo FastAPI em /static) e o
// scripts/publicar.mjs copia o index.html para templates/dashboard.html,
// que é o arquivo que a rota "/" do api.py já entrega. Assim o backend
// não muda nada.
export default defineConfig({
  plugins: [react()],
  base: '/static/app/',
  build: {
    outDir: '../static/app',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
