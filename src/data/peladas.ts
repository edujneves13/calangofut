import { hojeEmJoaoPessoa, proximoDia } from '../logic/datas'
import type { FormatoId, Jogo } from '../logic/formatos/tipos'
import type { Time } from '../logic/tipos'
import type { Db } from './cliente'
import { lerConfiguracoes } from './configuracoes'
import type { Json, Tables, TablesUpdate } from './database.types'
import { traduzirErro } from './erros'

/** O que fica guardado em peladas.times. */
export interface TimesSalvos {
  times: Time[]
  jogos: Jogo[]
}

export interface Pelada {
  id: string
  /** YYYY-MM-DD */
  data: string
  /** HH:MM */
  horario: string
  local: string
  formato: FormatoId | null
  duracaoMin: number | null
  times: TimesSalvos | null
  sorteadaEm: string | null
}

function paraPelada(linha: Tables<'peladas'>): Pelada {
  return {
    id: linha.id,
    data: linha.data,
    horario: linha.horario.slice(0, 5),
    local: linha.local,
    formato: linha.formato as FormatoId | null,
    duracaoMin: linha.duracao_min,
    times: linha.times as unknown as TimesSalvos | null,
    sorteadaEm: linha.sorteada_em,
  }
}

/** Abre a pelada da data. Cria com horário e local padrão se ainda não existir; se existir, não mexe. */
export async function abrirPelada(db: Db, data: string): Promise<Pelada> {
  const { horarioPadrao, localPadrao } = await lerConfiguracoes(db)
  const criar = await db
    .from('peladas')
    .upsert({ data, horario: horarioPadrao, local: localPadrao }, { onConflict: 'data', ignoreDuplicates: true })
  if (criar.error) throw traduzirErro(criar.error)

  const { data: linha, error } = await db.from('peladas').select('*').eq('data', data).single()
  if (error) throw traduzirErro(error)
  return paraPelada(linha)
}

/**
 * A pelada que a aba Times mostra: a primeira com data de hoje em diante (no horário de João Pessoa).
 * Se nenhuma estiver marcada, abre a do próximo dia da semana das configurações.
 * Assim, "Mudar só a próxima" é respeitado e, depois da meia-noite, a pelada vira para a seguinte.
 */
export async function peladaAtual(db: Db, agora: Date): Promise<Pelada> {
  const { data: linha, error } = await db
    .from('peladas')
    .select('*')
    .gte('data', hojeEmJoaoPessoa(agora))
    .order('data')
    .limit(1)
    .maybeSingle()
  if (error) throw traduzirErro(error)
  if (linha) return paraPelada(linha)

  const { diaSemana } = await lerConfiguracoes(db)
  return abrirPelada(db, proximoDia(agora, diaSemana))
}

async function atualizar(db: Db, id: string, valores: TablesUpdate<'peladas'>): Promise<Pelada> {
  const { data, error } = await db.from('peladas').update(valores).eq('id', id).select().single()
  if (error) throw traduzirErro(error)
  return paraPelada(data)
}

export function atualizarPelada(
  db: Db,
  id: string,
  mudancas: Partial<Pick<Pelada, 'data' | 'horario' | 'local' | 'formato' | 'duracaoMin'>>,
): Promise<Pelada> {
  return atualizar(db, id, {
    data: mudancas.data,
    horario: mudancas.horario,
    local: mudancas.local,
    formato: mudancas.formato,
    duracao_min: mudancas.duracaoMin,
  })
}

/** Grava o resultado do sorteio e a hora dele (relógio do servidor). */
export function salvarSorteio(
  db: Db,
  id: string,
  sorteio: { times: TimesSalvos; formato: FormatoId; duracaoMin: number },
): Promise<Pelada> {
  return atualizar(db, id, {
    times: sorteio.times as unknown as Json,
    formato: sorteio.formato,
    duracao_min: sorteio.duracaoMin,
    sorteada_em: 'now', // valor especial do Postgres: hora do servidor
  })
}

/** Atualiza os times (ex.: atrasado entrando) sem mudar a hora do sorteio. */
export function salvarTimes(db: Db, id: string, times: TimesSalvos): Promise<Pelada> {
  return atualizar(db, id, { times: times as unknown as Json })
}

/** "Tentar novamente": apaga a lista e os times da pelada, para colar outra lista. */
export async function recomecarPelada(db: Db, id: string): Promise<Pelada> {
  const { error } = await db.from('presencas').delete().eq('pelada_id', id)
  if (error) throw traduzirErro(error)
  return atualizar(db, id, { times: null, formato: null, duracao_min: null, sorteada_em: null })
}
