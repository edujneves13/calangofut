import { describe, expect, it } from 'vitest'
import { FORMATOS, formatoPadrao } from '../../src/logic/formatos'
import type { Jogo } from '../../src/logic/formatos/tipos'

const pares = (jogos: Jogo[]) => jogos.map((j) => [j.timeA, j.timeB].sort().join('x')).sort()
const todosOsPares = (n: number) => {
  const r: string[] = []
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) r.push(`${a}x${b}`)
  return r.sort()
}

describe('todos contra todos', () => {
  const formato = FORMATOS['todos-contra-todos']

  it('duração padrão de 8 min', () => {
    expect(formato.duracaoPadraoMin).toBe(8)
  })

  describe('5 times', () => {
    const { jogos, linhas } = formato.gerar(5, { duracaoMin: 8 })

    it('10 jogos, cada confronto uma vez', () => {
      expect(jogos).toHaveLength(10)
      expect(pares(jogos)).toEqual(todosOsPares(5))
    })

    it('nenhum time joga duas seguidas', () => {
      for (let i = 1; i < jogos.length; i++) {
        const antes = [jogos[i - 1]!.timeA, jogos[i - 1]!.timeB]
        expect(antes).not.toContain(jogos[i]!.timeA)
        expect(antes).not.toContain(jogos[i]!.timeB)
      }
    })

    it('texto da ordem dos jogos', () => {
      expect(linhas[0]).toBe('Jogos (todos contra todos, 8 min):')
      expect(linhas[1]).toBe('1) Time 1 x Time 2')
      expect(linhas.some((l) => l.includes('descansa'))).toBe(false)
      expect(linhas).toHaveLength(11)
    })
  })

  it('4 times: 6 jogos, todos os confrontos', () => {
    expect(pares(formato.gerar(4, { duracaoMin: 8 }).jogos)).toEqual(todosOsPares(4))
  })

  it('3 times: 3 jogos, todos os confrontos', () => {
    expect(pares(formato.gerar(3, { duracaoMin: 8 }).jogos)).toEqual(todosOsPares(3))
  })

  it('usa a duração do config', () => {
    expect(formato.gerar(5, { duracaoMin: 10 }).linhas[0]).toBe('Jogos (todos contra todos, 10 min):')
  })
})

describe('quem ganha fica', () => {
  const formato = FORMATOS['quem-ganha-fica']

  it('duração padrão de 10 min', () => {
    expect(formato.duracaoPadraoMin).toBe(10)
  })

  it('4 times: Time 1 x Time 2 começam, depois a fila', () => {
    expect(formato.gerar(4, { duracaoMin: 10 })).toEqual({
      jogos: [{ timeA: 1, timeB: 2 }],
      linhas: [
        'Jogos (quem ganha fica, 10 min):',
        'Começam Time 1 x Time 2. Próximos: Time 3, Time 4',
        'Time ganhador joga no máximo 3 partidas seguidas. Empate: saem os dois times.',
      ],
    })
  })

  it('2 times: sem fila', () => {
    expect(formato.gerar(2, { duracaoMin: 10 }).linhas[1]).toBe('Começam Time 1 x Time 2.')
  })
})

describe('formatoPadrao', () => {
  it('até 4 times: quem ganha fica', () => {
    for (const n of [2, 3, 4]) expect(formatoPadrao(n)).toBe('quem-ganha-fica')
  })
  it('5 times: todos contra todos', () => {
    expect(formatoPadrao(5)).toBe('todos-contra-todos')
  })
  it('6 ou mais times: quem ganha fica', () => {
    expect(formatoPadrao(6)).toBe('quem-ganha-fica')
  })
})
