import type { Jogador } from '../logic/tipos'
import type { Db } from './cliente'
import type { Tables } from './database.types'
import { traduzirErro } from './erros'

export type NovoJogador = Pick<Jogador, 'nome' | 'estrelas'> & Partial<Pick<Jogador, 'tipo' | 'goleiro'>>

function paraJogador(linha: Tables<'jogadores'>): Jogador {
  return {
    id: linha.id,
    nome: linha.nome,
    estrelas: linha.estrelas as Jogador['estrelas'],
    tipo: linha.tipo as Jogador['tipo'],
    goleiro: linha.goleiro,
    ativo: linha.ativo,
  }
}

export async function listarJogadores(db: Db, opcoes: { incluirInativos?: boolean } = {}): Promise<Jogador[]> {
  let consulta = db.from('jogadores').select('*').order('nome')
  if (!opcoes.incluirInativos) consulta = consulta.eq('ativo', true)
  const { data, error } = await consulta
  if (error) throw traduzirErro(error)
  return data.map(paraJogador)
}

export async function criarJogador(db: Db, novo: NovoJogador): Promise<Jogador> {
  const { data, error } = await db
    .from('jogadores')
    .insert({ ...novo, nome: novo.nome.trim() })
    .select()
    .single()
  if (error) throw traduzirErro(error)
  return paraJogador(data)
}

export async function atualizarJogador(db: Db, id: string, mudancas: Partial<Omit<Jogador, 'id'>>): Promise<Jogador> {
  const valores = mudancas.nome === undefined ? mudancas : { ...mudancas, nome: mudancas.nome.trim() }
  const { data, error } = await db.from('jogadores').update(valores).eq('id', id).select().single()
  if (error) throw traduzirErro(error)
  return paraJogador(data)
}

export async function desativarJogador(db: Db, id: string): Promise<void> {
  await atualizarJogador(db, id, { ativo: false })
}
