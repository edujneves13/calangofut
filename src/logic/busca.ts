import { normalizarNome } from './normalizar'

/** Posição do trecho encontrado no nome original: nome.slice(inicio, fim). */
export interface Trecho {
  inicio: number
  fim: number
}

/** Cada letra sem acento e minúscula, lembrando de qual posição do texto original ela veio. */
function semAcentoComPosicoes(texto: string): { texto: string; origem: number[] } {
  let saida = ''
  const origem: number[] = []
  for (let i = 0; i < texto.length; i++) {
    const limpo = texto[i]!.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    for (const c of limpo) {
      saida += c
      origem.push(i)
    }
  }
  return { texto: saida, origem }
}

/**
 * Onde a busca aparece no nome, sem diferenciar acento nem maiúscula ("joao" acha "João").
 * A posição é no nome original, para a tela destacar o trecho. null se não achou ou a busca está vazia.
 */
export function trechoEncontrado(nome: string, busca: string): Trecho | null {
  const q = normalizarNome(busca)
  if (!q) return null
  const { texto, origem } = semAcentoComPosicoes(nome)
  const i = texto.indexOf(q)
  if (i === -1) return null
  return { inicio: origem[i]!, fim: origem[i + q.length - 1]! + 1 }
}

export interface ResultadoBusca<J> {
  jogador: J
  /** null quando achou só pelo apelido. */
  trecho: Trecho | null
}

/** Filtra pelo nome ou apelido, mantendo a ordem recebida. Busca vazia devolve todos. */
export function buscarJogadores<J extends { nome: string; apelidos?: string[] }>(
  jogadores: J[],
  busca: string,
): ResultadoBusca<J>[] {
  if (!normalizarNome(busca)) return jogadores.map((jogador) => ({ jogador, trecho: null }))
  return jogadores.flatMap((jogador): ResultadoBusca<J>[] => {
    const trecho = trechoEncontrado(jogador.nome, busca)
    if (trecho) return [{ jogador, trecho }]
    const peloApelido = (jogador.apelidos ?? []).some((a) => trechoEncontrado(a, busca))
    return peloApelido ? [{ jogador, trecho: null }] : []
  })
}
