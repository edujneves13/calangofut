import { describe, expect, it } from 'vitest'
import { hojeEmJoaoPessoa, proximoDia } from '../../src/logic/datas'

const QUARTA = 3

describe('proximoDia (horário de João Pessoa)', () => {
  it('segunda → quarta da mesma semana', () => {
    expect(proximoDia(new Date('2026-11-23T12:00:00-03:00'), QUARTA)).toBe('2026-11-25')
  })
  it('quarta de manhã → a própria quarta', () => {
    expect(proximoDia(new Date('2026-11-25T08:00:00-03:00'), QUARTA)).toBe('2026-11-25')
  })
  it('quarta 23:30 (já é quinta em UTC) → ainda a própria quarta', () => {
    expect(proximoDia(new Date('2026-11-25T23:30:00-03:00'), QUARTA)).toBe('2026-11-25')
  })
  it('quinta 00:10 → quarta seguinte (virada à meia-noite)', () => {
    expect(proximoDia(new Date('2026-11-26T00:10:00-03:00'), QUARTA)).toBe('2026-12-02')
  })
  it('vira o mês e o ano', () => {
    expect(proximoDia(new Date('2026-12-31T12:00:00-03:00'), QUARTA)).toBe('2027-01-06')
  })
  it('funciona com outro dia da semana (domingo = 0)', () => {
    expect(proximoDia(new Date('2026-11-23T12:00:00-03:00'), 0)).toBe('2026-11-29')
  })
})

describe('hojeEmJoaoPessoa', () => {
  it('usa o fuso de João Pessoa, não o UTC', () => {
    expect(hojeEmJoaoPessoa(new Date('2026-11-25T23:30:00-03:00'))).toBe('2026-11-25')
  })
})
