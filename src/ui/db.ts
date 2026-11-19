import { criarCliente } from '../data/cliente'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local (veja .env.example).')
}

/** Cliente do Supabase usado por todas as telas. */
export const db = criarCliente(url, anonKey)
