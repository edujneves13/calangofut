import { casarNome } from './casamento'
import type { Jogador } from './tipos'

/** Como cada nome digitado ou colado se relaciona com o cadastro. */
export type ItemConfirmacao =
  | { texto: string; tipo: 'existente'; jogador: Jogador }
  | { texto: string; tipo: 'parecido'; sugestoes: Jogador[] }
  | { texto: string; tipo: 'novo' }

/**
 * Classifica os nomes para a tela de confirmação (Ajustes → vários de uma vez e "Confira a lista").
 * Existente: igual ao nome ou a um apelido. Parecido: precisa que o admin escolha. Novo: vai ser cadastrado.
 */
export function montarConfirmacao(nomes: string[], jogadores: Jogador[]): ItemConfirmacao[] {
  return nomes.map((texto) => {
    const r = casarNome(texto, jogadores)
    if (r.tipo === 'exato') return { texto, tipo: 'existente', jogador: r.jogador }
    if (r.sugestoes.length > 0) return { texto, tipo: 'parecido', sugestoes: r.sugestoes }
    return { texto, tipo: 'novo' }
  })
}

/**
 * Caminho "Selecionar jogadores" na etapa 1/3: os jogadores escolhidos chegam à "Confira a lista"
 * já como existentes, sem passar pelo leitor nem pelo casamento de nomes.
 */
export function confirmacaoDoCadastro(jogadores: Jogador[]): ItemConfirmacao[] {
  return jogadores.map((jogador) => ({ texto: jogador.nome, tipo: 'existente', jogador }))
}
