import { HandPalm, SneakerMove } from '@phosphor-icons/react'
import { TAMANHO_TIME } from '../../logic/tipos'
import { Badge } from './Badge'
import { Icon } from './Icon'
import s from './TeamCard.module.css'

interface Props {
  numero: number
  jogadores: { id: string; nome: string; estrelas: number; goleiro?: boolean }[]
  somaEstrelas: number
  completo: boolean
  /** Texto de "vaga" vindo do COPY.md */
  textoVaga: string
  /** Aviso do COPY.md 4.2 quando o time foi montado por ordem de chegada */
  aviso?: string
  /** Linha de alerta discreta, ex.: "3 craques neste time" */
  alerta?: string
}

/**
 * Card de time (docs/design/times-durante-v2.md, item 2): o elemento forte da tela,
 * com faixa verde no topo. Soma de estrelas só aparece aqui, nunca no texto copiado.
 */
export function TeamCard({ numero, jogadores, somaEstrelas, completo, textoVaga, aviso, alerta }: Props) {
  const vagas = Math.max(0, TAMANHO_TIME - jogadores.length)
  return (
    <section className={s.card} aria-label={`Time ${numero}`}>
      <div className={s.faixa}>
        <svg className={s.meioCampo} viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="22" />
          <line x1="40" y1="0" x2="40" y2="80" />
        </svg>
        <h2 className={s.nome}>Time {numero}</h2>
        {completo ? (
          <Badge variante="soma" rotulo={`${somaEstrelas} estrelas`}>
            {somaEstrelas}★
          </Badge>
        ) : (
          <Badge variante="incompleto">
            Incompleto · {jogadores.length}/{TAMANHO_TIME}
          </Badge>
        )}
      </div>
      <ul className={s.lista}>
        {jogadores.map((j) => (
          <li key={j.id} className={s.linha}>
            <Icon icon={j.goleiro ? HandPalm : SneakerMove} size={20} className={s.icone} />
            <span className={s.jogador}>{j.nome}</span>
            <span className={s.estrelas} aria-label={`${j.estrelas} estrelas`}>
              {j.estrelas}★
            </span>
          </li>
        ))}
        {Array.from({ length: vagas }, (_, i) => (
          <li key={`vaga-${i}`} className={`${s.linha} ${s.vaga}`}>
            <span className={s.circulo} aria-hidden />
            {textoVaga}
          </li>
        ))}
      </ul>
      {alerta && <p className={s.alerta}>{alerta}</p>}
      {aviso && <p className={s.aviso}>{aviso}</p>}
    </section>
  )
}
