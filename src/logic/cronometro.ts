/**
 * Cronômetro do jogo, sem React e sem relógio próprio: toda função recebe `agora` (ms).
 * O tempo sai do horário de término, não de somar "tiques". Assim continua certo
 * se a tela apagar ou o app for para segundo plano.
 */

export type FaseCronometro = 'parado' | 'rodando' | 'pausado' | 'fim'

export interface EstadoCronometro {
  fase: FaseCronometro
  /** Minutos escolhidos (8, 10 ou "Outro"). Zerar volta para eles. */
  minutos: number
  /** Duração total do jogo, com os +1 min. Base do anel. */
  duracaoMs: number
  /** Só rodando: quando o tempo acaba. */
  terminaEm: number | null
  /** Parado ou pausado: quanto falta. */
  restanteMs: number
}

export const MIN_MINUTOS = 1
export const MAX_MINUTOS = 30
const MINUTO = 60_000

export function minutosValidos(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_MINUTOS && n <= MAX_MINUTOS
}

export function limitarMinutos(n: number): number {
  return Math.min(MAX_MINUTOS, Math.max(MIN_MINUTOS, Math.round(n)))
}

function exigirValido(minutos: number) {
  if (!minutosValidos(minutos)) throw new RangeError(`Tempo de jogo fora de 1 a 30 minutos: ${minutos}`)
}

export function criarCronometro(minutos: number): EstadoCronometro {
  exigirValido(minutos)
  return { fase: 'parado', minutos, duracaoMs: minutos * MINUTO, terminaEm: null, restanteMs: minutos * MINUTO }
}

export function tempoRestante(e: EstadoCronometro, agora: number): number {
  if (e.fase === 'fim') return 0
  if (e.fase === 'rodando') return Math.max(0, e.terminaEm! - agora)
  return e.restanteMs
}

/** 0 = anel cheio (começo) … 1 = vazio (fim). */
export function progresso(e: EstadoCronometro, agora: number): number {
  if (e.duracaoMs <= 0) return 1
  return Math.min(1, Math.max(0, 1 - tempoRestante(e, agora) / e.duracaoMs))
}

/** Último minuto: 60 s ou menos, com o jogo andando ou pausado. */
export function ehUltimoMinuto(e: EstadoCronometro, agora: number): boolean {
  if (e.fase !== 'rodando' && e.fase !== 'pausado') return false
  const r = tempoRestante(e, agora)
  return r > 0 && r <= MINUTO
}

export function comecar(e: EstadoCronometro, agora: number): EstadoCronometro {
  if (e.fase !== 'parado') return e
  return { ...e, fase: 'rodando', terminaEm: agora + e.restanteMs }
}

export function pausar(e: EstadoCronometro, agora: number): EstadoCronometro {
  if (e.fase !== 'rodando') return e
  return { ...e, fase: 'pausado', restanteMs: tempoRestante(e, agora), terminaEm: null }
}

export function continuar(e: EstadoCronometro, agora: number): EstadoCronometro {
  if (e.fase !== 'pausado') return e
  return { ...e, fase: 'rodando', terminaEm: agora + e.restanteMs }
}

export function zerar(e: EstadoCronometro): EstadoCronometro {
  return criarCronometro(e.minutos)
}

/** +1 min com o jogo andando ou pausado. O anel cresce junto para não pular. */
export function maisUmMinuto(e: EstadoCronometro, _agora: number): EstadoCronometro {
  if (e.fase === 'rodando') return { ...e, duracaoMs: e.duracaoMs + MINUTO, terminaEm: e.terminaEm! + MINUTO }
  if (e.fase === 'pausado') return { ...e, duracaoMs: e.duracaoMs + MINUTO, restanteMs: e.restanteMs + MINUTO }
  return e
}

/** Trocar 8 / 10 / Outro: só com o cronômetro parado. */
export function mudarMinutos(e: EstadoCronometro, minutos: number): EstadoCronometro {
  exigirValido(minutos)
  if (e.fase !== 'parado') return e
  return criarCronometro(minutos)
}

/** Chamar a cada atualização da tela: passa para "fim" quando o tempo acaba. */
export function atualizar(e: EstadoCronometro, agora: number): EstadoCronometro {
  if (e.fase === 'rodando' && tempoRestante(e, agora) === 0) {
    return { ...e, fase: 'fim', terminaEm: null, restanteMs: 0 }
  }
  return e
}
