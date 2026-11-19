import type { FormatoJogo } from './tipos'

export const quemGanhaFica: FormatoJogo = {
  id: 'quem-ganha-fica',
  nome: 'Quem ganha fica',
  duracaoPadraoMin: 10,
  gerar(numTimes, { duracaoMin }) {
    const fila = Array.from({ length: Math.max(0, numTimes - 2) }, (_, i) => `Time ${i + 3}`)
    const inicio = 'Começam Time 1 x Time 2.' + (fila.length ? ` Próximos: ${fila.join(', ')}` : '')
    return {
      jogos: [{ timeA: 1, timeB: 2 }],
      linhas: [
        `Jogos (quem ganha fica, ${duracaoMin} min):`,
        inicio,
        'Time ganhador joga no máximo 3 partidas seguidas. Empate: saem os dois times.',
      ],
    }
  },
}
