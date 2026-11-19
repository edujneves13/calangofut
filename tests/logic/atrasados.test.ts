import { describe, expect, it } from 'vitest'
import { adicionarAtrasado } from '../../src/logic/atrasados'
import type { Time } from '../../src/logic/tipos'

function time(ids: string[], soma = ids.length * 3): Time {
  return { jogadorIds: ids, somaEstrelas: soma, completo: ids.length === 5 }
}

const t1 = time(['a1', 'a2', 'a3', 'a4', 'a5'])
const t2 = time(['b1', 'b2', 'b3', 'b4', 'b5'])
const x = { id: 'x', estrelas: 4 }

describe('adicionarAtrasado', () => {
  it('entra no fim do time incompleto e soma as estrelas', () => {
    const incompleto = time(['c1', 'c2', 'c3'], 9)
    const novos = adicionarAtrasado([t1, t2, incompleto], x)
    expect(novos[2]).toEqual({ jogadorIds: ['c1', 'c2', 'c3', 'x'], somaEstrelas: 13, completo: false })
  })

  it('não mexe nos outros times', () => {
    const novos = adicionarAtrasado([t1, t2, time(['c1'])], x)
    expect(novos[0]).toBe(t1)
    expect(novos[1]).toBe(t2)
  })

  it('o quinto jogador completa o time', () => {
    const novos = adicionarAtrasado([t1, time(['c1', 'c2', 'c3', 'c4'])], x)
    expect(novos[1]!.completo).toBe(true)
  })

  it('sem vaga, abre um novo time no fim', () => {
    expect(adicionarAtrasado([t1, t2], x)).toEqual([t1, t2, { jogadorIds: ['x'], somaEstrelas: 4, completo: false }])
  })

  it('não altera a lista original', () => {
    const incompleto = time(['c1'])
    const times = [t1, incompleto]
    adicionarAtrasado(times, x)
    expect(times).toEqual([t1, time(['c1'])])
    expect(incompleto.jogadorIds).toEqual(['c1'])
  })

  it('tocar "Presente" duas vezes não duplica o jogador', () => {
    const uma = adicionarAtrasado([t1, time(['c1'])], x)
    expect(adicionarAtrasado(uma, x)).toBe(uma)
  })
})
