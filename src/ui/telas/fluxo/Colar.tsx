import { CheckCircle, ClipboardText, UsersThree } from '@phosphor-icons/react'
import { useState } from 'react'
import { contarEncontrados, lerLista } from '../../../logic/leitor'
import { Button } from '../../components/Button'
import { Notice, Stepper } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { Textarea } from '../../components/Input'
import { ddmm } from '../../util'
import { useApp } from '../contexto'
import { linhasDaLista, type Linha } from '../../../logic/quemVai'
import t from '../Telas.module.css'

export const ETAPAS: [string, string, string] = ['Lista', 'Sorteio', 'Regras']

interface Props {
  texto: string
  setTexto: (texto: string) => void
  onVoltar: () => void
  onSelecionar: () => void
  onContinuar: (linhas: Linha[]) => void
}

/** 1/3 Lista de jogadores (docs/design/fluxo-sorteio-v2-20-novembro.md §2): colar, digitar ou selecionar do cadastro. */
export function Colar({ texto, setTexto, onVoltar, onSelecionar, onContinuar }: Props) {
  const { dados } = useApp()
  const [semJogadores, setSemJogadores] = useState(false)
  const [outraData, setOutraData] = useState<string | null>(null)
  const encontrados = contarEncontrados(lerLista(texto, dados.pelada.data))

  function continuar(aceitarOutraData = false) {
    const lista = lerLista(texto, dados.pelada.data)
    setSemJogadores(false)
    if (lista.jogadores.length === 0 && lista.goleiros.length === 0) {
      setOutraData(null)
      setSemJogadores(true)
      return
    }
    if (lista.data && lista.data !== dados.pelada.data && !aceitarOutraData) {
      setOutraData(ddmm(lista.data))
      return
    }
    setOutraData(null)
    onContinuar(linhasDaLista(lista, dados.jogadores.filter((j) => j.ativo)))
  }

  async function colar() {
    try {
      const colado = await navigator.clipboard.readText()
      if (colado) {
        setTexto(colado)
        setSemJogadores(false)
        setOutraData(null)
      }
    } catch {
      document.querySelector<HTMLTextAreaElement>('textarea')?.focus()
    }
  }

  return (
    <main className={`${t.tela} ${t.semMenu} ${t.entrar}`}>
      <Header titulo="Lista de jogadores" onVoltar={onVoltar} />
      <Stepper atual={1} rotulos={ETAPAS} />
      <p className={t.texto2}>
        Cole a lista do WhatsApp inteira ou digite os nomes, você também pode selecionar jogadores existentes
      </p>
      <Button variante="secundario" icone={UsersThree} onClick={onSelecionar}>
        Selecionar jogadores existentes
      </Button>
      <div className={t.ou}>ou</div>
      <Textarea
        rotulo="Cole sua lista ou digite os nomes"
        rows={8}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setSemJogadores(false)
          setOutraData(null)
        }}
      />
      {encontrados && (
        <p className={t.encontrados} aria-live="polite">
          <Icon icon={CheckCircle} size={18} weight="fill" />
          {encontrados}
        </p>
      )}
      {semJogadores && (
        <Notice>Não encontrei jogadores nesse texto. Copie a mensagem da lista de presença inteira e cole de novo.</Notice>
      )}
      {outraData && (
        <Notice>
          <div className={t.coluna}>
            <span>Essa lista é de {outraData}. Usar mesmo assim?</span>
            <div className={t.linhaBotoes}>
              <Button variante="pequeno" onClick={() => continuar(true)}>
                Usar esta lista
              </Button>
              <Button
                variante="pequeno-secundario"
                onClick={() => {
                  setTexto('')
                  setOutraData(null)
                }}
              >
                Colar outra
              </Button>
            </div>
          </div>
        </Notice>
      )}
      <Button variante="secundario" icone={ClipboardText} onClick={colar}>
        Colar
      </Button>
      <div className={t.rodape}>
        <Button disabled={!texto.trim()} onClick={() => continuar()}>
          Continuar
        </Button>
      </div>
    </main>
  )
}
