import { describe, expect, it } from 'vitest'
import { criarRng, embaralhar } from '../../src/logic/aleatorio'

const seq = (rng: () => number) => Array.from({ length: 5 }, () => rng())

describe('criarRng', () => {
  it('mesma semente gera a mesma sequência', () => {
    expect(seq(criarRng(42))).toEqual(seq(criarRng(42)))
  })
  it('sementes diferentes geram sequências diferentes', () => {
    expect(seq(criarRng(1))).not.toEqual(seq(criarRng(2)))
  })
  it('gera números entre 0 e 1', () => {
    const rng = criarRng(7)
    for (let i = 0; i < 1000; i++) {
      const n = rng()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })
})

describe('embaralhar', () => {
  it('mantém os mesmos itens', () => {
    expect(embaralhar([1, 2, 3, 4, 5], criarRng(3)).sort()).toEqual([1, 2, 3, 4, 5])
  })
  it('não altera a lista original', () => {
    const orig = [1, 2, 3]
    embaralhar(orig, criarRng(3))
    expect(orig).toEqual([1, 2, 3])
  })
})
