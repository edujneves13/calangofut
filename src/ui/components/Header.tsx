import { ArrowLeft, X } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Avatar } from './Avatar'
import { IconButton } from './IconButton'
import s from './Header.module.css'

interface Props {
  titulo: string
  subtitulo?: string
  /** Telas principais mostram o avatar da pelada. */
  avatar?: { nome: string; src?: string | null }
  /** Telas internas mostram voltar no lugar do avatar. */
  onVoltar?: () => void
  /** Tela cheia de edição: ✕ no lugar da seta, e o voltar cancela (ex.: Editar times). */
  fechar?: boolean
  acoes?: ReactNode
}

export function Header({ titulo, subtitulo, avatar, onVoltar, fechar, acoes }: Props) {
  return (
    <header className={s.cabecalho}>
      {onVoltar ? (
        <IconButton icone={fechar ? X : ArrowLeft} rotulo={fechar ? 'Cancelar' : 'Voltar'} onClick={onVoltar} semFundo />
      ) : (
        avatar && <Avatar nome={avatar.nome} src={avatar.src} borda />
      )}
      <div className={s.textos}>
        <h1 className={s.titulo}>{titulo}</h1>
        {subtitulo && <p className={s.subtitulo}>{subtitulo}</p>}
      </div>
      {acoes && <div className={s.acoes}>{acoes}</div>}
    </header>
  )
}
