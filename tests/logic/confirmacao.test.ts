import { describe, expect, it } from 'vitest'
import { confirmacaoDoCadastro, montarConfirmacao } from '../../src/logic/confirmacao'
import type { Jogador } from '../../src/logic/tipos'

function jogador(id: string, nome: string, extra: Partial<Jogador> = {}): Jogador {
  return { id, nome, apelidos: [], estrelas: 3, tipo: 'mensalista', goleiro: false, ativo: true, ...extra }
}

const stenio = jogador('1', 'Stenio Araújo', { apelidos: ['Stênio'] })
const juninho = jogador('2', 'Juninho')
const cadastro = [stenio, juninho]

describe('montarConfirmacao', () => {
  it('separa quem já está no cadastro, quem é parecido e quem é novo', () => {
    expect(montarConfirmacao(['Juninho', 'Stenio A', 'Zé Ninguém'], cadastro)).toEqual([
      { texto: 'Juninho', tipo: 'existente', jogador: juninho },
      { texto: 'Stenio A', tipo: 'parecido', sugestoes: [stenio] },
      { texto: 'Zé Ninguém', tipo: 'novo' },
    ])
  })

  it('apelido salvo conta como já cadastrado', () => {
    expect(montarConfirmacao(['stenio'], cadastro)[0]).toMatchObject({ tipo: 'existente', jogador: stenio })
  })

  it('cadastro vazio: todo mundo é novo', () => {
    expect(montarConfirmacao(['Ana', 'Bia'], []).map((i) => i.tipo)).toEqual(['novo', 'novo'])
  })
})

describe('confirmacaoDoCadastro', () => {
  it('quem foi escolhido do cadastro entra como já cadastrado, com o nome do cadastro', () => {
    expect(confirmacaoDoCadastro([juninho, stenio])).toEqual([
      { texto: 'Juninho', tipo: 'existente', jogador: juninho },
      { texto: 'Stenio Araújo', tipo: 'existente', jogador: stenio },
    ])
  })

  it('ninguém escolhido: lista vazia', () => {
    expect(confirmacaoDoCadastro([])).toEqual([])
  })
})
