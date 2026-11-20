import { SlidersHorizontal, SoccerBall, Timer } from '@phosphor-icons/react'
import { Icon } from './Icon'
import s from './TabBar.module.css'

export type Aba = 'times' | 'cronometro' | 'ajustes'

const ABAS = [
  { id: 'times', rotulo: 'Times', icone: SoccerBall },
  { id: 'cronometro', rotulo: 'Cronômetro', icone: Timer },
  { id: 'ajustes', rotulo: 'Ajustes', icone: SlidersHorizontal },
] as const

interface Props {
  ativa: Aba
  onTrocar: (aba: Aba) => void
}

/** Menu de baixo flutuante (DESIGN.md 7.3). Inativas mostram só o ícone. */
export function TabBar({ ativa, onTrocar }: Props) {
  return (
    <nav className={s.barra} aria-label="Menu principal">
      {ABAS.map(({ id, rotulo, icone }) => {
        const ehAtiva = id === ativa
        return (
          <button
            key={id}
            type="button"
            className={`${s.item} ${ehAtiva ? s.ativo : ''}`}
            aria-current={ehAtiva ? 'page' : undefined}
            aria-label={ehAtiva ? undefined : rotulo}
            onClick={() => onTrocar(id)}
          >
            <Icon icon={icone} size={ehAtiva ? 20 : 22} />
            {ehAtiva && rotulo}
          </button>
        )
      })}
    </nav>
  )
}
