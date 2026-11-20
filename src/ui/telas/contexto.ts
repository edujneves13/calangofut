import { createContext, useContext } from 'react'
import type { Configuracoes } from '../../data/configuracoes'
import type { Pelada } from '../../data/peladas'
import type { Presenca } from '../../data/presencas'
import type { Jogador } from '../../logic/tipos'

/** Tudo que as telas mostram, carregado uma vez ao entrar e de novo quando o app volta para a frente. */
export interface Dados {
  config: Configuracoes
  pelada: Pelada
  /** Ativos e inativos; cada tela filtra o que precisa. */
  jogadores: Jogador[]
  presencas: Presenca[]
}

export type TelaAjustes = 'inicio' | 'pelada'

export interface Contexto {
  dados: Dados
  /** Troca partes dos dados depois de gravar no banco. */
  atualizar: (mudancas: Partial<Dados>) => void
  recarregar: () => Promise<void>
  /** Abre a aba Jogadores (ex.: cadastro vazio no fluxo do sorteio). */
  irParaJogadores: () => void
  /** Esconde o menu de baixo durante o fluxo do sorteio. */
  setFluxoAberto: (aberto: boolean) => void
}

export const ContextoApp = createContext<Contexto | null>(null)

export function useApp(): Contexto {
  const ctx = useContext(ContextoApp)
  if (!ctx) throw new Error('useApp fora do Shell')
  return ctx
}

/** Atualiza ou acrescenta jogadores na lista local. */
export function juntarJogadores(lista: Jogador[], novos: Jogador[]): Jogador[] {
  const porId = new Map(lista.map((j) => [j.id, j]))
  for (const j of novos) porId.set(j.id, j)
  return [...porId.values()]
}
