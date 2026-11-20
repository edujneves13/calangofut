import { describe, expect, it } from 'vitest'
import { criarRng } from '../../src/logic/aleatorio'
import { refazerSorteio, sortearTimes, type ParticipanteSorteio } from '../../src/logic/sorteio'
import type { Time } from '../../src/logic/tipos'

function linha(estrelas: number[], prefixo = 'j'): ParticipanteSorteio[] {
  return estrelas.map((e, i) => ({ id: `${prefixo}${i}`, estrelas: e, goleiro: false, presente: true }))
}

const estrelas25 = [5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 3, 4]
const ps25 = linha(estrelas25)

function primeiroSorteio(ps: ParticipanteSorteio[]): Time[] {
  const r = sortearTimes(ps, { rng: criarRng(1) })
  if (!r.ok) throw new Error(r.motivo)
  return r.times
}

function refazerOk(ps: ParticipanteSorteio[], atuais: Time[], travados: number[], semente = 2): Time[] {
  const r = refazerSorteio(ps, atuais, travados, { rng: criarRng(semente) })
  if (!r.ok) throw new Error(r.motivo)
  return r.times
}

const todosIds = (times: Time[]) => times.flatMap((t) => t.jogadorIds).sort()

describe('refazerSorteio', () => {
  const atuais = primeiroSorteio(ps25)

  it('time travado continua igual e na mesma posição', () => {
    const novos = refazerOk(ps25, atuais, [1, 3])
    expect(novos[1]).toEqual(atuais[1])
    expect(novos[3]).toEqual(atuais[3])
  })

  it('os outros jogadores são sorteados de novo, cada um uma vez', () => {
    const novos = refazerOk(ps25, atuais, [1])
    expect(todosIds(novos)).toEqual(todosIds(atuais))
    expect(novos.map((t) => t.jogadorIds.length)).toEqual([5, 5, 5, 5, 5])
  })

  it('times não travados mudam em pelo menos uma das sementes', () => {
    const chave = (times: Time[]) => times.map((t) => [...t.jogadorIds].sort().join(',')).join('|')
    const resultados = new Set(Array.from({ length: 5 }, (_, s) => chave(refazerOk(ps25, atuais, [0], s + 10))))
    expect(resultados.size).toBeGreaterThan(1)
  })

  it('equilibra os times novos com a soma dos travados', () => {
    const novos = refazerOk(ps25, atuais, [0])
    const somas = novos.filter((t) => t.completo).map((t) => t.somaEstrelas)
    expect(Math.max(...somas) - Math.min(...somas)).toBeLessThanOrEqual(2)
  })

  it('sem nenhum time travado funciona como um sorteio novo', () => {
    const novos = refazerOk(ps25, atuais, [])
    expect(todosIds(novos)).toEqual(todosIds(atuais))
  })

  it('jogador marcado ausente depois do sorteio sai dos times não travados', () => {
    const naoTravado = atuais[2]!.jogadorIds[0]!
    const ps = ps25.map((p) => (p.id === naoTravado ? { ...p, presente: false } : p))
    const novos = refazerOk(ps, atuais, [0])
    expect(todosIds(novos)).not.toContain(naoTravado)
    expect(novos.map((t) => t.jogadorIds.length)).toEqual([5, 5, 5, 5, 4])
    expect(novos[0]).toEqual(atuais[0])
  })

  it('o incompleto continua por último', () => {
    const ps23 = linha(estrelas25.slice(0, 23))
    const atuais23 = primeiroSorteio(ps23)
    const novos = refazerOk(ps23, atuais23, [2])
    expect(novos[2]).toEqual(atuais23[2])
    expect(novos.map((t) => t.completo)).toEqual([true, true, true, true, false])
  })

  it('travar todos os completos mantém tudo', () => {
    expect(refazerOk(ps25, atuais, [0, 1, 2, 3, 4])).toEqual(atuais)
  })

  it('time incompleto não pode ser travado (é ignorado)', () => {
    const ps23 = linha(estrelas25.slice(0, 23))
    const atuais23 = primeiroSorteio(ps23)
    const novos = refazerOk(ps23, atuais23, [4])
    expect(todosIds(novos)).toEqual(todosIds(atuais23))
    expect(novos.map((t) => t.jogadorIds.length)).toEqual([5, 5, 5, 5, 3])
  })

  it('respeita no máximo dois 5 estrelas nos times novos', () => {
    const ps = linha([5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    const cinco = new Set(ps.filter((p) => p.estrelas === 5).map((p) => p.id))
    const base = primeiroSorteio(ps)
    for (let s = 1; s <= 20; s++) {
      for (const t of refazerOk(ps, base, [0], s)) {
        expect(t.jogadorIds.filter((id) => cinco.has(id)).length).toBeLessThanOrEqual(2)
      }
    }
  })

  it('com menos de 10 presentes no total, não sorteia', () => {
    const ps = ps25.map((p, i) => (i >= 9 ? { ...p, presente: false } : p))
    expect(refazerSorteio(ps, atuais, [])).toEqual({ ok: false, motivo: 'poucos-jogadores' })
  })
})

describe('refazerSorteio — limite de craques configurável', () => {
  it('sem limite, refaz mesmo com craques demais', () => {
    const ps = linha([5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1]) // 7 craques para 3 times
    expect(refazerSorteio(ps, [], []).ok).toBe(false)
    const r = sortearTimes(ps, { rng: criarRng(1), maxCincoEstrelas: Infinity })
    if (!r.ok) throw new Error(r.motivo)
    const novo = refazerSorteio(ps, r.times, [], { rng: criarRng(2), maxCincoEstrelas: Infinity })
    expect(novo.ok).toBe(true)
    if (novo.ok) expect(todosIds(novo.times)).toEqual(ps.map((p) => p.id).sort())
  })
})
