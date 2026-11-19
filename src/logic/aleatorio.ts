/**
 * Gerador de números aleatórios com semente (mulberry32).
 * Nos testes, a mesma semente sempre gera o mesmo sorteio.
 */
export function criarRng(semente: number): () => number {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Embaralha sem alterar a lista original (Fisher-Yates). */
export function embaralhar<T>(itens: readonly T[], rng: () => number): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j] as T, copia[i] as T]
  }
  return copia
}
