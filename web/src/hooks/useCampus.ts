import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Evento, type Sala } from '../lib/api'

export type Totais = { ligadas: number; ocupadas: number; vazias: number; quentes: number; total: number }

export type Conexao = 'carregando' | 'ok' | 'erro'

const INTERVALO = 3000

function contar(salas: Sala[]): Totais {
  return {
    ligadas: salas.filter(s => s.ligado).length,
    ocupadas: salas.filter(s => s.ligado && (s.pessoas ?? 0) > 0).length,
    vazias: salas.filter(s => s.desligado_por_sala_vazia).length,
    quentes: salas.filter(s => s.alerta).length,
    total: salas.length,
  }
}

/**
 * Mesmo polling do dashboard original: /api/salas e /api/eventos a cada 3 s.
 * Se a API cair, mantém os últimos dados na tela e marca a conexão como erro.
 * Pausa com a aba escondida e atualiza na hora em que ela volta.
 */
export function useCampus() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [limite, setLimite] = useState(28)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [conexao, setConexao] = useState<Conexao>('carregando')
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null)
  const emVoo = useRef(false)

  const atualizar = useCallback(async () => {
    if (emVoo.current) return
    emVoo.current = true
    try {
      const [dados, avisos] = await Promise.all([api.salas(), api.eventos(8)])
      setSalas(dados.salas)
      setLimite(dados.limite_temperatura)
      setEventos(avisos.eventos)
      setConexao('ok')
      setUltimaSync(new Date())
    } catch {
      setConexao('erro')
    } finally {
      emVoo.current = false
    }
  }, [])

  useEffect(() => {
    atualizar()
    let id = window.setInterval(atualizar, INTERVALO)
    const aba = () => {
      window.clearInterval(id)
      if (!document.hidden) {
        atualizar()
        id = window.setInterval(atualizar, INTERVALO)
      }
    }
    document.addEventListener('visibilitychange', aba)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', aba)
    }
  }, [atualizar])

  return { salas, limite, eventos, conexao, ultimaSync, totais: contar(salas), atualizar }
}
