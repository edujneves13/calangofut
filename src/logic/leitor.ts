import { normalizarNome } from './normalizar'
import type { Estrelas } from './tipos'

export interface LinhaLida {
  nome: string
  /** Só quando a lista traz a nota: "⭐⭐⭐⭐", "Ana - 4", "Ana 4 estrelas", coluna de planilha. */
  estrelas?: Estrelas
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
/** Emoji de número: 1️⃣, 2️⃣… */
const TECLA = /\d\uFE0F?\u20E3/gu
const PARENTESES = /\([^)]*\)/g
const SEPARADORES = /[,;]+|\s+e\s+/
/** "1-", "1.", "1)", "1 ", "1º", "#1", "01 -", ou marcador: - • * · ▪ ◦ → > */
const MARCADOR = /^\s*(?:#?\d{1,3}\s*[º°ª]?\s*[-–—.)]?|[-–—•*·▪◦→>])\s*/u
const ESTRELAS = /[⭐★]/gu
/** Jeitos de escrever a nota, do mais claro ao mais solto. O número só vale de 1 a 5. */
const NOTAS = [
  /(\d)\s*(?:estrelas?\b|[⭐★])/iu,
  /\bnota\s*(\d)\b/iu,
  /\(\s*(\d)\s*\)/u,
  /(?:^|\s)[-–—=]\s*(\d)\s*$/u,
  /\s(\d)\s*$/u,
]
const GOLEIRO = /\(\s*(?:goleir[oa]|gol|gk)\s*\)|\b(?:goleir[oa]|gk)\b|🧤/giu
/** Cabeçalho de planilha: "#, Nome, Estrelas, Posição". */
const CABECALHO = new Set(['nome', 'nomes', 'jogador', 'jogadores', 'estrela', 'estrelas', 'nota', 'nivel', 'posicao', 'gol'])
const MINUSCULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

interface Lido extends LinhaLida {
  goleiro: boolean
}

/**
 * Lê a lista colada (do WhatsApp, de planilha ou digitada) em qualquer formato: numerada, solta,
 * com marcador, vários nomes por linha, colunas com tab ou texto ditado. Lê também a nota
 * (estrelas) e "goleiro" quando aparecem na linha. Para em "Lista de espera"; depois de
 * "Goleiros" é goleiro. Quem tem ❌ em alguma linha sai da lista.
 * `hoje` (YYYY-MM-DD) dá o ano quando a data vem sem ele.
 */
export function lerLista(texto: string, hoje?: string): ListaLida {
  const linhas = texto.split(/\r?\n/)
  // A lista do WhatsApp tem um cabeçalho longo (horário, Pix, legenda) antes de "Lista de Presença".
  const inicio = linhas.findIndex((l) => tituloDe(l).startsWith('lista de presenca'))
  const jogadores: LinhaLida[] = []
  const goleiros: LinhaLida[] = []
  const cortados = new Set<string>()
  let secao: 'linha' | 'goleiros' = 'linha'

  for (let linha of linhas.slice(inicio + 1)) {
    const titulo = tituloDe(linha)
    if (titulo.startsWith('lista de espera')) break
    if (titulo.startsWith('goleiros')) {
      secao = 'goleiros'
      // "Goleiros: Caio, Duda" traz os nomes na mesma linha.
      const depois = linha.indexOf(':')
      if (depois < 0) continue
      linha = linha.slice(depois + 1)
    }

    const lidos = lerLinha(linha)
    if (linha.includes('❌')) lidos.forEach((l) => cortados.add(normalizarNome(l.nome)))
    else
      for (const { goleiro, ...l } of lidos) (goleiro || secao === 'goleiros' ? goleiros : jogadores).push(l)
  }

  const vistos = new Set(cortados)
  const unicos = (lidos: LinhaLida[]) =>
    lidos.filter((l) => {
      const chave = normalizarNome(l.nome)
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })

  return { data: lerData(texto, hoje), jogadores: unicos(jogadores), goleiros: unicos(goleiros) }
}

const tituloDe = (linha: string) => normalizarNome(linha.replace(EMOJIS, '').replace(/[:\s]+$/, ''))

/**
 * Uma linha vira zero ou mais nomes. Com tab, é linha de planilha: cada coluna é um pedaço e só a
 * primeira coluna com nome conta. Sem tab, os pedaços são os nomes separados por vírgula, ";" ou "e".
 * Pedaço só com nota ou "goleiro" ("Ana, 4", coluna "⭐⭐⭐") vale para o nome anterior.
 */
function lerLinha(linha: string): Lido[] {
  const planilha = linha.includes('\t')
  const semTecla = linha.replace(TECLA, ' ')
  const pedacos = planilha ? semTecla.split('\t') : semTecla.replace(MARCADOR, '').split(SEPARADORES)
  const lidos: Lido[] = []
  let atual: Lido | null = null

  for (const pedaco of pedacos) {
    const { resto, estrelas, goleiro } = extrairMarcas(pedaco, planilha)
    const numero = /^\s*(\d+)\s*$/.exec(resto)
    let nome = ''
    if (!numero && pareceNome(resto, estrelas !== undefined || goleiro)) nome = limparNome(resto)
    if (nome && CABECALHO.has(normalizarNome(nome))) continue

    if (nome && !(planilha && atual)) {
      atual = { nome, goleiro, ...(estrelas && { estrelas }) }
      lidos.push(atual)
    } else if (atual && (nome || numero || estrelas || goleiro)) {
      // Coluna ou pedaço que completa o nome anterior.
      const nota = estrelas ?? (numero ? comoNota(numero[1]!) : undefined)
      if (nota && atual.estrelas === undefined) atual.estrelas = nota
      if (goleiro) atual.goleiro = true
    }
  }
  return lidos
}

/** Tira do pedaço a nota e o "goleiro", devolvendo o que sobra para ser o nome. */
function extrairMarcas(pedaco: string, planilha: boolean) {
  let resto = pedaco
  let estrelas: Estrelas | undefined
  for (const padrao of NOTAS) {
    const m = padrao.exec(resto)
    if (!m) continue
    estrelas = comoNota(m[1]!)
    if (estrelas) resto = resto.replace(m[0], ' ')
    break
  }
  // Na lista do WhatsApp uma ⭐ sozinha quer dizer mensalista; nota é com duas ou mais, ou em planilha.
  const quantas = resto.match(ESTRELAS)?.length ?? 0
  if (estrelas === undefined && (quantas >= 2 || (planilha && quantas >= 1))) estrelas = comoNota(String(Math.min(quantas, 5)))
  resto = resto.replace(ESTRELAS, ' ').replace(/☆/g, ' ')

  let goleiro = false
  resto = resto.replace(GOLEIRO, () => {
    goleiro = true
    return ' '
  })
  if (planilha && /^\s*gol\s*$/i.test(resto)) {
    goleiro = true
    resto = ''
  }
  return { resto, estrelas, goleiro }
}

function comoNota(texto: string): Estrelas | undefined {
  const n = Number(texto)
  return n >= 1 && n <= 5 ? (n as Estrelas) : undefined
}

/**
 * Cabeçalho não vira nome: pedaço com data, horário, valor ou "Rótulo: valor".
 * Dois-pontos no fim só passa quando a nota veio depois ("Gabi: 1 estrela").
 */
function pareceNome(resto: string, temMarca: boolean): boolean {
  const texto = resto.replace(PARENTESES, ' ').trim()
  if (/\d/.test(texto)) return false
  return !texto.includes(':') || (temMarca && texto.indexOf(':') === texto.length - 1)
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

export interface NomeLido extends LinhaLida {
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
    ...lista.jogadores.map((j) => ({ ...j, goleiro: false })),
    ...lista.goleiros.map((g) => ({ ...g, goleiro: true })),
  ]
}

function limparNome(parte: string): string {
  const nome = parte
    .replace(PARENTESES, ' ')
    .replace(EMOJIS, ' ')
    .replace(/[^\p{L}\p{N}'\s.-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.'-]+|[\s.'-]+$/g, '')
  return nome === nome.toLowerCase() ? capitalizar(nome) : nome
}

/** Ditado costuma vir todo em minúsculas: "joão da silva" → "João da Silva". */
function capitalizar(nome: string): string {
  return nome
    .split(' ')
    .map((p) => (MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}
