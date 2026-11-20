import { Star, Warning } from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { useId, type ReactNode } from 'react'
import { Icon } from './Icon'
import s from './Controls.module.css'

interface PropsEstrelas {
  /** 0 = nenhuma ainda */
  valor: number
  onMudar: (estrelas: number) => void
  rotulo: string
  compacto?: boolean
}

/** 5 estrelas tocáveis. Tocar na que já está ativa não zera: mínimo 1 (DESIGN.md 7.9). */
export function StarPicker({ valor, onMudar, rotulo, compacto }: PropsEstrelas) {
  return (
    <div className={`${s.estrelas} ${compacto ? s.compacto : ''}`} role="radiogroup" aria-label={rotulo}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
          className={`${s.estrela} ${n <= valor ? s.cheia : ''}`}
          onClick={() => onMudar(n)}
        >
          <Star size={compacto ? 26 : 32} weight={n <= valor ? 'fill' : 'regular'} aria-hidden />
        </button>
      ))}
    </div>
  )
}

interface PropsToggle {
  rotulo: string
  ligado: boolean
  onMudar: (ligado: boolean) => void
}

export function Toggle({ rotulo, ligado, onMudar }: PropsToggle) {
  const id = useId()
  return (
    <div className={s.toggleLinha}>
      <span id={id}>{rotulo}</span>
      <button
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-labelledby={id}
        className={s.toggle}
        onClick={() => onMudar(!ligado)}
      />
    </div>
  )
}

interface PropsSegmentado<T extends string | number> {
  rotulo: string
  opcoes: { valor: T; texto: string }[]
  valor: T
  onMudar: (valor: T) => void
}

export function Segmented<T extends string | number>({ rotulo, opcoes, valor, onMudar }: PropsSegmentado<T>) {
  return (
    <div className={s.segmentado} role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={o.valor === valor}
          className={`${s.opcao} ${o.valor === valor ? s.opcaoAtiva : ''}`}
          onClick={() => onMudar(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  )
}

interface PropsStepper {
  /** 1, 2 ou 3 */
  atual: number
  rotulos: [string, string, string]
}

export function Stepper({ atual, rotulos }: PropsStepper) {
  return (
    <div className={s.stepper} aria-label={`Etapa ${atual} de 3: ${rotulos[atual - 1]}`} role="group">
      <div className={s.barras} aria-hidden>
        {rotulos.map((r, i) => (
          <span key={r} className={`${s.barra} ${i < atual ? s.barraFeita : ''}`} />
        ))}
      </div>
      <div className={s.rotulos} aria-hidden>
        {rotulos.map((r, i) => (
          <span key={r} className={i === atual - 1 ? s.rotuloAtual : ''}>
            {r}
          </span>
        ))}
      </div>
    </div>
  )
}

interface PropsVazio {
  icone?: PhosphorIcon
  /** Ilustração do mascote no lugar do ícone (nunca em erro). */
  imagem?: { src: string; alt: string }
  titulo: string
  texto?: string
  acao?: ReactNode
}

export function EmptyState({ icone, imagem, titulo, texto, acao }: PropsVazio) {
  return (
    <div className={s.vazio}>
      {imagem ? (
        <img src={imagem.src} alt={imagem.alt} width={160} />
      ) : (
        icone && (
          <span className={s.vazioIcone}>
            <Icon icon={icone} size={56} />
          </span>
        )
      )}
      <h2 className={s.vazioTitulo}>{titulo}</h2>
      {texto && <p className={s.vazioTexto}>{texto}</p>}
      {acao}
    </div>
  )
}

/** Aviso dentro da tela: borda tracejada âmbar, sempre dizendo o que fazer. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className={s.aviso} role="status">
      <span className={s.avisoIcone}>
        <Icon icon={Warning} size={22} />
      </span>
      <div>{children}</div>
    </div>
  )
}

export function SectionLabel({ children, destaque }: { children: ReactNode; destaque?: boolean }) {
  return <h2 className={`${s.secao} ${destaque ? s.secaoDestaque : ''}`}>{children}</h2>
}
