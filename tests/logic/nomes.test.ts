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

describe('lerNomes — lista copiada de planilha (número, nome e estrelas separados por tab)', () => {
  const lidos = lerNomes(fixture('lista-planilha.txt'))

  it('lê os 41 nomes, sem o número de ordem', () => {
    expect(lidos).toHaveLength(41)
    expect(lidos[0]).toEqual({ nome: 'Guilherme', goleiro: false, estrelas: 5 })
    expect(lidos.at(-1)).toEqual({ nome: 'Hagno', goleiro: false, estrelas: 2 })
  })

  it('as ⭐ de cada linha viram as estrelas do jogador', () => {
    const estrelasDe = (nome: string) => lidos.find((n) => n.nome === nome)?.estrelas
    expect(estrelasDe('Leandro Costa')).toBe(4)
    expect(estrelasDe('Paulo')).toBe(3)
    expect(estrelasDe('Clecio')).toBe(2)
  })

  it('parênteses saem do nome, como na lista do WhatsApp', () => {
    expect(lidos.some((n) => n.nome === 'Vinicius')).toBe(true)
  })

  it('sem coluna de estrelas, o nome entra sem estrelas', () => {
    expect(lerNomes('1\tAna\n2\tBia')).toEqual([
      { nome: 'Ana', goleiro: false },
      { nome: 'Bia', goleiro: false },
    ])
  })

  it('na lista do WhatsApp a ⭐ é mensalista, não estrela', () => {
    expect(lerNomes('1- Ana ⭐✅')).toEqual([{ nome: 'Ana', goleiro: false }])
  })
})

describe('lerNomes — leitor abrangente', () => {
  const lidos = (texto: string) => lerNomes(texto).map(({ nome, estrelas, goleiro }) => [nome, estrelas ?? 0, goleiro])

  it('numeração com espaço, º, travessão, # e emoji 1️⃣', () => {
    expect(nomes('1 Ana\n2º Bia\n3 — Caio\n#4 Duda\n5️⃣ Edu\n06 - Fabi')).toEqual(['Ana', 'Bia', 'Caio', 'Duda', 'Edu', 'Fabi'])
  })

  it('outros marcadores de lista', () => {
    expect(nomes('· Ana\n▪ Bia\n◦ Caio\n→ Duda\n> Edu')).toEqual(['Ana', 'Bia', 'Caio', 'Duda', 'Edu'])
  })

  it('estrelas escritas de vários jeitos', () => {
    expect(lidos('Ana ⭐⭐⭐⭐\nBia ★★\nCaio - 5\nDuda 3 estrelas\nEdu (4)\nFabi 2⭐\nGabi: 1 estrela\nHugo 4\nIvo nota 3')).toEqual([
      ['Ana', 4, false],
      ['Bia', 2, false],
      ['Caio', 5, false],
      ['Duda', 3, false],
      ['Edu', 4, false],
      ['Fabi', 2, false],
      ['Gabi', 1, false],
      ['Hugo', 4, false],
      ['Ivo', 3, false],
    ])
  })

  it('estrelas vazias (☆) não contam', () => {
    expect(lidos('Ana ★★★☆☆')).toEqual([['Ana', 3, false]])
  })

  it('nota em vírgula ou ponto e vírgula, estilo planilha', () => {
    expect(lidos('Ana, 4\nBia;2')).toEqual([
      ['Ana', 4, false],
      ['Bia', 2, false],
    ])
  })

  it('vários nomes com estrelas na mesma linha', () => {
    expect(lidos('Ana 4 estrelas, Bia 3 estrelas e Caio ⭐⭐')).toEqual([
      ['Ana', 4, false],
      ['Bia', 3, false],
      ['Caio', 2, false],
    ])
  })

  it('goleiro marcado na própria linha', () => {
    expect(lidos('Ana (goleiro)\nBia - goleira\nCaio 🧤\nDuda GK\nEdu\tGoleiro\t⭐⭐⭐')).toEqual([
      ['Ana', 0, true],
      ['Bia', 0, true],
      ['Caio', 0, true],
      ['Duda', 0, true],
      ['Edu', 3, true],
    ])
  })

  it('planilha: cabeçalho e colunas extras não viram nome', () => {
    expect(lidos('#\tNome\tEstrelas\tPosição\n1\tAna\t4\tZagueira\n2\tBia\t⭐⭐\tAtacante')).toEqual([
      ['Ana', 4, false],
      ['Bia', 2, false],
    ])
  })

  it('planilha com ponto e vírgula (CSV)', () => {
    expect(lidos('Nome;Estrelas\nAna;5\nBia;3')).toEqual([
      ['Ana', 5, false],
      ['Bia', 3, false],
    ])
  })

  it('nota fora de 1 a 5 não vira estrela e a linha some como cabeçalho', () => {
    expect(nomes('Valor: R$ 12,50\nPix 8\nAna')).toEqual(['Ana'])
  })

  it('número sozinho na linha não vira nome', () => {
    expect(nomes('1\n2\nAna')).toEqual(['Ana'])
  })

  it('repetido fica com a primeira leitura', () => {
    expect(lidos('Ana 4\nana 2')).toEqual([['Ana', 4, false]])
  })
})
