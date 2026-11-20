import { describe, expect, it } from 'vitest'
import { buscarJogadores, trechoEncontrado } from '../../src/logic/busca'
import { lerLista } from '../../src/logic/leitor'
import { fixture } from './fixtures'

describe('trechoEncontrado', () => {
  it('acha sem diferenciar acento nem maiúscula e devolve a posição no nome original', () => {
    expect(trechoEncontrado('João Vitor', 'joao')).toEqual({ inicio: 0, fim: 4 })
    expect(trechoEncontrado('Stênio', 'TEN')).toEqual({ inicio: 1, fim: 4 })
    expect(trechoEncontrado('Márcio', 'arci')).toEqual({ inicio: 1, fim: 5 })
  })

  it('busca com acento também acha nome sem acento', () => {
    expect(trechoEncontrado('Leo', 'léo')).toEqual({ inicio: 0, fim: 3 })
  })

  it('acha no meio de nome composto', () => {
    expect(trechoEncontrado('Eduardo Lucas', 'luc')).toEqual({ inicio: 8, fim: 11 })
  })

  it('não achou: null; busca vazia: null', () => {
    expect(trechoEncontrado('Hugo', 'xx')).toBeNull()
    expect(trechoEncontrado('Hugo', '   ')).toBeNull()
  })
})

describe('buscarJogadores', () => {
  const jogadores = lerLista(fixture('lista-2026-11-18.txt')).jogadores.map((j) => ({ id: j.nome, nome: j.nome }))

  it('filtra pelos nomes reais da lista, ignorando acento', () => {
    const r = buscarJogadores(jogadores, 'joao')
    expect(r.map((x) => x.jogador.nome)).toEqual(['João Vitor'])
    expect(r[0]!.trecho).toEqual({ inicio: 0, fim: 4 })
  })

  it('"edu" acha os dois Eduardos, na ordem da lista', () => {
    expect(buscarJogadores(jogadores, 'edu').map((x) => x.jogador.nome)).toEqual(['Eduardo', 'Eduardo Lucas'])
  })

  it('acha pelo apelido; aí não há trecho para destacar no nome', () => {
    const r = buscarJogadores([{ id: '1', nome: 'Márcio', apelidos: ['Marcinho'] }], 'marcinho')
    expect(r).toEqual([{ jogador: { id: '1', nome: 'Márcio', apelidos: ['Marcinho'] }, trecho: null }])
  })

  it('busca vazia devolve todos', () => {
    expect(buscarJogadores(jogadores, '')).toHaveLength(jogadores.length)
  })
})
