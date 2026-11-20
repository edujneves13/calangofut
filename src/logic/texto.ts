const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export interface DadosTexto {
  nomePelada: string
  /** YYYY-MM-DD */
  data: string
  /** HH:MM */
  horario: string
  /** Nomes do cadastro (não apelidos) de cada time, na ordem dos times. */
  times: { nomes: string[]; completo: boolean }[]
  goleiros: string[]
  /** Linhas de FORMATOS[id].gerar(). */
  linhasFormato: string[]
}

/** Texto simples (sem negrito nem estrelas) para copiar e colar no WhatsApp. Modelo: COPY.md, seção 6. */
export function montarTextoWhatsApp({ nomePelada, data, horario, times, goleiros, linhasFormato }: DadosTexto): string {
  const [ano, mes, dia] = data.split('-').map(Number) as [number, number, number]
  const diaSemana = DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  const ddmm = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`

  const blocos = [
    `⚽ ${nomePelada} — Times\n${diaSemana}, ${ddmm} · ${horario}`,
    times.map((t, i) => `Time ${i + 1}${t.completo ? '' : ' (incompleto)'}: ${t.nomes.join(', ')}`).join('\n'),
    goleiros.length ? `🧤 Goleiros: ${goleiros.join(', ')}` : '',
    linhasFormato.join('\n'),
  ]
  return blocos.filter(Boolean).join('\n\n')
}
