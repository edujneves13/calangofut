export type FormatoId = 'quem-ganha-fica' | 'todos-contra-todos'

/** Um jogo entre dois times (numerados a partir de 1). */
export interface Jogo {
  timeA: number
  timeB: number
}

export interface SaidaFormato {
  jogos: Jogo[]
  /** Linhas prontas para o texto do WhatsApp. */
  linhas: string[]
}

/**
 * Todo formato recebe o número de times e a configuração e devolve os jogos e o texto.
 * Um formato novo é só mais um objeto com esta forma.
 */
export interface FormatoJogo {
  id: FormatoId
  nome: string
  duracaoPadraoMin: number
  gerar(numTimes: number, config: { duracaoMin: number }): SaidaFormato
}
