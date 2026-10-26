import { AnimatePresence, motion } from 'motion/react'
import { Marca } from '../ui/Marca'
import { Pulso } from '../ui/Pulso'
import type { Conexao } from '../../hooks/useCampus'
import { SAIDA } from '../../lib/movimento'
import { cn } from '../../lib/formato'
import { useRelogio } from '../../hooks/useRelogio'

export function Topo({ conexao, total, ultimaSync }: { conexao: Conexao; total: number; ultimaSync: Date | null }) {
  const agora = useRelogio()
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const segundos = String(agora.getSeconds()).padStart(2, '0')
  const atraso = ultimaSync ? Math.max(0, Math.round((agora.getTime() - ultimaSync.getTime()) / 1000)) : null

  const status = {
    carregando: { titulo: 'Conectando', detalhe: 'Carregando telemetria…', tom: 'neutro' as const },
    ok: { titulo: 'Sistema operacional', detalhe: `${total} salas · sincronizado ${atraso !== null && atraso <= 1 ? 'agora' : `há ${atraso}s`}`, tom: 'energia' as const },
    erro: { titulo: 'Conexão interrompida', detalhe: total ? 'Mostrando os últimos dados recebidos' : 'Nenhum dado recebido ainda', tom: 'alerta' as const },
  }[conexao]

  return (
    <header className="sticky top-0 z-30 border-b border-linha/80 bg-papel/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Marca />

        <div className="flex items-center gap-3 sm:gap-5">
          <div
            role="status"
            className={cn(
              'flex items-center gap-2.5 rounded-full border py-1.5 pl-3 pr-3.5 transition-colors duration-300',
              conexao === 'erro' ? 'border-alerta-borda bg-alerta-suave' : 'border-linha bg-superficie'
            )}
          >
            <Pulso tom={status.tom} parado={conexao === 'carregando'} />
            <span className="relative grid leading-tight">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong
                  key={status.titulo}
                  initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22, ease: SAIDA }}
                  className={cn('text-[13px] font-semibold', conexao === 'erro' ? 'text-alerta' : 'text-tinta')}
                >
                  {status.titulo}
                </motion.strong>
              </AnimatePresence>
              <small className="hidden text-[11px] text-tinta-3 sm:block">{status.detalhe}</small>
            </span>
          </div>

          <time
            dateTime={agora.toISOString()}
            aria-label={`Horário local ${hora}`}
            className="hidden items-baseline gap-1 font-mono text-[22px] font-medium tracking-tight text-tinta tabular-nums md:flex"
          >
            {hora}
            <span className="text-xs text-tinta-4">{segundos}</span>
          </time>
        </div>
      </div>
    </header>
  )
}
