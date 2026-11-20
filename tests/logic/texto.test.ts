import { describe, expect, it } from 'vitest'
import { montarTextoWhatsApp, type DadosTexto } from '../../src/logic/texto'

// Modelo do COPY.md, seção 6.
const dados25: DadosTexto = {
  nomePelada: 'Pelada dos Brabos',
  data: '2026-11-25',
  horario: '20:30',
  times: [
    { nomes: ['Juninho', 'Rafael', 'Hugo', 'Leandro', 'Pedro'], completo: true },
    { nomes: ['Eduardo', 'Derik', 'Yhan', 'Murilo', 'Jackson'], completo: true },
    { nomes: ['Josué', 'Fabiano', 'Herlly', 'Léo', 'Paulinho'], completo: true },
    { nomes: ['Junior', 'Cleyton', 'Arllen', 'Adelson', 'Stênio'], completo: true },
    { nomes: ['Márcio', 'Guilherme', 'Eduardo Lucas'], completo: false },
  ],
  goleiros: ['Renan Araujo', 'Richard'],
  linhasFormato: ['Quem ganha fica · 10 min'],
}

describe('montarTextoWhatsApp', () => {
  it('gera exatamente o modelo do COPY.md', () => {
    expect(montarTextoWhatsApp(dados25)).toBe(
      [
        '⚽ Pelada dos Brabos — Times',
        'Quarta, 25/11 · 20:30',
        '',
        'Time 1: Juninho, Rafael, Hugo, Leandro, Pedro',
        'Time 2: Eduardo, Derik, Yhan, Murilo, Jackson',
        'Time 3: Josué, Fabiano, Herlly, Léo, Paulinho',
        'Time 4: Junior, Cleyton, Arllen, Adelson, Stênio',
        'Time 5 (incompleto): Márcio, Guilherme, Eduardo Lucas',
        '',
        '🧤 Goleiros: Renan Araujo, Richard',
        '',
        'Quem ganha fica · 10 min',
      ].join('\n'),
    )
  })

  it('não tem marcação do WhatsApp nem estrelas', () => {
    expect(montarTextoWhatsApp(dados25)).not.toMatch(/[*_~`★⭐]/)
  })

  it('sem goleiros, a linha de goleiros some', () => {
    const texto = montarTextoWhatsApp({ ...dados25, goleiros: [] })
    expect(texto).not.toContain('🧤')
    expect(texto).not.toContain('\n\n\n')
  })

  it('"(incompleto)" só no time com menos de 5', () => {
    const texto = montarTextoWhatsApp(dados25)
    expect(texto.match(/\(incompleto\)/g)).toHaveLength(1)
  })

  it('calcula o dia da semana pela data', () => {
    expect(montarTextoWhatsApp({ ...dados25, data: '2026-11-21' })).toContain('Sábado, 21/11 · 20:30')
  })
})
