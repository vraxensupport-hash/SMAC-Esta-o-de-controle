import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Eye, Inbox, Leaf, Power, PowerOff } from 'lucide-react'
import type { Evento } from '../../lib/api'
import { cn, quando } from '../../lib/formato'
import { SAIDA } from '../../lib/movimento'

const TIPO: Record<string, { icone: typeof Power; nome: string; cor: string }> = {
  LIGADO: { icone: Power, nome: 'Ligado', cor: 'bg-energia-suave text-energia ring-energia-borda' },
  DESLIGADO: { icone: PowerOff, nome: 'Desligado', cor: 'bg-nevoa text-tinta-3 ring-linha' },
  DESLIGADO_AUTO: { icone: Leaf, nome: 'Automático', cor: 'bg-auto-suave text-auto ring-auto-borda' },
  VAZIA: { icone: Eye, nome: 'Sala vazia', cor: 'bg-auto-suave/60 text-auto ring-auto-borda' },
}

const tipoDe = (t: string) => TIPO[t] ?? { icone: Eye, nome: t, cor: 'bg-nevoa text-tinta-3 ring-linha' }

/** Lista de eventos: o registro geral do campus ou o histórico de uma sala. */
export function ListaEventos({
  eventos, mostrarSala, onSala, vazio,
}: {
  eventos: Evento[]
  mostrarSala?: boolean
  onSala?: (n: string, el: HTMLElement) => void
  vazio: string
}) {
  const reduzir = useReducedMotion()

  if (!eventos.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-linha-forte px-4 py-8 text-center">
        <Inbox size={20} className="text-tinta-4" aria-hidden />
        <p className="max-w-[28ch] text-[13px] text-tinta-3">{vazio}</p>
      </div>
    )
  }

  return (
    <ol className="relative grid">
      <AnimatePresence initial={false}>
        {eventos.map(e => {
          const t = tipoDe(e.tipo)
          const Icone = t.icone
          return (
            <motion.li
              key={e.id}
              layout={reduzir ? false : 'position'}
              initial={{ opacity: 0, y: reduzir ? 0 : -10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: SAIDA }}
              className="relative grid grid-cols-[auto_1fr] gap-3 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-linha"
            >
              <span className={cn('mt-0.5 grid h-7 w-7 place-items-center rounded-lg ring-1 ring-inset', t.cor)} title={t.nome}>
                <Icone size={14} strokeWidth={2.2} aria-hidden />
                <span className="sr-only">{t.nome}</span>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <time dateTime={e.momento} className="font-mono text-[11.5px] text-tinta-3 tabular-nums">{quando(e.momento)}</time>
                  {mostrarSala && (
                    onSala ? (
                      <button
                        type="button"
                        onClick={ev => onSala(e.sala, ev.currentTarget)}
                        className="rounded-md bg-nevoa px-1.5 py-0.5 font-mono text-[11px] font-semibold text-tinta transition-colors duration-150 hover:bg-tinta hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-energia"
                      >
                        Sala {e.sala}
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] font-semibold text-tinta">Sala {e.sala}</span>
                    )
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-snug text-tinta-2">{e.mensagem}</p>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}

export function Registro({ eventos, onSala }: { eventos: Evento[]; onSala: (n: string, el: HTMLElement) => void }) {
  return (
    <section aria-labelledby="tituloRegistro" className="rounded-[28px] border border-linha bg-superficie p-5 shadow-difusa sm:p-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 id="tituloRegistro" className="text-[15px] font-semibold tracking-tight text-tinta">Registro operacional</h2>
          <p className="mt-0.5 text-[12.5px] text-tinta-3">O que o sistema fez por último</p>
        </div>
        <span className="rounded-full bg-nevoa px-2 py-0.5 font-mono text-[11.5px] font-medium text-tinta-3 tabular-nums" aria-label={`${eventos.length} eventos`}>
          {String(eventos.length).padStart(2, '0')}
        </span>
      </div>
      <div aria-live="polite" aria-relevant="additions">
        <ListaEventos
          eventos={eventos}
          mostrarSala
          onSala={onSala}
          vazio="Nenhum evento ainda. Ligue uma sala ou programe um horário e o registro começa aqui."
        />
      </div>
    </section>
  )
}
