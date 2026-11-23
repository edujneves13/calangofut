import { describe, expect, it } from 'vitest'
import { lerLista } from '../../src/logic/leitor'
import {
  contagem,
  ignorarTudo,
  linhasDaLista,
  novaLinha,
  pendencias,
  secoes,
  textoIgnorarTudo,
  type Linha,
} from '../../src/logic/quemVai'
import type { Jogador } from '../../src/logic/tipos'
import { fixture } from './fixtures'

function jogador(id: string, nome: string, extra: Partial<Jogador> = {}): Jogador {
  return { id, nome, apelidos: [], estrelas: 3, tipo: 'mensalista', goleiro: false, ativo: true, ...extra }
}

const stenio = jogador('1', 'Stenio Araújo', { estrelas: 4 })
const juninho = jogador('2', 'Juninho', { estrelas: 5 })
const hugo = jogador('3', 'Hugo', { estrelas: 2 })
const marcio = jogador('4', 'Márcio', { goleiro: true })
const cadastro = [stenio, juninho, hugo, marcio]

const nomes = (ls: Linha[]) => ls.map((l) => l.jogador?.nome ?? l.texto)

describe('linhasDaLista', () => {
  const linhas = linhasDaLista(lerLista(fixture('lista-baguncada.txt'), '2026-11-20'), cadastro)

  it('todos da lista entram marcados (no sorteio); goleiros à parte', () => {
    expect(linhas.every((l) => l.status === 'chegou')).toBe(true)
    expect(linhas.filter((l) => l.goleiro).map((l) => l.jogador?.nome)).toEqual(['Márcio'])
  })
})

describe('secoes', () => {
  const linhas = linhasDaLista(lerLista('Juninho\nHugo\nAraújo\nZé\nGoleiros\nMárcio'), cadastro)
  const depois = linhas.map((l) => (l.texto === 'Hugo' ? { ...l, status: 'nao-chegou' as const } : l))

  it('separa pendências, no sorteio, chegam depois e goleiros', () => {
    const s = secoes(depois, 'az')
    expect(nomes(s.faltamEstrelas)).toEqual(['Zé'])
    expect(s.confirmarNome.map((l) => l.texto)).toEqual(['Araújo'])
    expect(nomes(s.noSorteio)).toEqual(['Juninho'])
    expect(nomes(s.chegamDepois)).toEqual(['Hugo'])
    expect(nomes(s.goleiros)).toEqual(['Márcio'])
  })

  it('quem tem pendência fica na seção da pendência mesmo desmarcado', () => {
    const ze = depois.map((l) => (l.texto === 'Zé' ? { ...l, status: 'nao-chegou' as const } : l))
    expect(nomes(secoes(ze, 'az').faltamEstrelas)).toEqual(['Zé'])
    expect(nomes(secoes(ze, 'az').chegamDepois)).toEqual(['Hugo'])
  })

  it('ordena por nome (A–Z) ou por estrelas (★, maior primeiro) dentro da seção', () => {
    const todos = [novaLinha({ jogador: hugo }), novaLinha({ jogador: juninho }), novaLinha({ jogador: stenio })]
    expect(nomes(secoes(todos, 'az').noSorteio)).toEqual(['Hugo', 'Juninho', 'Stenio Araújo'])
    expect(nomes(secoes(todos, 'estrelas').noSorteio)).toEqual(['Juninho', 'Stenio Araújo', 'Hugo'])
  })
})

describe('contagem', () => {
  it('no sorteio conta todos os marcados, inclusive com pendência; total sem goleiros', () => {
    const linhas = linhasDaLista(lerLista('Juninho\nHugo\nZé\nGoleiros\nMárcio'), cadastro).map((l) =>
      l.texto === 'Hugo' ? { ...l, status: 'nao-chegou' as const } : l,
    )
    expect(contagem(linhas)).toEqual({ noSorteio: 2, total: 3, chegamDepois: 1, goleiros: 1 })
  })
})

describe('ignorarTudo', () => {
  const linhas = linhasDaLista(lerLista('Araújo\nZé\nBia\nJuninho'), cadastro)

  it('novos ganham 3★ e parecidos viram "É ele"', () => {
    const r = ignorarTudo(linhas)
    expect(r.novos).toBe(2)
    expect(r.iguais).toBe(1)
    expect(pendencias(r.linhas)).toBe(0)
    const st = r.linhas.find((l) => l.texto === 'Araújo')!
    expect(st).toMatchObject({ escolha: 'ele', jogador: stenio, estrelas: 4 })
    expect(r.linhas.find((l) => l.texto === 'Zé')!.estrelas).toBe(3)
  })

  it('não mexe em quem não tem pendência nem no original', () => {
    const r = ignorarTudo(linhas)
    expect(r.linhas.find((l) => l.texto === 'Juninho')).toBe(linhas.find((l) => l.texto === 'Juninho'))
    expect(pendencias(linhas)).toBe(3)
  })

  it('sugestão fraca (só letras parecidas) vira novo com 3★, sem juntar pessoas', () => {
    const [marcinho] = linhasDaLista(lerLista('Marcinho'), cadastro)
    expect(marcinho).toMatchObject({ tipo: 'parecido', sugestao: marcio })
    const r = ignorarTudo([marcinho!])
    expect(r).toMatchObject({ novos: 1, iguais: 0 })
    expect(r.linhas[0]).toMatchObject({ escolha: 'novo', jogador: null, estrelas: 3 })
  })

  it('parecido sem sugestão vira novo com 3★', () => {
    const solto: Linha = { ...novaLinha({ nome: 'Xis', estrelas: 0, goleiro: false }), tipo: 'parecido' }
    const r = ignorarTudo([solto])
    expect(r).toMatchObject({ novos: 1, iguais: 0 })
    expect(r.linhas[0]).toMatchObject({ escolha: 'novo', estrelas: 3 })
  })
})

describe('textoIgnorarTudo', () => {
  it('só contagens; partes com zero somem', () => {
    expect(textoIgnorarTudo({ novos: 2, iguais: 1 })).toBe('3 pendências resolvidas: 2 novos com 3★, 1 nome igual ao cadastro.')
    expect(textoIgnorarTudo({ novos: 5, iguais: 0 })).toBe('5 pendências resolvidas: 5 novos com 3★.')
    expect(textoIgnorarTudo({ novos: 0, iguais: 2 })).toBe('2 pendências resolvidas: 2 nomes iguais ao cadastro.')
    expect(textoIgnorarTudo({ novos: 1, iguais: 0 })).toBe('1 pendência resolvida: 1 novo com 3★.')
  })
})
