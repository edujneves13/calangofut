/** Deixa o nome comparável: sem acento, minúsculo e com espaços simples. */
export function normalizarNome(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
