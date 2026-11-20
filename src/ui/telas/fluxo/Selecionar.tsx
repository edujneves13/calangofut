import { UserPlus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState, SectionLabel, Stepper } from '../../components/Controls'
import { Header } from '../../components/Header'
import { SearchInput } from '../../components/Input'
import { PlayerRow } from '../../components/PlayerRow'
import { combina, porNome } from '../../util'
import { useApp } from '../contexto'
import { ETAPAS } from './Colar'
import { linhasDoCadastro, type Linha } from './linhas'
import t from '../Telas.module.css'

interface Props {
  onVoltar: () => void
  onContinuar: (linhas: Linha[]) => void
}

/** 1/3 Quem vai jogar? — escolher direto do cadastro (COPY 9.8). */
export function Selecionar({ onVoltar, onContinuar }: Props) {
  const { dados, irParaAjustes } = useApp()
  const [busca, setBusca] = useState('')
  const [marcados, setMarcados] = useState<Set<string>>(new Set())

  const ativos = dados.jogadores.filter((j) => j.ativo).sort(porNome)
  const visiveis = ativos.filter((j) => combina(j, busca))
  const linha = visiveis.filter((j) => !j.goleiro)
  const goleiros = visiveis.filter((j) => j.goleiro)

  const trocar = (id: string) =>
    setMarcados((m) => {
      const novo = new Set(m)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })

  const todosMarcados = visiveis.length > 0 && visiveis.every((j) => marcados.has(j.id))

  const item = (j: (typeof ativos)[number]) => (
    <li key={j.id}>
      <PlayerRow
        nome={j.nome}
        goleiro={j.goleiro}
        selecao
        chegou={marcados.has(j.id)}
        onTrocarChegou={() => trocar(j.id)}
        onClick={() => trocar(j.id)}
        direita={
          j.goleiro ? undefined : (
            <Badge variante="nivel" rotulo={`${j.estrelas} estrelas`}>
              {j.estrelas}★
            </Badge>
          )
        }
      />
    </li>
  )

  return (
    <main className={`${t.tela} ${t.semMenu} ${t.entrar}`}>
      <Header titulo="Quem vai jogar?" onVoltar={onVoltar} />
      <Stepper atual={1} rotulos={ETAPAS} />
      {ativos.length === 0 ? (
        <EmptyState
          icone={UserPlus}
          titulo="Nenhum jogador no cadastro ainda."
          acao={<Button onClick={() => irParaAjustes('jogadores')}>Adicionar jogadores</Button>}
        />
      ) : (
        <>
          <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar jogador" />
          <div className={t.linhaBotoes}>
            <button
              type="button"
              className={t.botaoTexto}
              onClick={() =>
                setMarcados((m) => {
                  const novo = new Set(m)
                  for (const j of visiveis) {
                    if (todosMarcados) novo.delete(j.id)
                    else novo.add(j.id)
                  }
                  return novo
                })
              }
            >
              {todosMarcados ? 'Limpar' : 'Selecionar todos'}
            </button>
          </div>
          <ul className={t.lista}>{linha.map(item)}</ul>
          {goleiros.length > 0 && (
            <>
              <SectionLabel>Goleiros · fora do sorteio</SectionLabel>
              <ul className={t.lista}>{goleiros.map(item)}</ul>
            </>
          )}
        </>
      )}
      <div className={t.rodape}>
        <Button
          disabled={marcados.size === 0}
          onClick={() => onContinuar(linhasDoCadastro(ativos.filter((j) => marcados.has(j.id))))}
        >
          {marcados.size === 0 ? 'Selecione quem vai jogar' : `Continuar · ${marcados.size}`}
        </Button>
      </div>
    </main>
  )
}
