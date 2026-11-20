// Apito gerado no app com Web Audio (DESIGN.md 12.3): sem arquivo de som, funciona offline.
let ctx: AudioContext | null = null
let tocando: OscillatorNode[] = []

/** Chamar no toque em "Começar": o iPhone só libera som depois de um toque. */
export function liberarSom() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

/** Um silvo: tom alto com trinado rápido, como apito de juiz. */
function silvo(inicio: number, duracao: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const trinado = ctx.createOscillator()
  const ganhoTrinado = ctx.createGain()
  const ganho = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.value = 2900
  trinado.frequency.value = 38
  ganhoTrinado.gain.value = 180
  trinado.connect(ganhoTrinado).connect(osc.frequency)

  ganho.gain.setValueAtTime(0, inicio)
  ganho.gain.linearRampToValueAtTime(0.35, inicio + 0.02)
  ganho.gain.setValueAtTime(0.35, inicio + duracao - 0.05)
  ganho.gain.linearRampToValueAtTime(0, inicio + duracao)

  osc.connect(ganho).connect(ctx.destination)
  osc.start(inicio)
  trinado.start(inicio)
  osc.stop(inicio + duracao)
  trinado.stop(inicio + duracao)
  tocando.push(osc, trinado)
}

/** Fim de jogo: dois curtos e um longo, com vibração. */
export function apitoFinal() {
  if (ctx) {
    const t = ctx.currentTime
    silvo(t, 0.25)
    silvo(t + 0.35, 0.25)
    silvo(t + 0.7, 1.1)
  }
  navigator.vibrate?.([200, 100, 200, 100, 600])
}

export function pararApito() {
  for (const n of tocando) {
    try {
      n.stop()
    } catch {
      // já parou
    }
  }
  tocando = []
  navigator.vibrate?.(0)
}
