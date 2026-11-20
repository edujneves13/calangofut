import { describe, expect, it } from 'vitest'
import { lerNomes } from '../../src/logic/leitor'
import { fixture } from './fixtures'

const nomes = (texto: string) => lerNomes(texto).map((n) => n.nome)

describe('lerNomes — adicionar vários jogadores de uma vez', () => {
  it('lista do WhatsApp: usa o leitor da lista e marca os goleiros', () => {
    const lidos = lerNomes(fixture('lista-2026-11-18.txt'))
    expect(lidos).toHaveLength(27)
    expect(lidos[0]).toEqual({ nome: 'Juninho', goleiro: false })
    expect(lidos.filter((n) => n.goleiro).map((n) => n.nome)).toEqual(['Renan Araujo', 'Richard'])
  })

  it('nomes separados por vírgula', () => {
    expect(nomes('Pedro, João Vitor,Maria ,  Léo')).toEqual(['Pedro', 'João Vitor', 'Maria', 'Léo'])
  })

  it('um nome por linha, com numeração e marcadores', () => {
    expect(nomes('1. Pedro\n2) Maria\n- Léo\n• Ana\n\n')).toEqual(['Pedro', 'Maria', 'Léo', 'Ana'])
  })

  it('texto ditado: "e" separa o último nome', () => {
    expect(nomes('Pedro, João e Maria')).toEqual(['Pedro', 'João', 'Maria'])
  })

  it('ditado todo em minúsculas ganha maiúscula no começo de cada nome', () => {
    expect(nomes('pedro henrique, joão da silva')).toEqual(['Pedro Henrique', 'João da Silva'])
  })

  it('não mexe em nome já escrito com maiúscula', () => {
    expect(nomes('JP, McLaren')).toEqual(['JP', 'McLaren'])
  })

  it('tira emojis e repetidos (ignorando acento e maiúsculas)', () => {
    expect(nomes('Léo ⭐, leo, Ana ✅; Ana')).toEqual(['Léo', 'Ana'])
  })

  it('texto vazio ou só pontuação devolve nada', () => {
    expect(lerNomes('  , ; \n ')).toEqual([])
  })
})
