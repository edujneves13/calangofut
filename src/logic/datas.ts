const FUSO = 'America/Fortaleza' // João Pessoa
const QUARTA = 3

/**
 * Data (YYYY-MM-DD) da próxima quarta no horário de João Pessoa.
 * Na própria quarta devolve ela mesma, até meia-noite.
 */
export function proximaQuarta(agora: Date): string {
  // 'en-CA' formata como YYYY-MM-DD
  const hojeLocal = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(agora)
  const [ano, mes, dia] = hojeLocal.split('-').map(Number) as [number, number, number]
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  data.setUTCDate(data.getUTCDate() + ((QUARTA - data.getUTCDay() + 7) % 7))
  return data.toISOString().slice(0, 10)
}
