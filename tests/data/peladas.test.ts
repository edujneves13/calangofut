import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../../src/data/cliente'
import { lerConfiguracoes, salvarConfiguracoes } from '../../src/data/configuracoes'
import { abrirPelada, atualizarPelada, salvarSorteio, salvarTimes } from '../../src/data/peladas'
import type { Time } from '../../src/logic/tipos'
import { clienteDeTeste, limparBanco } from './ajuda'

let db: Db
const padroes = {
  formatoAte4: 'quem-ganha-fica',
  formato5: 'todos-contra-todos',
  duracaoQuemGanhaFica: 10,
  duracaoTodosContraTodos: 8,
  horarioPadrao: '20:30',
  localPadrao: 'Colibris Club Arena',
} as const
const time: Time = { jogadorIds: ['a', 'b', 'c', 'd', 'e'], somaEstrelas: 15, completo: true }
const incompleto: Time = { jogadorIds: ['f'], somaEstrelas: 3, completo: false }

beforeAll(async () => {
  db = await clienteDeTeste()
})
beforeEach(async () => {
  await limparBanco(db)
})
afterEach(async () => {
  await salvarConfiguracoes(db, padroes)
})

describe('configurações', () => {
  it('lê os padrões', async () => {
    expect(await lerConfiguracoes(db)).toEqual(padroes)
  })
  it('salva só o que mudou', async () => {
    expect(await salvarConfiguracoes(db, { duracaoTodosContraTodos: 10 })).toEqual({ ...padroes, duracaoTodosContraTodos: 10 })
  })
})

describe('peladas', () => {
  it('abre a pelada da data com horário e local padrão', async () => {
    expect(await abrirPelada(db, '2026-11-25')).toMatchObject({
      data: '2026-11-25',
      horario: '20:30',
      local: 'Colibris Club Arena',
      formato: null,
      duracaoMin: null,
      times: null,
      sorteadaEm: null,
    })
  })

  it('abrir duas vezes ao mesmo tempo não cria duas peladas', async () => {
    const [a, b] = await Promise.all([abrirPelada(db, '2026-12-02'), abrirPelada(db, '2026-12-02')])
    expect(a.id).toBe(b.id)
  })

  it('abrir de novo devolve a existente sem mudar nada', async () => {
    const p = await abrirPelada(db, '2026-11-25')
    await atualizarPelada(db, p.id, { local: 'Outra Quadra', horario: '21:00' })
    expect(await abrirPelada(db, '2026-11-25')).toMatchObject({ id: p.id, local: 'Outra Quadra', horario: '21:00' })
  })

  it('usa o local padrão das configurações', async () => {
    await salvarConfiguracoes(db, { localPadrao: 'Quadra Nova' })
    expect((await abrirPelada(db, '2026-12-09')).local).toBe('Quadra Nova')
  })

  it('salvar sorteio grava times, formato, duração e hora do sorteio', async () => {
    const p = await abrirPelada(db, '2026-11-25')
    const s = await salvarSorteio(db, p.id, {
      times: { times: [time], jogos: [{ timeA: 1, timeB: 2 }] },
      formato: 'quem-ganha-fica',
      duracaoMin: 10,
    })
    expect(s).toMatchObject({ formato: 'quem-ganha-fica', duracaoMin: 10, times: { times: [time], jogos: [{ timeA: 1, timeB: 2 }] } })
    expect(s.sorteadaEm).not.toBeNull()
  })

  it('salvar times (atrasado entrando) não muda a hora do sorteio', async () => {
    const p = await abrirPelada(db, '2026-11-25')
    const s = await salvarSorteio(db, p.id, { times: { times: [time], jogos: [] }, formato: 'quem-ganha-fica', duracaoMin: 10 })
    const t = await salvarTimes(db, p.id, { times: [time, incompleto], jogos: [] })
    expect(t.times?.times).toEqual([time, incompleto])
    expect(t.sorteadaEm).toBe(s.sorteadaEm)
  })
})
