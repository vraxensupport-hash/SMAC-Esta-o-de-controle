// Odômetro — vindo do projeto Aurora (components/fx/odometro.tsx).
// Cada dígito é uma fita de 0 a 9 que rola até o algarismo certo, os da
// direita primeiro, como num contador mecânico. Mudanças para o SMAC: sem
// moeda/i18n, e rola de novo sempre que o valor muda (é telemetria ao vivo).
// A fita já nasce parada no dígito final: com movimento reduzido, o número
// na tela é sempre o verdadeiro.

import { useEffect, useRef } from 'react'
import { useAnimate, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/formato'

const ALTURA = 1.1 // em; folga para o dígito não ser cortado
const EASE = [0.22, 1, 0.36, 1] as const

function Fita({ digito, ordem, ativo }: { digito: number; ordem: number; ativo: boolean }) {
  const [escopo, animar] = useAnimate<HTMLSpanElement>()
  const anterior = useRef<number | null>(null)

  useEffect(() => {
    if (!escopo.current) return
    const de = anterior.current ?? 0
    anterior.current = digito
    if (!ativo || de === digito) return
    animar(
      escopo.current,
      { y: [`${-de * ALTURA}em`, `${-digito * ALTURA}em`] },
      { duration: 0.8, ease: EASE, delay: ordem * 0.05 }
    )
  }, [ativo, digito, ordem, animar, escopo])

  return (
    <span className="relative inline-block overflow-hidden" style={{ height: `${ALTURA}em`, lineHeight: `${ALTURA}em`, verticalAlign: 'bottom' }}>
      <span className="invisible">{digito}</span>
      <span
        ref={escopo}
        className="absolute inset-x-0 top-0 flex flex-col"
        style={{ transform: `translateY(${-digito * ALTURA}em)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block text-center" style={{ height: `${ALTURA}em`, lineHeight: `${ALTURA}em` }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}

export function Odometro({ value, className }: { value: number; className?: string }) {
  const reduzir = useReducedMotion()
  const texto = String(Math.max(0, Math.round(value)))
  const digitos = [...texto]

  return (
    <span className={cn('inline-flex items-baseline whitespace-nowrap leading-none tabular-nums', className)}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden className="inline-flex items-end">
        {digitos.map((ch, i) => {
          const ordem = digitos.length - 1 - i
          // a chave conta da direita: a fita das unidades continua a mesma
          // quando o número ganha uma casa
          return <Fita key={`d${ordem}`} digito={Number(ch)} ordem={ordem} ativo={!reduzir} />
        })}
      </span>
    </span>
  )
}
