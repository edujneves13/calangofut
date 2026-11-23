import { normalizarNome } from './normalizar'
import type { Jogador } from './tipos'

export type ResultadoCasamento =
  | { tipo: 'exato'; jogador: Jogador }
  | { tipo: 'sugestoes'; sugestoes: Jogador[] }

const MAX_SUGESTOES = 3
/** Abaixo disso, letras parecidas não bastam para sugerir ("Léo" não é "Clecio"). */
const NOTA_MINIMA = 0.7
/** Nome contido no outro, no meio ou no fim: "Junior" em "Adelson Júnior". */
const NOTA_CONTIDO = 0.8
/** Nome que é o começo do outro: "Eduardo" em "Eduardo Lucas". */
const NOTA_COMECO = 0.9

/**
 * Procura o jogador do cadastro com esse nome ou apelido. Casa sozinho em dois casos:
 * igualdade exata e única, ou o nome é o começo do nome de um jogador só e nenhum outro tem
 * essas palavras ("Adelson" → Adelson Júnior). O resto vira sugestão para o admin confirmar.
 */
export function casarNome(texto: string, jogadores: Jogador[]): ResultadoCasamento {
  const alvo = normalizarNome(texto)
  const ativos = jogadores.filter((j) => j.ativo)

  const exatos = ativos.filter((j) => nomesDe(j).some((n) => normalizarNome(n) === alvo))
  if (exatos.length === 1) return { tipo: 'exato', jogador: exatos[0]! }
  if (exatos.length > 1) return { tipo: 'sugestoes', sugestoes: exatos }

  const unico = comecoUnico(palavras(texto), ativos)
  if (unico) return { tipo: 'exato', jogador: unico }

  const sugestoes = ativos
    .map((jogador) => ({ jogador, nota: Math.max(...nomesDe(jogador).map((n) => similaridade(alvo, n))) }))
    .filter((s) => s.nota >= NOTA_MINIMA)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, MAX_SUGESTOES)
    .map((s) => s.jogador)

  return { tipo: 'sugestoes', sugestoes }
}

const nomesDe = (j: Jogador) => [j.nome, ...j.apelidos]

/** Palavras do nome, sem o que vem entre parênteses: "Vinicius (Adelson)" → ["vinicius"]. */
const palavras = (nome: string) => normalizarNome(nome.replace(/\([^)]*\)/g, ' ')).split(' ').filter(Boolean)

const contem = (longo: string[], curto: string[]) => curto.every((p) => longo.includes(p))
const comecaCom = (longo: string[], curto: string[]) => curto.every((p, i) => longo[i] === p)

/**
 * O jogador cujo nome (ou apelido) começa com essas palavras, quando é o único ativo que tem
 * todas elas em algum lugar do nome. "Junior" não casa se existem Júnior Kblinho e Adelson Júnior.
 */
function comecoUnico(alvo: string[], ativos: Jogador[]): Jogador | null {
  if (alvo.length === 0) return null
  const comAsPalavras = ativos.filter((j) => nomesDe(j).some((n) => contem(palavras(n), alvo)))
  if (comAsPalavras.length !== 1) return null
  const [jogador] = comAsPalavras
  return nomesDe(jogador!).some((n) => comecaCom(palavras(n), alvo)) ? jogador! : null
}

/**
 * Sugestão que dá para aceitar sem o admin olhar ("Ignorar tudo"): nome contido no outro ou
 * erro de digitação. Só algumas letras parecidas não basta.
 */
export function sugestaoForte(texto: string, jogador: Jogador): boolean {
  return nomesDe(jogador).some((n) => similaridade(texto, n) >= NOTA_CONTIDO)
}

/** Quão parecidos são dois nomes, de 0 (nada) a 1 (iguais). */
export function similaridade(a: string, b: string): number {
  const x = normalizarNome(a)
  const y = normalizarNome(b)
  if (x === y) return 1
  if (!x || !y) return 0

  const porLetras = 1 - levenshtein(x, y) / Math.max(x.length, y.length)
  const [curto, longo] = x.length <= y.length ? [a, b] : [b, a]
  const pCurto = palavras(curto)
  const pLongo = palavras(longo)
  if (pCurto.length > 0 && comecaCom(pLongo, pCurto)) return Math.max(porLetras, NOTA_COMECO)
  if (pCurto.length > 0 && contem(pLongo, pCurto)) return Math.max(porLetras, NOTA_CONTIDO)
  return porLetras
}

/** Número mínimo de letras a trocar, inserir ou apagar para ir de a até b. */
function levenshtein(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const atual = [i]
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      atual[j] = Math.min(anterior[j]! + 1, atual[j - 1]! + 1, anterior[j - 1]! + custo)
    }
    anterior = atual
  }
  return anterior[b.length]!
}
