import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import s from './Button.module.css'

const CLASSES = {
  principal: s.principal,
  secundario: s.secundario,
  tracejado: s.tracejado,
  pequeno: s.pequeno,
  'pequeno-secundario': s.pequenoSecundario,
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: keyof typeof CLASSES
  icone?: PhosphorIcon
  /** O texto continua; só o ícone vira spinner (DESIGN.md 7.1). */
  carregando?: boolean
}

export function Button({ variante = 'principal', icone, carregando, className, children, disabled, ...resto }: Props) {
  return (
    <button
      type="button"
      className={[s.botao, CLASSES[variante], className].filter(Boolean).join(' ')}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? <span className={s.spinner} aria-hidden /> : icone && <Icon icon={icone} size={20} />}
      {children}
    </button>
  )
}
