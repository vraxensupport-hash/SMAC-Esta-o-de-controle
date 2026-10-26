import { motion, useReducedMotion } from 'motion/react'
import { SAIDA } from '../../lib/movimento'

/** Símbolo SMAC: três barras de telemetria que sobem ao abrir a tela. */
export function Marca() {
  const reduzir = useReducedMotion()
  const barras = [
    { x: 9, y1: 21, y2: 17 },
    { x: 16, y1: 21, y2: 11 },
    { x: 23, y1: 21, y2: 14 },
  ]
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-tinta shadow-[0_8px_20px_-10px_rgb(17_25_23/0.7)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          {barras.map((b, i) => (
            <motion.line
              key={b.x}
              x1={b.x} x2={b.x} y1={b.y1} y2={b.y2}
              stroke="#12A07A" strokeWidth={3.2} strokeLinecap="round"
              initial={{ pathLength: reduzir ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: SAIDA }}
            />
          ))}
        </svg>
      </span>
      <div className="leading-tight">
        <p className="text-[17px] font-semibold tracking-tight text-tinta">SMAC</p>
        <p className="text-xs text-tinta-3">Estação de controle</p>
      </div>
    </div>
  )
}
