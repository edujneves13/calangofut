import type { StatusPresenca } from '../../../data/presencas'
import { confirmacaoDoCadastro, montarConfirmacao, type ItemConfirmacao } from '../../../logic/confirmacao'
import type { ListaLida } from '../../../logic/leitor'
import { normalizarNome } from '../../../logic/normalizar'
import type { Jogador } from '../../../logic/tipos'

/** Uma linha da tela "Confira a lista": rascunho até tocar em Continuar. */
export interface Linha {
  chave: string
  /** Como veio na lista (ou o nome do cadastro). */
  texto: string
  goleiro: boolean
  status: StatusPresenca
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

function deItem(item: ItemConfirmacao, goleiro: boolean, status: StatusPresenca): Linha {
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

/** Lista do WhatsApp → linhas. ❌ na lista entra como "não vem". Goleiros entram como chegou (não vão para o sorteio). */
export function linhasDaLista(lista: ListaLida, ativos: Jogador[]): Linha[] {
  const jogadores = montarConfirmacao(lista.jogadores.map((j) => j.nome), ativos).map((item, i) =>
    deItem(item, false, lista.jogadores[i]!.presente ? 'chegou' : 'ausente'),
  )
  const goleiros = montarConfirmacao(lista.goleiros.map((g) => g.nome), ativos).map((item) => deItem(item, true, 'chegou'))
  return semRepetidos([...jogadores, ...goleiros])
}

/** "Selecionar jogadores": todos já cadastrados e como chegou. */
export function linhasDoCadastro(escolhidos: Jogador[]): Linha[] {
  return confirmacaoDoCadastro(escolhidos).map((item) => deItem(item, false, 'chegou'))
}

export function novaLinha(dados: { nome: string; estrelas: number; goleiro: boolean } | { jogador: Jogador }): Linha {
  if ('jogador' in dados) return deItem({ texto: dados.jogador.nome, tipo: 'existente', jogador: dados.jogador }, false, 'chegou')
  return { ...deItem({ texto: dados.nome.trim(), tipo: 'novo' }, dados.goleiro, 'chegou'), estrelas: dados.estrelas }
}

export const nomeDaLinha = (l: Linha) => l.jogador?.nome ?? l.texto
export const ehNova = (l: Linha) => l.tipo === 'novo' || (l.tipo === 'parecido' && l.escolha === 'novo')
export const faltaEscolha = (l: Linha) => l.tipo === 'parecido' && l.escolha === null && l.status !== 'ausente'
export const faltaEstrelas = (l: Linha) => ehNova(l) && !l.goleiro && l.estrelas === 0 && l.status !== 'ausente'
/** Quem não vem e ainda não está no cadastro não é cadastrado. */
export const vaiGravar = (l: Linha) => l.jogador !== null || (ehNova(l) && l.status !== 'ausente')
