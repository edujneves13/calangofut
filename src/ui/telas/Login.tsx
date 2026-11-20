import { useEffect, useState, type FormEvent } from 'react'
import { lerIdentidade } from '../../data/configuracoes'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Notice } from '../components/Controls'
import { db } from '../db'
import s from './Login.module.css'
import t from './Telas.module.css'

const NOME_PADRAO = 'Pelada dos Brabos'
/** Fase de teste: um usuário só. O código de acesso é a senha dele; o e-mail nunca aparece na tela. */
const EMAIL_ACESSO = 'acesso@calangofut.app'

/** Login com código de acesso (fase de teste): um campo só, sem e-mail, sem cadastro. */
export function Login({ sessaoExpirou }: { sessaoExpirou?: boolean }) {
  const [nome, setNome] = useState(NOME_PADRAO)
  const [codigo, setCodigo] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    lerIdentidade(db)
      .then((i) => setNome(i.nomePelada))
      .catch(() => {})
  }, [])

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!navigator.onLine) {
      setErro('Sem internet. Conecte e tente de novo.')
      return
    }
    setEntrando(true)
    const { error } = await db.auth.signInWithPassword({ email: EMAIL_ACESSO, password: codigo.trim() })
    setEntrando(false)
    if (error) setErro('Código não confere.')
  }

  return (
    <main className={`${t.tela} ${t.semMenu} ${s.login}`}>
      <div className={s.imagem}>
        <img src="/mascote/login.webp" alt={`Calango, mascote da ${nome}, no gramado`} />
      </div>
      <div className={s.conteudo}>
        <div>
          <h1 className={s.nome}>{nome}</h1>
          <p className={t.texto2}>Digite o código de acesso</p>
        </div>
        {sessaoExpirou && <Notice>Sua sessão acabou. Entre de novo.</Notice>}
        <form className={t.coluna} onSubmit={entrar} noValidate>
          <Input
            rotulo="Código de acesso"
            mostrarSenha={{ mostrar: 'Mostrar', esconder: 'Esconder' }}
            autoComplete="current-password"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          {erro && (
            <p className={s.erro} role="alert">
              {erro}
            </p>
          )}
          <Button type="submit" carregando={entrando} disabled={!codigo.trim()}>
            Entrar
          </Button>
        </form>
      </div>
    </main>
  )
}
