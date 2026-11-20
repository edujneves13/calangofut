import { describe, expect, it } from 'vitest'
import { contarEncontrados, lerLista } from '../../src/logic/leitor'
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

  it('ignora o cabeçalho (horário, endereço, legenda)', () => {
    const nomes = lista.jogadores.map((j) => j.nome)
    expect(nomes.some((n) => /pago|legenda|pix|colibris/i.test(n))).toBe(false)
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

  it('lê 19 jogadores de linha (Kauã tem ❌ e fica de fora)', () => {
    expect(lista.jogadores).toHaveLength(19)
    expect(lista.data).toBe('2026-11-11')
  })

  it('jogador com ❌ não entra na lista', () => {
    expect(lista.jogadores.some((j) => j.nome === 'Kauã')).toBe(false)
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

  it('jogador pendente (⚠️) entra', () => {
    expect(lerLista('1- Ana ⚠️').jogadores).toEqual([{ nome: 'Ana' }])
  })

  it('texto sem data retorna data nula', () => {
    expect(lerLista('sem data').data).toBeNull()
  })

  it('texto vazio não quebra', () => {
    expect(lerLista('')).toEqual({ data: null, jogadores: [], goleiros: [] })
  })
})

describe('lerLista — lista bagunçada (qualquer formato)', () => {
  const lista = lerLista(fixture('lista-baguncada.txt'), '2026-11-20')

  it('lê numeradas, soltas, com marcador e vários nomes na mesma linha', () => {
    expect(lista.jogadores.map((j) => j.nome)).toEqual(['Juninho', 'Hugo', 'Arllen', 'Stênio', 'Derik', 'Yhan', 'Josué'])
  })

  it('❌ tira a pessoa da lista, mesmo que ela apareça antes sem ❌', () => {
    expect(lista.jogadores.some((j) => j.nome === 'Leandro')).toBe(false)
  })

  it('goleiros depois de "Goleiros" e lista de espera ignorada', () => {
    expect(lista.goleiros.map((g) => g.nome)).toEqual(['Márcio'])
  })

  it('a linha com data não vira nome, mas a data é lida (ano de hoje)', () => {
    expect(lista.data).toBe('2026-11-25')
  })
})

describe('lerLista — formatos soltos', () => {
  const nomes = (texto: string) => lerLista(texto).jogadores.map((j) => j.nome)

  it('aceita 1- 1. e 1)', () => {
    expect(nomes('1- Ana\n2. Bia\n3) Caio')).toEqual(['Ana', 'Bia', 'Caio'])
  })

  it('texto ditado', () => {
    expect(nomes('pedro, joão e maria')).toEqual(['Pedro', 'João', 'Maria'])
  })

  it('nomes repetidos entram uma vez só', () => {
    expect(nomes('Léo\nleo\n1- Léo ✅')).toEqual(['Léo'])
  })

  it('linhas de cabeçalho com horário, valor ou dois-pontos não viram nome', () => {
    expect(nomes('⏰ 20:30h às 22:00h\nValor: R$ 12,50\nLista:\nAna')).toEqual(['Ana'])
  })

  it('data com ano de dois dígitos', () => {
    expect(lerLista('Pelada 25/11/26\nAna').data).toBe('2026-11-25')
  })

  it('sem data de referência, usa o ano atual', () => {
    expect(lerLista('25/11\nAna').data).toBe(`${new Date().getFullYear()}-11-25`)
  })
})

describe('contarEncontrados', () => {
  it('texto da contagem em tempo real', () => {
    expect(contarEncontrados(lerLista('Ana, Bia\nGoleiros\nCaio'))).toBe('2 jogadores e 1 goleiro encontrados')
    expect(contarEncontrados(lerLista('Ana'))).toBe('1 jogador encontrado')
    expect(contarEncontrados(lerLista('Ana\nGoleiros\nCaio\nDudu'))).toBe('1 jogador e 2 goleiros encontrados')
    expect(contarEncontrados(lerLista('Goleiros\nCaio'))).toBe('1 goleiro encontrado')
    expect(contarEncontrados(lerLista(''))).toBeNull()
  })
})
