// Padrão de movimento do SMAC (mesma régua do sistema de processos da
// Desenvolve): tudo que anima usa estes valores, para a tela inteira se
// mexer do mesmo jeito. Painel operacional = rápido e firme, sem balanço.

/** Curva de saída forte (Emil Kowalski) — entradas e respostas. */
export const SAIDA = [0.23, 1, 0.32, 1] as const
/** Curva de gaveta (iOS / Vaul) — painel lateral e folha inferior. */
export const GAVETA = [0.32, 0.72, 0, 1] as const

export const DURACAO = { rapida: 0.15, normal: 0.25, lenta: 0.4 } as const

/** Mola padrão: firme, sem balançar. */
export const MOLA = { type: 'spring', stiffness: 380, damping: 32 } as const
/** Mola mais suave, para blocos grandes. */
export const MOLA_SUAVE = { type: 'spring', stiffness: 260, damping: 28 } as const

/** Cascata curta: 40 ms entre itens, nunca bloqueia interação. */
export const PASSO_CASCATA = 0.04
