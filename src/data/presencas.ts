import type { Db } from './cliente'
import type { Tables } from './database.types'
import { traduzirErro } from './erros'
import type { Pelada } from './peladas'

// marcado_presente_em é gravado pelo banco (trigger presencas_hora): muda só de ausente para presente.
export interface Presenca {
  id: string
  peladaId: string
  jogadorId: string
  presente: boolean
  marcadoPresenteEm: string | null
  origem: 'lista' | 'na-hora'
}

function paraPresenca(linha: Tables<'presencas'>): Presenca {
  return {
    id: linha.id,
    peladaId: linha.pelada_id,
    jogadorId: linha.jogador_id,
    presente: linha.presente,
    marcadoPresenteEm: linha.marcado_presente_em,
    origem: linha.origem as Presenca['origem'],
  }
}

export async function listarPresencas(db: Db, peladaId: string): Promise<Presenca[]> {
  const { data, error } = await db.from('presencas').select('*').eq('pelada_id', peladaId)
  if (error) throw traduzirErro(error)
  return data.map(paraPresenca)
}

/** Salva quem veio na lista colada. Colar de novo atualiza em vez de duplicar. */
export async function salvarPresencasDaLista(
  db: Db,
  peladaId: string,
  itens: { jogadorId: string; presente: boolean }[],
): Promise<Presenca[]> {
  const linhas = itens.map((i) => ({
    pelada_id: peladaId,
    jogador_id: i.jogadorId,
    presente: i.presente,
    origem: 'lista',
  }))
  const { data, error } = await db.from('presencas').upsert(linhas, { onConflict: 'pelada_id,jogador_id' }).select()
  if (error) throw traduzirErro(error)
  return data.map(paraPresenca)
}

/** Jogador que não estava na lista, adicionado na hora. */
export async function adicionarNaHora(db: Db, peladaId: string, jogadorId: string): Promise<Presenca> {
  const { data, error } = await db
    .from('presencas')
    .upsert(
      { pelada_id: peladaId, jogador_id: jogadorId, presente: true, origem: 'na-hora' },
      { onConflict: 'pelada_id,jogador_id' },
    )
    .select()
    .single()
  if (error) throw traduzirErro(error)
  return paraPresenca(data)
}

/** Um toque em Presente/Ausente. */
export async function marcarPresenca(db: Db, peladaId: string, jogadorId: string, presente: boolean): Promise<Presenca> {
  const { data, error } = await db
    .from('presencas')
    .update({ presente })
    .eq('pelada_id', peladaId)
    .eq('jogador_id', jogadorId)
    .select()
    .single()
  if (error) throw traduzirErro(error)
  return paraPresenca(data)
}

/** Marcado presente depois do sorteio = chegou depois (vai para o último time). */
export function chegouDepois(presenca: Presenca, pelada: Pelada): boolean {
  if (!presenca.presente || !presenca.marcadoPresenteEm || !pelada.sorteadaEm) return false
  return new Date(presenca.marcadoPresenteEm) > new Date(pelada.sorteadaEm)
}
