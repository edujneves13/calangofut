import { CheckCircle, Clock, HandPalm, Plus, WarningCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { adicionarApelido, atualizarJogador, criarJogadores } from '../../../data/jogadores'
import { recomecarPelada } from '../../../data/peladas'
import { salvarPresencasDaLista, type StatusPresenca } from '../../../data/presencas'
import {
  contagem,
  ehNova,
  faltaEscolha,
  ignorarTudo,
  nomeDaLinha,
  novaLinha,
  pendencias,
  secoes,
  textoIgnorarTudo,
  type Linha,
  type Ordem,
} from '../../../logic/quemVai'
import type { Estrelas, Jogador } from '../../../logic/tipos'
import { Badge, BadgeEstrelas } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Notice, SectionLabel, Segmented, Stepper } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { SearchInput } from '../../components/Input'
import { PlayerRow } from '../../components/PlayerRow'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { combina, mensagemDeErro, plural } from '../../util'
import { AdicionarJogador } from '../AdicionarJogador'
import { juntarJogadores, useApp } from '../contexto'
import { EstrelasSheet } from '../EstrelasSheet'
import { ETAPAS } from './Colar'
import c from './Conferir.module.css'
import t from '../Telas.module.css'

interface Props {
  linhas: Linha[]
  setLinhas: (f: (linhas: Linha[]) => Linha[]) => void
  abrirAdicionar: boolean
  onAdicionarAberto: () => void
  onVoltar: () => void
  onContinuar: () => void
}

/** 2/3 Quem vai pro sorteio? (docs/design/fluxo-sorteio-v2-20-novembro.md §3). */
export function Conferir({ linhas, setLinhas, abrirAdicionar, onAdicionarAberto, onVoltar, onContinuar }: Props) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('az')
  const [estrelasDe, setEstrelasDe] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (abrirAdicionar) {
      setAdicionando(true)
      onAdicionarAberto()
    }
  }, [abrirAdicionar, onAdicionarAberto])

  const mudar = (chave: string, m: Partial<Linha>) =>
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...m } : l)))

  const visiveis = linhas.filter((l) => combina({ nome: nomeDaLinha(l), apelidos: [l.texto] }, busca))
  const sec = secoes(visiveis, ordem)
  const conta = contagem(linhas)
  const pendentes = pendencias(linhas)
  const linhaEstrelas = linhas.find((l) => l.chave === estrelasDe) ?? null

  function ignorar() {
    const antes = linhas
    const r = ignorarTudo(linhas)
    setLinhas(() => r.linhas)
    mostrarToast({ texto: textoIgnorarTudo(r), tom: 'sucesso', acoes: [{ texto: 'Desfazer', onClick: () => setLinhas(() => antes) }] })
  }

  async function mudarEstrelas(l: Linha, estrelas: number) {
    if (!l.jogador) {
      mudar(l.chave, { estrelas })
      return
    }
    // Já cadastrado: salva no cadastro na hora (adendo 18).
    const antes = l.jogador
    mudar(l.chave, { estrelas, jogador: { ...antes, estrelas: estrelas as Estrelas } })
    try {
      const salvo = await atualizarJogador(db, antes.id, { estrelas: estrelas as Estrelas })
      atualizar({ jogadores: juntarJogadores(dados.jogadores, [salvo]) })
      mudar(l.chave, { jogador: salvo })
      mostrarToast({ texto: `Estrelas do ${salvo.nome}: ${estrelas}★.` })
    } catch (e) {
      mudar(l.chave, { estrelas: antes.estrelas, jogador: antes })
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  async function continuar() {
    setSalvando(true)
    try {
            const novas = linhas.filter((l) => !l.jogador)
      const criados = await criarJogadores(
        db,
        novas.map((l) => ({ nome: l.texto, estrelas: (l.estrelas || 3) as Estrelas, goleiro: l.goleiro })),
      )
      const idDe = new Map<string, Jogador>(novas.map((l, i) => [l.chave, criados[i]!]))

      for (const l of linhas) {
        if (l.escolha === 'ele' && l.jogador) {
          // "Stênio" vira apelido do Stenio Araújo; se já for apelido de alguém, segue sem ele.
          await adicionarApelido(db, l.jogador.id, l.texto).catch(() => {})
        }
      }

      // Colou outra lista por cima: começa limpo para não sobrar presença da lista anterior.
      if (dados.presencas.length > 0) await recomecarPelada(db, dados.pelada.id)

      const vistos = new Set<string>()
      const itens: { jogadorId: string; status: StatusPresenca }[] = []
      for (const l of linhas) {
        const jogador = l.jogador ?? idDe.get(l.chave)!
        if (vistos.has(jogador.id)) continue
        vistos.add(jogador.id)
        itens.push({ jogadorId: jogador.id, status: l.goleiro ? 'chegou' : l.status })
      }
      const presencas = await salvarPresencasDaLista(db, dados.pelada.id, itens)
      atualizar({ jogadores: juntarJogadores(dados.jogadores, criados), presencas })
      setLinhas((ls) => ls.map((l) => (idDe.has(l.chave) ? { ...l, tipo: 'existente', jogador: idDe.get(l.chave)!, escolha: null } : l)))
      onContinuar()
    } catch (e) {
      const nova = linhas.find((l) => !l.jogador)
      mostrarToast({ texto: mensagemDeErro(e, nova?.texto), tom: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  function linhaDeJogador(l: Linha) {
    const nome = nomeDaLinha(l)
    if (faltaEscolha(l)) {
      // Sem o selo Novo, para não confundir com o botão Novo; a linha mantém o fundo de novo.
      return (
        <li key={l.chave}>
          <PlayerRow
            nome={l.texto}
            goleiro={l.goleiro}
            novo
            sub={l.sugestao ? `Parece o ${l.sugestao.nome}` : undefined}
            direita={
              <>
                {l.sugestao && (
                  <Button
                    variante="pequeno"
                    onClick={() => mudar(l.chave, { escolha: 'ele', jogador: l.sugestao, estrelas: l.sugestao?.estrelas ?? 0 })}
                  >
                    É ele
                  </Button>
                )}
                <Button variante="pequeno-secundario" onClick={() => mudar(l.chave, { escolha: 'novo' })}>
                  Novo
                </Button>
              </>
            }
          />
        </li>
      )
    }
    const sub = ehNova(l) ? (
      <Badge variante="novo">Novo</Badge>
    ) : l.escolha === 'ele' ? (
      `"${l.texto}" vai ser lembrado como apelido do ${nome}.`
    ) : undefined
    return (
      <li key={l.chave}>
        <PlayerRow
          nome={nome}
          goleiro={l.goleiro}
          novo={ehNova(l)}
          sub={sub}
          chegou={l.goleiro ? undefined : l.status === 'chegou'}
          apagado={!l.goleiro && l.status !== 'chegou'}
          onTrocarChegou={() => mudar(l.chave, { status: l.status === 'chegou' ? 'nao-chegou' : 'chegou' })}
          direita={
            l.goleiro ? undefined : (
              <BadgeEstrelas estrelas={l.estrelas} nome={nome} textoVazio="Dar estrelas" onClick={() => setEstrelasDe(l.chave)} />
            )
          }
        />
      </li>
    )
  }

  const botaoIgnorar = (
    <button type="button" className={`${t.botaoTexto} ${c.ignorar}`} onClick={ignorar}>
      Ignorar tudo
    </button>
  )
  const ajudaIgnorar = (
    <p className={c.ajuda}>"Ignorar tudo" dá 3★ para os novos e trata nomes parecidos como o mesmo jogador.</p>
  )
  // Ignorar tudo fica na primeira seção de pendência que aparece.
  const ignorarEmEstrelas = sec.faltamEstrelas.length > 0

  return (
    <main className={`${t.tela} ${t.semMenu} ${t.entrar}`}>
      <Header titulo="Quem vai pro sorteio?" onVoltar={onVoltar} />
      <Stepper atual={2} rotulos={ETAPAS} />
      <p className={t.texto2}>Marcados entram no sorteio agora. Quem ainda não chegou fica desmarcado e entra depois, no último time.</p>
      <div className={c.buscaLinha}>
        <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar jogador" />
        <Segmented
          rotulo="Ordenar"
          valor={ordem}
          onMudar={setOrdem}
          opcoes={[
            { valor: 'az', texto: 'A–Z', rotulo: 'Ordem alfabética' },
            { valor: 'estrelas', texto: '★', rotulo: 'Por estrelas' },
          ]}
        />
      </div>

      <Card className={c.contagem}>
        <div className={c.principal}>
          <span className={c.numero}>{conta.noSorteio}</span>
          <span className={c.noSorteio}>
            <Icon icon={CheckCircle} size={18} weight="fill" className={c.verde} />
            no sorteio
          </span>
          <span className={c.de}>de {plural(conta.total, 'jogador', 'jogadores')}</span>
        </div>
        <div className={c.divisoria} />
        <ul className={c.extras}>
          <li>
            <Icon icon={Clock} size={18} />
            <b>{conta.chegamDepois}</b> {conta.chegamDepois === 1 ? 'chega depois' : 'chegam depois'}
          </li>
          <li>
            <Icon icon={HandPalm} size={18} />
            <b>{conta.goleiros}</b> {conta.goleiros === 1 ? 'goleiro' : 'goleiros'}
          </li>
        </ul>
      </Card>

      {conta.noSorteio === 0 && conta.total > 0 && <Notice>Ninguém marcado. Marque quem já chegou.</Notice>}

      {sec.faltamEstrelas.length > 0 && (
        <section className={c.secao}>
          <SectionLabel icone={WarningCircle} tom="aviso" acao={botaoIgnorar}>
            Faltam estrelas · {sec.faltamEstrelas.length}
          </SectionLabel>
          {ajudaIgnorar}
          <ul className={t.lista}>{sec.faltamEstrelas.map(linhaDeJogador)}</ul>
        </section>
      )}
      {sec.confirmarNome.length > 0 && (
        <section className={c.secao}>
          <SectionLabel icone={WarningCircle} tom="aviso" acao={ignorarEmEstrelas ? undefined : botaoIgnorar}>
            Confirmar nome · {sec.confirmarNome.length}
          </SectionLabel>
          {!ignorarEmEstrelas && ajudaIgnorar}
          <ul className={t.lista}>{sec.confirmarNome.map(linhaDeJogador)}</ul>
        </section>
      )}
      {sec.noSorteio.length > 0 && (
        <section className={c.secao}>
          <SectionLabel icone={CheckCircle} tom="dentro">
            No sorteio · {sec.noSorteio.length}
          </SectionLabel>
          <ul className={t.lista}>{sec.noSorteio.map(linhaDeJogador)}</ul>
        </section>
      )}
      {sec.chegamDepois.length > 0 && (
        <section className={c.secao}>
          <SectionLabel icone={Clock}>Chegam depois · fora do sorteio · {sec.chegamDepois.length}</SectionLabel>
          <ul className={t.lista}>{sec.chegamDepois.map(linhaDeJogador)}</ul>
        </section>
      )}
      {sec.goleiros.length > 0 && (
        <section className={c.secao}>
          <SectionLabel icone={HandPalm}>Goleiros · fora do sorteio · {sec.goleiros.length}</SectionLabel>
          <ul className={t.lista}>{sec.goleiros.map(linhaDeJogador)}</ul>
        </section>
      )}

      <div className={t.rodape}>
        <Button variante="secundario" icone={Plus} style={{ width: 'auto', flex: 'none', padding: '0 18px' }} onClick={() => setAdicionando(true)}>
          Novo jogador
        </Button>
        <Button disabled={pendentes > 0} carregando={salvando} onClick={continuar}>
          {pendentes > 0 ? `Confirme ${plural(pendentes, 'jogador', 'jogadores')}` : `Continuar com ${conta.noSorteio}`}
        </Button>
      </div>

      <EstrelasSheet
        aberto={linhaEstrelas !== null}
        onFechar={() => setEstrelasDe(null)}
        nome={linhaEstrelas ? nomeDaLinha(linhaEstrelas) : ''}
        estrelas={linhaEstrelas?.estrelas ?? 0}
        nota={linhaEstrelas?.jogador ? 'Muda também no cadastro' : undefined}
        onMudar={(e) => linhaEstrelas && void mudarEstrelas(linhaEstrelas, e)}
      />

      <AdicionarJogador
        aberto={adicionando}
        onFechar={() => setAdicionando(false)}
        jaEsta={(id) => linhas.some((l) => l.jogador?.id === id)}
        onExistente={(jogador) => {
          setLinhas((ls) => [...ls, novaLinha({ jogador })])
          setAdicionando(false)
          mostrarToast({ texto: `${jogador.nome} adicionado.` })
        }}
        onNovo={(novo) => {
          setLinhas((ls) => [...ls, novaLinha(novo)])
          setAdicionando(false)
          mostrarToast({ texto: `${novo.nome} adicionado.` })
        }}
      />
    </main>
  )
}
