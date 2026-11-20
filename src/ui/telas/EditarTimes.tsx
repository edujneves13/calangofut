import { ArrowsLeftRight, CaretRight, HandPalm, Plus, SneakerMove, UserMinus } from '@phosphor-icons/react'
import { useState } from 'react'
import { buscarJogadores, type Trecho } from '../../logic/busca'
import {
  calcularEquilibrio,
  colocarNoTime,
  contarCincoEstrelas,
  moverJogador,
  previaMover,
  previaTroca,
  timeDe,
  tirarDoTime,
  trocarJogadores,
} from '../../logic/edicao'
import { TAMANHO_TIME, type Jogador, type Time } from '../../logic/tipos'
import { Button } from '../components/Button'
import { SectionLabel } from '../components/Controls'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { SearchInput } from '../components/Input'
import { Sheet } from '../components/Sheet'
import { porNome } from '../util'
import s from './EditarTimes.module.css'
import t from './Telas.module.css'

export interface ResultadoEdicao {
  times: Time[]
  /** Saíram dos times: voltam para "Não chegaram". */
  tirados: string[]
  /** Estavam em "Não chegaram" e entraram num time: passam a "chegou". */
  colocados: string[]
}

interface Props {
  times: Time[]
  /** Quem está em "Não chegaram" ao abrir a tela. */
  naoChegaram: Jogador[]
  porId: Map<string, Jogador>
  maxCincoEstrelas: number
  onCancelar: () => void
  /** Só é chamado com mudanças; sem mudança, Concluir só fecha. */
  onConcluir: (resultado: ResultadoEdicao) => Promise<void>
}

/** "16★" para time completo, "3/5" para incompleto. */
function resumoDoTime(tm: Time): string {
  return tm.completo ? `${tm.somaEstrelas}★` : `${tm.jogadorIds.length}/${TAMANHO_TIME}`
}

/** "+1★" / "−1★" (sinal de menos de verdade, não hífen). */
function sinal(n: number): string {
  return `${n > 0 ? '+' : '−'}${Math.abs(n)}★`
}

/**
 * Editar times (docs/design/times-durante-v2.md, item 4). Tudo acontece num rascunho;
 * nada é gravado até o Concluir. A regra dos craques não bloqueia, só avisa.
 */
export function EditarTimes({ times: iniciais, naoChegaram, porId, maxCincoEstrelas, onCancelar, onConcluir }: Props) {
  const [times, setTimes] = useState(iniciais)
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const [adicionarEm, setAdicionarEm] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)

  const estrelasDe = (id: string) => porId.get(id)?.estrelas ?? 0
  const jogador = (id: string) => porId.get(id)
  const noTime = new Set(times.flatMap((tm) => tm.jogadorIds))
  const estavamNoTime = iniciais.flatMap((tm) => tm.jogadorIds)
  // Fora dos times agora: quem não tinha chegado + quem foi tirado, menos quem entrou.
  const fora = [...naoChegaram, ...estavamNoTime.map(jogador).filter((j): j is Jogador => Boolean(j))]
    .filter((j) => !noTime.has(j.id))
    .sort(porNome)
  const equilibrio = calcularEquilibrio(times)

  async function concluir() {
    const tirados = estavamNoTime.filter((id) => !noTime.has(id))
    const colocados = naoChegaram.map((j) => j.id).filter((id) => noTime.has(id))
    const mudou = JSON.stringify(times) !== JSON.stringify(iniciais)
    if (!mudou) return onCancelar()
    setSalvando(true)
    try {
      await onConcluir({ times, tirados, colocados })
    } finally {
      setSalvando(false)
    }
  }

  const aplicar = (novos: Time[] | null) => {
    if (novos) setTimes(novos)
    setEscolhido(null)
    setAdicionarEm(null)
  }

  const todos = [...times.flatMap((tm) => tm.jogadorIds.map(jogador)), ...fora].filter((j): j is Jogador => Boolean(j))
  const resultados = busca.trim() ? buscarJogadores(todos, busca) : []

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header
        titulo="Editar times"
        onVoltar={onCancelar}
        fechar
        acoes={
          <Button variante="pequeno" carregando={salvando} onClick={() => void concluir()}>
            Concluir
          </Button>
        }
      />

      <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar jogador" />

      {busca.trim() ? (
        <ul className={`${t.lista} ${s.resultados}`}>
          {resultados.map(({ jogador: j, trecho }) => {
            const i = timeDe(times, j.id)
            return (
              <li key={j.id}>
                <button type="button" className={s.linha} onClick={() => setEscolhido(j.id)}>
                  <Icon icon={j.goleiro ? HandPalm : SneakerMove} size={20} className={s.icone} />
                  <span className={s.nome}>
                    <Destaque texto={j.nome} trecho={trecho} />
                  </span>
                  <span className={s.estrelas}>{j.estrelas}★</span>
                  <span className={i === -1 ? s.ondeFora : s.onde}>{i === -1 ? 'Não chegou' : `Time ${i + 1}`}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <>
          <p className={t.pequeno}>Toque num jogador para mover, trocar ou tirar do time.</p>
          {equilibrio !== null && (
            <p className={s.equilibrio}>Equilíbrio: diferença de {equilibrio}★ entre os times completos</p>
          )}
          {times.map((tm, i) => {
            const vagas = TAMANHO_TIME - tm.jogadorIds.length
            const craques = contarCincoEstrelas(tm, estrelasDe)
            return (
              <section key={i} className={s.time} aria-label={`Time ${i + 1}`}>
                <h2 className={s.timeTopo}>
                  <span>Time {i + 1}</span>
                  <span className={tm.completo ? s.soma : s.incompleto}>
                    {tm.completo ? `${tm.somaEstrelas}★` : `Incompleto · ${tm.jogadorIds.length}/${TAMANHO_TIME}`}
                  </span>
                </h2>
                <ul className={t.lista}>
                  {tm.jogadorIds.map((id) => {
                    const j = jogador(id)
                    if (!j) return null
                    return (
                      <li key={id}>
                        <button type="button" className={s.linha} onClick={() => setEscolhido(id)}>
                          <Icon icon={j.goleiro ? HandPalm : SneakerMove} size={20} className={s.icone} />
                          <span className={s.nome}>{j.nome}</span>
                          <span className={s.estrelas}>{j.estrelas}★</span>
                          <Icon icon={CaretRight} size={18} className={s.seta} />
                        </button>
                      </li>
                    )
                  })}
                  {vagas > 0 && fora.length > 0 && (
                    <li>
                      <button type="button" className={`${s.linha} ${s.adicionar}`} onClick={() => setAdicionarEm(i)}>
                        <Icon icon={Plus} size={20} />
                        <span className={s.nome}>
                          Adicionar jogador · {vagas} {vagas === 1 ? 'vaga' : 'vagas'}
                        </span>
                      </button>
                    </li>
                  )}
                </ul>
                {craques > maxCincoEstrelas && <p className={s.alerta}>{craques} craques neste time</p>}
              </section>
            )
          })}
        </>
      )}

      <FolhaJogador
        id={escolhido}
        times={times}
        porId={porId}
        onFechar={() => setEscolhido(null)}
        onMover={(id, destino) =>
          aplicar(
            timeDe(times, id) === -1 ? colocarNoTime(times, id, destino, estrelasDe) : moverJogador(times, id, destino, estrelasDe),
          )
        }
        onTrocar={(a, b) => aplicar(trocarJogadores(times, a, b, estrelasDe))}
        onTirar={(id) => aplicar(tirarDoTime(times, id, estrelasDe))}
      />

      <Sheet
        aberto={adicionarEm !== null}
        onFechar={() => setAdicionarEm(null)}
        titulo={adicionarEm !== null ? `Time ${adicionarEm + 1} · ${resumoDoTime(times[adicionarEm]!)}` : ''}
      >
        <ul className={t.lista}>
          {fora.map((j) => (
            <li key={j.id}>
              <button
                type="button"
                className={s.linha}
                onClick={() => adicionarEm !== null && aplicar(colocarNoTime(times, j.id, adicionarEm, estrelasDe))}
              >
                <Icon icon={j.goleiro ? HandPalm : SneakerMove} size={20} className={s.iconeFora} />
                <span className={s.nome}>{j.nome}</span>
                <span className={s.estrelas}>{j.estrelas}★</span>
                <Icon icon={Plus} size={18} className={s.seta} />
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </main>
  )
}

/** Nome com a parte encontrada na busca em laranja. */
function Destaque({ texto, trecho }: { texto: string; trecho: Trecho | null }) {
  if (!trecho) return <>{texto}</>
  return (
    <>
      {texto.slice(0, trecho.inicio)}
      <mark className={s.destaque}>{texto.slice(trecho.inicio, trecho.fim)}</mark>
      {texto.slice(trecho.fim)}
    </>
  )
}

interface PropsFolha {
  id: string | null
  times: Time[]
  porId: Map<string, Jogador>
  onFechar: () => void
  onMover: (id: string, destino: number) => void
  onTrocar: (a: string, b: string) => void
  onTirar: (id: string) => void
}

/** Folha do jogador: mover para outro time, trocar com alguém ou tirar do time. */
function FolhaJogador({ id, times, porId, onFechar, onMover, onTrocar, onTirar }: PropsFolha) {
  const [trocando, setTrocando] = useState(false)
  const [parceiro, setParceiro] = useState<string | null>(null)
  const estrelasDe = (x: string) => porId.get(x)?.estrelas ?? 0
  const j = id ? porId.get(id) : undefined
  const meu = id ? timeDe(times, id) : -1

  const fechar = () => {
    setTrocando(false)
    setParceiro(null)
    onFechar()
  }
  const agir = (f: () => void) => {
    setTrocando(false)
    setParceiro(null)
    f()
  }

  const destinos = times.flatMap((tm, i) => (i !== meu && tm.jogadorIds.length < TAMANHO_TIME ? [i] : []))
  const parceiroJ = parceiro ? porId.get(parceiro) : undefined

  return (
    <Sheet aberto={Boolean(j)} onFechar={fechar} titulo={trocando && j ? `Trocar ${j.nome} com…` : (j?.nome ?? '')}>
      {j && !trocando && (
        <div className={t.coluna}>
          <div className={s.folhaTopo}>
            <Icon icon={j.goleiro ? HandPalm : SneakerMove} size={22} className={s.icone} />
            <span className={s.estrelas}>{j.estrelas}★</span>
            {meu === -1 ? (
              <span className={s.ondeFora}>Não chegou</span>
            ) : (
              <span className={s.onde}>
                Time {meu + 1} · {resumoDoTime(times[meu]!)}
              </span>
            )}
          </div>

          {destinos.length > 0 && (
            <>
              <SectionLabel>MOVER PARA</SectionLabel>
              {destinos.map((i) => {
                const p = previaMover(times, j.id, i, estrelasDe)
                const destino = times[i]!
                return (
                  <Button key={i} variante="secundario" className={s.opcao} onClick={() => agir(() => onMover(j.id, i))}>
                    {destino.completo
                      ? `Time ${i + 1} · ${p.somaAntes}★ → ${p.somaDepois}★`
                      : `Time ${i + 1} · ${p.tamanhoAntes}/${TAMANHO_TIME} → ${p.tamanhoDepois}/${TAMANHO_TIME} · ${p.somaDepois}★`}
                  </Button>
                )
              })}
            </>
          )}

          {meu !== -1 && (
            <>
              <Button variante="secundario" icone={ArrowsLeftRight} className={s.opcao} onClick={() => setTrocando(true)}>
                Trocar com alguém
              </Button>
              <Button variante="secundario" icone={UserMinus} className={s.opcao} onClick={() => agir(() => onTirar(j.id))}>
                Tirar do time
              </Button>
              <p className={t.pequeno}>Tirar do time leva o {j.nome} para "Não chegaram".</p>
            </>
          )}
        </div>
      )}

      {j && trocando && (
        <div className={t.coluna}>
          <p className={t.pequeno}>Cada nome mostra como fica o equilíbrio depois da troca.</p>
          {times.map((tm, i) =>
            i === meu ? null : (
              <section key={i} aria-label={`Time ${i + 1}`}>
                <SectionLabel>
                  Time {i + 1} · {resumoDoTime(tm)}
                </SectionLabel>
                <ul className={t.lista}>
                  {tm.jogadorIds.map((outro) => {
                    const o = porId.get(outro)
                    if (!o) return null
                    const p = previaTroca(times, j.id, outro, estrelasDe)
                    return (
                      <li key={outro}>
                        <button
                          type="button"
                          className={`${s.linha} ${parceiro === outro ? s.escolhido : ''}`}
                          aria-pressed={parceiro === outro}
                          onClick={() => setParceiro(outro)}
                        >
                          <span className={s.nome}>
                            {o.nome}
                            <span className={p.mantem ? s.mantem : s.efeito}>
                              {p.mantem
                                ? 'mantém o equilíbrio'
                                : `Time ${p.timeA + 1} ${sinal(p.deltaA)} · Time ${p.timeB + 1} ${sinal(p.deltaB)}`}
                            </span>
                          </span>
                          <span className={s.estrelas}>{o.estrelas}★</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ),
          )}
          <Button
            icone={ArrowsLeftRight}
            disabled={!parceiroJ}
            onClick={() => parceiroJ && agir(() => onTrocar(j.id, parceiroJ.id))}
          >
            {parceiroJ ? `Trocar ${j.nome} e ${parceiroJ.nome}` : 'Trocar com alguém'}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
