import { Pause, Play } from '@phosphor-icons/react'
import { useState } from 'react'
import { ehUltimoMinuto, formatarTempo, progresso, tempoRestante } from '../../logic/cronometro'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Anel } from './cronometro/Anel'
import { AJUDA_TEMPO } from './cronometro/TempoSheet'
import { EscolhaTempo } from './cronometro/EscolhaTempo'
import type { Cronometro as Crono } from './useCronometro'
import s from './Cronometro.module.css'
import t from './Telas.module.css'

/** Aba Cronômetro (DESIGN.md 7.15, B1 · Anel clássico). O estado fica no Shell. */
export function Cronometro({ cronometro: c }: { cronometro: Crono }) {
  const [somLiberado, setSomLiberado] = useState(false)
  const { estado, agora } = c
  const restante = tempoRestante(estado, agora)
  const ultimo = ehUltimoMinuto(estado, agora)
  const pausado = estado.fase === 'pausado'


  return (
    <main className={`${t.tela} ${t.entrar} ${s.tela}`}>
      <Header titulo="Cronômetro" />
      <div className={s.selo} aria-live="assertive">
        {pausado && <span className={s.seloPausado}>Pausado</span>}
        {!pausado && ultimo && <span className={s.seloAmbar}>Último minuto</span>}
      </div>
      <Anel progresso={progresso(estado, agora)} tom="normal" ultimo={ultimo} pausado={pausado} imagem={pausado ? 'pausa' : 'inicio'} />
      <div className={s.leitura}>
        <p
          className={`${s.numeros} ${ultimo ? s.ambar : ''} ${pausado ? s.piscando : ''}`}
          role="timer"
          aria-label={formatarTempo(restante)}
        >
          {formatarTempo(restante)}
        </p>
        {estado.fase === 'parado' && <p className={t.pequeno}>Pronto para o próximo jogo</p>}
        {estado.fase === 'rodando' && c.telaAcesa === false && (
          <p className={t.pequeno}>Seu celular pode apagar a tela durante o jogo. O tempo continua contando.</p>
        )}
      </div>

      <div className={s.controles}>
        {estado.fase === 'parado' && (
          <>
            <EscolhaTempo minutos={estado.minutos} onMudar={c.setMinutos} ajuda={AJUDA_TEMPO} />
            <Button
              icone={Play}
              className={s.grande}
              onClick={() => {
                setSomLiberado(true)
                c.comecar()
              }}
            >
              Começar
            </Button>
            {!somLiberado && <p className={`${t.pequeno} ${t.centro}`}>Toque em Começar para liberar o apito.</p>}
          </>
        )}
        {(estado.fase === 'rodando' || estado.fase === 'pausado') && (
          <>
            {estado.fase === 'rodando' ? (
              <Button icone={Pause} className={s.grande} onClick={c.pausar}>
                Pausar
              </Button>
            ) : (
              <Button icone={Play} className={s.grande} onClick={c.continuar}>
                Continuar
              </Button>
            )}
            <div className={s.dupla}>
              <Button variante="secundario" onClick={c.zerar}>
                Zerar
              </Button>
              <Button variante="secundario" onClick={c.maisUmMinuto}>
                +1 min
              </Button>
            </div>
          </>
        )}
      </div>

    </main>
  )
}

/** Tela laranja de fim de jogo, por cima de tudo (o menu de baixo fica escondido). */
export function FimDeJogo({ cronometro: c }: { cronometro: Crono }) {
  return (
    <div className={s.fim} role="alertdialog" aria-label="Fim de jogo">
      <Anel progresso={1} tom="fim" imagem="fim" />
      <p className={`${s.numeros} ${s.numerosFim}`}>00:00</p>
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
