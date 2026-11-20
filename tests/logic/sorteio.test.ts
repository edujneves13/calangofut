import { describe, expect, it } from 'vitest'
import { criarRng } from '../../src/logic/aleatorio'
import { sortearTimes, type ParticipanteSorteio } from '../../src/logic/sorteio'
import type { Time } from '../../src/logic/tipos'

function linha(estrelas: number[], prefixo = 'j'): ParticipanteSorteio[] {
  return estrelas.map((e, i) => ({ id: `${prefixo}${i}`, estrelas: e, goleiro: false, presente: true }))
}

const goleiros: ParticipanteSorteio[] = [
  { id: 'g1', estrelas: 5, goleiro: true, presente: true },
  { id: 'g2', estrelas: 4, goleiro: true, presente: true },
]
const ausentes = linha([5, 5, 5], 'a').map((p) => ({ ...p, presente: false }))

function sortearOk(ps: ParticipanteSorteio[], semente = 1): Time[] {
  const r = sortearTimes(ps, { rng: criarRng(semente) })
  if (!r.ok) throw new Error(`sorteio falhou: ${r.motivo}`)
  return r.times
}

const todosIds = (times: Time[]) => times.flatMap((t) => t.jogadorIds).sort()
const somas = (times: Time[]) => times.filter((t) => t.completo).map((t) => t.somaEstrelas)
const diferenca = (times: Time[]) => Math.max(...somas(times)) - Math.min(...somas(times))

// 25 jogadores com notas variadas, parecido com a pelada real
const estrelas25 = [5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 3, 4]

describe('sortearTimes — quem entra', () => {
  it('com menos de 10 de linha presentes não sorteia (goleiros e ausentes não contam)', () => {
    const ps = [...linha([3, 3, 3, 3, 3, 3, 3, 3, 3]), ...goleiros, ...ausentes]
    expect(sortearTimes(ps)).toEqual({ ok: false, motivo: 'poucos-jogadores' })
  })

  it('só jogadores de linha presentes entram, cada um uma vez', () => {
    const ps = [...linha(estrelas25), ...goleiros, ...ausentes]
    const times = sortearOk(ps)
    expect(todosIds(times)).toEqual(linha(estrelas25).map((p) => p.id).sort())
  })
})

describe('sortearTimes — tamanho dos times', () => {
  it('10 jogadores → 2 times completos', () => {
    expect(sortearOk(linha([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).map((t) => t.jogadorIds.length)).toEqual([5, 5])
  })

  it('25 jogadores → 5 times completos', () => {
    const times = sortearOk(linha(estrelas25))
    expect(times.map((t) => t.jogadorIds.length)).toEqual([5, 5, 5, 5, 5])
    expect(times.every((t) => t.completo)).toBe(true)
  })

  it('23 jogadores → 4 completos e o incompleto por último', () => {
    const times = sortearOk(linha(estrelas25.slice(0, 23)))
    expect(times.map((t) => t.jogadorIds.length)).toEqual([5, 5, 5, 5, 3])
    expect(times.map((t) => t.completo)).toEqual([true, true, true, true, false])
  })

  it('somaEstrelas confere com os jogadores do time', () => {
    const ps = linha(estrelas25)
    const estrelasDe = new Map(ps.map((p) => [p.id, p.estrelas]))
    for (const t of sortearOk(ps)) {
      expect(t.somaEstrelas).toBe(t.jogadorIds.reduce((s, id) => s + estrelasDe.get(id)!, 0))
    }
  })
})

describe('sortearTimes — balanceamento', () => {
  it('encontra a divisão perfeita quando ela existe', () => {
    expect(diferenca(sortearOk(linha([5, 5, 4, 4, 3, 3, 2, 2, 1, 1])))).toBe(0)
  })

  it('25 jogadores reais ficam com diferença de no máximo 1 estrela', () => {
    for (let s = 1; s <= 10; s++) expect(diferenca(sortearOk(linha(estrelas25), s))).toBeLessThanOrEqual(1)
  })

  it('sementes diferentes geram times diferentes', () => {
    const ps = linha(estrelas25)
    const chave = (times: Time[]) => times.map((t) => [...t.jogadorIds].sort().join(',')).sort().join('|')
    const divisoes = new Set(Array.from({ length: 10 }, (_, s) => chave(sortearOk(ps, s + 1))))
    expect(divisoes.size).toBeGreaterThan(1)
  })
})

describe('sortearTimes — restrição de 5 estrelas', () => {
  it('nenhum time tem mais de dois 5 estrelas', () => {
    const ps = linha([5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    const cinco = new Set(ps.filter((p) => p.estrelas === 5).map((p) => p.id))
    for (let s = 1; s <= 50; s++) {
      for (const t of sortearOk(ps, s)) {
        expect(t.jogadorIds.filter((id) => cinco.has(id)).length).toBeLessThanOrEqual(2)
      }
    }
  })

  it('vale também para o time incompleto', () => {
    const ps = linha([5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1])  // 12 → 5, 5, 2; o time de 2 precisa ficar com dois 5★
    const cinco = new Set(ps.filter((p) => p.estrelas === 5).map((p) => p.id))
    for (let s = 1; s <= 50; s++) {
      for (const t of sortearOk(ps, s)) {
        expect(t.jogadorIds.filter((id) => cinco.has(id)).length).toBeLessThanOrEqual(2)
      }
    }
  })

  it('quando é impossível respeitar, avisa em vez de sortear', () => {
    expect(sortearTimes(linha([5, 5, 5, 5, 5, 1, 1, 1, 1, 1]))).toEqual({ ok: false, motivo: 'muitos-cinco-estrelas' })
  })
})

describe('sortearTimes — limite de craques configurável', () => {
  const cincoDe = (ps: ParticipanteSorteio[]) => new Set(ps.filter((p) => p.estrelas === 5).map((p) => p.id))

  it('com limite 1, nenhum time tem mais de um 5 estrelas', () => {
    const ps = linha([5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1])
    const cinco = cincoDe(ps)
    for (let s = 1; s <= 20; s++) {
      const r = sortearTimes(ps, { rng: criarRng(s), maxCincoEstrelas: 1 })
      if (!r.ok) throw new Error(r.motivo)
      for (const t of r.times) expect(t.jogadorIds.filter((id) => cinco.has(id)).length).toBeLessThanOrEqual(1)
    }
  })

  it('com limite 1, avisa quando há mais craques que times', () => {
    expect(sortearTimes(linha([5, 5, 5, 1, 1, 1, 1, 1, 1, 1]), { maxCincoEstrelas: 1 })).toEqual({
      ok: false,
      motivo: 'muitos-cinco-estrelas',
    })
  })

  it('"Sortear assim mesmo": sem limite, sorteia mesmo com craques demais', () => {
    const ps = linha([5, 5, 5, 5, 5, 1, 1, 1, 1, 1])
    const r = sortearTimes(ps, { rng: criarRng(1), maxCincoEstrelas: Infinity })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(todosIds(r.times)).toEqual(ps.map((p) => p.id).sort())
      expect(r.times.map((t) => t.jogadorIds.length)).toEqual([5, 5])
    }
  })

  it('sem limite, ainda equilibra pelas estrelas', () => {
    const r = sortearTimes(linha([5, 5, 5, 5, 5, 1, 1, 1, 1, 1]), { rng: criarRng(1), maxCincoEstrelas: Infinity })
    if (!r.ok) throw new Error(r.motivo)
    expect(diferenca(r.times)).toBeLessThanOrEqual(4)
  })
})
