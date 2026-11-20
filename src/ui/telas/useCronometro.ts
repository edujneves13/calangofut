import { useCallback, useEffect, useRef, useState } from 'react'
import {
  atualizar,
  comecar,
  continuar,
  criarCronometro,
  ehUltimoMinuto,
  limitarMinutos,
  maisUmMinuto,
  mudarMinutos,
  pausar,
  zerar,
  type EstadoCronometro,
} from '../../logic/cronometro'
import { apitoFinal, liberarSom, pararApito } from '../som/apito'

export interface Cronometro {
  estado: EstadoCronometro
  /** Relógio da última atualização da tela (ms). */
  agora: number
  /** null = ainda não tentou; false = o celular não deixa manter a tela acesa. */
  telaAcesa: boolean | null
  comecar: () => void
  pausar: () => void
  continuar: () => void
  zerar: () => void
  maisUmMinuto: () => void
  setMinutos: (minutos: number) => void
  pararApito: () => void
}

/**
 * Estado do cronômetro + efeitos do celular (tela acesa, vibração, apito).
 * A conta do tempo fica em src/logic/cronometro.ts. Mora no Shell para continuar contando em outra aba.
 */
export function useCronometro(minutosPadrao: number): Cronometro {
  const [estado, setEstado] = useState(() => criarCronometro(limitarMinutos(minutosPadrao)))
  const [agora, setAgora] = useState(() => Date.now())
  const [telaAcesa, setTelaAcesa] = useState<boolean | null>(null)
  const trava = useRef<WakeLockSentinel | null>(null)
  const vibrouUltimo = useRef(false)

  const acender = useCallback(async () => {
    try {
      if (!('wakeLock' in navigator)) throw new Error('sem suporte')
      trava.current = await navigator.wakeLock.request('screen')
      setTelaAcesa(true)
    } catch {
      setTelaAcesa(false)
    }
  }, [])
  const apagar = useCallback(() => {
    void trava.current?.release().catch(() => {})
    trava.current = null
  }, [])

  const rodando = estado.fase === 'rodando'

  useEffect(() => {
    if (!rodando) return
    const passo = () => {
      const t = Date.now()
      setAgora(t)
      setEstado((e) => {
        const novo = atualizar(e, t)
        if (!vibrouUltimo.current && ehUltimoMinuto(novo, t)) {
          vibrouUltimo.current = true
          navigator.vibrate?.(150)
        }
        if (novo.fase === 'fim' && e.fase !== 'fim') {
          apagar()
          apitoFinal()
        }
        return novo
      })
    }
    passo()
    const id = setInterval(passo, 200)
    // O navegador solta a trava quando o app vai para o fundo; pega de novo na volta.
    const voltar = () => {
      if (document.visibilityState === 'visible') {
        passo()
        void acender()
      }
    }
    document.addEventListener('visibilitychange', voltar)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', voltar)
    }
  }, [rodando, acender, apagar])

  const agir = (f: (e: EstadoCronometro, t: number) => EstadoCronometro) => {
    const t = Date.now()
    setAgora(t)
    setEstado((e) => f(e, t))
  }

  return {
    estado,
    agora,
    telaAcesa,
    comecar: () => {
      liberarSom()
      vibrouUltimo.current = false
      agir(comecar)
      void acender()
    },
    pausar: () => {
      agir(pausar)
      apagar()
    },
    continuar: () => {
      liberarSom()
      agir(continuar)
      void acender()
    },
    zerar: () => {
      pararApito()
      apagar()
      vibrouUltimo.current = false
      agir((e) => zerar(e))
    },
    maisUmMinuto: () => {
      vibrouUltimo.current = false
      agir(maisUmMinuto)
    },
    setMinutos: (minutos) => agir((e) => mudarMinutos(e, limitarMinutos(minutos))),
    pararApito,
  }
}
