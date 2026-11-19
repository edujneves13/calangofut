import { execSync } from 'node:child_process'
import { criarCliente, type Db } from '../../src/data/cliente'

let config: { url: string; anonKey: string } | null = null

/** URL e anon key do Supabase local (lidas do `supabase status`, ou de variáveis de ambiente). */
export function configLocal(): { url: string; anonKey: string } {
  if (config) return config
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    config = { url: process.env.SUPABASE_URL, anonKey: process.env.SUPABASE_ANON_KEY }
    return config
  }
  const status = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const valor = (nome: string) => new RegExp(`^${nome}="?([^"\\n]+)"?$`, 'm').exec(status)?.[1]
  const url = valor('API_URL')
  const anonKey = valor('ANON_KEY')
  if (!url || !anonKey) throw new Error('Supabase local não está rodando. Rode: npm run db:start')
  config = { url, anonKey }
  return config
}

/** Cliente sem login. */
export function clienteDeslogado(): Db {
  const { url, anonKey } = configLocal()
  return criarCliente(url, anonKey, { persistirSessao: false })
}

/** Cliente logado como o admin de teste do seed.sql. */
export async function clienteDeTeste(): Promise<Db> {
  const db = clienteDeslogado()
  const { error } = await db.auth.signInWithPassword({ email: 'admin@teste.local', password: 'senha-de-teste' })
  if (error) throw error
  return db
}

/** Apaga os dados de teste (presenças somem junto com as peladas). */
export async function limparBanco(db: Db): Promise<void> {
  for (const tabela of ['peladas', 'jogadores'] as const) {
    const { error } = await db.from(tabela).delete().not('id', 'is', null)
    if (error) throw error
  }
}
