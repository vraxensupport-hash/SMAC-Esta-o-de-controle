// Copia o index.html gerado pelo Vite para templates/dashboard.html,
// o arquivo que a rota "/" do api.py entrega.
import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const origem = fileURLToPath(new URL('../../static/app/index.html', import.meta.url))
const destino = fileURLToPath(new URL('../../templates/dashboard.html', import.meta.url))
copyFileSync(origem, destino)
console.log('dashboard publicado em templates/dashboard.html')
