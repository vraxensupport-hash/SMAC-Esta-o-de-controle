// Contrato da API (api.py). Os tipos espelham exatamente o que o backend
// devolve — o front não inventa nem renomeia campo nenhum.

export type Sala = {
  numero: string
  bloco: string
  equipamento: string
  ligado: boolean
  motivo: string | null
  mudou_em: string | null
  hora_ligar: string | null
  hora_desligar: string | null
  pessoas: number | null
  ultima_verificacao: string | null
  proxima_verificacao: string | null
  ausencias: number
  temperatura: number | null
  desligado_por_sala_vazia: boolean
  dispositivo_online: boolean
  camera_online: boolean
  alerta: boolean
}

export type Evento = {
  id: number
  sala: string
  tipo: string
  mensagem: string
  momento: string
}

export type Leitura = {
  id: number
  sala: string
  temperatura: number
  umidade: number
  momento: string
}

export async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const resposta = await fetch(caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  const dados = await resposta.json()
  if (!resposta.ok) {
    const d = dados?.detail
    throw new Error(typeof d === 'string' ? d : 'Dados inválidos. Confira os campos.')
  }
  return dados as T
}

export const api = {
  salas: () => chamar<{ limite_temperatura: number; salas: Sala[] }>('GET', '/api/salas'),
  eventos: (limite: number, sala?: string) =>
    chamar<{ eventos: Evento[] }>('GET', `/api/eventos?limite=${limite}${sala ? `&sala=${sala}` : ''}`),
  leituras: (sala: string, limite = 30) =>
    chamar<{ sala: string; leituras: Leitura[] }>('GET', `/api/leituras?limite=${limite}&sala=${sala}`),
  energia: (sala: string, ligado: boolean) => chamar<Sala>('POST', `/api/salas/${sala}/energia`, { ligado }),
  agenda: (sala: string, hora_ligar: string | null, hora_desligar: string | null) =>
    chamar<Sala>('PUT', `/api/salas/${sala}/agenda`, { hora_ligar, hora_desligar }),
  equipamento: (sala: string, equipamento: string) =>
    chamar<Sala>('PUT', `/api/salas/${sala}/equipamento`, { equipamento }),
}
