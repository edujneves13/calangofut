import { SoccerBall } from '@phosphor-icons/react'
import { Icon } from '../../components/Icon'
import s from './Anel.module.css'

export type TomAnel = 'normal' | 'fim'

const IMAGENS = {
  inicio: '/mascote/cronometro-inicio.webp',
  pausa: '/mascote/cronometro-pausa.webp',
  fim: '/mascote/cronometro-fim.webp',
} as const
export type ImagemAnel = keyof typeof IMAGENS

// Desenho em 320 × 320: círculo da ilustração com 200 de diâmetro, anel de 12 em volta, marcações por fora.
const C = 160
const R_ANEL = 116
const CIRCUNFERENCIA = 2 * Math.PI * R_ANEL
const MARCAS = Array.from({ length: 60 }, (_, i) => i)
const RAIOS_FIM = Array.from({ length: 12 }, (_, i) => i)

function ponto(angulo: number, raio: number) {
  const a = ((angulo - 90) * Math.PI) / 180
  return { x: C + raio * Math.cos(a), y: C + raio * Math.sin(a) }
}

interface Props {
  /** 0 = cheio … 1 = vazio */
  progresso: number
  tom: TomAnel
  imagem: ImagemAnel
  /** Âmbar no último minuto. */
  ultimo?: boolean
  /** Anel parado e apagado. Vale junto com o último minuto. */
  pausado?: boolean
}

/** Anel clássico do cronômetro (DESIGN.md 7.15, B1): ilustração no centro, anel que esvazia e bola na ponta. */
export function Anel({ progresso, tom, imagem, ultimo, pausado }: Props) {
  const restante = tom === 'fim' ? 1 : 1 - progresso
  const ponta = ponto(restante * 360, R_ANEL)
  return (
    <div className={[s.anel, tom === 'fim' && s.fim, ultimo && s.ultimo, pausado && s.pausado].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 320 320" className={s.svg}>
        {MARCAS.map((i) => {
          const grande = i % 5 === 0
          const a = ponto(i * 6, 128)
          const b = ponto(i * 6, grande ? 140 : 134)
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={grande ? s.marcaGrande : s.marca} />
          )
        })}
        {tom === 'fim' &&
          RAIOS_FIM.map((i) => {
            const a = ponto(i * 30 + 15, 146)
            const b = ponto(i * 30 + 15, 158)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={s.raio} />
          })}
        <circle cx={C} cy={C} r={R_ANEL} className={s.trilho} />
        <circle
          cx={C}
          cy={C}
          r={R_ANEL}
          className={s.progresso}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - restante)}
          transform={`rotate(-90 ${C} ${C})`}
        />
      </svg>
      <div className={s.ilustracao}>
        {(Object.keys(IMAGENS) as ImagemAnel[]).map((k) => (
          <img key={k} src={IMAGENS[k]} alt="" className={k === imagem ? s.visivel : undefined} />
        ))}
      </div>
      {tom !== 'fim' && (
        <span className={s.bola} style={{ left: `${(ponta.x / 320) * 100}%`, top: `${(ponta.y / 320) * 100}%` }}>
          <Icon icon={SoccerBall} size={20} weight="fill" />
        </span>
      )}
    </div>
  )
}
