import { embaralhar } from './aleatorio'
import { TAMANHO_TIME, type Time } from './tipos'

export interface ParticipanteSorteio {
  id: string
  estrelas: number
  goleiro: boolean
  presente: boolean
}

export type ResultadoSorteio =
  | { ok: true; times: Time[] }
  | { ok: false; motivo: 'poucos-jogadores' | 'muitos-cinco-estrelas' }

export interface OpcoesSorteio {
  rng?: () => number
  tentativas?: number
}

export const MINIMO_JOGADORES = 10
export const MAX_CINCO_ESTRELAS = 2
const TENTATIVAS_PADRAO = 1000

type Divisao = ParticipanteSorteio[][]

/**
 * Divide os jogadores de linha presentes em times de 5, o mais equilibrado possível.
 *
 * Cada tentativa começa de uma divisão aleatória e vai trocando jogadores entre times
 * enquanto a diferença diminuir. Fica a melhor de todas as tentativas; empates são
 * decididos ao acaso, para os times não se repetirem toda semana.
 */
export function sortearTimes(participantes: ParticipanteSorteio[], opcoes: OpcoesSorteio = {}): ResultadoSorteio {
  const rng = opcoes.rng ?? Math.random
  const tentativas = opcoes.tentativas ?? TENTATIVAS_PADRAO

  const jogadores = participantes.filter((p) => !p.goleiro && p.presente)
  if (jogadores.length < MINIMO_JOGADORES) return { ok: false, motivo: 'poucos-jogadores' }

  const tamanhos = tamanhosDosTimes(jogadores.length)
  const vagasCinco = tamanhos.reduce((s, t) => s + Math.min(MAX_CINCO_ESTRELAS, t), 0)
  if (jogadores.filter(ehCinco).length > vagasCinco) return { ok: false, motivo: 'muitos-cinco-estrelas' }

  const numCompletos = Math.floor(jogadores.length / TAMANHO_TIME)
  let melhor: Divisao | null = null
  let melhorNota = Infinity
  let empates = 0

  for (let i = 0; i < tentativas; i++) {
    const divisao = cortar(embaralhar(jogadores, rng), tamanhos)
    consertarCincoEstrelas(divisao, rng)
    melhorarComTrocas(divisao, numCompletos)
    const nota = diferenca(divisao, numCompletos)

    if (nota < melhorNota) {
      melhor = divisao
      melhorNota = nota
      empates = 1
    } else if (nota === melhorNota) {
      empates++
      if (rng() < 1 / empates) melhor = divisao
    }
  }

  const completos = embaralhar(melhor!.slice(0, numCompletos), rng)
  const incompleto = melhor!.slice(numCompletos)
  return { ok: true, times: [...completos, ...incompleto].map(paraTime) }
}

function tamanhosDosTimes(n: number): number[] {
  const tamanhos = Array<number>(Math.floor(n / TAMANHO_TIME)).fill(TAMANHO_TIME)
  if (n % TAMANHO_TIME > 0) tamanhos.push(n % TAMANHO_TIME)
  return tamanhos
}

function cortar(jogadores: ParticipanteSorteio[], tamanhos: number[]): Divisao {
  let inicio = 0
  return tamanhos.map((t) => jogadores.slice(inicio, (inicio += t)))
}

const ehCinco = (p: ParticipanteSorteio) => p.estrelas === 5
const contarCinco = (time: ParticipanteSorteio[]) => time.filter(ehCinco).length
const soma = (time: ParticipanteSorteio[]) => time.reduce((s, p) => s + p.estrelas, 0)

/** Troca 5 estrelas de times com mais de 2 por jogadores de times que ainda têm vaga. */
function consertarCincoEstrelas(divisao: Divisao, rng: () => number): void {
  for (const time of divisao) {
    while (contarCinco(time) > MAX_CINCO_ESTRELAS) {
      const destinos = divisao.filter((t) => contarCinco(t) < Math.min(MAX_CINCO_ESTRELAS, t.length))
      const destino = destinos[Math.floor(rng() * destinos.length)]!
      const i = time.findIndex(ehCinco)
      const j = destino.findIndex((p) => !ehCinco(p))
      ;[time[i], destino[j]] = [destino[j]!, time[i]!]
    }
  }
}

/** Nota principal: maior soma − menor soma entre os times completos. */
function diferenca(divisao: Divisao, numCompletos: number): number {
  const somas = divisao.slice(0, numCompletos).map(soma)
  return Math.max(...somas) - Math.min(...somas)
}

/** Nota auxiliar que guia as trocas: quão espalhadas estão as somas dos completos. */
function espalhamento(divisao: Divisao, numCompletos: number): number {
  return divisao.slice(0, numCompletos).reduce((s, t) => s + soma(t) ** 2, 0)
}

/** Troca pares de jogadores entre times enquanto alguma troca melhorar o equilíbrio. */
function melhorarComTrocas(divisao: Divisao, numCompletos: number): void {
  let notaAtual = [diferenca(divisao, numCompletos), espalhamento(divisao, numCompletos)] as const
  let melhorou = true

  while (melhorou) {
    melhorou = false
    for (let a = 0; a < divisao.length; a++) {
      for (let b = a + 1; b < divisao.length; b++) {
        const timeA = divisao[a]!
        const timeB = divisao[b]!
        for (let i = 0; i < timeA.length; i++) {
          for (let j = 0; j < timeB.length; j++) {
            const pa = timeA[i]!
            const pb = timeB[j]!
            if (pa.estrelas === pb.estrelas) continue
            timeA[i] = pb
            timeB[j] = pa
            const valido = contarCinco(timeA) <= MAX_CINCO_ESTRELAS && contarCinco(timeB) <= MAX_CINCO_ESTRELAS
            const nota = [diferenca(divisao, numCompletos), espalhamento(divisao, numCompletos)] as const
            if (valido && (nota[0] < notaAtual[0] || (nota[0] === notaAtual[0] && nota[1] < notaAtual[1]))) {
              notaAtual = nota
              melhorou = true
            } else {
              timeA[i] = pa
              timeB[j] = pb
            }
          }
        }
      }
    }
  }
}

function paraTime(jogadores: ParticipanteSorteio[]): Time {
  return {
    jogadorIds: jogadores.map((p) => p.id),
    somaEstrelas: soma(jogadores),
    completo: jogadores.length === TAMANHO_TIME,
  }
}
