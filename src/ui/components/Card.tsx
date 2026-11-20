import type { HTMLAttributes } from 'react'
import s from './Card.module.css'

interface Props extends HTMLAttributes<HTMLDivElement> {
  semPadding?: boolean
}

export function Card({ semPadding, className, ...resto }: Props) {
  return <div className={[s.card, !semPadding && s.comPadding, className].filter(Boolean).join(' ')} {...resto} />
}
