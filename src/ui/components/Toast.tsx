import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import s from './Overlay.module.css'

interface DadosToast {
  texto: string
  tom?: 'sucesso' | 'erro'
  acao?: { texto: string; onClick: () => void }
}

const ContextoToast = createContext<(toast: DadosToast) => void>(() => {})

/** `const mostrarToast = useToast()` em qualquer tela. */
export const useToast = () => useContext(ContextoToast)

/** Um toast por vez; o novo substitui o antigo. 4 s, ou 6 s com "Desfazer" (DESIGN.md 7.13). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [atual, setAtual] = useState<(DadosToast & { id: number }) | null>(null)
  const contador = useRef(0)

  const mostrar = useCallback((toast: DadosToast) => {
    contador.current += 1
    setAtual({ ...toast, id: contador.current })
  }, [])

  useEffect(() => {
    if (!atual) return
    const t = setTimeout(() => setAtual(null), atual.acao ? 6000 : 4000)
    return () => clearTimeout(t)
  }, [atual])

  return (
    <ContextoToast.Provider value={mostrar}>
      {children}
      <div aria-live="polite" role="status">
        {atual && (
          <div key={atual.id} className={`${s.toast} ${atual.tom === 'erro' ? s.erro : s.sucesso}`}>
            <span className={s.toastTexto}>{atual.texto}</span>
            {atual.acao && (
              <button
                type="button"
                className={s.toastAcao}
                onClick={() => {
                  atual.acao!.onClick()
                  setAtual(null)
                }}
              >
                {atual.acao.texto}
              </button>
            )}
          </div>
        )}
      </div>
    </ContextoToast.Provider>
  )
}
