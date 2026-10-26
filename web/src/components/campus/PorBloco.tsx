import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Sala } from '../../lib/api'
import { cn } from '../../lib/formato'
import { MOLA_SUAVE } from '../../lib/movimento'

/**
 * Ar ligado por bloco — as barras do StatsBento, com dado de verdade.
 * Cada barra sobe com mola até a fração de salas ligadas do bloco; tocar
 * leva até o bloco na malha de salas.
 */
export function PorBloco({ salas }: { salas: Sala[] }) {
  const reduzir = useReducedMotion()
  const [foco, setFoco] = useState<string | null>(null)

  const blocos = useMemo(() => {
    const m = new Map<string, { ligadas: number; total: number }>()
    salas.forEach(s => {
      const b = m.get(s.bloco) ?? { ligadas: 0, total: 0 }
      b.total++
      if (s.ligado) b.ligadas++
      m.set(s.bloco, b)
    })
    return [...m.entries()].map(([bloco, v]) => ({ bloco, ...v, fracao: v.total ? v.ligadas / v.total : 0 }))
  }, [salas])

  const lider = blocos.reduce((a, b) => (b.fracao > a.fracao ? b : a), blocos[0])

  function irPara(bloco: string) {
    document.getElementById(`bloco-${bloco}`)?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-tinta-3">Ar ligado por bloco</p>
          <p className="mt-1.5 text-[13px] text-tinta-3">
            {lider && lider.ligadas > 0
              ? <>Mais ativo: <strong className="font-semibold text-tinta">Bloco {lider.bloco}</strong> com {lider.ligadas} de {lider.total}</>
              : 'Nenhum aparelho ligado agora'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-6 items-end gap-2.5 sm:gap-4" onPointerLeave={() => setFoco(null)}>
        {blocos.map(b => {
          const apagada = foco !== null && foco !== b.bloco
          return (
            <button
              key={b.bloco}
              type="button"
              onClick={() => irPara(b.bloco)}
              onPointerEnter={e => e.pointerType === 'mouse' && setFoco(b.bloco)}
              onFocus={() => setFoco(b.bloco)}
              onBlur={() => setFoco(null)}
              aria-label={`Bloco ${b.bloco}: ${b.ligadas} de ${b.total} salas ligadas. Ir para o bloco.`}
              className={cn(
                'group flex flex-col items-center gap-2 rounded-xl transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-energia',
                apagada && 'opacity-40'
              )}
            >
              <span className="font-mono text-[11px] font-medium text-tinta-3 tabular-nums">{b.ligadas}/{b.total}</span>
              <span className="relative h-24 w-full max-w-[34px] overflow-hidden rounded-full bg-nevoa ring-1 ring-inset ring-linha/70">
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-full origin-bottom rounded-full bg-gradient-to-t from-energia to-energia-vivo"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: Math.max(b.fracao, b.ligadas ? 0.06 : 0) }}
                  transition={reduzir ? { duration: 0 } : MOLA_SUAVE}
                />
              </span>
              <span className="font-mono text-[12px] font-semibold text-tinta transition-transform duration-200 ease-saida group-hover:-translate-y-0.5">{b.bloco}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
