import { TAMANHO_TIME } from '../../logic/tipos'
import { Badge } from './Badge'
import { PlayerRow } from './PlayerRow'
import s from './TeamCard.module.css'

interface Props {
  numero: number
  jogadores: { id: string; nome: string; estrelas: number }[]
  somaEstrelas: number
  completo: boolean
  /** Texto de "vaga" vindo do COPY.md */
  textoVaga: string
  /** Aviso do COPY.md 4.2 quando o time foi montado por ordem de chegada */
  aviso?: string
}

/** Card de time do carrossel (DESIGN.md 7.5). Soma de estrelas só aparece aqui, nunca no texto copiado. */
export function TeamCard({ numero, jogadores, somaEstrelas, completo, textoVaga, aviso }: Props) {
  const vagas = Math.max(0, TAMANHO_TIME - jogadores.length)
  return (
    <section className={`${s.card} ${completo ? '' : s.incompleto}`} aria-label={`Time ${numero}`}>
      <div className={s.topo}>
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
      <div>
        {jogadores.map((j) => (
          <PlayerRow
            key={j.id}
            nome={j.nome}
            direita={
              <Badge variante="nivel" rotulo={`${j.estrelas} estrelas`}>
                {j.estrelas}★
              </Badge>
            }
          />
        ))}
        {Array.from({ length: vagas }, (_, i) => (
          <div key={i} className={s.vaga}>
            <span className={s.circulo} aria-hidden />
            {textoVaga}
          </div>
        ))}
      </div>
      {aviso && <p className={s.aviso}>{aviso}</p>}
    </section>
  )
}
