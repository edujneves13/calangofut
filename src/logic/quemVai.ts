import { confirmacaoDoCadastro, montarConfirmacao, type ItemConfirmacao } from './confirmacao'
import type { ListaLida } from './leitor'
import { normalizarNome } from './normalizar'
import type { Jogador } from './tipos'

/** Marcado = chegou (entra no sorteio agora). Desmarcado = chega depois (entra no último time). */
export type StatusLinha = 'chegou' | 'nao-chegou'

/** Uma linha da tela "Quem vai pro sorteio?": rascunho até tocar em Continuar. */
export interface Linha {
  chave: string
  /** Como veio na lista (ou o nome do cadastro). */
  texto: string
  goleiro: boolean
  status: StatusLinha
  tipo: ItemConfirmacao['tipo']
  /** Existente, ou o escolhido em "É ele". */
  jogador: Jogador | null
  sugestao: Jogador | null
  /** Só para "parecido". */
  escolha: 'ele' | 'novo' | null
  /** Jogador novo: 0 até escolher. */
  estrelas: number
}

let contador = 0
const chave = () => `l${++contador}`

function deItem(item: ItemConfirmacao, goleiro: boolean, status: StatusLinha): Linha {
  const base = { chave: chave(), texto: item.texto, status, tipo: item.tipo, escolha: null }
  if (item.tipo === 'existente') {
    return { ...base, goleiro: goleiro || item.jogador.goleiro, jogador: item.jogador, sugestao: null, estrelas: item.jogador.estrelas }
  }
  if (item.tipo === 'parecido') {
    return { ...base, goleiro, jogador: null, sugestao: item.sugestoes[0] ?? null, estrelas: 0 }
  }
  return { ...base, goleiro, jogador: null, sugestao: null, estrelas: 0 }
}

/** Repetidos (mesmo jogador ou mesmo nome novo) ficam só uma vez. */
function semRepetidos(linhas: Linha[]): Linha[] {
  const vistos = new Set<string>()
  return linhas.filter((l) => {
    const id = l.jogador ? `j:${l.jogador.id}` : `t:${normalizarNome(l.texto)}`
    if (vistos.has(id)) return false
    vistos.add(id)
    return true
  })
}

/** Lista lida → linhas. Quem tinha ❌ já saiu no leitor. Goleiros entram como chegou (não vão para o sorteio). */
export function linhasDaLista(lista: ListaLida, ativos: Jogador[]): Linha[] {
  const jogadores = montarConfirmacao(lista.jogadores.map((j) => j.nome), ativos).map((item) => deItem(item, false, 'chegou'))
  const goleiros = montarConfirmacao(lista.goleiros.map((g) => g.nome), ativos).map((item) => deItem(item, true, 'chegou'))
  return semRepetidos([...jogadores, ...goleiros])
}

/** "Selecionar do cadastro": todos já cadastrados e como chegou. */
export function linhasDoCadastro(escolhidos: Jogador[]): Linha[] {
  return confirmacaoDoCadastro(escolhidos).map((item) => deItem(item, false, 'chegou'))
}

export function novaLinha(dados: { nome: string; estrelas: number; goleiro: boolean } | { jogador: Jogador }): Linha {
  if ('jogador' in dados) return deItem({ texto: dados.jogador.nome, tipo: 'existente', jogador: dados.jogador }, false, 'chegou')
  return { ...deItem({ texto: dados.nome.trim(), tipo: 'novo' }, dados.goleiro, 'chegou'), estrelas: dados.estrelas }
}

export const nomeDaLinha = (l: Linha) => l.jogador?.nome ?? l.texto
export const ehNova = (l: Linha) => l.tipo === 'novo' || (l.tipo === 'parecido' && l.escolha === 'novo')
export const faltaEscolha = (l: Linha) => l.tipo === 'parecido' && l.escolha === null
export const faltaEstrelas = (l: Linha) => ehNova(l) && !l.goleiro && l.estrelas === 0
/** Quantas linhas ainda pedem ação do admin (trava o Continuar). */
export const pendencias = (linhas: Linha[]) => linhas.filter((l) => faltaEscolha(l) || faltaEstrelas(l)).length

export type Ordem = 'az' | 'estrelas'

const porNome = (a: Linha, b: Linha) => nomeDaLinha(a).localeCompare(nomeDaLinha(b), 'pt-BR')
const ORDENAR: Record<Ordem, (a: Linha, b: Linha) => number> = {
  az: porNome,
  estrelas: (a, b) => b.estrelas - a.estrelas || porNome(a, b),
}

export interface Secoes {
  faltamEstrelas: Linha[]
  confirmarNome: Linha[]
  noSorteio: Linha[]
  chegamDepois: Linha[]
  goleiros: Linha[]
}

/** Cada linha numa seção só. Pendência vem antes de tudo: a linha fica lá até ser resolvida. */
export function secoes(linhas: Linha[], ordem: Ordem): Secoes {
  const s: Secoes = { faltamEstrelas: [], confirmarNome: [], noSorteio: [], chegamDepois: [], goleiros: [] }
  for (const l of [...linhas].sort(ORDENAR[ordem])) {
    if (faltaEscolha(l)) s.confirmarNome.push(l)
    else if (faltaEstrelas(l)) s.faltamEstrelas.push(l)
    else if (l.goleiro) s.goleiros.push(l)
    else if (l.status === 'chegou') s.noSorteio.push(l)
    else s.chegamDepois.push(l)
  }
  return s
}

/** Card de contagem. noSorteio inclui marcados com pendência; total = jogadores de linha (sem goleiros). */
export function contagem(linhas: Linha[]) {
  const deLinha = linhas.filter((l) => !l.goleiro)
  const noSorteio = deLinha.filter((l) => l.status === 'chegou').length
  return { noSorteio, total: deLinha.length, chegamDepois: deLinha.length - noSorteio, goleiros: linhas.length - deLinha.length }
}

const ESTRELAS_PADRAO = 3

/**
 * "Ignorar tudo": novos sem estrelas ganham 3★ e nomes parecidos viram "É ele" com a sugestão.
 * Devolve linhas novas (o array original fica intacto, para o Desfazer).
 */
export function ignorarTudo(linhas: Linha[]): { linhas: Linha[]; novos: number; iguais: number } {
  let novos = 0
  let iguais = 0
  const resolvidas = linhas.map((l): Linha => {
    if (faltaEscolha(l)) {
      if (l.sugestao) {
        iguais++
        return { ...l, escolha: 'ele', jogador: l.sugestao, estrelas: l.sugestao.estrelas }
      }
      novos++
      return { ...l, escolha: 'novo', estrelas: ESTRELAS_PADRAO }
    }
    if (faltaEstrelas(l)) {
      novos++
      return { ...l, estrelas: ESTRELAS_PADRAO }
    }
    return l
  })
  return { linhas: resolvidas, novos, iguais }
}

/** Aviso do Ignorar tudo: só contagens, nunca nomes (cabe com 15 pendências). */
export function textoIgnorarTudo({ novos, iguais }: { novos: number; iguais: number }): string {
  const total = novos + iguais
  const partes = [
    novos > 0 && `${novos} ${novos === 1 ? 'novo' : 'novos'} com 3★`,
    iguais > 0 && `${iguais} ${iguais === 1 ? 'nome igual' : 'nomes iguais'} ao cadastro`,
  ].filter(Boolean)
  return `${total} ${total === 1 ? 'pendência resolvida' : 'pendências resolvidas'}: ${partes.join(', ')}.`
}
