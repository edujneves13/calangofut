export type Estrelas = 1 | 2 | 3 | 4 | 5

export interface Jogador {
  id: string
  nome: string
  estrelas: Estrelas
  tipo: 'mensalista' | 'diarista'
  goleiro: boolean
  ativo: boolean
}

export interface Time {
  jogadorIds: string[]
  somaEstrelas: number
  completo: boolean
}

export const TAMANHO_TIME = 5
