const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export interface DadosTexto {
  /** YYYY-MM-DD */
  data: string
  horario: string
  /** Nomes de exibição de cada time, na ordem dos times. */
  times: string[][]
  goleiros: string[]
  linhasFormato: string[]
}

/** Texto simples (sem negrito nem estrelas) para colar no WhatsApp. */
export function montarTextoWhatsApp({ data, horario, times, goleiros, linhasFormato }: DadosTexto): string {
  const [ano, mes, dia] = data.split('-').map(Number) as [number, number, number]
  const diaSemana = DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  const ddmm = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`

  const blocos = [
    `⚽ Times — ${diaSemana} ${ddmm} · ${horario}`,
    times.map((nomes, i) => `Time ${i + 1}: ${nomes.join(', ')}`).join('\n'),
    goleiros.length ? `🧤 Goleiros: ${goleiros.join(', ')}` : '',
    linhasFormato.join('\n'),
  ]
  return blocos.filter(Boolean).join('\n\n')
}

/** Link que abre o WhatsApp com a mensagem já escrita. */
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}
