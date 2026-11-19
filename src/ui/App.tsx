import { useEffect, useState } from 'react'
import { db } from './db'

/** Tela provisória: só confirma que o app fala com o Supabase. Substitua pelas telas reais. */
export function App() {
  const [logado, setLogado] = useState<boolean | null>(null)

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setLogado(Boolean(data.session)))
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Pelada Sorteio</h1>
      <p>{logado === null ? 'Conectando…' : logado ? 'Logado.' : 'Supabase conectado. Ninguém logado.'}</p>
    </main>
  )
}
