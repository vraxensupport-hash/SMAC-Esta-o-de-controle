import { motion } from 'motion/react'
import { RefreshCw, ServerCrash } from 'lucide-react'
import { SAIDA } from '../../lib/movimento'

/** Carregamento inicial: esqueletos no formato da tela, sem spinner. */
export function Esqueleto() {
  return (
    <div className="grid gap-5" aria-label="Carregando dados do campus">
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="esqueleto h-[460px] rounded-[30px] lg:col-span-7" />
        <div className="grid content-start gap-5 lg:col-span-5">
          <div className="esqueleto h-[230px] rounded-[30px]" />
          <div className="grid grid-cols-2 gap-5">
            <div className="esqueleto h-[96px] rounded-[26px]" />
            <div className="esqueleto h-[96px] rounded-[26px]" />
          </div>
          <div className="esqueleto h-[96px] rounded-[26px]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => <div key={i} className="esqueleto h-[92px] rounded-2xl" />)}
      </div>
    </div>
  )
}

/** Faixa de API fora do ar: explica o que fazer e mantém os dados antigos. */
export function SemConexao({ onTentar, primeiraVez }: { onTentar: () => void; primeiraVez: boolean }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.3, ease: SAIDA }}
      className="overflow-hidden"
    >
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-alerta-borda bg-alerta-suave px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ServerCrash size={18} className="mt-0.5 shrink-0 text-alerta" aria-hidden />
          <div>
            <p className="text-[13.5px] font-semibold text-alerta">Sem conexão com a API</p>
            <p className="text-[12.5px] text-tinta-2">
              {primeiraVez ? 'Nenhum dado recebido ainda.' : 'Os dados abaixo são da última sincronização.'} Confira se o servidor está rodando:{' '}
              <code className="rounded bg-white/70 px-1 font-mono text-[12px]">uvicorn api:app --reload</code>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTentar}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-superficie px-3.5 text-[13px] font-semibold text-tinta ring-1 ring-inset ring-alerta-borda transition-transform duration-150 ease-saida active:scale-[0.97]"
        >
          <RefreshCw size={14} aria-hidden /> Tentar agora
        </button>
      </div>
    </motion.div>
  )
}
