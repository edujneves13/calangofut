import { SoccerBall } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Segmented } from '../components/Controls'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import type { Cronometro as Crono } from './useCronometro'
import s from './Cronometro.module.css'
import t from './Telas.module.css'

function mmss(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Aba Cronômetro (DESIGN.md 7.15). O estado fica no Shell para continuar contando em outra aba. */
export function Cronometro({ cronometro: c }: { cronometro: Crono }) {
  const [somLiberado, setSomLiberado] = useState(false)
  const ultimoMinuto = c.fase !== 'parado' && c.restante <= 60 && c.restante > 0
  const progresso = c.duracao ? Math.min(1, Math.max(0, 1 - c.restante / c.duracao)) : 0
  const minutos = Math.round(c.duracao / 60)
  const opcoes = [...new Set([8, 10, minutos])].sort((a, b) => a - b).map((m) => ({ valor: m, texto: `${m} min` }))

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header
        titulo="Cronômetro"
        acoes={c.fase === 'rodando' && c.telaAcesa ? <span className={s.nota}>Tela fica acesa</span> : undefined}
      />
      <div className={s.area}>
        <p className={s.ultimo} aria-live="assertive">
          {ultimoMinuto ? 'Último minuto' : ''}
        </p>
        <div className={`${s.numeros} ${ultimoMinuto ? s.ambar : ''}`} role="timer" aria-label={mmss(c.restante)}>
          {mmss(c.restante)}
        </div>
        <div className={s.trilho} aria-hidden="true">
          <div className={s.preenchido} style={{ width: `${progresso * 100}%` }} />
          <span className={s.bola} style={{ left: `${progresso * 100}%`, transform: `translate(-50%, -50%) rotate(${progresso * 1080}deg)` }}>
            <Icon icon={SoccerBall} size={20} weight="fill" />
          </span>
        </div>
        {c.fase === 'parado' ? (
          <Segmented rotulo="Tempo de jogo" opcoes={opcoes} valor={minutos} onMudar={c.setMinutos} />
        ) : (
          <div style={{ height: 44 }} />
        )}
        {c.fase === 'rodando' && c.telaAcesa === false && (
          <p className={t.pequeno}>Seu celular pode apagar a tela durante o jogo. O tempo continua contando.</p>
        )}
      </div>
      <div className={s.controles}>
        {c.fase === 'parado' && (
          <>
            <Button
              className={s.grande}
              onClick={() => {
                setSomLiberado(true)
                c.comecar()
              }}
            >
              Começar
            </Button>
            {!somLiberado && <p className={`${t.pequeno} ${t.centro}`}>Toque em Começar para liberar o apito.</p>}
            <div className={s.dupla}>
              <Button variante="secundario" onClick={() => c.ajustar(-1)}>
                −1 min
              </Button>
              <Button variante="secundario" onClick={() => c.ajustar(1)}>
                +1 min
              </Button>
            </div>
          </>
        )}
        {c.fase === 'rodando' && (
          <>
            <Button className={s.grande} onClick={c.pausar}>
              Pausar
            </Button>
            <div className={s.dupla}>
              <Button variante="secundario" onClick={() => c.ajustar(-1)}>
                −1 min
              </Button>
              <Button variante="secundario" onClick={() => c.ajustar(1)}>
                +1 min
              </Button>
            </div>
          </>
        )}
        {c.fase === 'pausado' && (
          <>
            <Button className={s.grande} onClick={c.continuar}>
              Continuar
            </Button>
            <div className={s.dupla}>
              <Button variante="secundario" onClick={c.zerar}>
                Zerar
              </Button>
              <Button variante="secundario" onClick={() => c.ajustar(1)}>
                +1 min
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

/** Tela laranja de fim de jogo, por cima de qualquer aba. */
export function FimDeJogo({ cronometro: c }: { cronometro: Crono }) {
  return (
    <div className={s.fim} role="alertdialog" aria-label="Fim de jogo">
      <div className={`${s.numeros} ${s.numerosFim}`}>00:00</div>
      <p className={s.fimTitulo}>Fim de jogo</p>
      <div className={s.fimBotoes}>
        <Button className={`${s.grande} ${s.branco}`} onClick={c.zerar}>
          Zerar para o próximo
        </Button>
        <Button variante="secundario" className={s.contornoBranco} onClick={c.pararApito}>
          Parar apito
        </Button>
      </div>
    </div>
  )
}
