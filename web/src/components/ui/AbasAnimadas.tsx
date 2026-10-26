// Abas com pílula que desliza até a escolhida — vinda do sistema de
// processos da Desenvolve (components/ui/abas-animadas.tsx). Mudanças: pílula
// em grafite sobre papel branco e contagem ao vivo. Setas trocam de aba.

import { useId } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { MOLA } from '../../lib/movimento'
import { cn } from '../../lib/formato'

export function AbasAnimadas<K extends string>({
  abas,
  ativa,
  onTroca,
  rotulo,
}: {
  abas: { key: K; label: string; icon?: LucideIcon; contagem?: number }[]
  ativa: K
  onTroca: (k: K) => void
  rotulo: string
}) {
  const id = useId()

  function teclado(e: React.KeyboardEvent, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const prox = (i + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length
    onTroca(abas[prox].key)
    const botoes = (e.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? []) as NodeListOf<HTMLElement>
    botoes[prox]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-full border border-linha bg-nevoa/70 p-1 [scrollbar-width:none] sm:w-fit"
    >
      {abas.map(({ key, label, icon: Icon, contagem }, i) => {
        const sel = key === ativa
        return (
          <button
            key={key}
            role="tab"
            aria-selected={sel}
            tabIndex={sel ? 0 : -1}
            onClick={() => onTroca(key)}
            onKeyDown={e => teclado(e, i)}
            className={cn(
              'relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150',
              sel ? 'text-white' : 'text-tinta-3 hover:text-tinta'
            )}
          >
            {sel && (
              <motion.span
                layoutId={`aba-${id}`}
                className="absolute inset-0 rounded-full bg-tinta shadow-[0_6px_16px_-8px_rgb(17_25_23/0.6)]"
                transition={MOLA}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {Icon && <Icon size={14} strokeWidth={2} aria-hidden />}
              {label}
              {contagem !== undefined && (
                <span className={cn('rounded-full px-1.5 font-mono text-[11px] tabular-nums', sel ? 'bg-white/15' : 'bg-white text-tinta-3')}>
                  {contagem}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
