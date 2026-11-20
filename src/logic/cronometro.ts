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

/** Sem máximo: cada pelada decide o tempo de jogo (navegacao-ajustes-v3, item 5). */
export const MIN_MINUTOS = 1
const MINUTO = 60_000

export function minutosValidos(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_MINUTOS
}

export function limitarMinutos(n: number): number {
  return Math.max(MIN_MINUTOS, Math.round(n))
}

function exigirValido(minutos: number) {
  if (!minutosValidos(minutos)) throw new RangeError(`Tempo de jogo precisa ser de 1 minuto ou mais: ${minutos}`)
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

const segundosRestantes = (ms: number) => Math.max(0, Math.ceil(ms / 1000))

/** "07:12". O segundo arredonda para cima: só mostra 00:00 quando acabou. */
export function formatarTempo(ms: number): string {
  const total = segundosRestantes(ms)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** "7 minutos e 12 segundos", para o leitor de tela. */
export function falarTempo(ms: number): string {
  const total = segundosRestantes(ms)
  const m = Math.floor(total / 60)
  const s = total % 60
  const partes = [
    m > 0 ? `${m} ${m === 1 ? 'minuto' : 'minutos'}` : '',
    s > 0 || m === 0 ? `${s} ${s === 1 ? 'segundo' : 'segundos'}` : '',
  ].filter(Boolean)
  return partes.join(' e ')
}

export interface EstadoNaBarra {
  tom: 'rodando' | 'ultimo' | 'pausado'
  /** "07:12" ou "Pausado". */
  texto: string
  /** Mesmo do anel grande: 0 = cheio … 1 = vazio. */
  progresso: number
  /** aria-label do item Cronômetro. */
  rotulo: string
}

/**
 * O que o item Cronômetro da barra de baixo mostra em qualquer aba (docs/design/times-durante-v2.md, item 9).
 * null = parado ou fim: o item normal, sem anel e sem tempo.
 */
export function estadoNaBarra(e: EstadoCronometro, agora: number): EstadoNaBarra | null {
  if (e.fase !== 'rodando' && e.fase !== 'pausado') return null
  const restante = tempoRestante(e, agora)
  const base = { progresso: progresso(e, agora) }
  if (e.fase === 'pausado') return { ...base, tom: 'pausado', texto: 'Pausado', rotulo: 'Cronômetro, pausado' }
  return {
    ...base,
    tom: ehUltimoMinuto(e, agora) ? 'ultimo' : 'rodando',
    texto: formatarTempo(restante),
    rotulo: `Cronômetro, ${falarTempo(restante)} restantes`,
  }
}
