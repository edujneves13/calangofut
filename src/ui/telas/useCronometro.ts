import { useCallback, useEffect, useRef, useState } from 'react'
import { apitoFinal, liberarSom, pararApito } from '../som/apito'

export type FaseCronometro = 'parado' | 'rodando' | 'pausado' | 'fim'

export interface Cronometro {
  fase: FaseCronometro
  /** Segundos */
  duracao: number
  restante: number
  telaAcesa: boolean | null
  comecar: () => void
  pausar: () => void
  continuar: () => void
  zerar: () => void
  ajustar: (minutos: number) => void
  setMinutos: (minutos: number) => void
  pararApito: () => void
}

/**
 * Fica no Shell para continuar contando quando a pessoa troca de aba.
 * O tempo vem do relógio (fimEm), não de somar segundos: não atrasa se o celular travar um pouco.
 */
export function useCronometro(minutosPadrao: number): Cronometro {
  const [fase, setFase] = useState<FaseCronometro>('parado')
  const [duracao, setDuracao] = useState(minutosPadrao * 60)
  const [restante, setRestante] = useState(minutosPadrao * 60)
  const [telaAcesa, setTelaAcesa] = useState<boolean | null>(null)
  const fimEm = useRef(0)
  const trava = useRef<WakeLockSentinel | null>(null)
  const vibrouUltimo = useRef(false)

  const acender = useCallback(async () => {
    try {
      trava.current = (await navigator.wakeLock?.request('screen')) ?? null
      setTelaAcesa(Boolean(trava.current))
    } catch {
      setTelaAcesa(false)
    }
  }, [])
  const apagar = useCallback(() => {
    void trava.current?.release().catch(() => {})
    trava.current = null
  }, [])

  useEffect(() => {
    if (fase !== 'rodando') return
    const id = setInterval(() => {
      const r = Math.max(0, (fimEm.current - Date.now()) / 1000)
      setRestante(r)
      if (r <= 60 && !vibrouUltimo.current) {
        vibrouUltimo.current = true
        navigator.vibrate?.(150)
      }
      if (r <= 0) {
        setFase('fim')
        apagar()
        apitoFinal()
      }
    }, 200)
    // O navegador solta a trava da tela quando o app vai para o fundo; pega de novo na volta.
    const voltar = () => {
      if (document.visibilityState === 'visible') void acender()
    }
    document.addEventListener('visibilitychange', voltar)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', voltar)
    }
  }, [fase, acender, apagar])

  const rodarPor = (segundos: number) => {
    fimEm.current = Date.now() + segundos * 1000
    setFase('rodando')
    void acender()
  }

  return {
    fase,
    duracao,
    restante,
    telaAcesa,
    comecar: () => {
      liberarSom()
      vibrouUltimo.current = false
      rodarPor(restante)
    },
    pausar: () => {
      setRestante(Math.max(0, (fimEm.current - Date.now()) / 1000))
      setFase('pausado')
      apagar()
    },
    continuar: () => {
      liberarSom()
      rodarPor(restante)
    },
    zerar: () => {
      pararApito()
      apagar()
      vibrouUltimo.current = false
      setRestante(duracao)
      setFase('parado')
    },
    ajustar: (minutos) => {
      if (fase === 'rodando') {
        fimEm.current = Math.max(Date.now() + 1000, fimEm.current + minutos * 60_000)
        setRestante((fimEm.current - Date.now()) / 1000)
        if (minutos > 0) vibrouUltimo.current = false
      } else {
        const novo = Math.max(60, restante + minutos * 60)
        setRestante(novo)
        if (fase === 'parado') setDuracao(novo)
      }
    },
    setMinutos: (minutos) => {
      setDuracao(minutos * 60)
      setRestante(minutos * 60)
    },
    pararApito,
  }
}
