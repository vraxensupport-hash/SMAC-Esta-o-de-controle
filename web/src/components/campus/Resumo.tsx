import { motion, useReducedMotion } from 'motion/react'
import { Leaf, ShieldCheck, ThermometerSun, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Sala } from '../../lib/api'
import type { Totais } from '../../hooks/useCampus'
import { Odometro } from '../fx/Odometro'
import { NumeroAnimado } from '../fx/NumeroAnimado'
import { BorderBeam } from '../fx/BorderBeam'
import { Moldura } from '../ui/Moldura'
import { MapaCampus } from './MapaCampus'
import { PorBloco } from './PorBloco'
import { cn, graus } from '../../lib/formato'
import { SAIDA } from '../../lib/movimento'

function Legenda() {
  const itens = [
    { cor: 'bg-energia-vivo', texto: 'Ligado' },
    { cor: 'bg-white/25', texto: 'Desligado' },
    { cor: 'bg-[#D9A043]', texto: 'Automático' },
    { cor: 'bg-[#EC6A53]', texto: 'Acima do limite' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legenda dos estados">
      {itens.map(i => (
        <li key={i.texto} className="flex items-center gap-1.5 text-[11.5px] text-white/55">
          <span className={cn('h-2 w-2 rounded-[2px]', i.cor)} aria-hidden />
          {i.texto}
        </li>
      ))}
    </ul>
  )
}

/** Bloquinho cinza do StatsBento: ícone em círculo, número e legenda. */
function Ficha({ icone: Icone, rotulo, valor, legenda, tom }: { icone: LucideIcon; rotulo: string; valor: number; legenda: string; tom: 'tinta' | 'auto' }) {
  return (
    <div className="flex items-center gap-4 rounded-[26px] border border-linha bg-nevoa/80 p-5">
      <span className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-superficie shadow-[0_1px_3px_rgb(17_25_23/0.1)]',
        tom === 'auto' ? 'text-auto' : 'text-tinta'
      )}>
        <Icone size={19} strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[30px] font-semibold leading-none tracking-tighter text-tinta">
          <NumeroAnimado valor={valor} />
        </p>
        <p className="mt-1 truncate text-[12px] font-semibold text-tinta-2">{rotulo}</p>
        <p className="truncate text-[11.5px] text-tinta-3">{legenda}</p>
      </div>
    </div>
  )
}

export function Resumo({ salas, totais, onAbrir }: { salas: Sala[]; totais: Totais; onAbrir: (n: string, el?: HTMLElement) => void }) {
  const reduzir = useReducedMotion()
  const quentes = salas.filter(s => s.alerta).sort((a, b) => (b.temperatura ?? 0) - (a.temperatura ?? 0))
  const fracao = totais.total ? totais.ligadas / totais.total : 0
  const pct = (fracao * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduzir ? 0 : 16, scale: reduzir ? 1 : 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.55, delay: i * 0.07, ease: SAIDA },
  })

  return (
    <section aria-labelledby="tituloResumo" className="grid gap-4 lg:grid-cols-12 lg:gap-5">
      {/* --- cartão principal escuro: o campus agora --- */}
      <motion.div
        {...entrada(0)}
        className="relative isolate flex flex-col overflow-hidden rounded-[30px] bg-tinta p-6 text-white shadow-[0_30px_60px_-30px_rgb(17_25_23/0.7)] sm:p-8 lg:col-span-7"
      >
        {/* hachura do StatsBento, correndo bem devagar no canto */}
        <div aria-hidden className="hachura pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_75%_55%_at_100%_0%,#000_45%,transparent_100%)]" />
        {/* brilho verde suave atrás do número */}
        <div aria-hidden className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-energia-vivo/20 blur-[90px]" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/[0.08] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Campus agora
            </span>
            <h2 id="tituloResumo" className="sr-only">Campus agora</h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-energia-vivo/30 bg-energia-vivo/10 px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#62D9B3]">
            <span className="h-1.5 w-1.5 rounded-full bg-energia-vivo motion-safe:animate-respirar" aria-hidden />
            AO VIVO
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-end gap-x-6 gap-y-3">
          <p className="flex items-baseline font-semibold leading-none tracking-[-0.06em]">
            <Odometro value={totais.ligadas} className="text-[clamp(68px,9.5vw,112px)]" />
            <span className="ml-2 text-[clamp(24px,3vw,34px)] font-medium tracking-tight text-white/35">/ {totais.total}</span>
          </p>
          <div className="pb-2.5">
            <p className="text-[15px] font-medium">aparelhos ligados</p>
            <p className="font-mono text-[12px] text-white/50 tabular-nums">{pct}% do campus</p>
          </div>
        </div>

        <div className="mb-8 mt-6 h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${pct}% dos aparelhos ligados`}>
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-energia-vivo to-[#62D9B3]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: fracao }}
            transition={{ duration: reduzir ? 0 : 0.9, ease: SAIDA }}
          />
        </div>

        <div className="mt-8 grid gap-5 border-t border-white/10 pt-6 lg:mt-auto">
          <MapaCampus salas={salas} onAbrir={onAbrir} />
          <Legenda />
        </div>
      </motion.div>

      {/* --- coluna da direita --- */}
      <div className="grid content-start gap-4 lg:col-span-5 lg:gap-5">
        <motion.div {...entrada(1)}>
          <Moldura>
            <PorBloco salas={salas} />
          </Moldura>
        </motion.div>

        <motion.div {...entrada(2)} className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          <Ficha icone={Users} rotulo="Salas ocupadas" valor={totais.ocupadas} legenda="com presença detectada" tom="tinta" />
          <Ficha icone={Leaf} rotulo="Economia automática" valor={totais.vazias} legenda="desligadas por sala vazia" tom="auto" />
        </motion.div>

        <motion.div
          {...entrada(3)}
          className={cn(
            'relative overflow-hidden rounded-[26px] border p-5 transition-colors duration-500',
            quentes.length ? 'border-alerta-borda bg-gradient-to-br from-alerta-suave to-superficie' : 'border-energia-borda/70 bg-energia-suave/50'
          )}
        >
          {quentes.length > 0 && <BorderBeam />}
          <div className="flex items-center gap-4">
            <span className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-superficie shadow-[0_1px_3px_rgb(17_25_23/0.1)]',
              quentes.length ? 'text-alerta' : 'text-energia'
            )}>
              {quentes.length ? <ThermometerSun size={19} aria-hidden /> : <ShieldCheck size={19} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('text-[14px] font-semibold', quentes.length ? 'text-alerta' : 'text-energia')}>
                {quentes.length ? <><NumeroAnimado valor={quentes.length} /> {quentes.length === 1 ? 'sala acima do limite' : 'salas acima do limite'}</> : 'Temperatura sob controle'}
              </p>
              <p className="text-[12px] text-tinta-3">
                {quentes.length ? 'Toque na sala para verificar o ar' : 'Nenhuma sala acima do limite agora'}
              </p>
            </div>
          </div>
          {quentes.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Salas acima do limite">
              {quentes.map((s, i) => (
                <motion.li
                  key={s.numero}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.3 + i * 0.04, ease: SAIDA }}
                >
                  <button
                    type="button"
                    onClick={ev => onAbrir(s.numero, ev.currentTarget)}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-alerta-borda bg-superficie pl-3 pr-3.5 text-[12.5px] transition-[transform,background-color] duration-150 ease-saida hover:bg-alerta-suave active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-alerta"
                  >
                    <span className="font-mono font-semibold text-tinta">Sala {s.numero}</span>
                    <span className="font-mono text-alerta tabular-nums">{s.temperatura !== null && graus(s.temperatura)}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </section>
  )
}
