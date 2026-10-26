// Feixe na borda — vindo do Vraxen HQ (components/fx/border-beam.tsx).
// Mudança: cor coral de alerta do SMAC. Use em UM elemento por tela: o que
// pede atenção agora (o cartão de alerta térmico, só quando há alerta).

import { motion, useReducedMotion } from 'motion/react'

export function BorderBeam({ tamanho = 80, duracao = 6, cor = '194 65 45' }: { tamanho?: number; duracao?: number; cor?: string }) {
  const reduzir = useReducedMotion()
  if (reduzir) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={{
        borderWidth: 1.5,
        borderStyle: 'solid',
        // duas camadas: uma só no miolo, outra até a borda; a exclusão deixa
        // visível apenas o anel da borda
        WebkitMask: 'linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0) border-box',
      }}
    >
      <motion.div
        className="absolute aspect-square"
        style={{
          width: tamanho,
          offsetPath: `rect(0 auto auto 0 round ${tamanho}px)`,
          background: `linear-gradient(to left, rgb(${cor}), rgb(${cor} / 0.4), transparent)`,
        }}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: duracao }}
      />
    </div>
  )
}
