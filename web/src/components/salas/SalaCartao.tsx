import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarClock, Leaf, Power, PowerOff, ThermometerSun, WifiOff } from 'lucide-react'
import type { Sala } from '../../lib/api'
import { agendada, cn, estadoDe, textoDetalhe, textoEstado, type Estado } from '../../lib/formato'
import { SAIDA } from '../../lib/movimento'

const ESTILO: Record<Estado, { caixa: string; selo: string; icone: typeof Power; nome: string }> = {
  ligada: {
    caixa: 'border-energia-borda bg-gradient-to-b from-energia-suave/70 to-superficie',
    selo: 'bg-energia text-white',
    icone: Power,
    nome: 'Ligada',
  },
  alerta: {
    caixa: 'border-alerta-borda bg-gradient-to-b from-alerta-suave to-superficie',
    selo: 'bg-alerta text-white',
    icone: ThermometerSun,
    nome: 'Quente',
  },
  auto: {
    caixa: 'border-auto-borda bg-gradient-to-b from-auto-suave/80 to-superficie',
    selo: 'bg-auto-suave text-auto ring-1 ring-inset ring-auto-borda',
    icone: Leaf,
    nome: 'Auto',
  },
  desligada: {
    caixa: 'border-linha bg-superficie',
    selo: 'bg-nevoa text-tinta-4',
    icone: PowerOff,
    nome: 'Desligada',
  },
}

/** Assinatura dos campos que aparecem no cartão: só re-renderiza se mudar. */
const assinatura = (s: Sala) =>
  `${s.ligado}|${s.desligado_por_sala_vazia}|${s.alerta}|${s.temperatura}|${s.pessoas}|${s.ausencias}|${s.hora_ligar}|${s.hora_desligar}|${s.dispositivo_online}|${s.equipamento}`

export const SalaCartao = memo(
  function SalaCartao({
    sala, indice, apagada, destacada, onAbrir,
  }: {
    sala: Sala
    indice: number
    apagada: boolean
    destacada: boolean
    onAbrir: (n: string, el: HTMLElement) => void
  }) {
    const estado = estadoDe(sala)
    const e = ESTILO[estado]
    const Icone = e.icone

    // quando o estado muda, uma onda rápida sai do cartão: a mudança fica
    // visível sem precisar de animação contínua
    const anterior = useRef(estado)
    const [onda, setOnda] = useState(0)
    useEffect(() => {
      if (anterior.current !== estado) setOnda(o => o + 1)
      anterior.current = estado
    }, [estado])

    const semSinal = sala.ligado && !sala.dispositivo_online
    const detalhe = textoDetalhe(sala)
    const extra = sala.ligado && sala.ausencias > 0 ? 'Conferindo presença' : sala.desligado_por_sala_vazia ? 'Sala vazia' : sala.alerta && !sala.ligado ? 'Desligada' : ''

    return (
      <button
        type="button"
        data-sala={sala.numero}
        onClick={ev => onAbrir(sala.numero, ev.currentTarget)}
        title={sala.equipamento}
        aria-label={`Sala ${sala.numero}, ${textoEstado(sala)}${detalhe ? `, ${detalhe}` : ''}${sala.alerta ? ', acima do limite' : ''}${semSinal ? ', ESP32 offline' : ''}`}
        className={cn(
          'sala-entrada group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left',
          'transition-[transform,box-shadow,opacity,filter,border-color] duration-200 ease-saida',
          'shadow-[0_1px_2px_rgb(17_25_23/0.04)] active:scale-[0.97]',
          'hover-fino:hover:-translate-y-0.5 hover-fino:hover:shadow-difusa',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-energia',
          e.caixa,
          apagada && 'opacity-30 saturate-0',
          destacada && 'ring-2 ring-tinta ring-offset-2 ring-offset-papel'
        )}
        style={{ '--i': indice } as React.CSSProperties}
      >
        <AnimatePresence>
          {onda > 0 && (
            <motion.span
              key={onda}
              aria-hidden
              className={cn('pointer-events-none absolute inset-0 rounded-[inherit] ring-2', estado === 'alerta' ? 'ring-alerta' : estado === 'auto' ? 'ring-auto' : 'ring-energia-vivo')}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: SAIDA }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[19px] font-semibold leading-none tracking-tight text-tinta">{sala.numero}</span>
          <span className={cn('inline-flex h-6 items-center gap-1 rounded-full px-1.5 text-[10.5px] font-semibold', e.selo)}>
            <Icone size={12} strokeWidth={2.4} aria-hidden />
            <span className="hidden pr-0.5 min-[420px]:inline">{e.nome}</span>
          </span>
        </div>

        <div className="mt-3 min-w-0">
          {/* o selo já diz ligada/desligada; aqui só entra o que acrescenta */}
          {extra && <p className="truncate text-[11.5px] font-medium text-tinta-2">{extra}</p>}
          <p className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-[12px] text-tinta-2 tabular-nums">
            {sala.ligado && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-energia-vivo motion-safe:animate-respirar" aria-hidden />}
            {detalhe || <span className="font-sans text-[11.5px] text-tinta-4">Sem leitura</span>}
            <span className="ml-auto flex items-center gap-1">
              {agendada(sala) && <CalendarClock size={12} className="text-tinta-4" aria-hidden />}
              {semSinal && <WifiOff size={12} className="text-tinta-4" aria-hidden />}
            </span>
          </p>
        </div>
      </button>
    )
  },
  (a, b) =>
    assinatura(a.sala) === assinatura(b.sala) &&
    a.apagada === b.apagada &&
    a.destacada === b.destacada &&
    a.indice === b.indice &&
    a.onAbrir === b.onAbrir
)
