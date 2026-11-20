import { useEffect, useState, type FormEvent } from 'react'
import { lerIdentidade } from '../../data/configuracoes'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Notice } from '../components/Controls'
import { db } from '../db'
import s from './Login.module.css'
import t from './Telas.module.css'

const NOME_PADRAO = 'Pelada dos Brabos'

/** Login só com senha: sem link mágico e sem cadastro (adendo). */
export function Login({ sessaoExpirou }: { sessaoExpirou?: boolean }) {
  const [nome, setNome] = useState(NOME_PADRAO)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
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
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEntrando(false)
    if (error) setErro('E-mail ou senha não conferem. Esqueceu? Peça para outro organizador trocar sua senha.')
  }

  return (
    <main className={`${t.tela} ${t.semMenu} ${s.login}`}>
      <div className={s.imagem}>
        <img src="/mascote/login.webp" alt={`Calango, mascote da ${nome}, no gramado`} />
      </div>
      <div className={s.conteudo}>
        <div>
          <h1 className={s.nome}>{nome}</h1>
          <p className={t.texto2}>Entrada dos organizadores</p>
        </div>
        {sessaoExpirou && <Notice>Sua sessão acabou. Entre de novo.</Notice>}
        <form className={t.coluna} onSubmit={entrar} noValidate>
          <Input
            rotulo="E-mail"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            rotulo="Senha"
            mostrarSenha={{ mostrar: 'Mostrar', esconder: 'Esconder' }}
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && (
            <p className={s.erro} role="alert">
              {erro}
            </p>
          )}
          <Button type="submit" carregando={entrando} disabled={!email.trim() || !senha}>
            Entrar
          </Button>
        </form>
      </div>
    </main>
  )
}
