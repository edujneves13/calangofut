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
  /** Máximo de craques (5★) por time. Padrão 2 (Ajustes). Infinity = "Sortear assim mesmo". */
  maxCincoEstrelas?: number
}

export const MINIMO_JOGADORES = 10
export const MAX_CINCO_ESTRELAS_PADRAO = 2
const TENTATIVAS_PADRAO = 300

type Divisao = ParticipanteSorteio[][]

/**
 * Divide os jogadores de linha presentes em times de 5, o mais equilibrado possível.
 *
 * Cada tentativa começa de uma divisão aleatória e vai trocando jogadores entre times
 * enquanto a diferença diminuir. Fica a melhor de todas as tentativas; empates são
 * decididos ao acaso, para os times não se repetirem toda semana.
 */
export function sortearTimes(participantes: ParticipanteSorteio[], opcoes: OpcoesSorteio = {}): ResultadoSorteio {
  return refazerSorteio(participantes, [], [], opcoes)
}

/**
 * Refaz o sorteio mantendo os times completos escolhidos (travados) iguais e na mesma posição.
 * Os outros jogadores presentes são sorteados de novo, equilibrando também com os travados.
 * Índices de times incompletos são ignorados.
 */
export function refazerSorteio(
  participantes: ParticipanteSorteio[],
  timesAtuais: Time[],
  travados: number[],
  opcoes: OpcoesSorteio = {},
): ResultadoSorteio {
  const rng = opcoes.rng ?? Math.random
  const tentativas = opcoes.tentativas ?? TENTATIVAS_PADRAO
  const maxCinco = opcoes.maxCincoEstrelas ?? MAX_CINCO_ESTRELAS_PADRAO

  const indices = [...new Set(travados)].filter((i) => timesAtuais[i]?.completo).sort((a, b) => a - b)
  const fixos = indices.map((i) => timesAtuais[i]!)
  const idsFixos = new Set(fixos.flatMap((t) => t.jogadorIds))

  const jogadores = participantes.filter((p) => !p.goleiro && p.presente && !idsFixos.has(p.id))
  if (jogadores.length + idsFixos.size < MINIMO_JOGADORES) return { ok: false, motivo: 'poucos-jogadores' }

  const tamanhos = tamanhosDosTimes(jogadores.length)
  const vagasCinco = tamanhos.reduce((s, t) => s + Math.min(maxCinco, t), 0)
  if (jogadores.filter(ehCinco).length > vagasCinco) return { ok: false, motivo: 'muitos-cinco-estrelas' }

  const numCompletos = Math.floor(jogadores.length / TAMANHO_TIME)
  const somasFixas = fixos.map((t) => t.somaEstrelas)
  let melhor: Divisao = []
  let melhorNota = Infinity
  let empates = 0

  for (let i = 0; i < tentativas && jogadores.length > 0; i++) {
    const divisao = cortar(embaralhar(jogadores, rng), tamanhos)
    consertarCincoEstrelas(divisao, maxCinco, rng)
    melhorarComTrocas(divisao, numCompletos, somasFixas, maxCinco)
    const nota = diferenca(divisao, numCompletos, somasFixas)

    if (nota < melhorNota) {
      melhor = divisao
      melhorNota = nota
      empates = 1
    } else if (nota === melhorNota) {
      empates++
      if (rng() < 1 / empates) melhor = divisao
    }
  }

  const novosCompletos = embaralhar(melhor.slice(0, numCompletos).map(paraTime), rng)
  const incompleto = melhor.slice(numCompletos).map(paraTime)

  // Travados voltam para a posição deles; os times novos ocupam as vagas que sobram.
  const totalCompletos = fixos.length + novosCompletos.length
  const posicoes: (Time | undefined)[] = Array(totalCompletos)
  const semPosicao: Time[] = []
  indices.forEach((indice, k) => {
    if (indice < totalCompletos) posicoes[indice] = fixos[k]
    else semPosicao.push(fixos[k]!)
  })
  const fila = [...semPosicao, ...novosCompletos]
  const completos = Array.from(posicoes, (t) => t ?? fila.shift()!)

  return { ok: true, times: [...completos, ...incompleto] }
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

/** Troca 5 estrelas de times acima do limite por jogadores de times que ainda têm vaga. */
function consertarCincoEstrelas(divisao: Divisao, maxCinco: number, rng: () => number): void {
  for (const time of divisao) {
    while (contarCinco(time) > maxCinco) {
      const destinos = divisao.filter((t) => contarCinco(t) < Math.min(maxCinco, t.length))
      const destino = destinos[Math.floor(rng() * destinos.length)]!
      const i = time.findIndex(ehCinco)
      const j = destino.findIndex((p) => !ehCinco(p))
      ;[time[i], destino[j]] = [destino[j]!, time[i]!]
    }
  }
}

/** Nota principal: maior soma − menor soma entre os times completos (incluindo os travados). */
function diferenca(divisao: Divisao, numCompletos: number, somasFixas: number[]): number {
  const somas = [...divisao.slice(0, numCompletos).map(soma), ...somasFixas]
  if (somas.length === 0) return 0
  return Math.max(...somas) - Math.min(...somas)
}

/** Nota auxiliar que guia as trocas: quão espalhadas estão as somas dos completos. */
function espalhamento(divisao: Divisao, numCompletos: number): number {
  return divisao.slice(0, numCompletos).reduce((s, t) => s + soma(t) ** 2, 0)
}

/** Troca pares de jogadores entre times enquanto alguma troca melhorar o equilíbrio. */
function melhorarComTrocas(divisao: Divisao, numCompletos: number, somasFixas: number[], maxCinco: number): void {
  let notaAtual = [diferenca(divisao, numCompletos, somasFixas), espalhamento(divisao, numCompletos)] as const
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
            const valido = contarCinco(timeA) <= maxCinco && contarCinco(timeB) <= maxCinco
            const nota = [diferenca(divisao, numCompletos, somasFixas), espalhamento(divisao, numCompletos)] as const
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
