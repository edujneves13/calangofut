import { describe, expect, it } from 'vitest'
import { casarNome, similaridade, sugestaoForte } from '../../src/logic/casamento'
import { lerLista } from '../../src/logic/leitor'
import type { Jogador } from '../../src/logic/tipos'
import { fixture } from './fixtures'

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
  it('"Eduardo" com dois Eduardos no cadastro sugere os dois, sem casar', () => {
    const eduardoSilva = jogador('9', 'Eduardo Silva')
    const r = casarNome('Eduardo', [...cadastro, eduardoSilva])
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') expect(r.sugestoes).toEqual(expect.arrayContaining([eduardoLucas, eduardoSilva]))
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
  it('nome que é o começo do outro = 0.9', () => {
    expect(similaridade('Eduardo', 'Eduardo Lucas')).toBe(0.9)
  })
  it('nome contido no meio ou no fim do outro = 0.8', () => {
    expect(similaridade('Junior', 'Adelson Júnior')).toBe(0.8)
  })
  it('letras parecidas sem nome em comum ficam abaixo de 0.7', () => {
    expect(similaridade('Edgar', 'Eduardo')).toBeLessThan(0.7)
    expect(similaridade('Joelson', 'Jackson')).toBeLessThan(0.7)
    expect(similaridade('Léo', 'Clecio')).toBeLessThan(0.7)
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

describe('casarNome — primeiro nome único', () => {
  // Cadastro feito pela planilha (nome completo); lista do WhatsApp com o primeiro nome.
  const planilha = lerLista(fixture('lista-planilha.txt')).jogadores.map((l, i) => jogador(`p${i}`, l.nome))
  const doCadastro = (nome: string) => planilha.find((j) => j.nome === nome)!

  it('"Adelson" casa com Adelson Júnior, o único com esse primeiro nome', () => {
    expect(casarNome('Adelson', planilha)).toEqual({ tipo: 'exato', jogador: doCadastro('Adelson Júnior') })
  })

  it('"Leandro" casa com Leandro Costa', () => {
    expect(casarNome('Leandro', planilha)).toEqual({ tipo: 'exato', jogador: doCadastro('Leandro Costa') })
  })

  it('"Eduardo" casa com Eduardo (igualdade exata ganha de Eduardo Lucas)', () => {
    expect(casarNome('Eduardo', planilha)).toEqual({ tipo: 'exato', jogador: doCadastro('Eduardo') })
  })

  it('"Eduardo" casa com Eduardo Lucas quando só ele tem esse nome', () => {
    expect(casarNome('Eduardo', cadastro)).toEqual({ tipo: 'exato', jogador: eduardoLucas })
  })

  it('"Junior" não casa: o nome aparece em Júnior Kblinho e em Adelson Júnior', () => {
    const r = casarNome('Junior', planilha)
    expect(r.tipo).toBe('sugestoes')
    if (r.tipo === 'sugestoes') {
      expect(r.sugestoes[0]).toBe(doCadastro('Júnior Kblinho'))
      expect(r.sugestoes).toContain(doCadastro('Adelson Júnior'))
    }
  })

  it('"Vinicius" não casa quando há Vinicius Martins e Vinicius Souza', () => {
    const r = casarNome('Vinicius', [jogador('a', 'Vinicius Martins'), jogador('b', 'Vinicius Souza')])
    expect(r.tipo).toBe('sugestoes')
  })

  it('o que vem entre parênteses no cadastro não conta como nome', () => {
    // "Vinicius (Adelson)" é convidado do Adelson; não impede "Adelson" de casar.
    const adelson = jogador('a', 'Adelson Júnior')
    expect(casarNome('Adelson', [adelson, jogador('b', 'Vinicius (Adelson)')])).toEqual({ tipo: 'exato', jogador: adelson })
  })

  it('sobrenome no fim não casa sozinho', () => {
    expect(casarNome('Kblinho', planilha).tipo).toBe('sugestoes')
  })

  it('sobrenome diferente não casa: "Felipe Araújo" não é o Felipe Gomes', () => {
    const r = casarNome('Felipe Araújo', planilha)
    expect(r.tipo).toBe('sugestoes')
  })

  it('jogador inativo não impede nem recebe o casamento', () => {
    const inativo = jogador('x', 'Adelson Pereira', { ativo: false })
    expect(casarNome('Adelson', [...planilha, inativo])).toEqual({ tipo: 'exato', jogador: doCadastro('Adelson Júnior') })
  })

  it('nomes só com letras parecidas não viram sugestão', () => {
    for (const nome of ['Edgar', 'Joelson', 'Léo']) {
      expect(casarNome(nome, planilha)).toEqual({ tipo: 'sugestoes', sugestoes: [] })
    }
  })

  it('a lista de 18/11 inteira contra o cadastro da planilha', () => {
    const lista = lerLista(fixture('lista-2026-11-18.txt'), '2026-11-18').jogadores.map((l) => l.nome)
    const exatos = lista.filter((n) => casarNome(n, planilha).tipo === 'exato')
    expect(exatos).toEqual(expect.arrayContaining(['Adelson', 'Leandro', 'Eduardo', 'Eduardo Lucas', 'Juninho']))
    expect(exatos).not.toContain('Junior')
  })
})

describe('sugestaoForte', () => {
  it('nome contido ou erro de digitação é forte', () => {
    expect(sugestaoForte('Junior', jogador('a', 'Adelson Júnior'))).toBe(true)
    expect(sugestaoForte('Juninh', juninho)).toBe(true)
  })
  it('só algumas letras parecidas não é forte', () => {
    expect(sugestaoForte('Marcinho', jogador('b', 'Márcio'))).toBe(false)
  })
  it('vale para apelido', () => {
    expect(sugestaoForte('Kak', jogador('c', 'Kauã', { apelidos: ['Kaká'] }))).toBe(false)
    expect(sugestaoForte('Kakaa', jogador('c', 'Kauã', { apelidos: ['Kaká'] }))).toBe(true)
  })
})
