import { CaretDown } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import s from './Badge.module.css'

type VarianteFixa = 'nivel' | 'soma' | 'incompleto' | 'goleiro' | 'novo' | 'cadastrado'

interface PropsFixo {
  variante: VarianteFixa
  children: ReactNode
  rotulo?: string
}

/** Selo só leitura (DESIGN.md 7.7). `rotulo` = aria-label, ex.: "16 estrelas". */
export function Badge({ variante, children, rotulo }: PropsFixo) {
  return (
    <span className={`${s.selo} ${s[variante]}`} aria-label={rotulo}>
      {children}
    </span>
  )
}

interface PropsEstrelas {
  /** 0 = ainda sem estrelas (jogador novo) */
  estrelas: number
  onClick: () => void
  /** Nome do jogador, para o leitor de tela. */
  nome: string
  textoVazio: string
}

/** Selo de estrelas tocável (rodada 4): abre o seletor de estrelas. */
export function BadgeEstrelas({ estrelas, onClick, nome, textoVazio }: PropsEstrelas) {
  const vazio = estrelas === 0
  return (
    <button
      type="button"
      className={`${s.selo} ${vazio ? s.darEstrelas : s.editavel}`}
      onClick={onClick}
      aria-label={vazio ? `${textoVazio}: ${nome}` : `${estrelas} estrelas, ${nome}. Mudar`}
    >
      {vazio ? textoVazio : `${estrelas}★`}
      {!vazio && <Icon icon={CaretDown} size={12} />}
    </button>
  )
}
