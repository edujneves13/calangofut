import { describe, expect, it } from 'vitest'
import { casarNome, similaridade } from '../../src/logic/casamento'
import type { Jogador } from '../../src/logic/tipos'

function jogador(id: string, nome: string, extra: Partial<Jogador> = {}): Jogador {
  return { id, nome, apelidos: [], estrelas: 3, tipo: 'mensalista', goleiro: false, ativo: true, ...extra }
}

const juninho = jogador('1', 'Juninho')
const junior = jogador('2', 'Junior')
const eduardoLucas = jogador('3', 'Eduardo Lucas')
const leo = jogador('4', 'Léo')
const joaoPedro = jogador('5', 'João Pedro')
const felipe = jogador('6', 'Felipe Gomes', { ativo: false })
const cadastro = [juninho, junior, eduardoLucas, leo, joaoPedro, felipe]

describe('casarNome — igualdade exata', () => {
  it('ignora acento', () => {
    expect(casarNome('Leo', cadastro)).toEqual({ tipo: 'exato', jogador: leo })
  })

  it('ignora maiúsculas e espaços extras', () => {
    expect(casarNome('  joão   PEDRO ', cadastro)).toEqual({ tipo: 'exato', jogador: joaoPedro })
  })

  it('Junior e Juninho são pessoas diferentes', () => {
    expect(casarNome('Junior', cadastro)).toEqual({ tipo: 'exato', jogador: junior })
    expect(casarNome('Juninho', cadastro)).toEqual({ tipo: 'exato', jogador: juninho })
  })
})

describe('casarNome — nunca casa sozinho por semelhança', () => {
  it('"Eduardo" sugere Eduardo Lucas, sem casar', () => {
    const r = casarNome('Eduardo', cadastro)
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes[0]).toBe(eduardoLucas)
  })

  it('erro de digitação vira sugestão', () => {
    const r = casarNome('Juninh', cadastro)
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes[0]).toBe(juninho)
  })

  it('no máximo 3 sugestões, da mais parecida para a menos', () => {
    const r = casarNome('Juni', cadastro)
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes.length).toBeLessThanOrEqual(3)
  })

  it('jogador inativo não casa nem é sugerido', () => {
    expect(casarNome('Felipe Gomes', cadastro)).toEqual({ tipo: 'sugestoes', sugestoes: [] })
  })

  it('nome sem nada parecido retorna lista vazia', () => {
    expect(casarNome('Xyzw', cadastro)).toEqual({ tipo: 'sugestoes', sugestoes: [] })
  })

  it('dois jogadores com o mesmo nome viram sugestão, sem casar', () => {
    const pedroA = jogador('a', 'Pedro')
    const pedroB = jogador('b', 'pedro')
    expect(casarNome('Pedro', [pedroA, pedroB])).toEqual({ tipo: 'sugestoes', sugestoes: [pedroA, pedroB] })
  })
})

describe('similaridade', () => {
  it('nomes iguais = 1', () => {
    expect(similaridade('Léo', 'leo')).toBe(1)
  })
  it('nome contido no outro = 0.8', () => {
    expect(similaridade('Eduardo', 'Eduardo Lucas')).toBe(0.8)
  })
  it('nomes sem relação ficam abaixo de 0.5', () => {
    expect(similaridade('Xyzw', 'Juninho')).toBeLessThan(0.5)
  })
})

describe('casarNome — apelidos', () => {
  const kaua = jogador('7', 'Kauã Ferreira', { apelidos: ['Kaká', 'KF'] })
  const comApelido = [...cadastro, kaua]

  it('apelido salvo casa sozinho, ignorando acento', () => {
    expect(casarNome('kaka', comApelido)).toEqual({ tipo: 'exato', jogador: kaua })
  })

  it('o nome do cadastro continua casando', () => {
    expect(casarNome('Kauã Ferreira', comApelido)).toEqual({ tipo: 'exato', jogador: kaua })
  })

  it('apelido parecido vira sugestão', () => {
    const r = casarNome('Kakà F', comApelido)
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes).toContain(kaua)
  })

  it('apelido de jogador inativo não casa', () => {
    const inativo = jogador('8', 'Zé Carlos', { apelidos: ['Zezinho'], ativo: false })
    const r = casarNome('Zezinho', [...cadastro, inativo])
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes).not.toContain(inativo)
  })
})
