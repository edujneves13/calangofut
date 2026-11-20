import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../../src/data/cliente'
import {
  adicionarApelido,
  atualizarJogador,
  criarJogador,
  criarJogadores,
  desativarJogador,
  desativarJogadores,
  listarJogadores,
  removerApelido,
} from '../../src/data/jogadores'
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
    expect(ana).toMatchObject({ nome: 'Ana Souza', apelidos: [], estrelas: 4, tipo: 'diarista', goleiro: false, ativo: true })
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

describe('apelidos', () => {
  it('lista o jogador com os apelidos, em ordem', async () => {
    const kaua = await criarJogador(db, { nome: 'Kauã Ferreira', estrelas: 4 })
    await adicionarApelido(db, kaua.id, ' Kaká ')
    await adicionarApelido(db, kaua.id, 'KF')
    expect((await listarJogadores(db))[0]!.apelidos).toEqual(['Kaká', 'KF'])
  })

  it('o mesmo apelido em dois jogadores dá erro apelido-duplicado', async () => {
    const a = await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    const b = await criarJogador(db, { nome: 'Bia', estrelas: 3 })
    await adicionarApelido(db, a.id, 'Baixinha')
    await expect(adicionarApelido(db, b.id, 'baixínha')).rejects.toMatchObject({ codigo: 'apelido-duplicado' })
  })

  it('remove apelido', async () => {
    const ana = await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    await adicionarApelido(db, ana.id, 'Aninha')
    await removerApelido(db, ana.id, 'Aninha')
    expect((await listarJogadores(db))[0]!.apelidos).toEqual([])
  })

  it('atualizar o jogador devolve os apelidos junto', async () => {
    const ana = await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    await adicionarApelido(db, ana.id, 'Aninha')
    expect((await atualizarJogador(db, ana.id, { estrelas: 4 })).apelidos).toEqual(['Aninha'])
  })
})

describe('em lote', () => {
  it('cria vários de uma vez, tirando espaços', async () => {
    const novos = await criarJogadores(db, [
      { nome: ' Ana ', estrelas: 4 },
      { nome: 'Richard', estrelas: 3, goleiro: true },
    ])
    expect(novos.map((j) => [j.nome, j.estrelas, j.goleiro])).toEqual([
      ['Ana', 4, false],
      ['Richard', 3, true],
    ])
    expect(await listarJogadores(db)).toHaveLength(2)
  })

  it('lista vazia não faz nada', async () => {
    expect(await criarJogadores(db, [])).toEqual([])
  })

  it('se um nome já existe, ninguém do lote é criado', async () => {
    await criarJogador(db, { nome: 'Ana', estrelas: 3 })
    await expect(
      criarJogadores(db, [
        { nome: 'Bia', estrelas: 3 },
        { nome: 'ana', estrelas: 2 },
      ]),
    ).rejects.toMatchObject({ codigo: 'nome-duplicado' })
    expect((await listarJogadores(db)).map((j) => j.nome)).toEqual(['Ana'])
  })

  it('"Excluir" vários: desativa, e eles continuam no filtro de inativos', async () => {
    const [a, b, c] = await criarJogadores(db, [
      { nome: 'Ana', estrelas: 3 },
      { nome: 'Bia', estrelas: 3 },
      { nome: 'Caio', estrelas: 3 },
    ])
    await desativarJogadores(db, [a!.id, b!.id])
    expect((await listarJogadores(db)).map((j) => j.id)).toEqual([c!.id])
    expect(await listarJogadores(db, { incluirInativos: true })).toHaveLength(3)
  })
})
