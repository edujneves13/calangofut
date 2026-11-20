import { Minus, Plus } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { limitarMinutos, MIN_MINUTOS } from '../../../logic/cronometro'
import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { Sheet } from '../../components/Sheet'
import t from '../Telas.module.css'
import s from './TempoSheet.module.css'

const ATALHOS = [5, 6, 7, 12, 15]

/** Ajuda da folha quando o tempo vale só para hoje (cronômetro e sorteio). COPY 5. */
export const AJUDA_TEMPO = 'Vale só para hoje. O padrão muda em Ajustes.'

interface Props {
  aberto: boolean
  minutos: number
  /** Linha de ajuda abaixo dos atalhos. */
  ajuda?: string
  onFechar: () => void
  onUsar: (minutos: number) => void
}

/** "Outro": tempo de jogo só para hoje (COPY.md 5, tempo personalizado). */
export function TempoSheet({ aberto, minutos, ajuda, onFechar, onUsar }: Props) {
  const [n, setN] = useState(minutos)
  useEffect(() => {
    if (aberto) setN(minutos)
  }, [aberto, minutos])

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Tempo de jogo">
      <div className={t.coluna}>
        <div className={s.contador}>
          <IconButton icone={Minus} rotulo="Menos" disabled={n <= MIN_MINUTOS} onClick={() => setN(limitarMinutos(n - 1))} />
          <p className={s.numero} aria-live="polite">
            {n}
            <span className={s.unidade}>minutos</span>
          </p>
          <IconButton icone={Plus} rotulo="Mais" onClick={() => setN(limitarMinutos(n + 1))} />
        </div>
        <div className={`${t.chips} ${s.atalhos}`}>
          {ATALHOS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={n === m}
              className={`${t.chip} ${n === m ? t.chipAtivo : ''}`}
              onClick={() => setN(m)}
            >
              {m} min
            </button>
          ))}
        </div>
        {ajuda && <p className={`${t.pequeno} ${t.centro}`}>{ajuda}</p>}
        <Button onClick={() => onUsar(n)}>Usar {n} min</Button>
      </div>
    </Sheet>
  )
}
