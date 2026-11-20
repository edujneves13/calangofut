import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes } from 'react'
import { Icon } from './Icon'
import s from './IconButton.module.css'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icone: PhosphorIcon
  /** Obrigatório: botão só com ícone precisa de nome para leitor de tela. */
  rotulo: string
  semFundo?: boolean
}

export function IconButton({ icone, rotulo, semFundo, className, ...resto }: Props) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      className={[s.botao, semFundo && s.semFundo, className].filter(Boolean).join(' ')}
      {...resto}
    >
      <Icon icon={icone} size={22} />
    </button>
  )
}
