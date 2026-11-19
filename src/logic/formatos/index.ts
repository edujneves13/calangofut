import { quemGanhaFica } from './quemGanhaFica'
import { todosContraTodos } from './todosContraTodos'
import type { FormatoId, FormatoJogo } from './tipos'

export const FORMATOS: Record<FormatoId, FormatoJogo> = {
  'quem-ganha-fica': quemGanhaFica,
  'todos-contra-todos': todosContraTodos,
}

/** Formato sugerido pelo número de times: 5 → todos contra todos; o resto → quem ganha fica. */
export function formatoPadrao(numTimes: number): FormatoId {
  return numTimes === 5 ? 'todos-contra-todos' : 'quem-ganha-fica'
}
