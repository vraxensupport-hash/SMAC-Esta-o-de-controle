import { useCallback, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useCampus } from './hooks/useCampus'
import { Topo } from './components/layout/Topo'
import { Rodape } from './components/layout/Rodape'
import { Esqueleto, SemConexao } from './components/layout/Estados'
import { Resumo } from './components/campus/Resumo'
import { Malha } from './components/salas/Malha'
import { Registro } from './components/eventos/Registro'
import { PainelSala } from './components/painel/PainelSala'

export default function App() {
  const campus = useCampus()
  const [aberta, setAberta] = useState<string | null>(null)
  const gatilho = useRef<HTMLElement | null>(null)

  const abrir = useCallback((numero: string, el?: HTMLElement) => {
    gatilho.current = el ?? (document.activeElement as HTMLElement | null)
    setAberta(numero)
  }, [])

  const fechar = useCallback(() => {
    setAberta(null)
    // devolve o foco para o cartão (ou evento) que abriu o painel
    const el = gatilho.current
    requestAnimationFrame(() => el?.focus({ preventScroll: true }))
  }, [])

  const sala = aberta ? campus.salas.find(s => s.numero === aberta) : undefined
  const temDados = campus.salas.length > 0

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-tinta focus:px-4 focus:py-2.5 focus:text-white">
        Pular para o conteúdo
      </a>

      <Topo conexao={campus.conexao} total={campus.totais.total} ultimaSync={campus.ultimaSync} />

      <main id="conteudo" className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <AnimatePresence initial={false}>
          {campus.conexao === 'erro' && <SemConexao key="erro" onTentar={campus.atualizar} primeiraVez={!temDados} />}
        </AnimatePresence>

        {!temDados ? (
          campus.conexao === 'erro' ? null : <Esqueleto />
        ) : (
          <div className="grid gap-10">
            <Resumo salas={campus.salas} totais={campus.totais} onAbrir={abrir} />

            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Malha salas={campus.salas} onAbrir={abrir} />
              <aside className="xl:sticky xl:top-24">
                <Registro eventos={campus.eventos} onSala={abrir} />
              </aside>
            </div>
          </div>
        )}
      </main>

      <Rodape ultimaSync={campus.ultimaSync} />

      <AnimatePresence>
        {sala && (
          <PainelSala
            key={sala.numero}
            sala={sala}
            limite={campus.limite}
            sinal={campus.ultimaSync?.getTime() ?? 0}
            onFechar={fechar}
            onAtualizar={campus.atualizar}
          />
        )}
      </AnimatePresence>
    </>
  )
}
