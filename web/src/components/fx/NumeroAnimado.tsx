// Número animado — vindo do sistema de processos da Desenvolve
// (components/ui/numero-animado.tsx). Conta de 0 até o valor ao aparecer e,
// quando o valor muda, anima do antigo para o novo. Escreve direto no DOM
// (sem setState por quadro) e o leitor de tela lê só o valor final.

import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/formato'

export function NumeroAnimado({ valor, duracao = 0.9, className }: { valor: number; duracao?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduzir = useReducedMotion()
  const anterior = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const escrever = (v: number) => { el.textContent = new Intl.NumberFormat('pt-BR').format(Math.round(v)) }
    if (reduzir) { escrever(valor); anterior.current = valor; return }
    const controle = animate(anterior.current, valor, {
      duration: duracao,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: escrever,
      onComplete: () => escrever(valor),
    })
    anterior.current = valor
    return () => controle.stop()
  }, [valor, reduzir, duracao])

  return (
    <span className={cn('tabular-nums', className)}>
      {/* só o primeiro render usa este texto; depois o efeito escreve no DOM */}
      <span ref={ref} aria-hidden>{reduzir ? valor : 0}</span>
      <span className="sr-only">{valor}</span>
    </span>
  )
}
