import { describe, expect, it } from 'vitest'
import { proximaQuarta } from '../../src/logic/datas'

describe('proximaQuarta (horário de João Pessoa)', () => {
  it('segunda → quarta da mesma semana', () => {
    expect(proximaQuarta(new Date('2026-11-23T12:00:00-03:00'))).toBe('2026-11-25')
  })
  it('quarta de manhã → a própria quarta', () => {
    expect(proximaQuarta(new Date('2026-11-25T08:00:00-03:00'))).toBe('2026-11-25')
  })
  it('quarta 23:30 (já é quinta em UTC) → ainda a própria quarta', () => {
    expect(proximaQuarta(new Date('2026-11-25T23:30:00-03:00'))).toBe('2026-11-25')
  })
  it('quinta 00:10 → quarta seguinte', () => {
    expect(proximaQuarta(new Date('2026-11-26T00:10:00-03:00'))).toBe('2026-12-02')
  })
  it('vira o mês e o ano', () => {
    expect(proximaQuarta(new Date('2026-12-31T12:00:00-03:00'))).toBe('2027-01-06')
  })
})
