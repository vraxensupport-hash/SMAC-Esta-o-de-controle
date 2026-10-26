import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App'

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    {/* quem pediu menos movimento no sistema vê as telas sem deslocamento */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>
)
