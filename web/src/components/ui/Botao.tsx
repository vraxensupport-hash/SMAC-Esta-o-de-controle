import { cn } from '../../lib/formato'

/** Botão do sistema: afunda ao tocar e mostra um brilho enquanto trabalha. */
export function Botao({
  children, onClick, ocupado, variante = 'neutro', className, type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  ocupado?: boolean
  variante?: 'neutro' | 'discreto'
  className?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={ocupado}
      className={cn(
        'relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-[13.5px] font-semibold',
        'transition-[transform,background-color,color] duration-150 ease-saida active:scale-[0.97] disabled:cursor-wait',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-energia',
        variante === 'neutro' ? 'bg-tinta text-white hover:bg-tinta-2' : 'border border-linha bg-superficie text-tinta-2 hover:bg-nevoa',
        className
      )}
    >
      {ocupado && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-brilho" aria-hidden />}
      {children}
    </button>
  )
}

export const campoClasse =
  'h-11 w-full rounded-xl border border-linha bg-superficie px-3 text-[14px] text-tinta outline-none transition-[border-color,box-shadow] duration-150 focus:border-tinta-3 focus:ring-4 focus:ring-tinta/5'
