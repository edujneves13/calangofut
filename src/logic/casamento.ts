import { normalizarNome } from './normalizar'
import type { Jogador } from './tipos'

export type ResultadoCasamento =
  | { tipo: 'exato'; jogador: Jogador }
  | { tipo: 'sugestoes'; sugestoes: Jogador[] }

const MAX_SUGESTOES = 3
const NOTA_MINIMA = 0.5
const NOTA_CONTIDO = 0.8

/**
 * Procura o jogador do cadastro com esse nome ou apelido.
 * Só casa sozinho com igualdade exata e única; o resto vira sugestão para o admin confirmar.
 */
export function casarNome(texto: string, jogadores: Jogador[]): ResultadoCasamento {
  const alvo = normalizarNome(texto)
  const ativos = jogadores.filter((j) => j.ativo)

  const exatos = ativos.filter((j) => nomesDe(j).some((n) => normalizarNome(n) === alvo))
  if (exatos.length === 1) return { tipo: 'exato', jogador: exatos[0]! }
  if (exatos.length > 1) return { tipo: 'sugestoes', sugestoes: exatos }

  const sugestoes = ativos
    .map((jogador) => ({ jogador, nota: Math.max(...nomesDe(jogador).map((n) => similaridade(alvo, n))) }))
    .filter((s) => s.nota >= NOTA_MINIMA)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, MAX_SUGESTOES)
    .map((s) => s.jogador)

  return { tipo: 'sugestoes', sugestoes }
}

const nomesDe = (j: Jogador) => [j.nome, ...j.apelidos]

/** Quão parecidos são dois nomes, de 0 (nada) a 1 (iguais). */
export function similaridade(a: string, b: string): number {
  const x = normalizarNome(a)
  const y = normalizarNome(b)
  if (x === y) return 1
  if (!x || !y) return 0

  const porLetras = 1 - levenshtein(x, y) / Math.max(x.length, y.length)
  const [curto, longo] = x.length <= y.length ? [x, y] : [y, x]
  const palavrasLongo = longo.split(' ')
  const contido = curto.split(' ').every((p) => palavrasLongo.includes(p))
  return contido ? Math.max(porLetras, NOTA_CONTIDO) : porLetras
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
