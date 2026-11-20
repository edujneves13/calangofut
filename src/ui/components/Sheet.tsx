import { X } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import { IconButton } from './IconButton'
import s from './Overlay.module.css'

/** Abre e fecha um <dialog> nativo conforme `aberto`, e avisa quando o usuário fecha (Esc). */
function useDialogo(aberto: boolean, onFechar: () => void) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const fechar = () => onFechar()
    d.addEventListener('close', fechar)
    return () => d.removeEventListener('close', fechar)
  }, [onFechar])
  return ref
}

interface PropsSheet {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
}

/** Bottom sheet. Fecha no scrim, no ×, com Esc e arrastando a alça para baixo. */
export function Sheet({ aberto, onFechar, titulo, children }: PropsSheet) {
  const ref = useDialogo(aberto, onFechar)
  const inicioY = useRef<number | null>(null)

  const arrastar = {
    onPointerDown: (e: React.PointerEvent) => {
      inicioY.current = e.clientY
      ;(e.target as Element).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (inicioY.current === null || !ref.current) return
      const dy = Math.max(0, e.clientY - inicioY.current)
      ref.current.style.transform = `translateY(${dy}px)`
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (inicioY.current === null || !ref.current) return
      const dy = e.clientY - inicioY.current
      ref.current.style.transform = ''
      inicioY.current = null
      if (dy > 80) onFechar()
    },
  }

  return (
    <dialog
      ref={ref}
      className={`${s.dialogo} ${s.sheet}`}
      aria-label={titulo}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar() // toque no scrim
      }}
    >
      {aberto && (
        <>
          <div className={s.alcaArea} {...arrastar}>
            <span className={s.alca} />
          </div>
          <div className={s.topo}>
            <h2 className={s.titulo}>{titulo}</h2>
            <IconButton icone={X} rotulo="Fechar" semFundo onClick={onFechar} />
          </div>
          <div className={s.corpo}>{children}</div>
        </>
      )}
    </dialog>
  )
}

interface PropsModal {
  aberto: boolean
  titulo: string
  texto: string
  confirmar: string
  cancelar: string
  onConfirmar: () => void
  onCancelar: () => void
  /** Ação destrutiva (excluir, sair) */
  perigo?: boolean
}

/** Confirmação de ação que desfaz trabalho. Título em pergunta + consequência (DESIGN.md 7.12). */
export function ConfirmModal({ aberto, titulo, texto, confirmar, cancelar, onConfirmar, onCancelar, perigo }: PropsModal) {
  const ref = useDialogo(aberto, onCancelar)
  return (
    <dialog ref={ref} className={`${s.dialogo} ${s.modal}`} aria-label={titulo}>
      {aberto && (
        <>
          <h2 className={s.titulo}>{titulo}</h2>
          <p className={s.modalTexto}>{texto}</p>
          <div className={s.modalBotoes}>
            <Button className={perigo ? s.perigo : undefined} onClick={onConfirmar}>
              {confirmar}
            </Button>
            <Button variante="secundario" onClick={onCancelar}>
              {cancelar}
            </Button>
          </div>
        </>
      )}
    </dialog>
  )
}
