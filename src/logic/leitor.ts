import { normalizarNome } from './normalizar'

export interface LinhaLida {
  nome: string
}

export interface ListaLida {
  /** Data da pelada no formato YYYY-MM-DD, se aparecer no texto. */
  data: string | null
  jogadores: LinhaLida[]
  goleiros: LinhaLida[]
}

/** dd/mm, dd/mm/aa ou dd/mm/aaaa. */
const DATA = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/
const EMOJIS = /[\p{Extended_Pictographic}\uFE0F\u200D]/gu
const PARENTESES = /\([^)]*\)/g
const SEPARADORES = /[,;]+|\s+e\s+/
const MARCADOR = /^\s*(?:\d+\s*[-–.)]|[-–•*])\s*/
const MINUSCULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/**
 * Lê a lista colada (do WhatsApp ou digitada) em qualquer formato: numerada, solta, com marcador,
 * vários nomes por linha ou texto ditado. Para em "Lista de espera"; depois de "Goleiros" é goleiro.
 * Quem tem ❌ em alguma linha sai da lista. `hoje` (YYYY-MM-DD) dá o ano quando a data vem sem ele.
 */
export function lerLista(texto: string, hoje?: string): ListaLida {
  const linhas = texto.split(/\r?\n/)
  // A lista do WhatsApp tem um cabeçalho longo (horário, Pix, legenda) antes de "Lista de Presença".
  const inicio = linhas.findIndex((l) => tituloDe(l).startsWith('lista de presenca'))
  const jogadores: string[] = []
  const goleiros: string[] = []
  const cortados = new Set<string>()
  let secao: 'linha' | 'goleiros' = 'linha'

  for (const linha of linhas.slice(inicio + 1)) {
    const titulo = tituloDe(linha)
    if (titulo.startsWith('lista de espera')) break
    if (titulo.startsWith('goleiros')) {
      secao = 'goleiros'
      continue
    }
    if (!pareceNomes(linha)) continue

    const nomes = linha.replace(MARCADOR, '').split(SEPARADORES).map(limparNome).filter(Boolean)
    if (linha.includes('❌')) nomes.forEach((n) => cortados.add(normalizarNome(n)))
    else (secao === 'goleiros' ? goleiros : jogadores).push(...nomes)
  }

  const vistos = new Set(cortados)
  const unicos = (nomes: string[]) =>
    nomes.flatMap((nome) => {
      const chave = normalizarNome(nome)
      if (vistos.has(chave)) return []
      vistos.add(chave)
      return [{ nome }]
    })

  return { data: lerData(texto, hoje), jogadores: unicos(jogadores), goleiros: unicos(goleiros) }
}

const tituloDe = (linha: string) => normalizarNome(linha.replace(EMOJIS, '').replace(/[:\s]+$/, ''))

/** Cabeçalho não vira nome: linha com data, horário, valor ou "Rótulo: valor". */
function pareceNomes(linha: string): boolean {
  const resto = linha.replace(MARCADOR, '').replace(PARENTESES, ' ')
  return !resto.includes(':') && !/\d/.test(resto)
}

function lerData(texto: string, hoje?: string): string | null {
  const m = DATA.exec(texto)
  if (!m) return null
  const [, dia, mes, ano] = m
  const anoCompleto = !ano
    ? (hoje?.slice(0, 4) ?? String(new Date().getFullYear()))
    : ano.length === 2
      ? `20${ano}`
      : ano
  return `${anoCompleto}-${mes!.padStart(2, '0')}-${dia!.padStart(2, '0')}`
}

/** "9 jogadores e 1 goleiro encontrados", em tempo real abaixo da caixa. Ninguém: null. */
export function contarEncontrados({ jogadores, goleiros }: ListaLida): string | null {
  const partes = [
    jogadores.length > 0 && `${jogadores.length} ${jogadores.length === 1 ? 'jogador' : 'jogadores'}`,
    goleiros.length > 0 && `${goleiros.length} ${goleiros.length === 1 ? 'goleiro' : 'goleiros'}`,
  ].filter(Boolean)
  if (partes.length === 0) return null
  const total = jogadores.length + goleiros.length
  return `${partes.join(' e ')} ${total === 1 ? 'encontrado' : 'encontrados'}`
}

export interface NomeLido {
  nome: string
  goleiro: boolean
}

/**
 * Lê nomes para cadastrar vários jogadores de uma vez.
 * Aceita a lista do WhatsApp, nomes separados por vírgula ou um por linha,
 * ou texto ditado pelo microfone do teclado ("Pedro, João e Maria").
 */
export function lerNomes(texto: string): NomeLido[] {
  const lista = lerLista(texto)
  return [
    ...lista.jogadores.map((j) => ({ nome: j.nome, goleiro: false })),
    ...lista.goleiros.map((g) => ({ nome: g.nome, goleiro: true })),
  ]
}

function limparNome(parte: string): string {
  const nome = parte
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
