import { cn } from '../../lib/formato'

/**
 * Cartão de moldura dupla — a ideia do BudgetCard (analytics-bento): uma
 * casca em névoa com brilho interno e, dentro dela, o cartão branco. Dá
 * profundidade sem sombra pesada. Use nos blocos que merecem destaque.
 */
export function Moldura({
  children, className, interno, as: Tag = 'div', ...resto
}: {
  children: React.ReactNode
  className?: string
  interno?: string
  as?: 'div' | 'section'
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        'relative rounded-[30px] bg-gradient-to-b from-nevoa to-[#EBEFED] p-1.5',
        'shadow-[0_24px_48px_-24px_rgb(17_25_23/0.22),inset_0_0_0_1px_rgb(255_255_255/0.7)]',
        className
      )}
      {...resto}
    >
      {/* brilho na metade de cima da casca */}
      <div aria-hidden className="pointer-events-none absolute inset-px h-1/2 rounded-[29px] bg-gradient-to-b from-white/80 to-transparent" />
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-[24px] bg-superficie',
          'shadow-[0_1px_3px_rgb(17_25_23/0.07),0_0_0_1px_rgb(17_25_23/0.04)]',
          interno
        )}
      >
        {children}
      </div>
    </Tag>
  )
}
