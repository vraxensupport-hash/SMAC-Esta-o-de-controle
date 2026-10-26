import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CalendarClock, LayoutGrid, Leaf, Power, Search, ThermometerSun, X } from 'lucide-react'
import type { Sala } from '../../lib/api'
import { agendada, cn } from '../../lib/formato'
import { SAIDA } from '../../lib/movimento'
import { AbasAnimadas } from '../ui/AbasAnimadas'
import { SalaCartao } from './SalaCartao'

type Filtro = 'todas' | 'ligadas' | 'alerta' | 'auto' | 'agendadas'

const PASSA: Record<Filtro, (s: Sala) => boolean> = {
  todas: () => true,
  ligadas: s => s.ligado,
  alerta: s => s.alerta,
  auto: s => s.desligado_por_sala_vazia,
  agendadas: agendada,
}

export function Malha({ salas, onAbrir }: { salas: Sala[]; onAbrir: (n: string, el: HTMLElement) => void }) {
  const reduzir = useReducedMotion()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busca, setBusca] = useState('')
  const campo = useRef<HTMLInputElement>(null)

  // "/" leva para a busca, como em qualquer ferramenta de operação
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(alvo.tagName) && !document.querySelector('[role="dialog"]')) {
        e.preventDefault()
        campo.current?.focus()
      }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [])

  const blocos = useMemo(() => {
    const m = new Map<string, Sala[]>()
    salas.forEach(s => m.set(s.bloco, [...(m.get(s.bloco) ?? []), s]))
    return [...m.entries()]
  }, [salas])

  const contagem = (f: Filtro) => salas.filter(PASSA[f]).length
  const termo = busca.trim()
  const casa = (s: Sala) => PASSA[filtro](s) && (!termo || s.numero.startsWith(termo))
  const achadas = salas.filter(casa)
  const exata = termo.length === 3 ? salas.find(s => s.numero === termo) : undefined

  // achou a sala exata: rola até ela
  useEffect(() => {
    if (!exata) return
    document.querySelector(`[data-sala="${exata.numero}"]`)?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' })
  }, [exata, reduzir])

  function enviarBusca(e: React.FormEvent) {
    e.preventDefault()
    const alvo = exata ?? (achadas.length === 1 ? achadas[0] : undefined)
    const el = alvo && document.querySelector<HTMLElement>(`[data-sala="${alvo.numero}"]`)
    if (alvo && el) onAbrir(alvo.numero, el)
  }

  return (
    <section aria-labelledby="tituloMalha" className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="tituloMalha" className="text-[20px] font-semibold tracking-tight text-tinta">Malha de salas</h2>
          <p className="mt-0.5 text-[13px] text-tinta-3">Toque em uma sala para abrir o controle</p>
        </div>

        <form role="search" onSubmit={enviarBusca} className="relative w-full sm:w-64">
          <label htmlFor="busca" className="sr-only">Buscar sala pelo número</label>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-4" aria-hidden />
          <input
            ref={campo}
            id="busca"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Buscar sala…"
            value={busca}
            onChange={e => setBusca(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={e => { if (e.key === 'Escape') setBusca('') }}
            className="h-11 w-full rounded-full border border-linha bg-superficie pl-10 pr-12 font-mono text-[14px] text-tinta shadow-[0_1px_2px_rgb(17_25_23/0.04)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:font-sans placeholder:text-tinta-4 focus:border-tinta-3 focus:ring-4 focus:ring-tinta/5"
          />
          {busca ? (
            <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-tinta-3 transition-colors hover:bg-nevoa hover:text-tinta">
              <X size={15} aria-hidden />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-linha bg-nevoa px-1.5 font-mono text-[11px] text-tinta-3 sm:block">/</kbd>
          )}
        </form>
      </div>

      <div className="mt-5">
        <AbasAnimadas<Filtro>
          rotulo="Filtrar salas"
          ativa={filtro}
          onTroca={setFiltro}
          abas={[
            { key: 'todas', label: 'Todas', icon: LayoutGrid, contagem: salas.length },
            { key: 'ligadas', label: 'Ligadas', icon: Power, contagem: contagem('ligadas') },
            { key: 'alerta', label: 'Alerta', icon: ThermometerSun, contagem: contagem('alerta') },
            { key: 'auto', label: 'Automático', icon: Leaf, contagem: contagem('auto') },
            { key: 'agendadas', label: 'Agendadas', icon: CalendarClock, contagem: contagem('agendadas') },
          ]}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {filtro === 'todas' && !termo ? '' : `${achadas.length} ${achadas.length === 1 ? 'sala encontrada' : 'salas encontradas'}`}
      </p>

      {(filtro !== 'todas' || termo) && achadas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: SAIDA }}
          className="mt-5 rounded-2xl border border-dashed border-linha-forte bg-nevoa/50 px-6 py-8 text-center"
        >
          <p className="text-[14px] font-medium text-tinta">Nenhuma sala nesse filtro agora</p>
          <p className="mt-1 text-[13px] text-tinta-3">
            {termo ? `Nenhuma sala começa com “${termo}”. Os números vão de 101 a 620.` : 'Quando alguma sala entrar nesse estado, ela aparece destacada aqui.'}
          </p>
        </motion.div>
      )}

      <div className="mt-6 grid gap-8">
        {blocos.map(([bloco, doBloco]) => {
          const ligadas = doBloco.filter(s => s.ligado).length
          const nenhuma = !doBloco.some(casa)
          return (
            <section key={bloco} aria-labelledby={`bloco-${bloco}`} className={cn('transition-opacity duration-300', nenhuma && 'opacity-60')}>
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-tinta font-mono text-[13px] font-semibold text-white">{bloco}</span>
                <h3 id={`bloco-${bloco}`} className="text-[14px] font-semibold text-tinta">Bloco {bloco}</h3>
                <span className="font-mono text-[11.5px] text-tinta-3 tabular-nums">
                  {doBloco[0].numero}–{doBloco[doBloco.length - 1].numero}
                </span>
                <span className="h-px flex-1 bg-linha" aria-hidden />
                <span className="flex items-center gap-2 font-mono text-[11.5px] text-tinta-3 tabular-nums">
                  <span className="relative h-1 w-14 overflow-hidden rounded-full bg-nevoa" aria-hidden>
                    <span
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-energia-vivo transition-transform duration-700 ease-saida"
                      style={{ transform: `scaleX(${ligadas / doBloco.length})` }}
                    />
                  </span>
                  {ligadas}/{doBloco.length} ligadas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
                {doBloco.map((s, i) => (
                  <SalaCartao
                    key={s.numero}
                    sala={s}
                    indice={i}
                    apagada={!casa(s)}
                    destacada={exata?.numero === s.numero}
                    onAbrir={onAbrir}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
