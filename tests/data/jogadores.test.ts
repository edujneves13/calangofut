import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../../src/data/cliente'
import { atualizarJogador, criarJogador, desativarJogador, listarJogadores } from '../../src/data/jogadores'
import { clienteDeslogado, clienteDeTeste, limparBanco } from './ajuda'

let db: Db

beforeAll(async () => {
  db = await clienteDeTeste()
})

afterAll(async () => {
  await limparBanco(db)
})

beforeEach(async () => {
  await limparBanco(db)
})

describe('jogadores', () => {
  it('cria com padrões e tira espaços do nome', async () => {
    const ana = await criarJogador(db, { nome: '  Ana Souza ', estrelas: 4 })
    expect(ana).toMatchObject({ nome: 'Ana Souza', estrelas: 4, tipo: 'diarista', goleiro: false, ativo: true })
    expect(ana.id).toBeTruthy()
  })

  it('cria goleiro mensalista', async () => {
    const g = await criarJogador(db, { nome: 'Richard', estrelas: 3, tipo: 'mensalista', goleiro: true })
    expect(g).toMatchObject({ tipo: 'mensalista', goleiro: true })
  })

  it('nome repetido entre ativos dá erro nome-duplicado', async () => {
    await criarJogador(db, { nome: 'Ana Souza', estrelas: 4 })
    await expect(criarJogador(db, { nome: 'ána  souza', estrelas: 2 })).rejects.toMatchObject({ codigo: 'nome-duplicado' })
  })

  it('lista em ordem de nome, só ativos por padrão', async () => {
    const bia = await criarJogador(db, { nome: 'Bia', estrelas: 3 })
    await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    await desativarJogador(db, bia.id)
    expect((await listarJogadores(db)).map((j) => j.nome)).toEqual(['Ana'])
    expect((await listarJogadores(db, { incluirInativos: true })).map((j) => j.nome)).toEqual(['Ana', 'Bia'])
  })

  it('desativado libera o nome para um novo cadastro', async () => {
    const ana = await criarJogador(db, { nome: 'Ana Souza', estrelas: 4 })
    await desativarJogador(db, ana.id)
    expect(await criarJogador(db, { nome: 'Ana Souza', estrelas: 2 })).toMatchObject({ ativo: true, estrelas: 2 })
  })

  it('atualiza estrelas', async () => {
    const ana = await criarJogador(db, { nome: 'Ana', estrelas: 4 })
    expect(await atualizarJogador(db, ana.id, { estrelas: 5 })).toMatchObject({ id: ana.id, estrelas: 5 })
  })

  it('atualizar id inexistente dá erro nao-encontrado', async () => {
    await expect(
      atualizarJogador(db, '00000000-0000-0000-0000-000000000000', { estrelas: 5 }),
    ).rejects.toMatchObject({ codigo: 'nao-encontrado' })
  })

  it('deslogado não vê ninguém', async () => {
    await criarJogador(db, { nome: 'Ana', estrelas: 5 })
    expect(await listarJogadores(clienteDeslogado())).toEqual([])
  })
})
