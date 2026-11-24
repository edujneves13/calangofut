import type { Session } from '@supabase/supabase-js'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { ToastProvider } from './components/Toast'
import { db } from './db'
import { Login } from './telas/Login'
import { Shell } from './telas/Shell'
import t from './telas/Telas.module.css'

// Página de componentes: só em `npm run dev`, no endereço /dev. Não entra no app publicado.
const Vitrine = import.meta.env.DEV ? lazy(() => import('./dev/Vitrine').then((m) => ({ default: m.Vitrine }))) : null

export function App() {
  if (Vitrine && window.location.pathname === '/dev') {
    return (
      <Suspense fallback={null}>
        <Vitrine />
      </Suspense>
    )
  }
  return (
    <ToastProvider>
      <Entrada />
      <Analytics />
    </ToastProvider>
  )
}

/** Mostra o login ou o app, conforme a sessão do Supabase (guardada no celular). */
function Entrada() {
  // undefined = ainda verificando
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined)
  const [expirou, setExpirou] = useState(false)

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = db.auth.onAuthStateChange((evento, nova) => {
      setSessao((antiga) => {
        if (antiga && !nova && evento !== 'SIGNED_OUT') setExpirou(true)
        return nova
      })
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return <div className={t.carregando} aria-busy="true" />
  if (!sessao) return <Login sessaoExpirou={expirou} />
  return <Shell />
}
