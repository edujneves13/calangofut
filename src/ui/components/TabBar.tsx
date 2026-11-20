import { Pause, SlidersHorizontal, SoccerBall, Timer, UsersThree } from '@phosphor-icons/react'
import type { EstadoNaBarra } from '../../logic/cronometro'
import { Icon } from './Icon'
import s from './TabBar.module.css'

export type Aba = 'times' | 'jogadores' | 'cronometro' | 'ajustes'

const ABAS = [
  { id: 'times', rotulo: 'Times', icone: SoccerBall },
  { id: 'jogadores', rotulo: 'Jogadores', icone: UsersThree },
  { id: 'cronometro', rotulo: 'Cronômetro', icone: Timer },
  { id: 'ajustes', rotulo: 'Ajustes', icone: SlidersHorizontal },
] as const

interface Props {
  ativa: Aba
  onTrocar: (aba: Aba) => void
  /** Cronômetro rodando ou pausado: anel e tempo no item, em qualquer aba (times-durante-v2, item 9). */
  cronometro?: EstadoNaBarra | null
}

// Anel de 34 px em volta do ícone.
const R = 15
const CIRCUNFERENCIA = 2 * Math.PI * R

function ItemCronometro({ estado }: { estado: EstadoNaBarra }) {
  return (
    <>
      <span className={s.anel} data-tom={estado.tom} aria-hidden="true">
        <svg viewBox="0 0 34 34" className={s.anelSvg}>
          <circle cx="17" cy="17" r={R} className={s.trilho} />
          <circle
            cx="17"
            cy="17"
            r={R}
            className={s.progresso}
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * estado.progresso}
          />
        </svg>
        <Icon icon={estado.tom === 'pausado' ? Pause : Timer} size={18} />
      </span>
      <span className={s.tempo} data-tom={estado.tom} aria-hidden="true">
        {estado.texto}
      </span>
    </>
  )
}

/** Menu de baixo flutuante (DESIGN.md 7.3). Inativas mostram só o ícone. */
export function TabBar({ ativa, onTrocar, cronometro }: Props) {
  return (
    <nav className={s.barra} aria-label="Menu principal">
      {ABAS.map(({ id, rotulo, icone }) => {
        const ehAtiva = id === ativa
        // Na própria aba o tempo já está grande na tela: o item fica normal.
        const crono = id === 'cronometro' && !ehAtiva ? cronometro : null
        return (
          <button
            key={id}
            type="button"
            className={`${s.item} ${ehAtiva ? s.ativo : ''}`}
            aria-current={ehAtiva ? 'page' : undefined}
            aria-label={crono ? crono.rotulo : ehAtiva ? undefined : rotulo}
            onClick={() => onTrocar(id)}
          >
            {crono ? (
              <ItemCronometro estado={crono} />
            ) : (
              <>
                <Icon icon={icone} size={ehAtiva ? 20 : 22} />
                {ehAtiva && rotulo}
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
