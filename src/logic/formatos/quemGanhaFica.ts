import type { FormatoJogo } from './tipos'

export const quemGanhaFica: FormatoJogo = {
  id: 'quem-ganha-fica',
  nome: 'Quem ganha fica',
  duracaoPadraoMin: 10,
  gerar(_numTimes, { duracaoMin }) {
    return {
      jogos: [{ timeA: 1, timeB: 2 }],
      linhas: [`Quem ganha fica · ${duracaoMin} min`],
    }
  },
}
