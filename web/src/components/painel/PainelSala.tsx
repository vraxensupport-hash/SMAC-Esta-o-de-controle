import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react'
import { AlertCircle, ArrowRight, Camera, Check, Clock, Cpu, Leaf, Power, PowerOff, Users, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api, type Evento, type Leitura, type Sala } from '../../lib/api'
import { agoraTexto, cn, quando } from '../../lib/formato'
import { GAVETA, SAIDA } from '../../lib/movimento'
import { useMidia } from '../../hooks/useMidia'
import { Moldura } from '../ui/Moldura'
import { Botao, campoClasse } from '../ui/Botao'
import { GraficoTemperatura } from './GraficoTemperatura'
import { FaixaAgenda } from './FaixaAgenda'
import { ListaEventos } from '../eventos/Registro'

type Acao = 'energia' | 'agenda' | 'limpar' | 'equipamento'

/** Linha da lista de situação: ícone em círculo, rótulo e valor. */
function Linha({ icone: Icone, rotulo, children, ok }: { icone: LucideIcon; rotulo: string; children: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nevoa text-tinta-3">
        <Icone size={15} strokeWidth={2} aria-hidden />
      </span>
      <dt className="flex-1 text-[13px] text-tinta-3">{rotulo}</dt>
      <dd className="flex items-center gap-1.5 text-right text-[13.5px] font-medium text-tinta">
        {ok !== undefined && <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-energia-vivo' : 'bg-tinta-4')} aria-hidden />}
        {children}
      </dd>
    </div>
  )
}

function Secao({ titulo, children, extra }: { titulo: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-tinta-3">{titulo}</h3>
        {extra}
      </div>
      {children}
    </section>
  )
}

export function PainelSala({
  sala, limite, sinal, onFechar, onAtualizar,
}: {
  sala: Sala
  limite: number
  /** muda a cada atualização do campus: o painel busca histórico de novo */
  sinal: number
  onFechar: () => void
  onAtualizar: () => Promise<void>
}) {
  const larga = useMidia('(min-width: 768px)')
  const reduzir = useReducedMotion()
  const arrasto = useDragControls()
  const painel = useRef<HTMLDivElement>(null)
  const fechar = useRef<HTMLButtonElement>(null)

  // os campos só são preenchidos ao abrir, para a atualização automática
  // não apagar o que a pessoa está digitando
  const [horaLigar, setHoraLigar] = useState(sala.hora_ligar ?? '')
  const [horaDesligar, setHoraDesligar] = useState(sala.hora_desligar ?? '')
  const [equipamento, setEquipamento] = useState(sala.equipamento)
  const [ocupado, setOcupado] = useState<Acao | null>(null)
  const [retorno, setRetorno] = useState<{ texto: string; erro?: boolean; n: number } | null>(null)
  const [historico, setHistorico] = useState<Evento[] | null>(null)
  const [leituras, setLeituras] = useState<Leitura[] | null>(null)

  useEffect(() => {
    let vivo = true
    Promise.all([api.eventos(6, sala.numero), api.leituras(sala.numero, 30)])
      .then(([h, l]) => {
        if (!vivo) return
        setHistorico(h.eventos)
        setLeituras(l.leituras)
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [sala.numero, sinal])

  // foco preso no painel, Escape fecha, fundo não rola
  useEffect(() => {
    fechar.current?.focus()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onFechar(); return }
      if (e.key !== 'Tab' || !painel.current) return
      const focaveis = painel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])')
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
    }
    document.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', tecla)
    }
  }, [onFechar])

  // o recado de sucesso some sozinho; o de erro fica até a próxima ação
  useEffect(() => {
    if (!retorno || retorno.erro) return
    const id = window.setTimeout(() => setRetorno(null), 3500)
    return () => window.clearTimeout(id)
  }, [retorno])

  async function executar(acao: Acao, funcao: () => Promise<unknown>, sucesso: string) {
    setOcupado(acao)
    try {
      await funcao()
      setRetorno({ texto: sucesso, n: Date.now() })
      await onAtualizar()
    } catch (e) {
      setRetorno({ texto: e instanceof Error ? e.message : 'Não foi possível concluir. Tente de novo.', erro: true, n: Date.now() })
    } finally {
      setOcupado(null)
    }
  }

  const ligar = !sala.ligado
  const proxima = !sala.ligado
    ? 'Só com o ar ligado'
    : !sala.proxima_verificacao || sala.proxima_verificacao <= agoraTexto()
      ? 'Aguardando a câmera'
      : quando(sala.proxima_verificacao)
  const estado = sala.ligado ? 'ligado' : sala.desligado_por_sala_vazia ? 'auto' : 'desligado'
  const fora = larga ? { x: '100%' } : { y: '100%' }

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:items-stretch" role="presentation">
      <motion.div
        className="absolute inset-0 bg-tinta/25 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        onClick={onFechar}
        aria-hidden
      />

      <motion.div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="painelTitulo"
        className={cn(
          'relative flex w-full flex-col bg-papel shadow-elevada',
          'max-md:mt-auto max-md:max-h-[92dvh] max-md:rounded-t-[30px]',
          'md:h-full md:max-w-[500px] md:border-l md:border-linha'
        )}
        initial={reduzir ? { opacity: 0 } : fora}
        animate={reduzir ? { opacity: 1 } : { x: 0, y: 0 }}
        exit={reduzir ? { opacity: 0 } : { ...fora, transition: { duration: 0.25, ease: GAVETA } }}
        transition={{ duration: 0.45, ease: GAVETA }}
        drag={larga ? false : 'y'}
        dragControls={arrasto}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          // um puxão rápido basta; não precisa arrastar até o fim
          if (info.offset.y > 120 || info.velocity.y > 500) onFechar()
        }}
      >
        <div className="flex touch-none justify-center pb-1 pt-3 md:hidden" onPointerDown={e => arrasto.start(e)} aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-linha-forte" />
        </div>

        <header className="flex items-start justify-between gap-4 px-5 pb-5 pt-2 sm:px-6 md:pt-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-tinta-3">Bloco {sala.bloco}</p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={estado}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2, ease: SAIDA }}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                    estado === 'ligado' ? 'bg-energia-suave text-energia' : estado === 'auto' ? 'bg-auto-suave text-auto' : 'bg-nevoa text-tinta-3'
                  )}
                >
                  {estado === 'ligado' && <span className="h-1.5 w-1.5 rounded-full bg-energia-vivo motion-safe:animate-respirar" aria-hidden />}
                  {estado === 'ligado' ? 'Ligado' : estado === 'auto' ? 'Desligado · vazia' : 'Desligado'}
                </motion.span>
              </AnimatePresence>
            </div>
            <h2 id="painelTitulo" className="mt-1.5 text-[30px] font-semibold leading-none tracking-tight text-tinta">
              Sala <span className="font-mono">{sala.numero}</span>
            </h2>
            <p className="mt-1.5 truncate text-[13px] text-tinta-3">{sala.equipamento}</p>
          </div>
          <button
            ref={fechar}
            type="button"
            onClick={onFechar}
            aria-label="Fechar painel"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-linha bg-superficie text-tinta-2 transition-[transform,background-color] duration-150 ease-saida hover:bg-nevoa active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-energia"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        {/* flex + shrink-0: num grid de altura fixa, filhos com overflow-hidden
            encolhiam até sumir */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 pb-10 sm:px-6 [&>*]:shrink-0">
          {/* --- energia: a ação dominante --- */}
          <Moldura interno={cn(
            'p-4 transition-colors duration-500',
            sala.ligado ? 'bg-gradient-to-br from-energia-suave via-superficie to-superficie'
              : sala.desligado_por_sala_vazia ? 'bg-gradient-to-br from-auto-suave via-superficie to-superficie' : ''
          )}>
            <div className="flex items-center gap-3">
              <span className={cn(
                'relative grid h-12 w-12 place-items-center rounded-2xl transition-colors duration-500',
                sala.ligado ? 'bg-energia text-white' : sala.desligado_por_sala_vazia ? 'bg-auto text-white' : 'bg-nevoa text-tinta-3'
              )}>
                {sala.ligado && <span className="absolute inset-0 rounded-2xl bg-energia-vivo motion-safe:animate-onda" aria-hidden />}
                <span className="relative">
                  {sala.ligado ? <Power size={21} aria-hidden /> : sala.desligado_por_sala_vazia ? <Leaf size={21} aria-hidden /> : <PowerOff size={21} aria-hidden />}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-tinta">{sala.ligado ? 'Ar ligado' : 'Ar desligado'}</p>
                <p className="truncate text-[12px] text-tinta-3">{sala.motivo ? `${sala.motivo.replace(/\.$/, '')} · ${quando(sala.mudou_em)}` : 'Ainda não foi ligado pelo sistema.'}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={ocupado === 'energia'}
              onClick={() => executar('energia', () => api.energia(sala.numero, ligar), ligar ? 'Comando de ligar enviado.' : 'Comando de desligar enviado.')}
              className={cn(
                'relative mt-4 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[14.5px] font-semibold text-white',
                'transition-[transform,background-color] duration-150 ease-saida active:scale-[0.98] disabled:cursor-wait',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-energia',
                ligar ? 'bg-energia shadow-[0_10px_24px_-12px_rgb(11_127_95/0.8)] hover:bg-energia-vivo' : 'bg-tinta shadow-[0_10px_24px_-12px_rgb(17_25_23/0.7)] hover:bg-tinta-2'
              )}
            >
              {ocupado === 'energia' && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-brilho" aria-hidden />}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={ocupado === 'energia' ? 'enviando' : ligar ? 'ligar' : 'desligar'}
                  initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
                  transition={{ duration: 0.2, ease: SAIDA }}
                  className="inline-flex items-center gap-2"
                >
                  {ocupado === 'energia' ? 'Enviando comando…' : ligar ? <><Power size={17} aria-hidden /> Ligar o ar</> : <><PowerOff size={17} aria-hidden /> Desligar o ar</>}
                </motion.span>
              </AnimatePresence>
            </button>

            <div aria-live="polite">
              <AnimatePresence>
                {retorno && (
                  <motion.p
                    key={retorno.n}
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: SAIDA }}
                    className={cn('flex items-center gap-2 overflow-hidden text-[13px] font-medium', retorno.erro ? 'text-alerta' : 'text-energia')}
                  >
                    {retorno.erro ? <AlertCircle size={15} aria-hidden /> : <Check size={15} aria-hidden />}
                    {retorno.texto}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Moldura>

          {/* --- temperatura --- */}
          {leituras === null
            ? <div className="esqueleto h-[260px] rounded-[30px]" aria-label="Carregando leituras" />
            : <Moldura><GraficoTemperatura leituras={leituras} limite={limite} atual={sala.temperatura} /></Moldura>}

          {/* --- situação --- */}
          <Secao titulo="Situação">
            <dl className="divide-y divide-linha overflow-hidden rounded-[22px] border border-linha bg-superficie">
              <Linha icone={Users} rotulo="Pessoas na sala">
                {sala.pessoas === null ? <span className="text-tinta-3">Não verificada</span>
                  : <>{sala.pessoas === 0 ? 'Ninguém' : sala.pessoas}<span className="font-mono text-[11.5px] font-normal text-tinta-3"> · {quando(sala.ultima_verificacao)}</span></>}
              </Linha>
              <Linha icone={Clock} rotulo="Próxima verificação">{proxima}</Linha>
              <Linha icone={Cpu} rotulo="ESP32" ok={sala.dispositivo_online}>{sala.dispositivo_online ? 'Online' : 'Offline'}</Linha>
              <Linha icone={Camera} rotulo="Câmera" ok={sala.camera_online}>{sala.camera_online ? 'Online' : 'Offline'}</Linha>
            </dl>
          </Secao>

          {/* --- horário --- */}
          <Secao titulo="Horário programado" extra={<span className="text-[11.5px] text-tinta-3">todos os dias</span>}>
            <form
              className="grid gap-4 rounded-[22px] border border-linha bg-superficie p-4"
              onSubmit={e => {
                e.preventDefault()
                executar('agenda', () => api.agenda(sala.numero, horaLigar || null, horaDesligar || null), 'Horário salvo.')
              }}
            >
              <FaixaAgenda ligar={horaLigar} desligar={horaDesligar} />
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                <label className="grid gap-1.5 text-[12px] font-medium text-tinta-3">
                  Ligar às
                  <input type="time" value={horaLigar} onChange={e => setHoraLigar(e.target.value)} className={cn(campoClasse, 'font-mono')} />
                </label>
                <ArrowRight size={16} className="mb-3.5 text-tinta-4" aria-hidden />
                <label className="grid gap-1.5 text-[12px] font-medium text-tinta-3">
                  Desligar às
                  <input type="time" value={horaDesligar} onChange={e => setHoraDesligar(e.target.value)} className={cn(campoClasse, 'font-mono')} />
                </label>
              </div>
              <div className="flex gap-2">
                <Botao type="submit" ocupado={ocupado === 'agenda'} className="flex-1">
                  {ocupado === 'agenda' ? 'Salvando…' : 'Salvar horário'}
                </Botao>
                <Botao
                  variante="discreto"
                  ocupado={ocupado === 'limpar'}
                  onClick={() => {
                    setHoraLigar('')
                    setHoraDesligar('')
                    executar('limpar', () => api.agenda(sala.numero, null, null), 'Horário removido.')
                  }}
                >
                  Limpar
                </Botao>
              </div>
            </form>
          </Secao>

          {/* --- equipamento --- */}
          <Secao titulo="Equipamento">
            <form
              className="flex gap-2"
              onSubmit={e => {
                e.preventDefault()
                executar('equipamento', () => api.equipamento(sala.numero, equipamento), 'Equipamento salvo.')
              }}
            >
              <label className="sr-only" htmlFor="campoEquipamento">Nome ou modelo do equipamento</label>
              <input
                id="campoEquipamento"
                type="text"
                maxLength={60}
                value={equipamento}
                onChange={e => setEquipamento(e.target.value)}
                placeholder="Nome / modelo"
                className={campoClasse}
              />
              <Botao type="submit" ocupado={ocupado === 'equipamento'}>
                {ocupado === 'equipamento' ? 'Salvando…' : 'Salvar'}
              </Botao>
            </form>
          </Secao>

          {/* --- histórico --- */}
          <Secao titulo="Histórico da sala">
            {historico === null ? (
              <div className="grid gap-2" aria-label="Carregando histórico">
                {[0, 1, 2].map(i => <div key={i} className="esqueleto h-12 rounded-xl" />)}
              </div>
            ) : historico.length ? (
              <div className="rounded-[22px] border border-linha bg-superficie px-4">
                <ListaEventos eventos={historico} vazio="" />
              </div>
            ) : (
              <ListaEventos eventos={[]} vazio="Nenhum registro para esta sala ainda. Ligue o ar ou salve um horário e ele aparece aqui." />
            )}
          </Secao>
        </div>
      </motion.div>
    </div>
  )
}
