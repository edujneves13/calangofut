import { CaretRight, Clock, MapPin, Shuffle, UsersThree } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { dataLonga } from '../util'
import { useApp } from './contexto'
import { Durante } from './Durante'
import { Fluxo } from './fluxo/Fluxo'
import s from './Times.module.css'
import t from './Telas.module.css'

export const AVATAR_PADRAO = '/mascote/avatar-circulo.webp'

/** Aba Times: próxima pelada → fluxo do sorteio → times durante a pelada. */
export function Times() {
  const { dados, setFluxoAberto } = useApp()
  const [fluxo, setFluxo] = useState(false)

  useEffect(() => {
    setFluxoAberto(fluxo)
    return () => setFluxoAberto(false)
  }, [fluxo, setFluxoAberto])

  if (fluxo) return <Fluxo onSair={() => setFluxo(false)} />
  if (dados.pelada.times) return <Durante onTentarNovamente={() => setFluxo(true)} />
  return <ProximaPelada onSortear={() => setFluxo(true)} />
}

/** Link discreto no fim da aba Times (COPY 9.1). */
export function LinkJogadores() {
  const { dados, irParaAjustes } = useApp()
  const ativos = dados.jogadores.filter((j) => j.ativo).length
  return (
    <button type="button" className={t.linkRodape} onClick={() => irParaAjustes('jogadores')}>
      <Icon icon={UsersThree} size={20} />
      Lista de jogadores · {ativos}
      <Icon icon={CaretRight} size={18} />
    </button>
  )
}

function ProximaPelada({ onSortear }: { onSortear: () => void }) {
  const { dados } = useApp()
  const { config, pelada } = dados
  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header titulo={config.nomePelada} avatar={{ nome: config.nomePelada, src: config.avatarUrl ?? AVATAR_PADRAO }} />
      <section className={s.hero} aria-label="Próxima pelada">
        <div className={s.ilustracao}>
          <img src="/mascote/proxima-pelada.webp" alt={`Calango, mascote da ${config.nomePelada}, no gramado`} />
        </div>
        <div className={s.conteudo}>
          <p className={s.rotulo}>Próxima pelada</p>
          <p className={s.data}>{dataLonga(pelada.data)}</p>
          <div className={s.meta}>
            <span>
              <Icon icon={Clock} size={18} />
              {pelada.horario}
            </span>
            <span>
              <Icon icon={MapPin} size={18} />
              {pelada.local}
            </span>
          </div>
          <Button icone={Shuffle} onClick={onSortear} className={s.botao}>
            Sortear times
          </Button>
        </div>
      </section>
      <LinkJogadores />
    </main>
  )
}
