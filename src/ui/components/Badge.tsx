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

interface PropsSelect {
  /** 0 = ainda sem estrelas */
  estrelas: number
  goleiro: boolean
  onMudar: (m: { estrelas: number; goleiro: boolean }) => void
  /** aria-label, ex.: "Estrelas: Pedro" */
  rotulo: string
  textoVazio: string
}

/**
 * Selo de estrelas como dropdown nativo (confirmação do lote): 1★ a 5★ ou Goleiro.
 * No celular abre o seletor do sistema, que dá para usar com uma mão.
 */
export function SeloEstrelasSelect({ estrelas, goleiro, onMudar, rotulo, textoVazio }: PropsSelect) {
  const valor = goleiro ? 'goleiro' : estrelas ? String(estrelas) : ''
  return (
    <span className={`${s.selo} ${s.select} ${valor ? s.editavel : s.darEstrelas}`}>
      {goleiro ? 'Goleiro' : estrelas ? `${estrelas}★` : textoVazio}
      <Icon icon={CaretDown} size={12} />
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(e) => {
          const v = e.target.value
          onMudar(v === 'goleiro' ? { estrelas, goleiro: true } : { estrelas: Number(v), goleiro: false })
        }}
      >
        <option value="" disabled>
          {textoVazio}
        </option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n}★
          </option>
        ))}
        <option value="goleiro">Goleiro</option>
      </select>
    </span>
  )
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
