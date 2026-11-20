import { ErroDados } from '../data/erros'
import { hojeEmJoaoPessoa } from '../logic/datas'
import type { Jogador } from '../logic/tipos'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function diaDaSemana(data: string): number {
  return new Date(`${data}T12:00:00Z`).getUTCDay()
}

/** "25/11" */
export function ddmm(data: string): string {
  const [, mes, dia] = data.split('-')
  return `${dia}/${mes}`
}

/** "Quarta, 25/11" — no dia da pelada, "Hoje, 25/11" (COPY 2.1). */
export function dataLonga(data: string, agora = new Date()): string {
  const dia = data === hojeEmJoaoPessoa(agora) ? 'Hoje' : DIAS[diaDaSemana(data)]
  return `${dia}, ${ddmm(data)}`
}

/** "Qua 25/11" */
export function dataCurta(data: string): string {
  return `${DIAS_CURTOS[diaDaSemana(data)]} ${ddmm(data)}`
}

export function nomeDoDia(diaSemana: number): string {
  return DIAS[diaSemana]!
}

/** plural(2, 'jogador', 'jogadores') → "2 jogadores" */
export function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`
}

/** "Times 1, 2, 4 e 5" */
export function listaComE(itens: string[]): string {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

export function porNome(a: { nome: string }, b: { nome: string }): number {
  return a.nome.localeCompare(b.nome, 'pt-BR')
}

/** Busca sem acento e sem maiúsculas, no nome e nos apelidos. */
export function combina(jogador: Pick<Jogador, 'nome'> & { apelidos?: string[] }, busca: string): boolean {
  const q = normalizar(busca)
  if (!q) return true
  return [jogador.nome, ...(jogador.apelidos ?? [])].some((n) => normalizar(n).includes(q))
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Mensagem do COPY.md para um erro ao gravar. */
export function mensagemDeErro(erro: unknown, nome?: string): string {
  if (!navigator.onLine) return 'Sem internet. Conecte e tente de novo.'
  if (erro instanceof ErroDados && erro.codigo === 'nome-duplicado' && nome) {
    return `Já existe um ${nome.trim()}. Use o nome completo para diferenciar, como "Eduardo Lucas".`
  }
  return 'Não deu para salvar. O app tenta de novo sozinho.'
}
