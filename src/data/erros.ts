import type { PostgrestError } from '@supabase/supabase-js'

export type CodigoErro = 'nome-duplicado' | 'nao-encontrado' | 'sem-permissao' | 'desconhecido'

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
  '23505': 'nome-duplicado', // valor único repetido
  '42501': 'sem-permissao', // bloqueado pelo RLS
  PGRST116: 'nao-encontrado', // .single() sem linha
}

export function traduzirErro(erro: PostgrestError): ErroDados {
  return new ErroDados(CODIGOS[erro.code] ?? 'desconhecido', erro.message)
}
