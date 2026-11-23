import { PencilSimple } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Segmented } from '../../components/Controls'
import { Icon } from '../../components/Icon'
import { TempoSheet } from './TempoSheet'

type Escolha = 8 | 10 | 'outro'

interface Props {
  minutos: number
  onMudar: (minutos: number) => void
  /** Ajuda da folha "Outro". Sem ela, a folha não mostra a linha de ajuda. */
  ajuda?: string
}

/** Tempo de jogo: 8 min · 10 min · Outro. Mesmo controle no cronômetro, no sorteio e em Ajustes (navegacao-ajustes-v3). */
export function EscolhaTempo({ minutos, onMudar, ajuda }: Props) {
  const [folha, setFolha] = useState(false)
  const escolha: Escolha = minutos === 8 || minutos === 10 ? minutos : 'outro'
  const opcoes: { valor: Escolha; texto: ReactNode; rotulo?: string }[] = [
    { valor: 8, texto: '8 min' },
    { valor: 10, texto: '10 min' },
    escolha === 'outro'
      ? {
          valor: 'outro',
          texto: (
            <>
              {minutos} min <Icon icon={PencilSimple} size={18} />
            </>
          ),
          rotulo: `${minutos} min, mudar`,
        }
      : { valor: 'outro', texto: 'Outro' },
  ]

  return (
    <>
      <Segmented rotulo="Tempo de jogo" opcoes={opcoes} valor={escolha} onMudar={(v) => (v === 'outro' ? setFolha(true) : onMudar(v))} />
      <TempoSheet
        aberto={folha}
        minutos={minutos}
        ajuda={ajuda}
        onFechar={() => setFolha(false)}
        onUsar={(m) => {
          onMudar(m)
          setFolha(false)
        }}
      />
    </>
  )
}
