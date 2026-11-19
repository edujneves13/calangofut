import { describe, expect, it } from 'vitest'
import { lerLista } from '../../src/logic/leitor'
import { fixture } from './fixtures'

const texto18 = fixture('lista-2026-11-18.txt')
const texto11 = fixture('lista-2026-11-11.txt')

describe('lerLista — fixture 18/11', () => {
  const lista = lerLista(texto18)

  it('lê a data do cabeçalho', () => {
    expect(lista.data).toBe('2026-11-18')
  })

  it('lê os 25 jogadores de linha, sem números, emojis e parênteses', () => {
    expect(lista.jogadores.map((j) => j.nome)).toEqual([
      'Juninho', 'Márcio', 'Eduardo', 'Josué', 'Rafael', 'Derik', 'Fabiano', 'Yhan',
      'Hugo', 'Junior', 'Herlly', 'Cleyton', 'Léo', 'Arllen', 'Leandro', 'Adelson',
      'Eduardo Lucas', 'Matheus Rei', 'João Vitor', 'Guilherme', 'Paulinho', 'Jackson',
      'Murilo', 'Pedro', 'Stênio',
    ])
  })

  it('todos pagos entram como presentes', () => {
    expect(lista.jogadores.every((j) => j.presente)).toBe(true)
  })

  it('separa os goleiros e ignora numeração vazia', () => {
    expect(lista.goleiros.map((g) => g.nome)).toEqual(['Renan Araujo', 'Richard'])
  })

  it('ignora a lista de espera', () => {
    const nomes = [...lista.jogadores, ...lista.goleiros].map((j) => j.nome)
    expect(nomes.some((n) => n.startsWith('Renê') || n === 'Mago')).toBe(false)
  })
})

describe('lerLista — fixture 11/11', () => {
  const lista = lerLista(texto11)

  it('lê 20 jogadores de linha', () => {
    expect(lista.jogadores).toHaveLength(20)
    expect(lista.data).toBe('2026-11-11')
  })

  it('jogador com ❌ entra como ausente', () => {
    expect(lista.jogadores.find((j) => j.nome === 'Kauã')).toEqual({ nome: 'Kauã', presente: false })
    expect(lista.jogadores.filter((j) => !j.presente)).toHaveLength(1)
  })

  it('seção de goleiros vazia', () => {
    expect(lista.goleiros).toEqual([])
  })

  it('ignora a lista de espera', () => {
    expect(lista.jogadores.some((j) => j.nome === 'Thiago')).toBe(false)
  })
})

describe('lerLista — variações de texto colado', () => {
  it('quebras de linha do Windows (\\r\\n) dão o mesmo resultado', () => {
    expect(lerLista(texto18.replace(/\n/g, '\r\n'))).toEqual(lerLista(texto18))
  })

  it('funciona sem o cabeçalho "Lista de Presença" e com espaços extras', () => {
    const lista = lerLista('1- Ana ✅\n2-   Bia   ⭐✅\nGoleiros\n1- Caio')
    expect(lista.jogadores.map((j) => j.nome)).toEqual(['Ana', 'Bia'])
    expect(lista.goleiros.map((g) => g.nome)).toEqual(['Caio'])
  })

  it('jogador pendente (⚠️) entra como presente', () => {
    expect(lerLista('1- Ana ⚠️').jogadores[0]).toEqual({ nome: 'Ana', presente: true })
  })

  it('texto sem data retorna data nula', () => {
    expect(lerLista('sem data').data).toBeNull()
  })

  it('texto vazio não quebra', () => {
    expect(lerLista('')).toEqual({ data: null, jogadores: [], goleiros: [] })
  })
})
