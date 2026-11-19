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
