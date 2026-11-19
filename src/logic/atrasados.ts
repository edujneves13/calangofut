import { TAMANHO_TIME, type Time } from './tipos'

/**
 * Coloca quem chegou depois na próxima vaga do último time incompleto.
 * Sem vaga, abre um novo time no fim. Os outros times não mudam.
 */
export function adicionarAtrasado(times: Time[], jogador: { id: string; estrelas: number }): Time[] {
  if (times.some((t) => t.jogadorIds.includes(jogador.id))) return times

  const ultimo = times[times.length - 1]
  if (ultimo && ultimo.jogadorIds.length < TAMANHO_TIME) {
    const jogadorIds = [...ultimo.jogadorIds, jogador.id]
    return [
      ...times.slice(0, -1),
      { jogadorIds, somaEstrelas: ultimo.somaEstrelas + jogador.estrelas, completo: jogadorIds.length === TAMANHO_TIME },
    ]
  }

  return [...times, { jogadorIds: [jogador.id], somaEstrelas: jogador.estrelas, completo: false }]
}
