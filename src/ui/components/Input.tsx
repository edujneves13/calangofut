import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import s from './Input.module.css'

interface Base {
  /** Label sempre visível (DESIGN.md 7.8). */
  rotulo: string
  ajuda?: string
  erro?: string
}

type PropsInput = Base & InputHTMLAttributes<HTMLInputElement> & { mostrarSenha?: { mostrar: string; esconder: string } }

function Moldura({ id, rotulo, ajuda, erro, children }: Base & { id: string; children: React.ReactNode }) {
  return (
    <div className={s.campo}>
      <label htmlFor={id} className={s.rotulo}>
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-msg`} className={s.erro} role="alert">
          {erro}
        </p>
      ) : (
        ajuda && (
          <p id={`${id}-msg`} className={s.ajuda}>
            {ajuda}
          </p>
        )
      )}
    </div>
  )
}

/** Campo de texto. Com `mostrarSenha`, vira campo de senha com botão "Mostrar". */
export function Input({ rotulo, ajuda, erro, mostrarSenha, type, ...resto }: PropsInput) {
  const id = useId()
  const [visivel, setVisivel] = useState(false)
  const tipo = mostrarSenha ? (visivel ? 'text' : 'password') : type
  return (
    <Moldura id={id} rotulo={rotulo} ajuda={ajuda} erro={erro}>
      <div className={`${s.caixa} ${erro ? s.caixaErro : ''}`}>
        <input
          id={id}
          type={tipo}
          className={s.input}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || ajuda ? `${id}-msg` : undefined}
          {...resto}
        />
        {mostrarSenha && (
          <button type="button" className={s.botaoInterno} onClick={() => setVisivel((v) => !v)} aria-pressed={visivel}>
            {visivel ? mostrarSenha.esconder : mostrarSenha.mostrar}
          </button>
        )}
      </div>
    </Moldura>
  )
}

/** Área de colar lista (borda tracejada, monoespaçada). */
export function Textarea({ rotulo, ajuda, erro, ...resto }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Moldura id={id} rotulo={rotulo} ajuda={ajuda} erro={erro}>
      <textarea
        id={id}
        className={s.textarea}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || ajuda ? `${id}-msg` : undefined}
        {...resto}
      />
    </Moldura>
  )
}

interface PropsBusca {
  valor: string
  onMudar: (valor: string) => void
  placeholder: string
}

/** Busca: lupa à esquerda, limpar (×) quando há texto. O placeholder também é o nome do campo. */
export function SearchInput({ valor, onMudar, placeholder }: PropsBusca) {
  return (
    <div className={s.caixa} role="search">
      <span className={s.lupa}>
        <Icon icon={MagnifyingGlass} size={20} />
      </span>
      <input
        type="search"
        className={s.input}
        value={valor}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onMudar(e.target.value)}
      />
      {valor && <IconButton icone={X} rotulo="Limpar busca" semFundo onClick={() => onMudar('')} />}
    </div>
  )
}
