import { ArrowsClockwise, CaretDown, CaretRight, Copy, DotsThree, Shuffle, UserPlus } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { adicionarNaHora, chegouDepois, marcarPresenca } from '../../data/presencas'
import { criarJogador } from '../../data/jogadores'
import { recomecarPelada, salvarTimes, type TimesSalvos } from '../../data/peladas'
import { adicionarAtrasado } from '../../logic/atrasados'
import { FORMATOS } from '../../logic/formatos'
import { refazerSorteio } from '../../logic/sorteio'
import { montarTextoWhatsApp } from '../../logic/texto'
import type { Estrelas, Jogador, Time } from '../../logic/tipos'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { PlayerRow } from '../components/PlayerRow'
import { ConfirmModal, Sheet } from '../components/Sheet'
import { TeamCard } from '../components/TeamCard'
import { useToast } from '../components/Toast'
import { db } from '../db'
import { dataCurta, listaComE, mensagemDeErro, porNome } from '../util'
import { AdicionarJogador, type NovoNaHora } from './AdicionarJogador'
import { juntarJogadores, useApp } from './contexto'
import { participantesDe } from './fluxo/Sortear'
import { AVATAR_PADRAO, LinkJogadores } from './Times'
import s from './Durante.module.css'
import t from './Telas.module.css'

/** Times — durante a pelada (COPY 3.1 a 3.5). */
export function Durante({ onTentarNovamente }: { onTentarNovamente: () => void }) {
  const { dados, atualizar, recarregar } = useApp()
  const mostrarToast = useToast()
  const { config, pelada, jogadores, presencas } = dados
  const salvos = pelada.times!
  const times = salvos.times

  const [ativo, setAtivo] = useState(0)
  const [naoChegaramAberto, setNaoChegaramAberto] = useState(false)
  const [refazerAberto, setRefazerAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [confirmarRecomecar, setConfirmarRecomecar] = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [textoManual, setTextoManual] = useState<string | null>(null)
  const carrossel = useRef<HTMLDivElement>(null)

  const porId = new Map(jogadores.map((j) => [j.id, j]))
  const presencaDe = new Map(presencas.map((p) => [p.jogadorId, p]))
  const naoChegaram = presencas
    .filter((p) => p.status === 'nao-chegou')
    .map((p) => porId.get(p.jogadorId))
    .filter((j): j is Jogador => Boolean(j && !j.goleiro))
    .sort(porNome)
  const goleiros = presencas
    .filter((p) => p.status === 'chegou')
    .map((p) => porId.get(p.jogadorId))
    .filter((j): j is Jogador => Boolean(j?.goleiro))
    .sort(porNome)

  function irParaTime(i: number) {
    const el = carrossel.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card) return
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: reduzir ? 'auto' : 'smooth' })
  }

  function aoRolar() {
    const el = carrossel.current
    const primeiro = el?.children[0] as HTMLElement | undefined
    if (!el || !primeiro) return
    const largura = primeiro.offsetWidth + 12
    setAtivo(Math.max(0, Math.min(times.length - 1, Math.round(el.scrollLeft / largura))))
  }

  /** Grava os times novos, recalculando os jogos se o número de times mudou. */
  async function gravarTimes(novos: Time[]) {
    const jogos = FORMATOS[pelada.formato ?? config.formatoPadrao].gerar(novos.length, {
      duracaoMin: pelada.duracaoMin ?? config.tempoJogo,
    }).jogos
    const atualizada = await salvarTimes(db, pelada.id, { times: novos, jogos })
    atualizar({ pelada: atualizada })
    return atualizada
  }

  /** Coloca quem chegou no último time e oferece desfazer por 6 s. */
  async function entrarNoTime(jogador: Jogador, desfazer: () => Promise<unknown>) {
    const antes: TimesSalvos = salvos
    const novos = adicionarAtrasado(times, { id: jogador.id, estrelas: jogador.estrelas })
    await gravarTimes(novos)
    const indice = novos.findIndex((tm) => tm.jogadorIds.includes(jogador.id))
    const abriuTime = novos.length > times.length
    irParaTime(indice)
    mostrarToast({
      texto: abriuTime ? `${jogador.nome} começou o Time ${indice + 1}` : `${jogador.nome} entrou no Time ${indice + 1}`,
      acao: {
        texto: 'Desfazer',
        onClick: async () => {
          try {
            await salvarTimes(db, pelada.id, antes)
            await desfazer()
            await recarregar()
          } catch (e) {
            mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
          }
        },
      },
    })
  }

  async function chegou(jogador: Jogador) {
    try {
      const p = await marcarPresenca(db, pelada.id, jogador.id, 'chegou')
      atualizar({ presencas: presencas.map((x) => (x.jogadorId === jogador.id ? p : x)) })
      await entrarNoTime(jogador, () => marcarPresenca(db, pelada.id, jogador.id, 'nao-chegou'))
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  async function adicionar(jogador: Jogador) {
    const p = await adicionarNaHora(db, pelada.id, jogador.id)
    atualizar({ presencas: [...presencas.filter((x) => x.jogadorId !== jogador.id), p] })
    setAdicionando(false)
    if (jogador.goleiro) {
      mostrarToast({ texto: `${jogador.nome} adicionado.` })
      return
    }
    // Desfazer de quem não estava na lista: volta para "não chegou".
    await entrarNoTime(jogador, () => marcarPresenca(db, pelada.id, jogador.id, 'nao-chegou'))
  }

  async function adicionarNovo(novo: NovoNaHora) {
    try {
      const jogador = await criarJogador(db, { nome: novo.nome, estrelas: novo.estrelas as Estrelas, goleiro: novo.goleiro })
      atualizar({ jogadores: juntarJogadores(jogadores, [jogador]) })
      await adicionar(jogador)
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e, novo.nome), tom: 'erro' })
    }
  }

  async function copiarLista() {
    const formato = FORMATOS[pelada.formato ?? config.formatoPadrao]
    const texto = montarTextoWhatsApp({
      nomePelada: config.nomePelada,
      data: pelada.data,
      horario: pelada.horario,
      times: times.map((tm) => ({ nomes: tm.jogadorIds.map((id) => porId.get(id)?.nome ?? ''), completo: tm.completo })),
      goleiros: goleiros.map((g) => g.nome),
      linhasFormato: formato.gerar(times.length, { duracaoMin: pelada.duracaoMin ?? config.tempoJogo }).linhas,
    })
    try {
      await navigator.clipboard.writeText(texto)
      mostrarToast({ texto: 'Lista copiada. É só colar no grupo.' })
    } catch {
      setTextoManual(texto)
    }
  }

  async function recomecar() {
    try {
      const limpa = await recomecarPelada(db, pelada.id)
      atualizar({ pelada: limpa, presencas: [] })
      setConfirmarRecomecar(false)
      onTentarNovamente()
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  const cards = times.map((tm, i) => {
    const doTime = tm.jogadorIds.map((id) => porId.get(id)).filter((j): j is Jogador => Boolean(j))
    // Time só de quem chegou depois do sorteio: não foi equilibrado (COPY 4.2).
    const soAtrasados =
      !tm.completo && doTime.length > 0 && doTime.every((j) => {
        const p = presencaDe.get(j.id)
        return p ? chegouDepois(p, pelada) : false
      })
    return (
      <div key={i} className={s.slide} aria-label={`Time ${i + 1} de ${times.length}`}>
        <TeamCard
          numero={i + 1}
          jogadores={doTime.map((j) => ({ id: j.id, nome: j.nome, estrelas: j.estrelas }))}
          somaEstrelas={tm.somaEstrelas}
          completo={tm.completo}
          textoVaga="Vaga"
          aviso={
            soAtrasados
              ? 'Esse time foi montado por ordem de chegada, sem equilibrar. Para equilibrar, use Sortear de novo.'
              : undefined
          }
        />
      </div>
    )
  })

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header
        titulo={config.nomePelada}
        subtitulo={`${dataCurta(pelada.data)} · ${pelada.horario}`}
        avatar={{ nome: config.nomePelada, src: config.avatarUrl ?? AVATAR_PADRAO }}
        acoes={
          <>
            <IconButton icone={ArrowsClockwise} rotulo="Sortear de novo" onClick={() => setRefazerAberto(true)} />
            <IconButton icone={DotsThree} rotulo="Mais opções" semFundo onClick={() => setMenuAberto(true)} />
          </>
        }
      />

      <div className={s.indice} role="tablist" aria-label="Times">
        {times.map((tm, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === ativo}
            className={`${s.indiceItem} ${i === ativo ? s.indiceAtivo : ''} ${tm.completo ? '' : s.indiceIncompleto}`}
            onClick={() => irParaTime(i)}
          >
            {i === ativo ? `Time ${i + 1}` : i + 1}
          </button>
        ))}
      </div>

      <div ref={carrossel} className={s.carrossel} onScroll={aoRolar}>
        {cards}
      </div>
      <div className={s.pontos} aria-hidden="true">
        {times.map((_, i) => (
          <i key={i} className={i === ativo ? s.pontoAtivo : undefined} />
        ))}
      </div>

      <div className={t.coluna}>
        <Button
          variante="tracejado"
          aria-expanded={naoChegaramAberto}
          onClick={() => setNaoChegaramAberto((a) => !a)}
          className={s.expansor}
        >
          <span>
            <b>Não chegaram</b> <span className={s.cinza}>· {naoChegaram.length}</span>
          </span>
          <Icon icon={naoChegaramAberto ? CaretDown : CaretRight} size={20} />
        </Button>
        {naoChegaramAberto && (
          <div className={s.caixa}>
            {naoChegaram.length > 0 ? (
              <>
                <ul className={t.lista}>
                  {naoChegaram.map((j) => (
                    <li key={j.id}>
                      <PlayerRow
                        nome={j.nome}
                        direita={
                          <Button variante="pequeno" onClick={() => void chegou(j)}>
                            Chegou
                          </Button>
                        }
                      />
                    </li>
                  ))}
                </ul>
                <p className={t.pequeno}>Entra no último time.</p>
              </>
            ) : (
              <p className={t.texto2}>Todo mundo chegou.</p>
            )}
            <Button variante="pequeno-secundario" icone={UserPlus} onClick={() => setAdicionando(true)}>
              Adicionar jogador
            </Button>
          </div>
        )}
        <Button icone={Copy} onClick={copiarLista}>
          Copiar lista dos times
        </Button>
      </div>
      <LinkJogadores />

      <SortearDeNovo
        aberto={refazerAberto}
        onFechar={() => setRefazerAberto(false)}
        times={times}
        onSortear={async (marcados) => {
          const travados = times.map((_, i) => i).filter((i) => !marcados.includes(i))
          const participantes = participantesDe(dados)
          let r = refazerSorteio(participantes, times, travados, { maxCincoEstrelas: config.maxCincoEstrelas })
          if (!r.ok && r.motivo === 'muitos-cinco-estrelas') r = refazerSorteio(participantes, times, travados, { maxCincoEstrelas: Infinity })
          if (!r.ok) return
          try {
            await gravarTimes(r.times)
            setRefazerAberto(false)
            mostrarToast({
              texto: `Times ${listaComE(marcados.map((i) => String(i + 1)))} sorteados de novo. Copie a lista nova.`,
            })
          } catch (e) {
            mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
          }
        }}
      />

      <Sheet aberto={menuAberto} onFechar={() => setMenuAberto(false)} titulo="Mais opções">
        <button
          type="button"
          className={t.opcao}
          onClick={() => {
            setMenuAberto(false)
            setConfirmarRecomecar(true)
          }}
        >
          <Icon icon={ArrowsClockwise} />
          <span>
            <span className={t.opcaoTitulo}>Tentar novamente</span>
          </span>
        </button>
      </Sheet>

      <ConfirmModal
        aberto={confirmarRecomecar}
        titulo="Começar de novo com outra lista?"
        texto="A lista e os times de hoje serão apagados."
        confirmar="Tentar novamente"
        cancelar="Cancelar"
        perigo
        onConfirmar={recomecar}
        onCancelar={() => setConfirmarRecomecar(false)}
      />

      <AdicionarJogador
        aberto={adicionando}
        onFechar={() => setAdicionando(false)}
        jaEsta={(id) => times.some((tm) => tm.jogadorIds.includes(id)) || presencaDe.has(id)}
        onExistente={async (j) => {
          try {
            await adicionar(j)
          } catch (e) {
            mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
          }
        }}
        onNovo={adicionarNovo}
      />

      <Sheet aberto={textoManual !== null} onFechar={() => setTextoManual(null)} titulo="Lista dos times">
        <div className={t.coluna}>
          <p className={t.texto2}>Não deu para copiar. Toque e segure o texto para copiar manualmente.</p>
          <div className={t.textoCopiado}>{textoManual}</div>
        </div>
      </Sheet>
    </main>
  )
}

interface PropsRefazer {
  aberto: boolean
  onFechar: () => void
  times: Time[]
  onSortear: (marcados: number[]) => Promise<void>
}

/** Sortear de novo (COPY 3.4): marcados são misturados; desmarcados ficam iguais. */
function SortearDeNovo({ aberto, onFechar, times, onSortear }: PropsRefazer) {
  const [marcados, setMarcados] = useState<number[] | null>(null)
  const [sorteando, setSorteando] = useState(false)
  const sel = marcados ?? times.map((_, i) => i)

  return (
    <Sheet
      aberto={aberto}
      onFechar={() => {
        setMarcados(null)
        onFechar()
      }}
      titulo="Sortear de novo"
    >
      <div className={t.coluna}>
        <p className={t.texto2}>Marque os times que vão ser misturados. Os outros ficam iguais.</p>
        <ul className={t.lista}>
          {times.map((tm, i) => {
            const marcado = sel.includes(i)
            const trocar = () => setMarcados(marcado ? sel.filter((x) => x !== i) : [...sel, i].sort((a, b) => a - b))
            return (
              <li key={i}>
                <PlayerRow
                  nome={`Time ${i + 1}`}
                  selecao
                  chegou={marcado}
                  onTrocarChegou={trocar}
                  onClick={trocar}
                  sub={tm.completo ? `${tm.somaEstrelas}★` : `${tm.jogadorIds.length}/5`}
                  direita={marcado ? undefined : <span className={t.pequeno}>fica igual</span>}
                />
              </li>
            )
          })}
        </ul>
        {sel.length < 2 && <p className={t.pequeno}>Marque pelo menos 2 times.</p>}
        <Button
          icone={Shuffle}
          disabled={sel.length < 2}
          carregando={sorteando}
          onClick={async () => {
            setSorteando(true)
            await onSortear(sel)
            setSorteando(false)
            setMarcados(null)
          }}
        >
          Sortear {sel.length} times
        </Button>
        <Button
          variante="secundario"
          onClick={() => {
            setMarcados(null)
            onFechar()
          }}
        >
          Cancelar
        </Button>
      </div>
    </Sheet>
  )
}
