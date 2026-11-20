import { useState } from 'react'
import { enviarAvatar, salvarConfiguracoes } from '../../../data/configuracoes'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { Input } from '../../components/Input'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { mensagemDeErro } from '../../util'
import { useApp } from '../contexto'
import { AVATAR_PADRAO } from '../Times'
import s from './NomeAvatar.module.css'
import t from '../Telas.module.css'

/** Foto do celular costuma ter vários MB: reduz para 512 px, recortada em quadrado, antes de enviar. */
async function reduzir(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo)
  const lado = Math.min(imagem.width, imagem.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  canvas
    .getContext('2d')!
    .drawImage(imagem, (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado, 0, 0, 512, 512)
  return new Promise((resolver, rejeitar) =>
    canvas.toBlob((b) => (b ? resolver(b) : rejeitar(new Error('imagem'))), 'image/jpeg', 0.85),
  )
}

/** Nome e avatar (COPY 6.4). */
export function NomeAvatar({ onVoltar }: { onVoltar: () => void }) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const [nome, setNome] = useState(dados.config.nomePelada)
  const [enviando, setEnviando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const avatar = dados.config.avatarUrl

  async function trocarFoto(arquivo: File | undefined) {
    if (!arquivo) return
    setEnviando(true)
    try {
      atualizar({ config: await enviarAvatar(db, await reduzir(arquivo)) })
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    } finally {
      setEnviando(false)
    }
  }

  async function salvar() {
    setSalvando(true)
    try {
      atualizar({ config: await salvarConfiguracoes(db, { nomePelada: nome.trim() }) })
      onVoltar()
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header titulo="Nome e avatar" onVoltar={onVoltar} />
      <div className={s.topo}>
        <Avatar nome={nome || dados.config.nomePelada} src={avatar ?? AVATAR_PADRAO} tamanho={110} />
        <label className={s.botaoFoto} aria-busy={enviando}>
          {avatar ? 'Trocar foto' : 'Escolher foto'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={enviando}
            onChange={(e) => void trocarFoto(e.target.files?.[0])}
          />
        </label>
        <p className={`${t.pequeno} ${t.centro}`}>Foto do grupo, escudo ou mascote. Aparece em círculo.</p>
      </div>
      <Input
        rotulo="Nome da pelada"
        ajuda="Aparece no app e na lista dos times copiada."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <Button disabled={!nome.trim()} carregando={salvando} onClick={salvar}>
        Salvar
      </Button>
    </main>
  )
}
