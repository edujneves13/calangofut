const FUSO = 'America/Fortaleza' // João Pessoa

/** Data de hoje (YYYY-MM-DD) no horário de João Pessoa. */
export function hojeEmJoaoPessoa(agora: Date): string {
  // 'en-CA' formata como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(agora)
}

/**
 * Data (YYYY-MM-DD) do próximo dia da semana escolhido (0 = domingo … 6 = sábado),
 * no horário de João Pessoa. No próprio dia devolve ele mesmo, até meia-noite.
 */
export function proximoDia(agora: Date, diaSemana: number): string {
  const [ano, mes, dia] = hojeEmJoaoPessoa(agora).split('-').map(Number) as [number, number, number]
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  data.setUTCDate(data.getUTCDate() + ((diaSemana - data.getUTCDay() + 7) % 7))
  return data.toISOString().slice(0, 10)
}
