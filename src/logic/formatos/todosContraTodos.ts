import type { FormatoJogo, Jogo } from './tipos'

/**
 * Ordem fixa para 5 times: 10 jogos, ninguém joga duas seguidas.
 */
const TABELA_5_TIMES: Jogo[] = [
  { timeA: 1, timeB: 2 },
  { timeA: 3, timeB: 4 },
  { timeA: 1, timeB: 5 },
  { timeA: 2, timeB: 3 },
  { timeA: 4, timeB: 5 },
  { timeA: 1, timeB: 3 },
  { timeA: 2, timeB: 4 },
  { timeA: 3, timeB: 5 },
  { timeA: 1, timeB: 4 },
  { timeA: 2, timeB: 5 },
]

/** Método do círculo: fixa o primeiro time e gira os outros a cada rodada. */
function rodizio(numTimes: number): Jogo[] {
  if (numTimes < 2) return []
  const times = Array.from({ length: numTimes }, (_, i) => i + 1)
  if (numTimes % 2 === 1) times.push(0) // 0 = time fantasma: quem pega ele folga na rodada
  const jogos: Jogo[] = []

  for (let rodada = 0; rodada < times.length - 1; rodada++) {
    const metade = times.length / 2
    const pares = Array.from({ length: metade }, (_, i) => [times[i]!, times[times.length - 1 - i]!] as const)
    for (const [a, b] of pares) {
      if (a !== 0 && b !== 0) jogos.push({ timeA: Math.min(a, b), timeB: Math.max(a, b) })
    }
    times.splice(1, 0, times.pop()!)
  }
  return jogos
}

export const todosContraTodos: FormatoJogo = {
  id: 'todos-contra-todos',
  nome: 'Todos contra todos',
  duracaoPadraoMin: 8,
  gerar(numTimes, { duracaoMin }) {
    const jogos = numTimes === 5 ? TABELA_5_TIMES : rodizio(numTimes)
    const linhas = [
      `Jogos (todos contra todos, ${duracaoMin} min):`,
      ...jogos.map((j, i) => `${i + 1}) Time ${j.timeA} x Time ${j.timeB}`),
    ]
    return { jogos, linhas }
  },
}
