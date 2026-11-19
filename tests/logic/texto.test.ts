import { describe, expect, it } from 'vitest'
import { linkWhatsApp, montarTextoWhatsApp } from '../../src/logic/texto'

const dados18 = {
  data: '2026-11-18',
  horario: '20:30',
  times: [
    ['Juninho', 'Rafael', 'Hugo', 'Leandro', 'Pedro'],
    ['Eduardo', 'Josué', 'Derik', 'Fabiano', 'Yhan'],
  ],
  goleiros: ['Renan Araujo', 'Richard'],
  linhasFormato: ['Jogos (quem ganha fica, 10 min):', 'Começam Time 1 x Time 2.'],
}

describe('montarTextoWhatsApp', () => {
  it('monta o texto no formato da spec', () => {
    expect(montarTextoWhatsApp(dados18)).toBe(
      [
        '⚽ Times — Quarta 18/11 · 20:30',
        '',
        'Time 1: Juninho, Rafael, Hugo, Leandro, Pedro',
        'Time 2: Eduardo, Josué, Derik, Fabiano, Yhan',
        '',
        '🧤 Goleiros: Renan Araujo, Richard',
        '',
        'Jogos (quem ganha fica, 10 min):',
        'Começam Time 1 x Time 2.',
      ].join('\n'),
    )
  })

  it('não tem marcação do WhatsApp nem estrelas', () => {
    expect(montarTextoWhatsApp(dados18)).not.toMatch(/[*_~`⭐]/)
  })

  it('sem goleiros, a linha de goleiros some', () => {
    const texto = montarTextoWhatsApp({ ...dados18, goleiros: [] })
    expect(texto).not.toContain('🧤')
    expect(texto).not.toContain('\n\n\n')
  })

  it('calcula o dia da semana pela data', () => {
    expect(montarTextoWhatsApp({ ...dados18, data: '2026-11-21' })).toContain('Sábado 21/11')
  })
})

describe('linkWhatsApp', () => {
  it('codifica o texto no link wa.me', () => {
    expect(linkWhatsApp('⚽ A\nB')).toBe('https://wa.me/?text=' + encodeURIComponent('⚽ A\nB'))
  })
})
