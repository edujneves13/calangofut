import { TAMANHO_TIME, type Time } from './tipos'

/**
 * Edição manual dos times (tela "Editar times", docs/design/times-durante-v2.md item 4).
 *
 * Toda função devolve uma lista nova; a original não muda (a tela guarda um rascunho
 * e só grava no Concluir). Nenhum time passa de 5. Time que fica vazio sai da lista.
 * A regra dos craques (5★) não bloqueia: o admin manda; a tela só avisa.
 */

/** Estrelas de um jogador pelo id. */
export type EstrelasDe = (id: string) => number

/** Índice do time do jogador, ou -1 se ele não está em nenhum. */
export function timeDe(times: Time[], id: string): number {
  return times.findIndex((t) => t.jogadorIds.includes(id))
}

function montarTime(jogadorIds: string[], estrelasDe: EstrelasDe): Time {
  return {
    jogadorIds,
    somaEstrelas: jogadorIds.reduce((s, id) => s + estrelasDe(id), 0),
    completo: jogadorIds.length === TAMANHO_TIME,
  }
}

/** Troca os jogadores dos times indicados e remonta só esses times. */
function remontar(times: Time[], mudancas: Map<number, string[]>, estrelasDe: EstrelasDe): Time[] {
  return times
    .map((t, i) => (mudancas.has(i) ? montarTime(mudancas.get(i)!, estrelasDe) : t))
    .filter((t) => t.jogadorIds.length > 0)
}

/** Move o jogador para o time `destino`. null se o destino está cheio, é o mesmo time ou o jogador não está em time. */
export function moverJogador(times: Time[], id: string, destino: number, estrelasDe: EstrelasDe): Time[] | null {
  const origem = timeDe(times, id)
  const alvo = times[destino]
  if (origem === -1 || origem === destino || !alvo || alvo.jogadorIds.length >= TAMANHO_TIME) return null
  return remontar(
    times,
    new Map([
      [origem, times[origem]!.jogadorIds.filter((x) => x !== id)],
      [destino, [...alvo.jogadorIds, id]],
    ]),
    estrelasDe,
  )
}

/** Troca dois jogadores de times diferentes; cada um fica na posição do outro. */
export function trocarJogadores(times: Time[], a: string, b: string, estrelasDe: EstrelasDe): Time[] {
  const ta = timeDe(times, a)
  const tb = timeDe(times, b)
  if (ta === -1 || tb === -1 || ta === tb) return times
  const trocar = (ids: string[]) => ids.map((x) => (x === a ? b : x === b ? a : x))
  return remontar(
    times,
    new Map([
      [ta, trocar(times[ta]!.jogadorIds)],
      [tb, trocar(times[tb]!.jogadorIds)],
    ]),
    estrelasDe,
  )
}

/** Tira o jogador do time (ele volta para "Não chegaram"). */
export function tirarDoTime(times: Time[], id: string, estrelasDe: EstrelasDe): Time[] {
  const origem = timeDe(times, id)
  if (origem === -1) return times
  return remontar(times, new Map([[origem, times[origem]!.jogadorIds.filter((x) => x !== id)]]), estrelasDe)
}

/** Coloca quem está fora dos times (Não chegaram) no time `destino`. null se cheio ou se a pessoa já está em time. */
export function colocarNoTime(times: Time[], id: string, destino: number, estrelasDe: EstrelasDe): Time[] | null {
  const alvo = times[destino]
  if (timeDe(times, id) !== -1 || !alvo || alvo.jogadorIds.length >= TAMANHO_TIME) return null
  return remontar(times, new Map([[destino, [...alvo.jogadorIds, id]]]), estrelasDe)
}

/** Maior soma menos menor soma entre os times completos. null com menos de 2 completos. */
export function calcularEquilibrio(times: Time[]): number | null {
  const somas = times.filter((t) => t.completo).map((t) => t.somaEstrelas)
  if (somas.length < 2) return null
  return Math.max(...somas) - Math.min(...somas)
}

export interface PreviaMover {
  somaAntes: number
  somaDepois: number
  tamanhoAntes: number
  tamanhoDepois: number
  /** Destino já tem 5: o botão fica desabilitado. */
  cheio: boolean
}

/** Como fica o time `destino` se o jogador for para ele (ex.: "Time 2 · 16★ → 19★"). */
export function previaMover(times: Time[], id: string, destino: number, estrelasDe: EstrelasDe): PreviaMover {
  const alvo = times[destino]
  if (!alvo) throw new Error(`Time ${destino + 1} não existe`)
  const tamanho = alvo.jogadorIds.length
  return {
    somaAntes: alvo.somaEstrelas,
    somaDepois: alvo.somaEstrelas + estrelasDe(id),
    tamanhoAntes: tamanho,
    tamanhoDepois: tamanho + 1,
    cheio: tamanho >= TAMANHO_TIME,
  }
}

export interface PreviaTroca {
  timeA: number
  timeB: number
  /** Quanto o time de A ganha (+) ou perde (−) de estrelas. O time de B muda o oposto. */
  deltaA: number
  deltaB: number
  /** Mesmas estrelas: "mantém o equilíbrio". */
  mantem: boolean
}

/** Efeito de trocar A com B (ex.: "Time 1 +1★ · Time 2 −1★"). */
export function previaTroca(times: Time[], a: string, b: string, estrelasDe: EstrelasDe): PreviaTroca {
  const deltaA = estrelasDe(b) - estrelasDe(a)
  return { timeA: timeDe(times, a), timeB: timeDe(times, b), deltaA, deltaB: -deltaA, mantem: deltaA === 0 }
}

/** Quantos craques (5★) o time tem. Acima do limite dos Ajustes, a tela mostra um aviso discreto. */
export function contarCincoEstrelas(time: Time, estrelasDe: EstrelasDe): number {
  return time.jogadorIds.filter((id) => estrelasDe(id) === 5).length
}
