import { ArrowsClockwise, CaretDown, Check, Clock, Copy, DotsThree, PencilSimple, Shuffle, UserPlus, WarningCircle } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { adicionarNaHora, chegouDepois, marcarPresenca } from '../../data/presencas'
import { criarJogador } from '../../data/jogadores'
import { recomecarPelada, salvarTimes, type TimesSalvos } from '../../data/peladas'
import { adicionarAtrasado } from '../../logic/atrasados'
import { contarCincoEstrelas, naoChegaramComecaAberta } from '../../logic/edicao'
import { FORMATOS } from '../../logic/formatos'
import { refazerSorteio } from '../../logic/sorteio'
import { montarTextoWhatsApp } from '../../logic/texto'
import { TAMANHO_TIME, type Estrelas, type Jogador, type Time } from '../../logic/tipos'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { PlayerRow } from '../components/PlayerRow'
import { ConfirmModal, Sheet } from '../components/Sheet'
import { TeamCard } from '../components/TeamCard'
import { useToast } from '../components/Toast'
import { db } from '../db'
import { dataCurta, mensagemDeErro, porNome } from '../util'
import { AdicionarJogador, type NovoNaHora } from './AdicionarJogador'
import { EditarTimes, type ResultadoEdicao } from './EditarTimes'
import { juntarJogadores, useApp } from './contexto'
import { participantesDe } from './fluxo/Sortear'
import { AVATAR_PADRAO } from './Times'
import s from './Durante.module.css'
import t from './Telas.module.css'

/** Times — durante a pelada (docs/design/times-durante-v2.md). */
export function Durante({ onNovoSorteio }: { onNovoSorteio: () => void }) {
  const { dados, atualizar, recarregar, setFluxoAberto } = useApp()
  const mostrarToast = useToast()
  const { config, pelada, jogadores, presencas } = dados
  const salvos = pelada.times!
  const times = salvos.times

  const [ativo, setAtivo] = useState(0)
  const [refazerAberto, setRefazerAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [confirmarRecomecar, setConfirmarRecomecar] = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [textoManual, setTextoManual] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
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

  const banco = useBanco(pelada.id, naoChegaram.length)
  // O toast guarda a função de quando foi criado; o ref garante copiar os times de agora.
  const copiarRef = useRef<() => Promise<void>>(async () => {})
  const copiarTimes = { texto: 'Copiar times', onClick: () => void copiarRef.current() }

  /** Aviso que aparece sempre que os times mudam (v2, item 6). */
  function avisarQueMudou() {
    mostrarToast({ texto: 'Os times mudaram. Copie a lista nova.', acoes: [copiarTimes] })
  }

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
      acoes: [
        {
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
        copiarTimes,
      ],
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
      mostrarToast({ texto: 'Lista copiada' })
    } catch {
      setTextoManual(texto)
    }
  }

  copiarRef.current = copiarLista

  // Editar times é tela cheia: esconde o menu de baixo e não recarrega por cima do rascunho.
  useEffect(() => {
    setFluxoAberto(editando)
  }, [editando, setFluxoAberto])

  /** Concluir do Editar times: presenças de quem saiu ou entrou, depois os times. */
  async function concluirEdicao({ times: novos, tirados, colocados }: ResultadoEdicao) {
    try {
      const mudancas = await Promise.all([
        ...tirados.map((id) => marcarPresenca(db, pelada.id, id, 'nao-chegou')),
        ...colocados.map((id) => marcarPresenca(db, pelada.id, id, 'chegou')),
      ])
      const porJogador = new Map(mudancas.map((p) => [p.jogadorId, p]))
      atualizar({ presencas: presencas.map((p) => porJogador.get(p.jogadorId) ?? p) })
      await gravarTimes(novos)
      setEditando(false)
      avisarQueMudou()
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  async function recomecar() {
    try {
      const limpa = await recomecarPelada(db, pelada.id)
      atualizar({ pelada: limpa, presencas: [] })
      setConfirmarRecomecar(false)
      onNovoSorteio()
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
    const craques = contarCincoEstrelas(tm, (id) => porId.get(id)?.estrelas ?? 0)
    return (
      <div key={i} className={s.slide} aria-label={`Time ${i + 1} de ${times.length}`}>
        <TeamCard
          numero={i + 1}
          jogadores={doTime.map((j) => ({ id: j.id, nome: j.nome, estrelas: j.estrelas }))}
          somaEstrelas={tm.somaEstrelas}
          completo={tm.completo}
          textoVaga="Vaga"
          alerta={craques > config.maxCincoEstrelas ? `${craques} craques neste time` : undefined}
          aviso={
            soAtrasados
              ? 'Esse time foi montado por ordem de chegada, sem equilibrar. Para equilibrar, use Sortear de novo.'
              : undefined
          }
        />
      </div>
    )
  })

  if (editando) {
    return (
      <EditarTimes
        times={times}
        naoChegaram={naoChegaram}
        porId={porId}
        maxCincoEstrelas={config.maxCincoEstrelas}
        onCancelar={() => setEditando(false)}
        onConcluir={concluirEdicao}
      />
    )
  }

  const incompletos = times.flatMap((tm, i) => (tm.completo ? [] : [{ i, tamanho: tm.jogadorIds.length }]))

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header
        titulo={config.nomePelada}
        subtitulo={`${dataCurta(pelada.data)} · ${pelada.horario}`}
        avatar={{ nome: config.nomePelada, src: config.avatarUrl ?? AVATAR_PADRAO }}
        acoes={<IconButton icone={DotsThree} rotulo="Mais opções" semFundo onClick={() => setMenuAberto(true)} />}
      />

      <div className={s.linhaAbas}>
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
        <button type="button" className={s.copiar} onClick={copiarLista}>
          <Icon icon={Copy} size={18} />
          Copiar times
        </button>
      </div>

      {incompletos.map(({ i, tamanho }) => (
        <div key={i} className={s.avisoIncompleto}>
          <Icon icon={WarningCircle} size={20} />
          <span className={t.cresce}>
            Time {i + 1} está incompleto · {tamanho}/{TAMANHO_TIME}
          </span>
          <button type="button" className={s.ver} onClick={() => irParaTime(i)}>
            Ver
          </button>
        </div>
      ))}

      <div ref={carrossel} className={s.carrossel} onScroll={aoRolar}>
        {cards}
      </div>
      <div className={s.pontos} aria-hidden="true">
        {times.map((_, i) => (
          <i key={i} className={i === ativo ? s.pontoAtivo : undefined} />
        ))}
      </div>

      <div className={s.acoes}>
        <Button variante="secundario" icone={Shuffle} className={s.acao} onClick={() => setRefazerAberto(true)}>
          Sortear de novo
        </Button>
        <Button variante="secundario" icone={PencilSimple} className={s.acao} onClick={() => setEditando(true)}>
          Editar times
        </Button>
      </div>

      {banco.visivel && (
        <section className={`${s.banco} ${naoChegaram.length === 0 ? s.bancoSaindo : ''}`} aria-label="Não chegaram">
          <button
            type="button"
            className={s.bancoTopo}
            aria-expanded={banco.aberto}
            onClick={banco.alternar}
          >
            <Icon icon={Clock} size={20} className={s.relogio} />
            <span className={s.bancoTitulo}>Não chegaram</span>
            <span className={s.bancoConta}>{naoChegaram.length}</span>
            {!banco.aberto && <span className={s.bancoResumo}>{resumoDeNomes(naoChegaram)}</span>}
            <Icon icon={CaretDown} size={20} className={`${s.seta} ${banco.aberto ? s.setaAberta : ''}`} />
          </button>
          {banco.aberto && (
            <ul className={s.bancoLista}>
              {naoChegaram.map((j) => (
                <li key={j.id} className={s.bancoLinha}>
                  <PlayerRow
                    nome={j.nome}
                    apagado
                    direita={
                      <>
                        <span className={s.bancoEstrelas}>{j.estrelas}★</span>
                        <Button variante="pequeno" icone={Check} className={s.chegou} onClick={() => void chegou(j)}>
                          Chegou
                        </Button>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Button variante="secundario" icone={UserPlus} className={s.adicionar} onClick={() => setAdicionando(true)}>
        Adicionar jogador
      </Button>

      <SortearDeNovo
        aberto={refazerAberto}
        onFechar={() => setRefazerAberto(false)}
        times={times}
        nomesDe={(tm) => resumoDeNomes(tm.jogadorIds.map((id) => porId.get(id)).filter((j): j is Jogador => Boolean(j)), TAMANHO_TIME)}
        onSortear={async (marcados) => {
          const travados = times.map((_, i) => i).filter((i) => !marcados.includes(i))
          const participantes = participantesDe(dados)
          let r = refazerSorteio(participantes, times, travados, { maxCincoEstrelas: config.maxCincoEstrelas })
          if (!r.ok && r.motivo === 'muitos-cinco-estrelas') r = refazerSorteio(participantes, times, travados, { maxCincoEstrelas: Infinity })
          if (!r.ok) return
          try {
            await gravarTimes(r.times)
            setRefazerAberto(false)
            avisarQueMudou()
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
            <span className={t.opcaoTitulo}>Iniciar novo sorteio</span>
            <span className={t.opcaoSub}>Cola outra lista e sorteia do zero</span>
          </span>
        </button>
      </Sheet>

      <ConfirmModal
        aberto={confirmarRecomecar}
        titulo="Iniciar um novo sorteio?"
        texto="A lista e os times de hoje serão apagados. Você vai colar a lista do WhatsApp de novo."
        confirmar="Iniciar novo sorteio"
        cancelar="Cancelar"
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
  /** Nomes resumidos do time, para a linha de baixo. */
  nomesDe: (time: Time) => string
  onSortear: (marcados: number[]) => Promise<void>
}

/**
 * Sortear de novo (v2, item 5): os times marcados são sorteados de novo entre eles; os desmarcados ficam iguais.
 * Time incompleto sempre entra: refazerSorteio só consegue travar time completo.
 */
function SortearDeNovo({ aberto, onFechar, times, nomesDe, onSortear }: PropsRefazer) {
  const [marcados, setMarcados] = useState<number[] | null>(null)
  const [sorteando, setSorteando] = useState(false)
  const sel = marcados ?? times.map((_, i) => i)
  const fechar = () => {
    setMarcados(null)
    onFechar()
  }

  return (
    <Sheet aberto={aberto} onFechar={fechar} titulo="Sortear de novo">
      <div className={t.coluna}>
        <p className={t.texto2}>
          Os jogadores dos times marcados são sorteados de novo entre eles. Desmarque quem já está jogando: esse time
          não muda.
        </p>
        <ul className={t.lista}>
          {times.map((tm, i) => {
            const marcado = sel.includes(i)
            const trocar = tm.completo
              ? () => setMarcados(marcado ? sel.filter((x) => x !== i) : [...sel, i].sort((a, b) => a - b))
              : undefined
            return (
              <li key={i}>
                <PlayerRow
                  nome={`Time ${i + 1} · ${tm.completo ? `${tm.somaEstrelas}★` : `${tm.jogadorIds.length}/${TAMANHO_TIME}`}`}
                  selecao
                  chegou={marcado}
                  onTrocarChegou={trocar}
                  onClick={trocar}
                  apagado={!marcado}
                  sub={nomesDe(tm)}
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
          Sortear {sel.length} times de novo
        </Button>
        <Button variante="secundario" onClick={fechar}>
          Cancelar
        </Button>
      </div>
    </Sheet>
  )
}

/** "Matheus, João, Caio, Renan…": primeiros nomes de quem não chegou, para a seção fechada. */
function resumoDeNomes(jogadores: Jogador[], ate = 4): string {
  const nomes = jogadores.slice(0, ate).map((j) => j.nome.split(' ')[0])
  return nomes.join(', ') + (jogadores.length > ate ? '…' : '')
}

/**
 * Estado da seção "Não chegaram" (v2, item 3): abre sozinha com até 3 pessoas, fecha com 4 ou mais.
 * Se o admin abrir ou fechar, a escolha vale até o fim da pelada (localStorage, por pelada).
 * Quando a última pessoa chega, a seção fica um instante na tela para sumir com animação.
 */
function useBanco(peladaId: string, quantos: number) {
  const chave = `calangofut:nao-chegaram:${peladaId}`
  const [escolha, setEscolha] = useState<boolean | null>(() => {
    try {
      const v = localStorage.getItem(chave)
      return v === null ? null : v === 'aberto'
    } catch {
      return null
    }
  })
  const aberto = escolha ?? naoChegaramComecaAberta(quantos)

  const anterior = useRef(quantos)
  const [saindo, setSaindo] = useState(false)
  useEffect(() => {
    if (anterior.current > 0 && quantos === 0) {
      setSaindo(true)
      const t = setTimeout(() => setSaindo(false), 240)
      anterior.current = quantos
      return () => clearTimeout(t)
    }
    anterior.current = quantos
  }, [quantos])

  return {
    aberto,
    visivel: quantos > 0 || saindo,
    alternar: () => {
      setEscolha(!aberto)
      try {
        localStorage.setItem(chave, aberto ? 'fechado' : 'aberto')
      } catch {
        // Sem localStorage (aba anônima): vale só enquanto a tela está aberta.
      }
    },
  }
}
