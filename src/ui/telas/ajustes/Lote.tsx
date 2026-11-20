import { ClipboardText, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { adicionarApelido, criarJogadores } from '../../../data/jogadores'
import { montarConfirmacao } from '../../../logic/confirmacao'
import { lerNomes } from '../../../logic/leitor'
import type { Estrelas, Jogador } from '../../../logic/tipos'
import { Badge, BadgeEstrelas } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Notice } from '../../components/Controls'
import { Header } from '../../components/Header'
import { IconButton } from '../../components/IconButton'
import { Textarea } from '../../components/Input'
import { PlayerRow } from '../../components/PlayerRow'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { mensagemDeErro, plural } from '../../util'
import { juntarJogadores, useApp } from '../contexto'
import { EstrelasSheet } from '../EstrelasSheet'
import t from '../Telas.module.css'

/** Uma linha da confirmação do lote. */
interface ItemLote {
  chave: string
  texto: string
  goleiro: boolean
  estrelas: number
  tipo: 'existente' | 'parecido' | 'novo'
  jogador: Jogador | null
  sugestao: Jogador | null
  escolha: 'ele' | 'novo' | null
}

const ehNovo = (i: ItemLote) => i.tipo === 'novo' || i.escolha === 'novo'

/** Vários de uma vez (COPY 9.4) → Confirme os jogadores (9.5). */
export function Lote({ onVoltar }: { onVoltar: () => void }) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [texto, setTexto] = useState('')
  const [semNomes, setSemNomes] = useState(false)
  const [itens, setItens] = useState<ItemLote[] | null>(null)
  const [estrelasDe, setEstrelasDe] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function continuar() {
    const nomes = lerNomes(texto)
    if (nomes.length === 0) {
      setSemNomes(true)
      return
    }
    const ativos = dados.jogadores.filter((j) => j.ativo)
    const confirmacao = montarConfirmacao(
      nomes.map((n) => n.nome),
      ativos,
    )
    setItens(
      confirmacao.map((c, i) => ({
        chave: `${i}`,
        texto: c.texto,
        goleiro: nomes[i]!.goleiro,
        estrelas: 0,
        tipo: c.tipo,
        jogador: c.tipo === 'existente' ? c.jogador : null,
        sugestao: c.tipo === 'parecido' ? (c.sugestoes[0] ?? null) : null,
        escolha: null,
      })),
    )
  }

  async function colar() {
    try {
      const colado = await navigator.clipboard.readText()
      if (colado) setTexto(colado)
    } catch {
      document.querySelector<HTMLTextAreaElement>('textarea')?.focus()
    }
  }

  if (!itens) {
    return (
      <main className={`${t.tela} ${t.entrar}`}>
        <Header titulo="Vários de uma vez" onVoltar={onVoltar} />
        <p className={t.texto2}>
          Cole a lista do WhatsApp ou escreva os nomes separados por vírgula. Para ditar, toque no microfone do teclado.
        </p>
        <Textarea
          rotulo="Nomes"
          placeholder="Pedro, João Vitor, Maria…"
          rows={6}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setSemNomes(false)
          }}
        />
        {semNomes && <Notice>Não encontrei nomes nesse texto. Separe os nomes por vírgula ou um por linha.</Notice>}
        <Button variante="secundario" icone={ClipboardText} onClick={colar}>
          Colar do WhatsApp
        </Button>
        <div className={t.rodapeComMenu}>
          <Button disabled={!texto.trim()} onClick={continuar}>
            Continuar
          </Button>
        </div>
      </main>
    )
  }

  const mudar = (chave: string, m: Partial<ItemLote>) =>
    setItens((lista) => lista!.map((i) => (i.chave === chave ? { ...i, ...m } : i)))
  const novos = itens.filter(ehNovo)
  const semEstrelas = novos.filter((i) => !i.goleiro && i.estrelas === 0).length
  const semEscolha = itens.filter((i) => i.tipo === 'parecido' && i.escolha === null).length
  const travado = semEstrelas > 0 || semEscolha > 0
  const itemEstrelas = itens.find((i) => i.chave === estrelasDe) ?? null

  async function adicionar() {
    setSalvando(true)
    try {
      const criados = await criarJogadores(
        db,
        novos.map((i) => ({ nome: i.texto, estrelas: (i.estrelas || 3) as Estrelas, goleiro: i.goleiro })),
      )
      for (const i of itens!) {
        if (i.escolha === 'ele' && i.sugestao) await adicionarApelido(db, i.sugestao.id, i.texto).catch(() => {})
      }
      atualizar({ jogadores: juntarJogadores(dados.jogadores, criados) })
      mostrarToast({ texto: `${plural(criados.length, 'jogador adicionado', 'jogadores adicionados')}.` })
      onVoltar()
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e, novos[0]?.texto), tom: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header titulo={`Confirme os jogadores (${itens.length})`} onVoltar={() => setItens(null)} />
      <p className={t.texto2}>Confira os nomes e dê as estrelas de quem é novo.</p>
      <ul className={t.lista}>
        {itens.map((i) => {
          const tirar = (
            <IconButton
              icone={X}
              rotulo={`Tirar ${i.texto} da lista`}
              semFundo
              onClick={() => setItens((lista) => lista!.filter((x) => x.chave !== i.chave))}
            />
          )
          if (i.tipo === 'parecido' && i.escolha === null) {
            return (
              <li key={i.chave}>
                <PlayerRow
                  nome={i.texto}
                  novo
                  sub={`Parece o ${i.sugestao?.nome ?? ''}`}
                  direita={
                    <>
                      <Button variante="pequeno" onClick={() => mudar(i.chave, { escolha: 'ele' })}>
                        É ele
                      </Button>
                      <Button variante="pequeno-secundario" onClick={() => mudar(i.chave, { escolha: 'novo' })}>
                        É novo
                      </Button>
                    </>
                  }
                />
              </li>
            )
          }
          if (ehNovo(i)) {
            return (
              <li key={i.chave}>
                <PlayerRow
                  nome={i.texto}
                  goleiro={i.goleiro}
                  novo
                  sub={<Badge variante="novo">Novo</Badge>}
                  direita={
                    <>
                      {i.goleiro ? (
                        <button type="button" className={t.botaoTexto} onClick={() => setEstrelasDe(i.chave)}>
                          <Badge variante="goleiro">Goleiro</Badge>
                        </button>
                      ) : (
                        <BadgeEstrelas
                          estrelas={i.estrelas}
                          nome={i.texto}
                          textoVazio="Dar estrelas"
                          onClick={() => setEstrelasDe(i.chave)}
                        />
                      )}
                      {tirar}
                    </>
                  }
                />
              </li>
            )
          }
          const quem = i.jogador ?? i.sugestao!
          return (
            <li key={i.chave}>
              <PlayerRow
                nome={quem.nome}
                goleiro={quem.goleiro}
                sub={
                  i.escolha === 'ele'
                    ? `"${i.texto}" vai ser lembrado como apelido do ${quem.nome}.`
                    : undefined
                }
                direita={
                  <>
                    <Badge variante="cadastrado">Já cadastrado</Badge>
                    {tirar}
                  </>
                }
              />
            </li>
          )
        })}
      </ul>
      <div className={t.rodapeComMenu}>
        <Button disabled={travado || novos.length === 0} carregando={salvando} onClick={adicionar}>
          {semEstrelas > 0
            ? `Falta dar estrelas a ${plural(semEstrelas, 'jogador', 'jogadores')}`
            : semEscolha > 0
              ? `Falta escolher ${plural(semEscolha, 'nome', 'nomes')}`
              : `Adicionar ${plural(novos.length, 'jogador', 'jogadores')}`}
        </Button>
      </div>
      <EstrelasSheet
        aberto={itemEstrelas !== null}
        onFechar={() => setEstrelasDe(null)}
        nome={itemEstrelas?.texto ?? ''}
        estrelas={itemEstrelas?.estrelas ?? 0}
        onMudar={(e) => itemEstrelas && mudar(itemEstrelas.chave, { estrelas: e })}
        goleiro={
          itemEstrelas
            ? { valor: itemEstrelas.goleiro, onMudar: (g) => mudar(itemEstrelas.chave, { goleiro: g }) }
            : undefined
        }
      />
    </main>
  )
}
