import { SneakerMove } from '@phosphor-icons/react'
import type { Time } from '../../../logic/tipos'
import { Icon } from '../../components/Icon'
import { useApp } from '../contexto'
import s from './Sorteando.module.css'
import t from '../Telas.module.css'

/** Sorteando… (COPY 2.7): calango + chips caindo nos times, sem interação. */
export function Sorteando({ times }: { times: Time[] }) {
  const { dados } = useApp()
  const nomeDe = new Map(dados.jogadores.map((j) => [j.id, j.nome.split(' ')[0]!]))
  let atraso = 0
  return (
    <main className={`${t.tela} ${t.semMenu} ${s.tela}`} aria-live="polite">
      <img className={s.imagem} src="/mascote/sorteando.webp" alt="Calango sorteando os times" />
      <div className={t.centro}>
        <p className={t.destaque}>Sorteando…</p>
        <p className={t.texto2}>Equilibrando os times</p>
      </div>
      <div className={s.grade} aria-hidden="true">
        {times.slice(0, 4).map((time, i) => (
          <div key={i} className={s.time}>
            <b>Time {i + 1}</b>
            <div className={s.chips}>
              {time.jogadorIds.map((id) => (
                <span key={id} className={s.chip} style={{ animationDelay: `${(atraso += 55)}ms` }}>
                  <Icon icon={SneakerMove} size={12} />
                  {nomeDe.get(id)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
