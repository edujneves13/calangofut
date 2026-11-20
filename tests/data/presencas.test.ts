import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../../src/data/cliente'
import { criarJogador } from '../../src/data/jogadores'
import { abrirPelada, salvarSorteio, type Pelada, type TimesSalvos } from '../../src/data/peladas'
import {
  type Presenca,
  adicionarNaHora,
  chegouDepois,
  listarPresencas,
  marcarPresenca,
  salvarPresencasDaLista,
} from '../../src/data/presencas'
import type { Jogador } from '../../src/logic/tipos'
import { clienteDeTeste, limparBanco } from './ajuda'

let db: Db
let pelada: Pelada
let ana: Jogador
let bia: Jogador
let caio: Jogador

const vazio: TimesSalvos = { times: [], jogos: [] }
const sorteio = { times: vazio, formato: 'quem-ganha-fica', duracaoMin: 10 } as const
const de = (lista: Presenca[], j: Jogador) => lista.find((p) => p.jogadorId === j.id)!

beforeAll(async () => {
  db = await clienteDeTeste()
})

afterAll(async () => {
  await limparBanco(db)
})

beforeEach(async () => {
  await limparBanco(db)
  pelada = await abrirPelada(db, '2026-11-25')
  ana = await criarJogador(db, { nome: 'Ana', estrelas: 4 })
  bia = await criarJogador(db, { nome: 'Bia', estrelas: 3 })
  caio = await criarJogador(db, { nome: 'Caio', estrelas: 2 })
})

describe('presenças', () => {
  it('salva a lista colada com origem "lista"', async () => {
    await salvarPresencasDaLista(db, pelada.id, [
      { jogadorId: ana.id, status: 'chegou' },
      { jogadorId: bia.id, status: 'nao-chegou' },
    ])
    const lista = await listarPresencas(db, pelada.id)
    expect(lista).toHaveLength(2)
    expect(de(lista, ana)).toMatchObject({ peladaId: pelada.id, status: 'chegou', origem: 'lista' })
    expect(de(lista, ana).marcadoPresenteEm).not.toBeNull()
    expect(de(lista, bia)).toMatchObject({ status: 'nao-chegou', marcadoPresenteEm: null })
  })

  it('colar a lista de novo não duplica', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    expect(await listarPresencas(db, pelada.id)).toHaveLength(1)
  })

  it('adiciona jogador na hora como chegou', async () => {
    expect(await adicionarNaHora(db, pelada.id, caio.id)).toMatchObject({ jogadorId: caio.id, status: 'chegou', origem: 'na-hora' })
  })

  it('marcar "não chegou" limpa a hora; marcar "chegou" grava a hora', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    expect((await marcarPresenca(db, pelada.id, ana.id, 'nao-chegou')).marcadoPresenteEm).toBeNull()
    expect((await marcarPresenca(db, pelada.id, ana.id, 'chegou')).marcadoPresenteEm).not.toBeNull()
  })

  it('ausente (avisou que não vem) fica sem hora e com status próprio', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'ausente' }])
    expect(de(await listarPresencas(db, pelada.id), ana)).toMatchObject({ status: 'ausente', marcadoPresenteEm: null })
    expect(await marcarPresenca(db, pelada.id, ana.id, 'nao-chegou')).toMatchObject({ status: 'nao-chegou' })
  })

  it('ausente que aparece depois do sorteio chegou depois', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: bia.id, status: 'ausente' }])
    const sorteada = await salvarSorteio(db, pelada.id, sorteio)
    expect(chegouDepois(await marcarPresenca(db, pelada.id, bia.id, 'chegou'), sorteada)).toBe(true)
  })

  it('quem é marcado presente depois do sorteio chegou depois', async () => {
    await salvarPresencasDaLista(db, pelada.id, [
      { jogadorId: ana.id, status: 'chegou' },
      { jogadorId: bia.id, status: 'nao-chegou' },
    ])
    const sorteada = await salvarSorteio(db, pelada.id, sorteio)
    const biaChegou = await marcarPresenca(db, pelada.id, bia.id, 'chegou')
    const anaLista = de(await listarPresencas(db, pelada.id), ana)
    expect(chegouDepois(biaChegou, sorteada)).toBe(true)
    expect(chegouDepois(anaLista, sorteada)).toBe(false)
  })

  it('antes do sorteio ninguém chegou depois', async () => {
    const biaPresente = await adicionarNaHora(db, pelada.id, bia.id)
    expect(chegouDepois(biaPresente, pelada)).toBe(false)
  })

  it('colar a lista de novo depois do sorteio não marca ninguém como atrasado', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    const sorteada = await salvarSorteio(db, pelada.id, sorteio)
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    expect(chegouDepois(de(await listarPresencas(db, pelada.id), ana), sorteada)).toBe(false)
  })

  it('tocar Chegou em quem já estava presente não marca como atrasado', async () => {
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: ana.id, status: 'chegou' }])
    const sorteada = await salvarSorteio(db, pelada.id, sorteio)
    expect(chegouDepois(await marcarPresenca(db, pelada.id, ana.id, 'chegou'), sorteada)).toBe(false)
  })

  it('colar a lista de novo não muda a origem de quem entrou na hora', async () => {
    await adicionarNaHora(db, pelada.id, caio.id)
    await salvarPresencasDaLista(db, pelada.id, [{ jogadorId: caio.id, status: 'chegou' }])
    expect(de(await listarPresencas(db, pelada.id), caio).origem).toBe('na-hora')
  })
})
