import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type Db = SupabaseClient<Database>

/**
 * Cria o cliente do Supabase. Usa só a anon key (pública): quem protege os dados é o RLS.
 * A sessão fica salva no celular para os admins não precisarem logar toda semana.
 */
export function criarCliente(url: string, anonKey: string, opcoes: { persistirSessao?: boolean } = {}): Db {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: opcoes.persistirSessao ?? true, autoRefreshToken: true },
  })
}
