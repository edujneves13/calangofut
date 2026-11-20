import { CaretDown, CaretRight, DotsThree, Plus } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { adicionarApelido, atualizarJogador, criarJogadores } from '../../../data/jogadores'
import { recomecarPelada } from '../../../data/peladas'
import { salvarPresencasDaLista, type StatusPresenca } from '../../../data/presencas'
import type { Estrelas, Jogador } from '../../../logic/tipos'
import { Badge, BadgeEstrelas } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Notice, SectionLabel, Stepper } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { IconButton } from '../../components/IconButton'
import { SearchInput } from '../../components/Input'
import { PlayerRow } from '../../components/PlayerRow'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { combina, mensagemDeErro, plural } from '../../util'
import { AdicionarJogador } from '../AdicionarJogador'
import { juntarJogadores, useApp } from '../contexto'
import { EstrelasSheet } from '../EstrelasSheet'
import { ETAPAS } from './Colar'
import { ehNova, faltaEscolha, faltaEstrelas, nomeDaLinha, novaLinha, type Linha } from '../../../logic/quemVai'
import t from '../Telas.module.css'

interface Props {
  linhas: Linha[]
  setLinhas: (f: (linhas: Linha[]) => Linha[]) => void
  abrirAdicionar: boolean
  onAdicionarAberto: () => void
  onVoltar: () => void
  onContinuar: () => void
}

const ordem = (a: Linha, b: Linha) => nomeDaLinha(a).localeCompare(nomeDaLinha(b), 'pt-BR')

/** 2/3 Confira a lista (COPY 9.6): novos destacados, parecidos, estrelas, chegou / não chegou / não vem. */
export function Conferir({ linhas, setLinhas, abrirAdicionar, onAdicionarAberto, onVoltar, onContinuar }: Props) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [busca, setBusca] = useState('')
  const [estrelasDe, setEstrelasDe] = useState<string | null>(null)
  const [menuDe, setMenuDe] = useState<string | null>(null)
  const [naoVemAberto, setNaoVemAberto] = useState(false)
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

  const visiveis = linhas.filter((l) => combina({ nome: nomeDaLinha(l), apelidos: [l.texto] }, busca)).sort(ordem)
  const deLinha = visiveis.filter((l) => !l.goleiro)
  const ativos = deLinha
  const naoVem: Linha[] = []
  const goleiros = visiveis.filter((l) => l.goleiro)

  const todosDeLinha = linhas.filter((l) => !l.goleiro)
  const chegaram = todosDeLinha.filter((l) => l.status === 'chegou').length
  const naoChegaram = todosDeLinha.filter((l) => l.status === 'nao-chegou').length
  const naoVem_ = naoVem.length
  const semEstrelas = linhas.filter(faltaEstrelas).length
  const semEscolha = linhas.filter(faltaEscolha).length

  const linhaEstrelas = linhas.find((l) => l.chave === estrelasDe) ?? null
  const linhaMenu = linhas.find((l) => l.chave === menuDe) ?? null

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
      const gravar = linhas
      const novas = gravar.filter((l) => !l.jogador)
      const criados = await criarJogadores(
        db,
        novas.map((l) => ({ nome: l.texto, estrelas: (l.estrelas || 3) as Estrelas, goleiro: l.goleiro })),
      )
      const idDe = new Map<string, Jogador>(novas.map((l, i) => [l.chave, criados[i]!]))

      for (const l of gravar) {
        if (l.escolha === 'ele' && l.jogador) {
          // "Stênio" vira apelido do Stenio Araújo; se já for apelido de alguém, segue sem ele.
          await adicionarApelido(db, l.jogador.id, l.texto).catch(() => {})
        }
      }

      // Colou outra lista por cima: começa limpo para não sobrar presença da lista anterior.
      if (dados.presencas.length > 0) await recomecarPelada(db, dados.pelada.id)

      const vistos = new Set<string>()
      const itens: { jogadorId: string; status: StatusPresenca }[] = []
      for (const l of gravar) {
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
    if (faltaEscolha(l) || (l.tipo === 'parecido' && l.escolha === null)) {
      return (
        <li key={l.chave}>
          <PlayerRow
            nome={l.texto}
            goleiro={l.goleiro}
            novo
            sub={`Parece o ${l.sugestao?.nome ?? ''}`}
            direita={
              <>
                <Button
                  variante="pequeno"
                  onClick={() =>
                    mudar(l.chave, { escolha: 'ele', jogador: l.sugestao, estrelas: l.sugestao?.estrelas ?? 0 })
                  }
                >
                  É ele
                </Button>
                <Button variante="pequeno-secundario" onClick={() => mudar(l.chave, { escolha: 'novo' })}>
                  É novo
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
          onTrocarChegou={() => mudar(l.chave, { status: l.status === 'chegou' ? 'nao-chegou' : 'chegou' })}
          direita={
            l.goleiro ? undefined : (
              <>
                <BadgeEstrelas
                  estrelas={l.estrelas}
                  nome={nome}
                  textoVazio="Dar estrelas"
                  onClick={() => setEstrelasDe(l.chave)}
                />
                <IconButton icone={DotsThree} rotulo={`Mais opções: ${nome}`} semFundo onClick={() => setMenuDe(l.chave)} />
              </>
            )
          }
        />
      </li>
    )
  }

  const travado = semEstrelas > 0 || semEscolha > 0
  const textoBotao = [
    semEstrelas > 0 && `Falta dar estrelas a ${plural(semEstrelas, 'jogador', 'jogadores')}`,
    semEscolha > 0 && `Falta escolher ${plural(semEscolha, 'nome', 'nomes')}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <main className={`${t.tela} ${t.semMenu} ${t.entrar}`}>
      <Header titulo="Confira a lista" onVoltar={onVoltar} />
      <Stepper atual={2} rotulos={ETAPAS} />
      <div className={t.coluna}>
        <p className={t.texto}>Desmarque quem ainda não chegou.</p>
        <p className={t.pequeno}>Toque nas estrelas para mudar. Quem chegar depois entra no último time.</p>
        <p className={t.pequeno}>
          <b className={t.forte}>{chegaram}</b> {chegaram === 1 ? 'chegou' : 'chegaram'} · <b className={t.forte}>{naoChegaram}</b>{' '}
          {naoChegaram === 1 ? 'não chegou' : 'não chegaram'} · <b className={t.forte}>{naoVem_}</b>{' '}
          {naoVem_ === 1 ? 'não vem' : 'não vêm'}
        </p>
      </div>
      <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar jogador" />
      {chegaram === 0 && todosDeLinha.length > 0 && <Notice>Ninguém marcado. Marque quem já chegou.</Notice>}

      <ul className={t.lista}>{ativos.map(linhaDeJogador)}</ul>

      {goleiros.length > 0 && (
        <>
          <SectionLabel>Goleiros · fora do sorteio</SectionLabel>
          <ul className={t.lista}>{goleiros.map(linhaDeJogador)}</ul>
        </>
      )}

      {naoVem.length > 0 && (
        <>
          <button
            type="button"
            className={t.expansor}
            aria-expanded={naoVemAberto}
            onClick={() => setNaoVemAberto((a) => !a)}
          >
            Não vêm · {naoVem.length}
            <Icon icon={naoVemAberto ? CaretDown : CaretRight} size={20} />
          </button>
          {naoVemAberto && (
            <ul className={t.lista}>
              {naoVem.map((l) => (
                <li key={l.chave}>
                  <PlayerRow
                    nome={nomeDaLinha(l)}
                    novo={ehNova(l) || l.tipo === 'parecido'}
                    direita={
                      <Button variante="pequeno-secundario" onClick={() => mudar(l.chave, { status: 'nao-chegou' })}>
                        Vem sim
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className={t.rodape}>
        <Button variante="secundario" icone={Plus} style={{ width: 'auto', flex: 'none', padding: '0 18px' }} onClick={() => setAdicionando(true)}>
          Adicionar
        </Button>
        <Button disabled={travado} carregando={salvando} onClick={continuar}>
          {travado ? textoBotao : 'Continuar'}
        </Button>
      </div>

      <EstrelasSheet
        aberto={linhaEstrelas !== null}
        onFechar={() => setEstrelasDe(null)}
        nome={linhaEstrelas ? nomeDaLinha(linhaEstrelas) : ''}
        estrelas={linhaEstrelas?.estrelas ?? 0}
        onMudar={(e) => linhaEstrelas && void mudarEstrelas(linhaEstrelas, e)}
      />

      <Sheet aberto={linhaMenu !== null} onFechar={() => setMenuDe(null)} titulo={linhaMenu ? nomeDaLinha(linhaMenu) : ''}>
        <Button
          variante="secundario"
          onClick={() => {
            if (linhaMenu) mudar(linhaMenu.chave, { status: 'nao-chegou' })
            setMenuDe(null)
          }}
        >
          Não vem
        </Button>
      </Sheet>

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
