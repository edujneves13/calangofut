import { Plus, X } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { ErroDados } from '../../../data/erros'
import { adicionarApelido, atualizarJogador, criarJogador, removerApelido } from '../../../data/jogadores'
import type { Estrelas, Jogador } from '../../../logic/tipos'
import { Button } from '../../components/Button'
import { Segmented, StarPicker, Toggle } from '../../components/Controls'
import { Icon } from '../../components/Icon'
import { Input } from '../../components/Input'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { mensagemDeErro } from '../../util'
import { juntarJogadores, useApp } from '../contexto'
import s from './EditarJogador.module.css'
import t from '../Telas.module.css'

interface Rascunho {
  nome: string
  apelidos: string[]
  novoApelido: string
  estrelas: number
  tipo: Jogador['tipo']
  goleiro: boolean
  ativo: boolean
}

const vazio = (nome = ''): Rascunho => ({
  nome,
  apelidos: [],
  novoApelido: '',
  estrelas: 0,
  tipo: 'diarista',
  goleiro: false,
  ativo: true,
})

interface Props {
  aberto: boolean
  onFechar: () => void
  /** null = Novo jogador */
  jogador: Jogador | null
  nomeInicial?: string
}

/** Editar jogador / Novo jogador (COPY 6.3). */
export function EditarJogador({ aberto, onFechar, jogador, nomeInicial }: Props) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [r, setR] = useState<Rascunho>(vazio())
  const [erroNome, setErroNome] = useState<string | undefined>()
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setErroNome(undefined)
    setR(
      jogador
        ? { ...jogador, apelidos: [...jogador.apelidos], novoApelido: '' }
        : vazio(nomeInicial),
    )
  }, [aberto, jogador, nomeInicial])

  const mudar = (m: Partial<Rascunho>) => setR((atual) => ({ ...atual, ...m }))

  function incluirApelido() {
    const a = r.novoApelido.trim()
    if (!a || r.apelidos.includes(a)) return mudar({ novoApelido: '' })
    mudar({ apelidos: [...r.apelidos, a], novoApelido: '' })
  }

  async function salvar() {
    setSalvando(true)
    setErroNome(undefined)
    const pendente = r.novoApelido.trim()
    const apelidos = pendente && !r.apelidos.includes(pendente) ? [...r.apelidos, pendente] : r.apelidos
    const estrelas = (r.estrelas || 3) as Estrelas
    try {
      let salvo: Jogador
      if (jogador) {
        salvo = await atualizarJogador(db, jogador.id, {
          nome: r.nome,
          estrelas,
          tipo: r.tipo,
          goleiro: r.goleiro,
          ativo: r.ativo,
        })
        for (const a of jogador.apelidos.filter((a) => !apelidos.includes(a))) await removerApelido(db, jogador.id, a)
        for (const a of apelidos.filter((a) => !jogador.apelidos.includes(a))) await adicionarApelido(db, jogador.id, a)
      } else {
        salvo = await criarJogador(db, { nome: r.nome, estrelas, tipo: r.tipo, goleiro: r.goleiro })
        for (const a of apelidos) await adicionarApelido(db, salvo.id, a)
      }
      atualizar({ jogadores: juntarJogadores(dados.jogadores, [{ ...salvo, apelidos }]) })
      mostrarToast({ texto: 'Jogador salvo.' })
      onFechar()
    } catch (e) {
      if (e instanceof ErroDados && e.codigo === 'nome-duplicado') setErroNome(mensagemDeErro(e, r.nome))
      else mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  const precisaEstrelas = !r.goleiro && r.estrelas === 0

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={jogador ? 'Editar jogador' : 'Novo jogador'}>
      <div className={t.coluna}>
        <Input
          rotulo="Nome completo"
          value={r.nome}
          erro={erroNome}
          autoComplete="off"
          onChange={(e) => mudar({ nome: e.target.value })}
        />
        <div className={s.apelidos}>
          <span className={t.pequeno}>Apelidos (opcional)</span>
          <div className={t.chips}>
            {r.apelidos.map((a) => (
              <button
                key={a}
                type="button"
                className={t.chip}
                aria-label={`Remover apelido ${a}`}
                onClick={() => mudar({ apelidos: r.apelidos.filter((x) => x !== a) })}
              >
                {a}
                <Icon icon={X} size={12} />
              </button>
            ))}
          </div>
          <div className={s.novoApelido}>
            <input
              className={s.campoApelido}
              placeholder="+ Apelido"
              aria-label="Novo apelido"
              value={r.novoApelido}
              onChange={(e) => mudar({ novoApelido: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  incluirApelido()
                }
              }}
            />
            <Button variante="pequeno-secundario" icone={Plus} onClick={incluirApelido} disabled={!r.novoApelido.trim()}>
              Apelido
            </Button>
          </div>
          <span className={t.pequeno}>Como o nome aparece na lista do WhatsApp.</span>
        </div>
        {!r.goleiro && <StarPicker rotulo="Estrelas" valor={r.estrelas} onMudar={(estrelas) => mudar({ estrelas })} />}
        <Segmented
          rotulo="Tipo"
          opcoes={[
            { valor: 'mensalista', texto: 'Mensalista' },
            { valor: 'diarista', texto: 'Diarista' },
          ]}
          valor={r.tipo}
          onMudar={(tipo) => mudar({ tipo })}
        />
        <Toggle rotulo="Goleiro" ligado={r.goleiro} onMudar={(goleiro) => mudar({ goleiro })} />
        {jogador && (
          <div>
            <Toggle rotulo="Ativo" ligado={r.ativo} onMudar={(ativo) => mudar({ ativo })} />
            <p className={t.pequeno}>Inativo some da busca e não é reconhecido na lista.</p>
          </div>
        )}
        <Button disabled={r.nome.trim().length < 2 || precisaEstrelas} carregando={salvando} onClick={salvar}>
          Salvar
        </Button>
      </div>
    </Sheet>
  )
}
