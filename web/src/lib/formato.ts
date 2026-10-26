import type { Sala } from './api'

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** "2026-10-10T17:22:05" -> "17:22" (hoje) ou "10/10 17:22" (outro dia) */
export function quando(momento: string | null | undefined) {
  if (!momento) return '—'
  const hora = momento.slice(11, 16)
  return momento.slice(0, 10) === hojeTexto() ? hora : `${momento.slice(8, 10)}/${momento.slice(5, 7)} ${hora}`
}

function hojeTexto() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** data e hora de agora no mesmo formato de texto da API, para comparar */
export function agoraTexto() {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 19)
}

export const graus = (t: number) => `${t.toFixed(1).replace('.', ',')} °C`

/** Estado único de uma sala, na ordem de prioridade que o operador precisa ver. */
export type Estado = 'alerta' | 'ligada' | 'auto' | 'desligada'

export function estadoDe(s: Sala): Estado {
  if (s.alerta) return 'alerta'
  if (s.ligado) return 'ligada'
  if (s.desligado_por_sala_vazia) return 'auto'
  return 'desligada'
}

export function textoEstado(s: Sala) {
  if (s.ligado) return s.ausencias > 0 ? 'Ligado · conferindo' : 'Ligado'
  return s.desligado_por_sala_vazia ? 'Desligado · vazia' : 'Desligado'
}

export function textoDetalhe(s: Sala) {
  const partes: string[] = []
  if (s.temperatura !== null) partes.push(graus(s.temperatura))
  if (s.ligado && s.pessoas !== null) partes.push(s.pessoas > 0 ? `${s.pessoas} pess.` : 'ninguém')
  if (!partes.length && (s.hora_ligar || s.hora_desligar)) partes.push('agendada')
  return partes.join(' · ')
}

export const agendada = (s: Sala) => Boolean(s.hora_ligar || s.hora_desligar)
