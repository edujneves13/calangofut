import { CaretRight, DotsThree, ListPlus, Trash, User, UserPlus, UsersThree } from '@phosphor-icons/react'
import { useState } from 'react'
import { atualizarJogador, desativarJogadores } from '../../../data/jogadores'
import type { Jogador } from '../../../logic/tipos'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { IconButton } from '../../components/IconButton'
import { SearchInput } from '../../components/Input'
import { PlayerRow } from '../../components/PlayerRow'
import { ConfirmModal, Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { combina, mensagemDeErro, plural, porNome } from '../../util'
import { juntarJogadores, useApp } from '../contexto'
import { EditarJogador } from './EditarJogador'
import { Lote } from './Lote'
import t from '../Telas.module.css'

type Filtro = 'todos' | 'linha' | 'goleiros' | 'inativos'

/** Ajustes → Jogadores (COPY 6.2 e 9.2). */
export function Jogadores({ onVoltar }: { onVoltar: () => void }) {
  const { dados, atualizar, recarregar } = useApp()
  const mostrarToast = useToast()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [editando, setEditando] = useState<{ jogador: Jogador | null; nome?: string } | null>(null)
  const [opcoesAdicionar, setOpcoesAdicionar] = useState(false)
  const [lote, setLote] = useState(false)
  const [selecionando, setSelecionando] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState(false)
  const [excluir, setExcluir] = useState<'selecionados' | 'todos' | null>(null)

  if (lote) return <Lote onVoltar={() => setLote(false)} />

  const ativos = dados.jogadores.filter((j) => j.ativo)
  let lista = filtro === 'inativos' ? dados.jogadores.filter((j) => !j.ativo) : ativos
  if (filtro === 'linha') lista = lista.filter((j) => !j.goleiro)
  if (filtro === 'goleiros') lista = lista.filter((j) => j.goleiro)
  lista = lista.filter((j) => combina(j, busca)).sort(porNome)

  const trocar = (id: string) =>
    setSelecionados((s) => {
      const novo = new Set(s)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })

  /** Marca ou desmarca de uma vez quem aparece na lista (respeita busca e filtro). */
  const todosSelecionados = lista.length > 0 && lista.every((j) => selecionados.has(j.id))
  const trocarTodos = () =>
    setSelecionados((s) => {
      const novo = new Set(s)
      for (const j of lista) {
        if (todosSelecionados) novo.delete(j.id)
        else novo.add(j.id)
      }
      return novo
    })

  function sairDaSelecao() {
    setSelecionando(false)
    setSelecionados(new Set())
  }

  async function confirmarExcluir() {
    const ids = excluir === 'todos' ? ativos.map((j) => j.id) : [...selecionados]
    setExcluir(null)
    try {
      await desativarJogadores(db, ids)
      atualizar({ jogadores: dados.jogadores.map((j) => (ids.includes(j.id) ? { ...j, ativo: false } : j)) })
      sairDaSelecao()
      mostrarToast({
        texto: `${plural(ids.length, 'jogador excluído', 'jogadores excluídos')}.`,
        acao: {
          texto: 'Desfazer',
          onClick: async () => {
            try {
              const voltaram = await Promise.all(ids.map((id) => atualizarJogador(db, id, { ativo: true })))
              atualizar({ jogadores: juntarJogadores(dados.jogadores, voltaram) })
            } catch {
              // Alguém cadastrou um nome igual enquanto isso: recarrega para mostrar o que ficou.
              await recarregar()
            }
          },
        },
      })
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  const filtros: { id: Filtro; texto: string }[] = [
    { id: 'todos', texto: `Todos ${ativos.length}` },
    { id: 'linha', texto: 'Linha' },
    { id: 'goleiros', texto: 'Goleiros' },
    { id: 'inativos', texto: 'Inativos' },
  ]

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      {selecionando ? (
        <Header titulo={plural(selecionados.size, 'selecionado', 'selecionados')} onVoltar={sairDaSelecao} />
      ) : (
        <Header
          titulo="Jogadores"
          onVoltar={onVoltar}
          acoes={
            ativos.length > 0 ? <IconButton icone={DotsThree} rotulo="Mais opções" semFundo onClick={() => setMenu(true)} /> : undefined
          }
        />
      )}

      {!selecionando && (
        <Button icone={UserPlus} onClick={() => setOpcoesAdicionar(true)}>
          Adicionar jogadores
        </Button>
      )}

      {dados.jogadores.length === 0 ? (
        <EmptyState
          icone={UsersThree}
          titulo="Nenhum jogador ainda."
          texto="Cole uma lista do WhatsApp na próxima pelada e cadastre todos de uma vez."
        />
      ) : (
        <>
          <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar por nome ou apelido" />
          <div className={t.linhaBotoes} style={{ justifyContent: 'space-between' }}>
            <div className={t.chips}>
              {filtros.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  className={`${t.chip} ${filtro === f.id ? t.chipAtivo : ''}`}
                  onClick={() => setFiltro(f.id)}
                >
                  {f.texto}
                </button>
              ))}
            </div>
            {filtro !== 'inativos' && lista.length > 0 && (
              <button type="button" className={t.botaoTexto} onClick={selecionando ? trocarTodos : () => setSelecionando(true)}>
                {!selecionando ? 'Selecionar' : todosSelecionados ? 'Limpar' : 'Selecionar todos'}
              </button>
            )}
          </div>

          {lista.length > 0 ? (
            <ul className={t.lista}>
              {lista.map((j) => (
                <li key={j.id}>
                  <PlayerRow
                    nome={j.nome}
                    goleiro={j.goleiro}
                    sub={j.goleiro ? 'Goleiro' : j.tipo === 'mensalista' ? 'Mensalista' : 'Diarista'}
                    selecao={selecionando}
                    chegou={selecionando ? selecionados.has(j.id) : undefined}
                    onTrocarChegou={() => trocar(j.id)}
                    onClick={() => (selecionando ? trocar(j.id) : setEditando({ jogador: j }))}
                    direita={
                      selecionando ? undefined : (
                        <>
                          {!j.goleiro && (
                            <Badge variante="nivel" rotulo={`${j.estrelas} estrelas`}>
                              {j.estrelas}★
                            </Badge>
                          )}
                          <Icon icon={CaretRight} size={18} />
                        </>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          ) : busca.trim() ? (
            <EmptyState
              titulo={`Ninguém com "${busca.trim()}".`}
              acao={
                <Button variante="pequeno" onClick={() => setEditando({ jogador: null, nome: busca.trim() })}>
                  {`Cadastrar "${busca.trim()}"`}
                </Button>
              }
            />
          ) : null}
        </>
      )}

      {selecionando && (
        <div className={t.rodapeComMenu}>
          <Button variante="secundario" style={{ width: 'auto', flex: 'none', padding: '0 18px' }} onClick={sairDaSelecao}>
            Cancelar
          </Button>
          <Button icone={Trash} disabled={selecionados.size === 0} onClick={() => setExcluir('selecionados')}>
            Excluir ({selecionados.size})
          </Button>
        </div>
      )}

      <Sheet aberto={opcoesAdicionar} onFechar={() => setOpcoesAdicionar(false)} titulo="Adicionar jogadores">
        <div className={t.coluna}>
          <button
            type="button"
            className={t.opcao}
            onClick={() => {
              setOpcoesAdicionar(false)
              setEditando({ jogador: null })
            }}
          >
            <span className={t.ajusteIcone}>
              <Icon icon={User} />
            </span>
            <span>
              <span className={t.opcaoTitulo}>Um jogador</span>
              <span className={t.opcaoSub}>Nome, apelidos e estrelas</span>
            </span>
          </button>
          <button
            type="button"
            className={t.opcao}
            onClick={() => {
              setOpcoesAdicionar(false)
              setLote(true)
            }}
          >
            <span className={t.ajusteIcone}>
              <Icon icon={ListPlus} />
            </span>
            <span>
              <span className={t.opcaoTitulo}>Vários de uma vez</span>
              <span className={t.opcaoSub}>Cole uma lista ou dite os nomes</span>
            </span>
          </button>
        </div>
      </Sheet>

      <Sheet aberto={menu} onFechar={() => setMenu(false)} titulo="Mais opções">
        <button
          type="button"
          className={`${t.opcao} ${t.perigo}`}
          onClick={() => {
            setMenu(false)
            setExcluir('todos')
          }}
        >
          <Icon icon={Trash} />
          <span className={t.opcaoTitulo}>Excluir todos</span>
        </button>
      </Sheet>

      <ConfirmModal
        aberto={excluir !== null}
        titulo={
          excluir === 'todos'
            ? `Excluir todos os ${ativos.length} jogadores?`
            : `Excluir ${plural(selecionados.size, 'jogador', 'jogadores')}?`
        }
        texto="Eles saem da lista, mas continuam nas peladas antigas. Dá para trazer de volta em Inativos."
        confirmar="Excluir"
        cancelar="Cancelar"
        perigo
        onConfirmar={confirmarExcluir}
        onCancelar={() => setExcluir(null)}
      />

      <EditarJogador
        aberto={editando !== null}
        onFechar={() => setEditando(null)}
        jogador={editando?.jogador ?? null}
        nomeInicial={editando?.nome}
      />
    </main>
  )
}
