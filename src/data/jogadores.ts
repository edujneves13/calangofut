import type { Jogador } from '../logic/tipos'
import type { Db } from './cliente'
import type { Tables } from './database.types'
import { traduzirErro } from './erros'

export type NovoJogador = Pick<Jogador, 'nome' | 'estrelas'> & Partial<Pick<Jogador, 'tipo' | 'goleiro'>>

type LinhaJogador = Tables<'jogadores'> & { apelidos: Pick<Tables<'apelidos'>, 'texto'>[] }

/** Jogador junto com os apelidos dele (relação apelidos.jogador_id). */
const COLUNAS = '*, apelidos(texto)'

function paraJogador(linha: LinhaJogador): Jogador {
  return {
    id: linha.id,
    nome: linha.nome,
    apelidos: linha.apelidos.map((a) => a.texto).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    estrelas: linha.estrelas as Jogador['estrelas'],
    tipo: linha.tipo as Jogador['tipo'],
    goleiro: linha.goleiro,
    ativo: linha.ativo,
  }
}

export async function listarJogadores(db: Db, opcoes: { incluirInativos?: boolean } = {}): Promise<Jogador[]> {
  let consulta = db.from('jogadores').select(COLUNAS).order('nome')
  if (!opcoes.incluirInativos) consulta = consulta.eq('ativo', true)
  const { data, error } = await consulta
  if (error) throw traduzirErro(error)
  return data.map(paraJogador)
}

export async function criarJogador(db: Db, novo: NovoJogador): Promise<Jogador> {
  const { data, error } = await db
    .from('jogadores')
    .insert({ ...novo, nome: novo.nome.trim() })
    .select(COLUNAS)
    .single()
  if (error) throw traduzirErro(error)
  return paraJogador(data)
}

export async function atualizarJogador(
  db: Db,
  id: string,
  mudancas: Partial<Omit<Jogador, 'id' | 'apelidos'>>,
): Promise<Jogador> {
  const valores = mudancas.nome === undefined ? mudancas : { ...mudancas, nome: mudancas.nome.trim() }
  const { data, error } = await db.from('jogadores').update(valores).eq('id', id).select(COLUNAS).single()
  if (error) throw traduzirErro(error)
  return paraJogador(data)
}

export async function desativarJogador(db: Db, id: string): Promise<void> {
  await atualizarJogador(db, id, { ativo: false })
}

/** Cadastra vários de uma vez. É uma gravação só: se um nome repetir, nenhum é criado. */
export async function criarJogadores(db: Db, novos: NovoJogador[]): Promise<Jogador[]> {
  if (novos.length === 0) return []
  const { data, error } = await db
    .from('jogadores')
    // defaultToNull: false → campo que faltar em algum item usa o padrão do banco, não null.
    .insert(
      novos.map((n) => ({ ...n, nome: n.nome.trim() })),
      { defaultToNull: false },
    )
    .select(COLUNAS)
  if (error) throw traduzirErro(error)
  return data.map(paraJogador)
}

/**
 * "Excluir" jogadores na tela = desativar: somem da lista e da leitura da lista do WhatsApp,
 * mas continuam nas peladas antigas e voltam pelo filtro Inativos.
 */
export async function desativarJogadores(db: Db, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await db.from('jogadores').update({ ativo: false }).in('id', ids)
  if (error) throw traduzirErro(error)
}

/** Guarda outro jeito como o nome do jogador aparece na lista do WhatsApp. */
export async function adicionarApelido(db: Db, jogadorId: string, texto: string): Promise<void> {
  const { error } = await db.from('apelidos').insert({ jogador_id: jogadorId, texto: texto.trim() })
  if (error) throw traduzirErro(error)
}

export async function removerApelido(db: Db, jogadorId: string, texto: string): Promise<void> {
  const { error } = await db.from('apelidos').delete().eq('jogador_id', jogadorId).eq('texto', texto)
  if (error) throw traduzirErro(error)
}
