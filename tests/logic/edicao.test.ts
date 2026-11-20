import { describe, expect, it } from 'vitest'
import { criarRng } from '../../src/logic/aleatorio'
import {
  calcularEquilibrio,
  colocarNoTime,
  contarCincoEstrelas,
  moverJogador,
  previaMover,
  previaTroca,
  timeDe,
  tirarDoTime,
  trocarJogadores,
} from '../../src/logic/edicao'
import { lerLista } from '../../src/logic/leitor'
import { sortearTimes } from '../../src/logic/sorteio'
import type { Time } from '../../src/logic/tipos'
import { fixture } from './fixtures'

// Jogadores reais da lista de 18/11, com estrelas fixas para o teste (o nome vira o id).
const lista = lerLista(fixture('lista-2026-11-18.txt'))
const ESTRELAS = [5, 4, 3, 3, 2, 4, 5, 3, 1, 2, 4, 3, 3, 2, 4, 5, 3, 2, 1, 3, 4, 2, 3, 3, 4]
const estrelasPorId = new Map(lista.jogadores.map((j, i) => [j.nome, ESTRELAS[i % ESTRELAS.length]]))
const estrelasDe = (id: string) => estrelasPorId.get(id) ?? 0

// Os 2 últimos ficam de fora (não chegaram): 23 jogadores = 4 times completos + 1 com 3.
function sorteio(): Time[] {
  const ps = lista.jogadores.slice(0, 23).map((j) => ({ id: j.nome, estrelas: estrelasDe(j.nome), goleiro: false, presente: true }))
  const r = sortearTimes(ps, { rng: criarRng(7) })
  if (!r.ok) throw new Error(r.motivo)
  return r.times
}

function time(ids: string[]): Time {
  return { jogadorIds: ids, somaEstrelas: ids.reduce((s, id) => s + estrelasDe(id), 0), completo: ids.length === 5 }
}

const todosIds = (times: Time[]) => times.flatMap((t) => t.jogadorIds).sort()

describe('fixture', () => {
  it('tem jogadores para pelo menos 4 times completos e um incompleto', () => {
    const times = sorteio()
    expect(times.filter((t) => t.completo).length).toBeGreaterThanOrEqual(4)
    expect(times.some((t) => !t.completo)).toBe(true)
  })
})

describe('timeDe', () => {
  it('acha o índice do time do jogador, ou -1 se ele não está em nenhum', () => {
    const times = sorteio()
    const id = times[2]!.jogadorIds[0]!
    expect(timeDe(times, id)).toBe(2)
    expect(timeDe(times, 'ninguém')).toBe(-1)
  })
})

describe('moverJogador', () => {
  const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
  const t2 = time(['Derik', 'Fabiano', 'Yhan'])

  it('move para um time com vaga e recalcula soma e completo dos dois', () => {
    const novos = moverJogador([t1, t2], 'Eduardo', 1, estrelasDe)!
    expect(novos[0]).toEqual(time(['Juninho', 'Márcio', 'Josué', 'Rafael']))
    expect(novos[1]).toEqual(time(['Derik', 'Fabiano', 'Yhan', 'Eduardo']))
  })

  it('não move para um time cheio (nenhum time passa de 5)', () => {
    expect(moverJogador([t2, t1], 'Derik', 1, estrelasDe)).toBeNull()
  })

  it('não move para o próprio time nem quem não está em time', () => {
    expect(moverJogador([t1, t2], 'Derik', 1, estrelasDe)).toBeNull()
    expect(moverJogador([t1, t2], 'ninguém', 1, estrelasDe)).toBeNull()
  })

  it('ninguém some nem duplica', () => {
    const times = sorteio()
    const incompleto = times.findIndex((t) => !t.completo)
    const novos = moverJogador(times, times[0]!.jogadorIds[0]!, incompleto, estrelasDe)!
    expect(todosIds(novos)).toEqual(todosIds(times))
  })

  it('time que fica vazio sai da lista', () => {
    const sozinho = time(['Hugo'])
    const novos = moverJogador([t2, sozinho], 'Hugo', 0, estrelasDe)!
    expect(novos).toHaveLength(1)
    expect(novos[0]!.jogadorIds).toEqual(['Derik', 'Fabiano', 'Yhan', 'Hugo'])
  })
})

describe('trocarJogadores', () => {
  it('troca dois jogadores de times diferentes, mantendo a posição de cada um', () => {
    const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    const t2 = time(['Derik', 'Fabiano', 'Yhan', 'Hugo', 'Junior'])
    const novos = trocarJogadores([t1, t2], 'Eduardo', 'Hugo', estrelasDe)
    expect(novos[0]).toEqual(time(['Juninho', 'Márcio', 'Hugo', 'Josué', 'Rafael']))
    expect(novos[1]).toEqual(time(['Derik', 'Fabiano', 'Yhan', 'Eduardo', 'Junior']))
  })

  it('jogadores do mesmo time ou fora de time: nada muda', () => {
    const times = sorteio()
    const [a, b] = times[0]!.jogadorIds as [string, string]
    expect(trocarJogadores(times, a, b, estrelasDe)).toBe(times)
    expect(trocarJogadores(times, a, 'ninguém', estrelasDe)).toBe(times)
  })
})

describe('tirarDoTime', () => {
  it('tira o jogador e o time fica incompleto', () => {
    const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    const novos = tirarDoTime([t1], 'Josué', estrelasDe)
    expect(novos[0]).toEqual(time(['Juninho', 'Márcio', 'Eduardo', 'Rafael']))
    expect(novos[0]!.completo).toBe(false)
  })

  it('time que fica vazio sai da lista; quem não está em time: nada muda', () => {
    const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    const times = [t1, time(['Hugo'])]
    expect(tirarDoTime(times, 'Hugo', estrelasDe)).toEqual([t1])
    expect(tirarDoTime(times, 'ninguém', estrelasDe)).toBe(times)
  })
})

describe('colocarNoTime', () => {
  it('coloca quem estava fora num time com vaga', () => {
    const novos = colocarNoTime([time(['Derik', 'Fabiano'])], 'Hugo', 0, estrelasDe)!
    expect(novos[0]).toEqual(time(['Derik', 'Fabiano', 'Hugo']))
  })

  it('não coloca em time cheio nem quem já está em time', () => {
    const cheio = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    expect(colocarNoTime([cheio], 'Hugo', 0, estrelasDe)).toBeNull()
    expect(colocarNoTime([cheio, time(['Derik'])], 'Juninho', 1, estrelasDe)).toBeNull()
  })
})

describe('calcularEquilibrio', () => {
  it('maior soma menos menor soma, só entre os completos', () => {
    const times = [
      { jogadorIds: ['a', 'b', 'c', 'd', 'e'], somaEstrelas: 16, completo: true },
      { jogadorIds: ['f', 'g', 'h', 'i', 'j'], somaEstrelas: 19, completo: true },
      { jogadorIds: ['k', 'l', 'm', 'n', 'o'], somaEstrelas: 17, completo: true },
      { jogadorIds: ['p'], somaEstrelas: 2, completo: false },
    ]
    expect(calcularEquilibrio(times)).toBe(3)
  })

  it('com menos de 2 times completos não há o que comparar', () => {
    expect(calcularEquilibrio([time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael']), time(['Hugo'])])).toBeNull()
  })
})

describe('previaMover', () => {
  it('mostra a soma e o tamanho do time de destino antes e depois', () => {
    const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    const t2 = time(['Derik', 'Fabiano', 'Yhan'])
    expect(previaMover([t1, t2], 'Eduardo', 1, estrelasDe)).toEqual({
      somaAntes: t2.somaEstrelas,
      somaDepois: t2.somaEstrelas + estrelasDe('Eduardo'),
      tamanhoAntes: 3,
      tamanhoDepois: 4,
      cheio: false,
    })
  })

  it('time cheio fica marcado', () => {
    const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
    expect(previaMover([time(['Hugo']), t1], 'Hugo', 1, estrelasDe).cheio).toBe(true)
  })
})

describe('previaTroca', () => {
  const t1 = time(['Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael'])
  const t2 = time(['Derik', 'Fabiano', 'Yhan', 'Hugo', 'Junior'])

  it('diz quanto cada time ganha ou perde', () => {
    // Juninho 5★ ↔ Hugo 1★: Time 1 perde 4, Time 2 ganha 4.
    expect(previaTroca([t1, t2], 'Juninho', 'Hugo', estrelasDe)).toEqual({
      timeA: 0,
      timeB: 1,
      deltaA: -4,
      deltaB: 4,
      mantem: false,
    })
  })

  it('mesmas estrelas: mantém o equilíbrio', () => {
    // Eduardo 3★ ↔ Yhan 3★
    expect(previaTroca([t1, t2], 'Eduardo', 'Yhan', estrelasDe).mantem).toBe(true)
  })
})

describe('contarCincoEstrelas', () => {
  it('conta os craques do time', () => {
    // Juninho 5★, Fabiano 5★, Adelson 5★
    expect(contarCincoEstrelas(time(['Juninho', 'Fabiano', 'Adelson', 'Hugo', 'Yhan']), estrelasDe)).toBe(3)
  })
})
