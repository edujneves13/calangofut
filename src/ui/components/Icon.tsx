import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

interface Props {
  icon: PhosphorIcon
  /** 18 metadados · 20 botão · 22 lista (DESIGN.md 6) */
  size?: 12 | 18 | 20 | 22 | 24 | 32 | 56
  /** Só para ícone sozinho, sem texto ao lado. */
  label?: string
  weight?: 'regular' | 'fill'
  className?: string
}

/** Ícone Phosphor com a cor do texto em volta (currentColor). */
export function Icon({ icon: Componente, size = 22, label, weight = 'regular', className }: Props) {
  return (
    <Componente
      size={size}
      weight={weight}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}
