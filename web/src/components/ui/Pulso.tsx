import { cn } from '../../lib/formato'

/** Ponto de status que respira, com uma onda saindo — "ao vivo". */
export function Pulso({ tom = 'energia', parado = false, className }: { tom?: 'energia' | 'alerta' | 'auto' | 'neutro'; parado?: boolean; className?: string }) {
  const cor = { energia: 'bg-energia-vivo', alerta: 'bg-alerta', auto: 'bg-auto', neutro: 'bg-tinta-4' }[tom]
  return (
    <span className={cn('relative inline-flex h-2 w-2 shrink-0', className)} aria-hidden>
      {!parado && <span className={cn('absolute inset-0 rounded-full motion-safe:animate-onda', cor)} />}
      <span className={cn('relative h-2 w-2 rounded-full', cor)} />
    </span>
  )
}
