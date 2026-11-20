import { normalizarNome } from './normalizar'

export interface LinhaLida {
  nome: string
  presente: boolean
}

export interface ListaLida {
  /** Data da pelada no formato YYYY-MM-DD, se aparecer no texto. */
  data: string | null
  jogadores: LinhaLida[]
  goleiros: LinhaLida[]
}

const LINHA_NUMERADA = /^\s*\d+\s*[-–.)]\s*(.*)$/
const DATA = /(\d{1,2})\/(\d{1,2})\/(\d{4})/
const EMOJIS = /[\p{Extended_Pictographic}️‍]/gu
const PARENTESES = /\([^)]*\)/g

/** Lê o texto da lista colado do WhatsApp. */
export function lerLista(texto: string): ListaLida {
  const jogadores: LinhaLida[] = []
  const goleiros: LinhaLida[] = []
  let secao: 'linha' | 'goleiros' = 'linha'

  for (const linha of texto.split(/\r?\n/)) {
    const titulo = normalizarNome(linha.replace(EMOJIS, ''))
    if (titulo.startsWith('lista de espera')) break
    if (titulo.startsWith('goleiros')) {
      secao = 'goleiros'
      continue
    }

    const numerada = LINHA_NUMERADA.exec(linha)
    if (!numerada) continue

    const resto = numerada[1] ?? ''
    const nome = resto.replace(PARENTESES, ' ').replace(EMOJIS, ' ').replace(/\s+/g, ' ').trim()
    if (!nome) continue

    const lida = { nome, presente: !resto.includes('❌') }
    if (secao === 'goleiros') goleiros.push(lida)
    else jogadores.push(lida)
  }

  return { data: lerData(texto), jogadores, goleiros }
}

function lerData(texto: string): string | null {
  const m = DATA.exec(texto)
  if (!m) return null
  const [, dia, mes, ano] = m
  return `${ano}-${mes!.padStart(2, '0')}-${dia!.padStart(2, '0')}`
}

export interface NomeLido {
  nome: string
  goleiro: boolean
}

const SEPARADORES = /[\n,;]+|\s+e\s+/
const MARCADOR = /^\s*(?:\d+\s*[-–.)]|[-–•*])\s*/
const MINUSCULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/**
 * Lê nomes para cadastrar vários jogadores de uma vez.
 * Aceita a lista do WhatsApp, nomes separados por vírgula ou um por linha,
 * ou texto ditado pelo microfone do teclado ("Pedro, João e Maria").
 */
export function lerNomes(texto: string): NomeLido[] {
  const lista = lerLista(texto)
  // A lista do WhatsApp sempre tem a data no cabeçalho (ou a seção de goleiros).
  const ehListaDoWhatsApp = lista.data !== null || lista.goleiros.length > 0
  const lidos: NomeLido[] =
    ehListaDoWhatsApp
      ? [
          ...lista.jogadores.map((j) => ({ nome: j.nome, goleiro: false })),
          ...lista.goleiros.map((g) => ({ nome: g.nome, goleiro: true })),
        ]
      : texto.split(SEPARADORES).map((parte) => ({ nome: limparNome(parte), goleiro: false }))

  const vistos = new Set<string>()
  return lidos.filter(({ nome }) => {
    const chave = normalizarNome(nome)
    if (!chave || vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
}

function limparNome(parte: string): string {
  const nome = parte
    .replace(MARCADOR, '')
    .replace(PARENTESES, ' ')
    .replace(EMOJIS, ' ')
    .replace(/[^\p{L}\p{N}'\s.-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return nome === nome.toLowerCase() ? capitalizar(nome) : nome
}

/** Ditado costuma vir todo em minúsculas: "joão da silva" → "João da Silva". */
function capitalizar(nome: string): string {
  return nome
    .split(' ')
    .map((p) => (MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}
