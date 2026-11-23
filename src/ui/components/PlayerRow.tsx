import { Check, HandPalm, SneakerMove } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import s from './PlayerRow.module.css'

interface Props {
  nome: string
  goleiro?: boolean
  /** Linha de baixo, ex.: "Mensalista" */
  sub?: ReactNode
  /** Check de presença à esquerda. undefined = sem check. */
  chegou?: boolean
  onTrocarChegou?: () => void
  /** Destaque de jogador fora do cadastro. */
  novo?: boolean
  /** Lado direito: selo, botão "Chegou", chevron… */
  direita?: ReactNode
  /** Linha inteira tocável (Ajustes → Jogadores). */
  onClick?: () => void
  /** Check de seleção (escolher do cadastro, excluir vários): desmarcado não fica riscado. */
  selecao?: boolean
  /** Nome vira campo de texto (confirmação do lote). `rotulo` = aria-label. */
  editarNome?: { onMudar: (nome: string) => void; rotulo: string }
  /** Ícone e nome em cinza (ex.: "Não chegaram", "Chegam depois"). Nunca riscado: quem chega depois não está cancelado. */
  apagado?: boolean
}

/** Linha de jogador (DESIGN.md 7.6). Ordem alfabética é responsabilidade de quem lista. */
export function PlayerRow({ nome, goleiro, sub, chegou, onTrocarChegou, novo, direita, onClick, selecao, apagado, editarNome }: Props) {
  const temCheck = chegou !== undefined
  const classes = [s.linha, apagado && s.apagado, novo && s.novo, temCheck && !chegou && !selecao && !apagado && s.riscado, onClick && s.tocavel]
  return (
    <div
      className={classes.filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick &&
        ((e) => {
          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        })
      }
    >
      {temCheck && (
        <button
          type="button"
          role="checkbox"
          aria-checked={chegou}
          aria-label={selecao ? nome : chegou ? `Chegou: ${nome}` : `Não chegou: ${nome}`}
          className={s.check}
          disabled={!onTrocarChegou}
          onClick={(e) => {
            e.stopPropagation()
            onTrocarChegou?.()
          }}
        >
          <span className={`${s.bolinha} ${chegou ? s.marcado : ''}`}>
            <Icon icon={Check} size={18} />
          </span>
        </button>
      )}
      <span className={s.icone}>
        <Icon icon={goleiro ? HandPalm : SneakerMove} size={22} />
      </span>
      <div className={s.centro}>
        {editarNome ? (
          <input
            className={`${s.nome} ${s.campoNome}`}
            value={nome}
            aria-label={editarNome.rotulo}
            autoCapitalize="words"
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => editarNome.onMudar(e.target.value)}
          />
        ) : (
          <div className={s.nome}>{nome}</div>
        )}
        {sub && <div className={s.sub}>{sub}</div>}
      </div>
      {direita && (
        <div className={s.direita} onClick={(e) => e.stopPropagation()}>
          {direita}
        </div>
      )}
    </div>
  )
}
