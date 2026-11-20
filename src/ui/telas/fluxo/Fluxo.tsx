import { useState } from 'react'
import { salvarSorteio } from '../../../data/peladas'
import { FORMATOS } from '../../../logic/formatos'
import type { FormatoId } from '../../../logic/formatos/tipos'
import type { Time } from '../../../logic/tipos'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { mensagemDeErro } from '../../util'
import { useApp } from '../contexto'
import { Colar } from './Colar'
import { Conferir } from './Conferir'
import type { Linha } from '../../../logic/quemVai'
import { Selecionar } from './Selecionar'
import { Sortear } from './Sortear'
import { Sorteando } from './Sorteando'

type Etapa = 'colar' | 'selecionar' | 'conferir' | 'sortear' | 'sorteando'

const TEMPO_SORTEANDO_MS = 1900

/** Fluxo do sorteio: 1/3 lista (colar ou selecionar) → 2/3 conferir → 3/3 sortear → sorteando. */
export function Fluxo({ onSair }: { onSair: () => void }) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [etapa, setEtapa] = useState<Etapa>('colar')
  const [texto, setTexto] = useState('')
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [abrirAdicionar, setAbrirAdicionar] = useState(false)
  const [sorteados, setSorteados] = useState<Time[]>([])

  async function sortear(times: Time[], formato: FormatoId, duracaoMin: number) {
    setSorteados(times)
    setEtapa('sorteando')
    const espera = new Promise((r) => setTimeout(r, TEMPO_SORTEANDO_MS))
    try {
      const { jogos } = FORMATOS[formato].gerar(times.length, { duracaoMin })
      const [pelada] = await Promise.all([salvarSorteio(db, dados.pelada.id, { times: { times, jogos }, formato, duracaoMin }), espera])
      atualizar({ pelada })
      onSair()
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
      setEtapa('sortear')
    }
  }

  switch (etapa) {
    case 'colar':
      return (
        <Colar
          texto={texto}
          setTexto={setTexto}
          onVoltar={onSair}
          onSelecionar={() => setEtapa('selecionar')}
          onContinuar={(novas) => {
            setLinhas(novas)
            setEtapa('conferir')
          }}
        />
      )
    case 'selecionar':
      return (
        <Selecionar
          onVoltar={() => setEtapa('colar')}
          onContinuar={(novas) => {
            setLinhas(novas)
            setEtapa('conferir')
          }}
        />
      )
    case 'conferir':
      return (
        <Conferir
          linhas={linhas}
          setLinhas={setLinhas}
          abrirAdicionar={abrirAdicionar}
          onAdicionarAberto={() => setAbrirAdicionar(false)}
          onVoltar={() => setEtapa('colar')}
          onContinuar={() => setEtapa('sortear')}
        />
      )
    case 'sortear':
      return (
        <Sortear
          onVoltar={() => setEtapa('conferir')}
          onAdicionar={() => {
            setAbrirAdicionar(true)
            setEtapa('conferir')
          }}
          onSortear={sortear}
        />
      )
    case 'sorteando':
      return <Sorteando times={sorteados} />
  }
}
