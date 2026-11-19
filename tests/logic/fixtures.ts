import { readFileSync } from 'node:fs'

export function fixture(nome: string): string {
  return readFileSync(new URL(`../fixtures/${nome}`, import.meta.url), 'utf8')
}
