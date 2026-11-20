import { ClipboardText, UsersThree } from '@phosphor-icons/react'
import { useState } from 'react'
import { lerLista } from '../../../logic/leitor'
import { Button } from '../../components/Button'
import { Notice, Stepper } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Textarea } from '../../components/Input'
import { ddmm } from '../../util'
import { useApp } from '../contexto'
import { linhasDaLista, type Linha } from './linhas'
import t from '../Telas.module.css'

export const ETAPAS: [string, string, string] = ['Lista', 'Conferir', 'Sortear']

interface Props {
  texto: string
  setTexto: (texto: string) => void
  onVoltar: () => void
  onSelecionar: () => void
  onContinuar: (linhas: Linha[]) => void
}

/** 1/3 Cole a lista do WhatsApp (COPY 2.2), com "Selecionar do cadastro" como alternativa (9.8). */
export function Colar({ texto, setTexto, onVoltar, onSelecionar, onContinuar }: Props) {
  const { dados } = useApp()
  const [semJogadores, setSemJogadores] = useState(false)
  const [outraData, setOutraData] = useState<string | null>(null)

  function continuar(aceitarOutraData = false) {
    const lista = lerLista(texto)
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

  async function colarDoWhatsApp() {
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
      <Header titulo="Cole a lista do WhatsApp" onVoltar={onVoltar} />
      <Stepper atual={1} rotulos={ETAPAS} />
      <p className={t.texto2}>
        No WhatsApp, segure a mensagem da lista e toque em Copiar. Pode colar inteira: o app separa jogadores e goleiros e
        ignora a lista de espera.
      </p>
      <Textarea
        rotulo="Lista do WhatsApp"
        placeholder="Cole a mensagem aqui"
        rows={8}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setSemJogadores(false)
          setOutraData(null)
        }}
      />
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
      <Button variante="secundario" icone={ClipboardText} onClick={colarDoWhatsApp}>
        Colar do WhatsApp
      </Button>
      <div className={t.ou}>ou</div>
      <Button variante="secundario" icone={UsersThree} onClick={onSelecionar}>
        Selecionar do cadastro
      </Button>
      <div className={t.rodape}>
        <Button disabled={!texto.trim()} onClick={() => continuar()}>
          Continuar
        </Button>
      </div>
    </main>
  )
}
