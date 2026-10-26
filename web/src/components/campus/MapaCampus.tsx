import { memo, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Sala } from '../../lib/api'
import { cn, estadoDe, graus, textoEstado, type Estado } from '../../lib/formato'
import { SAIDA } from '../../lib/movimento'

// cores pensadas para o cartão escuro do "Campus agora"
const COR: Record<Estado, string> = {
  ligada: 'bg-energia-vivo motion-safe:animate-respirar',
  alerta: 'bg-[#EC6A53] motion-safe:animate-respirar',
  auto: 'bg-[#D9A043]',
  desligada: 'bg-white/[0.13]',
}

type Dica = { sala: Sala; x: number; y: number }

/**
 * A malha viva: o campus inteiro em um olhar. Cada ponto é uma sala, cada
 * linha um bloco. As salas ligadas respiram em onda (o atraso segue a
 * posição), as automáticas ficam âmbar e as quentes, coral.
 * É um atalho visual para o mouse; o caminho acessível são os cartões da
 * malha de salas logo abaixo, que têm os mesmos estados em texto.
 */
export const MapaCampus = memo(function MapaCampus({ salas, onAbrir }: { salas: Sala[]; onAbrir: (n: string) => void }) {
  const caixa = useRef<HTMLDivElement>(null)
  const [dica, setDica] = useState<Dica | null>(null)

  const blocos = useMemo(() => {
    const m = new Map<string, Sala[]>()
    salas.forEach(s => m.set(s.bloco, [...(m.get(s.bloco) ?? []), s]))
    return [...m.entries()]
  }, [salas])

  function mostrar(e: React.PointerEvent<HTMLButtonElement>, sala: Sala) {
    if (e.pointerType !== 'mouse' || !caixa.current) return
    const r = caixa.current.getBoundingClientRect()
    const p = e.currentTarget.getBoundingClientRect()
    setDica({ sala, x: p.left - r.left + p.width / 2, y: p.top - r.top })
  }

  return (
    <div ref={caixa} className="relative" onPointerLeave={() => setDica(null)}>
      <div aria-hidden className="grid gap-2">
        {blocos.map(([bloco, doBloco], b) => (
          <div key={bloco} className="flex items-center gap-3">
            <span className="w-4 font-mono text-[11px] font-medium text-white/40">{bloco}</span>
            {/* 20 colunas fixas: blocos de 10 salas ocupam meia linha e tudo
                alinha; no celular os pontos encolhem em vez de quebrar linha */}
            <div className="grid max-w-[340px] flex-1 grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px] sm:gap-[5px]">
              {doBloco.map((s, i) => (
                <button
                  key={s.numero}
                  type="button"
                  tabIndex={-1}
                  onClick={() => onAbrir(s.numero)}
                  onPointerEnter={e => mostrar(e, s)}
                  className={cn(
                    'aspect-square w-full max-w-[12px] rounded-[3px] transition-[background-color,transform] duration-300 ease-saida',
                    'hover:scale-[1.35] focus:outline-none',
                    COR[estadoDe(s)]
                  )}
                  // a onda da respiração percorre o campus da esquerda para a direita
                  style={{ animationDelay: `${(i * 0.09 + b * 0.18).toFixed(2)}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {dica && (
          <motion.div
            key="dica"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, x: dica.x, y: dica.y }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
            transition={{ duration: 0.14, ease: SAIDA, x: { duration: 0.12 }, y: { duration: 0.12 } }}
            className="pointer-events-none absolute left-0 top-0 z-10"
            aria-hidden
          >
            <div className="-translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-[11px] text-tinta shadow-elevada">
              <span className="font-mono font-semibold">Sala {dica.sala.numero}</span>
              <span className="text-tinta-3"> · {textoEstado(dica.sala)}</span>
              {dica.sala.temperatura !== null && <span className="text-tinta-3"> · {graus(dica.sala.temperatura)}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
