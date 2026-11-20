import { HandPalm, SneakerMove, UserPlus } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { StarPicker, Toggle } from '../components/Controls'
import { Icon } from '../components/Icon'
import { Input } from '../components/Input'
import { Sheet } from '../components/Sheet'
import type { Jogador } from '../../logic/tipos'
import { combina, normalizar, porNome } from '../util'
import { useApp } from './contexto'
import s from './AdicionarJogador.module.css'
import t from './Telas.module.css'

export interface NovoNaHora {
  nome: string
  estrelas: number
  goleiro: boolean
}

interface Props {
  aberto: boolean
  onFechar: () => void
  jaEsta: (jogadorId: string) => boolean
  onExistente: (jogador: Jogador) => void | Promise<void>
  onNovo: (novo: NovoNaHora) => void | Promise<void>
}

/** Adicionar jogador (COPY 2.5): busca no cadastro; se não achar, cadastra como novo. */
export function AdicionarJogador({ aberto, onFechar, jaEsta, onExistente, onNovo }: Props) {
  const { dados } = useApp()
  const [busca, setBusca] = useState('')
  const [modoNovo, setModoNovo] = useState(false)
  const [estrelas, setEstrelas] = useState(0)
  const [goleiro, setGoleiro] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) {
      setBusca('')
      setModoNovo(false)
      setEstrelas(0)
      setGoleiro(false)
    }
  }, [aberto])

  const q = normalizar(busca)
  const resultados =
    q.length >= 2 ? dados.jogadores.filter((j) => j.ativo && combina(j, busca)).sort(porNome).slice(0, 5) : []
  const exato = dados.jogadores.some((j) => j.ativo && normalizar(j.nome) === q)

  async function rodar(acao: () => void | Promise<void>) {
    setSalvando(true)
    try {
      await acao()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Adicionar jogador">
      <div className={t.coluna}>
        <Input
          rotulo="Nome"
          placeholder="Digite o nome"
          autoComplete="off"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {modoNovo ? (
          <>
            <p className={t.texto2}>Jogador novo. Quantas estrelas?</p>
            {!goleiro && <StarPicker rotulo="Estrelas" valor={estrelas} onMudar={setEstrelas} />}
            <Toggle rotulo="É goleiro" ligado={goleiro} onMudar={setGoleiro} />
            <Button
              carregando={salvando}
              disabled={busca.trim().length < 2 || (!goleiro && estrelas === 0)}
              onClick={() => rodar(() => onNovo({ nome: busca.trim(), estrelas: goleiro ? 3 : estrelas, goleiro }))}
            >
              {goleiro ? 'Adicionar como goleiro' : 'Adicionar ao sorteio'}
            </Button>
          </>
        ) : (
          <ul className={t.lista}>
            {resultados.map((j) =>
              jaEsta(j.id) ? (
                <li key={j.id} className={`${s.resultado} ${s.apagado}`}>
                  <Icon icon={j.goleiro ? HandPalm : SneakerMove} />
                  <span className={s.nome}>
                    {j.nome}
                    <span className={t.pequeno}>{`${j.nome} já está na lista de hoje.`}</span>
                  </span>
                </li>
              ) : (
                <li key={j.id}>
                  <button
                    type="button"
                    className={s.resultado}
                    disabled={salvando}
                    onClick={() => rodar(() => onExistente(j))}
                  >
                    <span className={s.icone}>
                      <Icon icon={j.goleiro ? HandPalm : SneakerMove} />
                    </span>
                    <span className={s.nome}>{j.nome}</span>
                    {j.goleiro ? (
                      <Badge variante="goleiro">Goleiro</Badge>
                    ) : (
                      <Badge variante="nivel" rotulo={`${j.estrelas} estrelas`}>
                        {j.estrelas}★
                      </Badge>
                    )}
                  </button>
                </li>
              ),
            )}
            {busca.trim().length >= 3 && !exato && (
              <li>
                <button type="button" className={s.resultado} onClick={() => setModoNovo(true)}>
                  <span className={s.icone}>
                    <Icon icon={UserPlus} />
                  </span>
                  <span className={s.nome}>{`Adicionar "${busca.trim()}" como jogador novo`}</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </Sheet>
  )
}
