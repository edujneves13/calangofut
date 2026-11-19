import { describe, expect, it } from 'vitest'
import { normalizarNome } from '../../src/logic/normalizar'

describe('normalizarNome', () => {
  it('remove acentos, maiúsculas e espaços extras', () => {
    expect(normalizarNome('  Léo  ')).toBe('leo')
    expect(normalizarNome('João   Pedro')).toBe('joao pedro')
    expect(normalizarNome('STÊNIO')).toBe('stenio')
  })
})
