import type { FormatoId } from '../logic/formatos/tipos'
import type { Db } from './cliente'
import type { Tables, TablesUpdate } from './database.types'
import { traduzirErro } from './erros'

export interface Configuracoes {
  formatoAte4: FormatoId
  formato5: FormatoId
  duracaoQuemGanhaFica: number
  duracaoTodosContraTodos: number
  /** HH:MM */
  horarioPadrao: string
  localPadrao: string
}

function paraConfiguracoes(linha: Tables<'configuracoes'>): Configuracoes {
  return {
    formatoAte4: linha.formato_ate_4 as FormatoId,
    formato5: linha.formato_5 as FormatoId,
    duracaoQuemGanhaFica: linha.duracao_quem_ganha_fica,
    duracaoTodosContraTodos: linha.duracao_todos_contra_todos,
    horarioPadrao: linha.horario_padrao.slice(0, 5),
    localPadrao: linha.local_padrao,
  }
}

export async function lerConfiguracoes(db: Db): Promise<Configuracoes> {
  const { data, error } = await db.from('configuracoes').select('*').single()
  if (error) throw traduzirErro(error)
  return paraConfiguracoes(data)
}

export async function salvarConfiguracoes(db: Db, mudancas: Partial<Configuracoes>): Promise<Configuracoes> {
  const valores: TablesUpdate<'configuracoes'> = {
    formato_ate_4: mudancas.formatoAte4,
    formato_5: mudancas.formato5,
    duracao_quem_ganha_fica: mudancas.duracaoQuemGanhaFica,
    duracao_todos_contra_todos: mudancas.duracaoTodosContraTodos,
    horario_padrao: mudancas.horarioPadrao,
    local_padrao: mudancas.localPadrao,
  }
  const { data, error } = await db.from('configuracoes').update(valores).eq('id', true).select().single()
  if (error) throw traduzirErro(error)
  return paraConfiguracoes(data)
}
