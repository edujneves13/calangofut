import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../../src/data/cliente'
import { lerConfiguracoes, lerIdentidade, salvarConfiguracoes } from '../../src/data/configuracoes'
import { criarJogador } from '../../src/data/jogadores'
import {
  abrirPelada,
  atualizarPelada,
  peladaAtual,
  recomecarPelada,
  salvarSorteio,
  salvarTimes,
} from '../../src/data/peladas'
import { listarPresencas, salvarPresencasDaLista } from '../../src/data/presencas'
import type { Time } from '../../src/logic/tipos'
import { clienteDeslogado, clienteDeTeste, limparBanco } from './ajuda'

let db: Db
const padroes = {
  nomePelada: 'Pelada dos Brabos',
  avatarUrl: null,
  diaSemana: 3,
  horarioPadrao: '20:30',
  localPadrao: 'Colibris Club Arena',
  formatoPadrao: 'quem-ganha-fica',
  tempoJogo: 10,
  maxJogosSeguidos: 3,
  maxCincoEstrelas: 2,
} as const
const time: Time = { jogadorIds: ['a', 'b', 'c', 'd', 'e'], somaEstrelas: 15, completo: true }
const incompleto: Time = { jogadorIds: ['f'], somaEstrelas: 3, completo: false }

beforeAll(async () => {
  db = await clienteDeTeste()
})
afterAll(async () => {
  await limparBanco(db)
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
    expect(await salvarConfiguracoes(db, { maxCincoEstrelas: 3 })).toEqual({ ...padroes, maxCincoEstrelas: 3 })
  })
  it('tira espaços do nome da pelada', async () => {
    expect((await salvarConfiguracoes(db, { nomePelada: '  Calango FC ' })).nomePelada).toBe('Calango FC')
  })
  it('nome e avatar aparecem sem login (tela de login)', async () => {
    await salvarConfiguracoes(db, { nomePelada: 'Calango FC', avatarUrl: 'https://exemplo/avatar.png' })
    expect(await lerIdentidade(clienteDeslogado())).toEqual({ nomePelada: 'Calango FC', avatarUrl: 'https://exemplo/avatar.png' })
  })
  it('sem login, o resto das configurações continua fechado', async () => {
    await expect(lerConfiguracoes(clienteDeslogado())).rejects.toMatchObject({ codigo: 'nao-encontrado' })
  })
})

describe('peladaAtual', () => {
  const segunda = new Date('2026-11-23T12:00:00-03:00')

  it('sem pelada marcada, abre a do próximo dia da semana', async () => {
    expect((await peladaAtual(db, segunda)).data).toBe('2026-11-25')
  })

  it('respeita "Mudar só a próxima"', async () => {
    const p = await peladaAtual(db, segunda)
    await atualizarPelada(db, p.id, { data: '2026-11-26' })
    expect((await peladaAtual(db, segunda)).id).toBe(p.id)
  })

  it('na quarta à noite continua na pelada do dia', async () => {
    const p = await abrirPelada(db, '2026-11-25')
    expect((await peladaAtual(db, new Date('2026-11-25T23:30:00-03:00'))).id).toBe(p.id)
  })

  it('depois da meia-noite vira para a semana seguinte', async () => {
    await abrirPelada(db, '2026-11-25')
    expect((await peladaAtual(db, new Date('2026-11-26T00:10:00-03:00'))).data).toBe('2026-12-02')
  })

  it('usa o dia da semana das configurações', async () => {
    await salvarConfiguracoes(db, { diaSemana: 5 })
    expect((await peladaAtual(db, segunda)).data).toBe('2026-11-27')
  })
})

describe('recomecarPelada ("Tentar novamente")', () => {
  it('apaga a lista e os times, mantendo data, horário e local', async () => {
    const p = await abrirPelada(db, '2026-11-25')
    const ana = await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    await salvarPresencasDaLista(db, p.id, [{ jogadorId: ana.id, status: 'chegou' }])
    await salvarSorteio(db, p.id, { times: { times: [time], jogos: [] }, formato: 'quem-ganha-fica', duracaoMin: 10 })

    expect(await recomecarPelada(db, p.id)).toMatchObject({
      id: p.id,
      data: '2026-11-25',
      local: p.local,
      times: null,
      formato: null,
      duracaoMin: null,
      sorteadaEm: null,
    })
    expect(await listarPresencas(db, p.id)).toEqual([])
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

  it('mudar a data para uma que já tem pelada dá erro data-duplicada', async () => {
    await abrirPelada(db, '2026-12-02')
    const p = await abrirPelada(db, '2026-11-25')
    await expect(atualizarPelada(db, p.id, { data: '2026-12-02' })).rejects.toMatchObject({ codigo: 'data-duplicada' })
  })
})
