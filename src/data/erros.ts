import type { PostgrestError } from '@supabase/supabase-js'

export type CodigoErro = 'nome-duplicado' | 'data-duplicada' | 'nao-encontrado' | 'sem-permissao' | 'desconhecido'

/** Erro do banco já traduzido para algo que a tela sabe mostrar. */
export class ErroDados extends Error {
  constructor(
    readonly codigo: CodigoErro,
    mensagem: string,
  ) {
    super(mensagem)
    this.name = 'ErroDados'
  }
}

const CODIGOS: Record<string, CodigoErro> = {
  '42501': 'sem-permissao', // bloqueado pelo RLS
  PGRST116: 'nao-encontrado', // .single() sem linha
}

// Valor único repetido (23505): o nome da restrição diz qual campo repetiu.
const RESTRICOES_UNICAS: Record<string, CodigoErro> = {
  jogadores_nome_ativo: 'nome-duplicado',
  peladas_data_key: 'data-duplicada',
}

export function traduzirErro(erro: PostgrestError): ErroDados {
  if (erro.code === '23505') {
    const restricao = Object.keys(RESTRICOES_UNICAS).find((nome) => erro.message.includes(`"${nome}"`))
    return new ErroDados(restricao ? RESTRICOES_UNICAS[restricao]! : 'desconhecido', erro.message)
  }
  return new ErroDados(CODIGOS[erro.code] ?? 'desconhecido', erro.message)
}
