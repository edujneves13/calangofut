import { describe, expect, it } from 'vitest'
import {
  atualizar,
  comecar,
  continuar,
  criarCronometro,
  ehUltimoMinuto,
  estadoNaBarra,
  falarTempo,
  formatarTempo,
  limitarMinutos,
  maisUmMinuto,
  minutosValidos,
  mudarMinutos,
  pausar,
  progresso,
  tempoRestante,
  zerar,
} from '../../src/logic/cronometro'

const MIN = 60_000
const T0 = 1_000_000

describe('cronômetro', () => {
  it('começa parado com o tempo cheio', () => {
    const c = criarCronometro(10)
    expect(c.fase).toBe('parado')
    expect(tempoRestante(c, T0)).toBe(10 * MIN)
    expect(progresso(c, T0)).toBe(0)
  })

  it('conta pelo horário de término: continua certo se a tela apagou', () => {
    const c = comecar(criarCronometro(10), T0)
    // 5 minutos sem nenhum "tique" (tela apagada, app em segundo plano)
    expect(tempoRestante(c, T0 + 5 * MIN)).toBe(5 * MIN)
    expect(progresso(c, T0 + 5 * MIN)).toBeCloseTo(0.5)
  })

  it('pausar congela o tempo; continuar segue de onde parou', () => {
    let c = comecar(criarCronometro(10), T0)
    c = pausar(c, T0 + 2 * MIN)
    expect(c.fase).toBe('pausado')
    expect(tempoRestante(c, T0 + 9 * MIN)).toBe(8 * MIN)
    c = continuar(c, T0 + 9 * MIN)
    expect(c.fase).toBe('rodando')
    expect(tempoRestante(c, T0 + 10 * MIN)).toBe(7 * MIN)
  })

  it('+1 min rodando e pausado; o anel continua coerente', () => {
    let c = comecar(criarCronometro(10), T0)
    c = maisUmMinuto(c, T0 + 5 * MIN)
    expect(tempoRestante(c, T0 + 5 * MIN)).toBe(6 * MIN)
    expect(progresso(c, T0 + 5 * MIN)).toBeCloseTo(5 / 11)
    c = pausar(c, T0 + 6 * MIN)
    c = maisUmMinuto(c, T0 + 6 * MIN)
    expect(tempoRestante(c, T0 + 6 * MIN)).toBe(6 * MIN)
  })

  it('+1 min parado ou no fim não faz nada', () => {
    const parado = criarCronometro(10)
    expect(maisUmMinuto(parado, T0)).toEqual(parado)
  })

  it('último minuto começa em 60 s, só com o jogo andando', () => {
    const c = comecar(criarCronometro(10), T0)
    expect(ehUltimoMinuto(c, T0 + 9 * MIN - 1)).toBe(false)
    expect(ehUltimoMinuto(c, T0 + 9 * MIN)).toBe(true)
    expect(ehUltimoMinuto(pausar(c, T0 + 9.5 * MIN), T0 + 20 * MIN)).toBe(true)
    expect(ehUltimoMinuto(criarCronometro(1), T0)).toBe(false)
  })

  it('acaba em zero, sem ficar negativo', () => {
    let c = comecar(criarCronometro(1), T0)
    expect(tempoRestante(c, T0 + 2 * MIN)).toBe(0)
    c = atualizar(c, T0 + MIN)
    expect(c.fase).toBe('fim')
    expect(progresso(c, T0 + 5 * MIN)).toBe(1)
    expect(ehUltimoMinuto(c, T0 + MIN)).toBe(false)
  })

  it('atualizar antes do fim não muda nada', () => {
    const c = comecar(criarCronometro(1), T0)
    expect(atualizar(c, T0 + 30_000)).toBe(c)
  })

  it('zerar volta ao tempo escolhido, sem o +1 min', () => {
    let c = comecar(criarCronometro(8), T0)
    c = maisUmMinuto(c, T0 + MIN)
    c = zerar(atualizar(c, T0 + 20 * MIN))
    expect(c.fase).toBe('parado')
    expect(tempoRestante(c, T0)).toBe(8 * MIN)
  })

  it('mudar os minutos só parado', () => {
    const c = mudarMinutos(criarCronometro(10), 12)
    expect(tempoRestante(c, T0)).toBe(12 * MIN)
    const rodando = comecar(c, T0)
    expect(mudarMinutos(rodando, 5)).toBe(rodando)
  })

  it('valida de 1 a 30 minutos inteiros', () => {
    expect([1, 12, 30].every(minutosValidos)).toBe(true)
    expect([0, 31, 2.5, Number.NaN].some(minutosValidos)).toBe(false)
    expect(() => criarCronometro(0)).toThrow()
    expect(() => mudarMinutos(criarCronometro(10), 31)).toThrow()
  })

  it('limita fora da faixa', () => {
    expect(limitarMinutos(0)).toBe(1)
    expect(limitarMinutos(45)).toBe(30)
    expect(limitarMinutos(7.6)).toBe(8)
  })
})

describe('formatarTempo e falarTempo', () => {
  it('mm:ss arredondando o segundo para cima', () => {
    expect(formatarTempo(7 * MIN + 12_000)).toBe('07:12')
    expect(formatarTempo(7 * MIN + 11_001)).toBe('07:12')
    expect(formatarTempo(0)).toBe('00:00')
  })

  it('por extenso para o leitor de tela', () => {
    expect(falarTempo(7 * MIN + 12_000)).toBe('7 minutos e 12 segundos')
    expect(falarTempo(1 * MIN + 1_000)).toBe('1 minuto e 1 segundo')
    expect(falarTempo(10 * MIN)).toBe('10 minutos')
    expect(falarTempo(45_000)).toBe('45 segundos')
  })
})

describe('estadoNaBarra', () => {
  it('parado ou fim: nada na barra', () => {
    expect(estadoNaBarra(criarCronometro(10), T0)).toBeNull()
    const fim = atualizar(comecar(criarCronometro(1), T0), T0 + MIN)
    expect(estadoNaBarra(fim, T0 + MIN)).toBeNull()
  })

  it('rodando: tempo restante, progresso e rótulo acessível', () => {
    const c = comecar(criarCronometro(10), T0)
    expect(estadoNaBarra(c, T0 + 2 * MIN + 48_000)).toEqual({
      tom: 'rodando',
      texto: '07:12',
      progresso: progresso(c, T0 + 2 * MIN + 48_000),
      rotulo: 'Cronômetro, 7 minutos e 12 segundos restantes',
    })
  })

  it('último minuto: tom âmbar', () => {
    const c = comecar(criarCronometro(10), T0)
    expect(estadoNaBarra(c, T0 + 9 * MIN + 30_000)?.tom).toBe('ultimo')
  })

  it('pausado vence o último minuto e mostra "Pausado"', () => {
    const c = pausar(comecar(criarCronometro(10), T0), T0 + 9 * MIN + 30_000)
    const b = estadoNaBarra(c, T0 + 9 * MIN + 40_000)!
    expect(b.tom).toBe('pausado')
    expect(b.texto).toBe('Pausado')
    expect(b.rotulo).toBe('Cronômetro, pausado')
  })
})
