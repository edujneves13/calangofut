import { quemGanhaFica } from './quemGanhaFica'
import { todosContraTodos } from './todosContraTodos'
import type { FormatoId, FormatoJogo } from './tipos'

export const FORMATOS: Record<FormatoId, FormatoJogo> = {
  'quem-ganha-fica': quemGanhaFica,
  'todos-contra-todos': todosContraTodos,
}
