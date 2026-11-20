import s from './Avatar.module.css'

interface Props {
  nome: string
  src?: string | null
  /** 44 cabeçalho · 64 ajustes · 110 editar pelada */
  tamanho?: 44 | 64 | 110
  borda?: boolean
}

export function iniciais(nome: string): string {
  const todas = nome.trim().split(/\s+/).filter(Boolean)
  // "Pelada dos Brabos" → PB: ignora palavras minúsculas como "dos" e "da".
  const fortes = todas.filter((p) => /^[\p{Lu}\p{N}]/u.test(p))
  const palavras = fortes.length > 0 ? fortes : todas
  if (palavras.length === 0) return '?'
  const texto = palavras.length > 1 ? palavras[0]![0]! + palavras.at(-1)![0]! : palavras[0]!.slice(0, 2)
  return texto.toUpperCase()
}

/** Avatar da pelada. Sem imagem, mostra as iniciais (DESIGN.md 7.17). */
export function Avatar({ nome, src, tamanho = 44, borda }: Props) {
  return (
    <span
      className={`${s.avatar} ${borda ? s.comBorda : ''}`}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.36 }}
      role="img"
      aria-label={nome}
    >
      {src ? <img src={src} alt="" /> : iniciais(nome)}
    </span>
  )
}
