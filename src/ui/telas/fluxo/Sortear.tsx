import { Clock, Plus, Shuffle } from '@phosphor-icons/react'
import { useState } from 'react'
import { FORMATOS } from '../../../logic/formatos'
import type { FormatoId } from '../../../logic/formatos/tipos'
import { MINIMO_JOGADORES, sortearTimes, type ParticipanteSorteio } from '../../../logic/sorteio'
import { TAMANHO_TIME, type Time } from '../../../logic/tipos'
import { Button } from '../../components/Button'
import { Notice, SectionLabel, Segmented, Stepper } from '../../components/Controls'
import { EscolhaTempo } from '../cronometro/EscolhaTempo'
import { AJUDA_TEMPO } from '../cronometro/TempoSheet'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { ConfirmModal } from '../../components/Sheet'
import { plural } from '../../util'
import { useApp, type Dados } from '../contexto'
import { ETAPAS } from './Colar'
import t from '../Telas.module.css'

const POR_EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco']

/** Participantes do sorteio a partir das presenças salvas. */
export function participantesDe(dados: Dados): ParticipanteSorteio[] {
  const porId = new Map(dados.jogadores.map((j) => [j.id, j]))
  return dados.presencas.flatMap((p) => {
    const j = porId.get(p.jogadorId)
    return j ? [{ id: j.id, estrelas: j.estrelas, goleiro: j.goleiro, presente: p.status === 'chegou' }] : []
  })
}

/** "4 times de 5 e 1 time com 3" */
export function resumoTimes(n: number): string {
  const completos = Math.floor(n / TAMANHO_TIME)
  const resto = n % TAMANHO_TIME
  const base = `${plural(completos, 'time', 'times')} de ${TAMANHO_TIME}`
  return resto ? `${base} e 1 time com ${resto}` : base
}

interface Props {
  onVoltar: () => void
  onAdicionar: () => void
  onSortear: (times: Time[], formato: FormatoId, duracaoMin: number) => void
}

/** 3/3 Regras: Como vai ser hoje? (COPY 2.6 e 4.1; resumo em fluxo-sorteio-v2-20-novembro.md §4) */
export function Sortear({ onVoltar, onAdicionar, onSortear }: Props) {
  const { dados } = useApp()
  const { config } = dados
  const [formato, setFormato] = useState<FormatoId>(config.formatoPadrao)
  const [tempo, setTempo] = useState(config.tempoJogo)
  const [craques, setCraques] = useState<{ quantos: number; times: number } | null>(null)

  const participantes = participantesDe(dados)
  const deLinha = participantes.filter((p) => !p.goleiro && p.presente)
  const n = deLinha.length
  const naoChegaram = participantes.filter((p) => !p.goleiro && !p.presente).length
  const max = config.maxCincoEstrelas
  const maxTexto = POR_EXTENSO[max] ?? String(max)

  function sortear(semRegraDosCraques = false) {
    const r = sortearTimes(participantes, { maxCincoEstrelas: semRegraDosCraques ? Infinity : max })
    if (r.ok) {
      setCraques(null)
      onSortear(r.times, formato, tempo)
    } else if (r.motivo === 'muitos-cinco-estrelas') {
      setCraques({ quantos: deLinha.filter((p) => p.estrelas === 5).length, times: Math.ceil(n / TAMANHO_TIME) })
    }
  }

  return (
    <main className={`${t.tela} ${t.semMenu} ${t.entrar}`}>
      <Header titulo="Como vai ser hoje?" onVoltar={onVoltar} />
      <Stepper atual={3} rotulos={ETAPAS} />
      {n < MINIMO_JOGADORES ? (
        <>
          <div className={t.resumo}>
            <p className={t.destaque}>{plural(n, 'jogador', 'jogadores')}</p>
            <p className={t.texto2}>Faltam {MINIMO_JOGADORES - n} para sortear</p>
          </div>
          <Notice>O sorteio precisa de pelo menos 10 jogadores de linha. Marque quem chegou ou adicione alguém.</Notice>
          <Button variante="secundario" onClick={onVoltar}>
            Ver quem chegou
          </Button>
          <Button variante="secundario" icone={Plus} onClick={onAdicionar}>
            Adicionar jogador
          </Button>
          <div className={t.rodape}>
            <Button icone={Shuffle} disabled>
              Sortear times
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={t.resumo}>
            <p className={t.destaque}>{n} jogadores no sorteio</p>
            <p className={t.texto2}>{resumoTimes(n)}</p>
            {naoChegaram > 0 && (
              <p className={`${t.pequeno} ${t.resumoNota}`}>
                <Icon icon={Clock} size={18} />
                {plural(naoChegaram, 'jogador ainda não chegou', 'jogadores ainda não chegaram')}
              </p>
            )}
          </div>
          <SectionLabel>Formato</SectionLabel>
          <Segmented
            rotulo="Formato"
            opcoes={(Object.keys(FORMATOS) as FormatoId[]).map((id) => ({ valor: id, texto: FORMATOS[id].nome }))}
            valor={formato}
            onMudar={setFormato}
          />
          <SectionLabel>Tempo de jogo</SectionLabel>
          <EscolhaTempo minutos={tempo} onMudar={setTempo} ajuda={AJUDA_TEMPO} />
          <p className={t.pequeno}>
            Times equilibrados pelas estrelas, com no máximo {max === 1 ? 'um craque' : `${maxTexto} craques`} (5★) por time.
          </p>
          <div className={t.rodape}>
            <Button icone={Shuffle} onClick={() => sortear()}>
              Sortear times
            </Button>
          </div>
        </>
      )}
      <ConfirmModal
        aberto={craques !== null}
        titulo="Sortear sem essa regra?"
        texto={
          craques
            ? `Tem ${craques.quantos} craques (5★) para ${craques.times} times: não dá para ter no máximo ${maxTexto} por time.`
            : ''
        }
        confirmar="Sortear assim mesmo"
        cancelar="Voltar"
        onConfirmar={() => sortear(true)}
        onCancelar={() => setCraques(null)}
      />
    </main>
  )
}
