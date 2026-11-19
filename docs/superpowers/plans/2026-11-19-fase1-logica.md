# Fase 1 — Parte A: Lógica pura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar e testar toda a lógica da fase 1 em `src/logic/` (leitor da lista, casamento de nomes, sorteio balanceado, atrasados, formatos de jogo, texto do WhatsApp), sem React e sem Supabase.

**Architecture:** Funções puras em TypeScript, um arquivo por responsabilidade, sem estado global. Aleatoriedade injetável (`rng`) para os testes serem determinísticos. As camadas `src/data/` e `src/ui/` (planos seguintes) só chamam estas funções.

**Tech Stack:** TypeScript (strict), Vitest, Node 24. Sem Vite/React nesta parte.

**Spec:** `docs/superpowers/specs/2026-11-19-pelada-sorteio-design.md`

## Roadmap da fase 1 (um plano por parte, escrito antes de executar cada uma)

- **A — Lógica pura** (este plano)
- B — Banco e regras: tabelas `jogadores`, `peladas`, `presencas`, RLS, `src/data/`
- C — Telas: Vite + React, login, início, pelada do dia, jogadores, configurações
- D — Cronômetro (timestamps, Wake Lock, apito, vibração, aviso no último minuto)
- E — PWA + deploy Netlify + ping agendado + teste com a lista real de 18/11

## Global Constraints

- `src/logic/` não importa React, Supabase nem nada do navegador (só JS padrão).
- Identificadores e textos em português do Brasil.
- Tamanho do time = 5. Mínimo para sortear = 10 jogadores de linha presentes.
- Nenhum time pode ter mais de 2 jogadores 5 estrelas.
- Texto do WhatsApp: sem `*`, `_`, `~` ou outra marcação; sem estrelas nem soma de estrelas.
- Emojis removidos no leitor: ⭐ ✅ ✅️ ⚠️ 👤 ❌ (e qualquer outro pictograma + seletor de variação).
- Nome parecido nunca casa sozinho; só igualdade exata (sem acento, sem maiúsculas, espaços normalizados).
- Todo comportamento do leitor e do sorteio tem teste. Testes do leitor usam `tests/fixtures/`.

## Review Focus

1. **Lista colada com `\r\n`, espaços extras ou sem a linha "Lista de Presença"** → mesmo resultado. Teste na Task 2.
2. **Jogador com ⚠️ (pendente)** → entra com Presente = sim; só ❌ vira não. Teste na Task 2.
3. **Dois jogadores do cadastro com o mesmo nome normalizado** → vira sugestão entre os dois, nunca casa sozinho. Teste na Task 3.
4. **Tocar "Presente" duas vezes no mesmo atrasado** → não duplica no time. Teste na Task 5.
5. **5 estrelas demais para a restrição caber** (ex.: 10 presentes, 5 deles 5★) → erro claro `muitos-cinco-estrelas`, nunca times inválidos nem laço infinito. Teste na Task 4.

---

### Task 1: Projeto, tipos e utilitários

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `src/logic/tipos.ts`, `src/logic/normalizar.ts`, `src/logic/aleatorio.ts`
- Test: `tests/logic/normalizar.test.ts`, `tests/logic/aleatorio.test.ts`

**Interfaces:**
- Produces:
  - `type Estrelas = 1 | 2 | 3 | 4 | 5`
  - `interface Jogador { id: string; nome: string; estrelas: Estrelas; tipo: 'mensalista' | 'diarista'; goleiro: boolean; ativo: boolean }`
  - `interface Time { jogadorIds: string[]; somaEstrelas: number; completo: boolean }`
  - `const TAMANHO_TIME = 5`
  - `normalizarNome(texto: string): string`
  - `criarRng(semente: number): () => number` (mulberry32, retorna [0, 1))
  - `embaralhar<T>(itens: readonly T[], rng: () => number): T[]` (Fisher-Yates, não muta a entrada)

- [ ] **Step 1:** `package.json` com `"type": "module"`, scripts `test: vitest run`, `test:watch: vitest`, `typecheck: tsc --noEmit`; devDependencies `typescript`, `vitest`. `tsconfig.json` strict, `target/lib ES2022`, `module ESNext`, `moduleResolution Bundler`, `include: ["src", "tests"]`. `.gitignore`: `node_modules`, `dist`, `.env.local`, `.env*.local`, `.DS_Store`. Rodar `npm install`.
- [ ] **Step 2: Testes que falham**

```ts
// normalizar.test.ts
expect(normalizarNome('  Léo  ')).toBe('leo')
expect(normalizarNome('João   Pedro')).toBe('joao pedro')
expect(normalizarNome('STÊNIO')).toBe('stenio')
// aleatorio.test.ts
expect(seq(criarRng(42))).toEqual(seq(criarRng(42)))      // mesma semente, mesma sequência
expect(embaralhar([1,2,3,4,5], rng).sort()).toEqual([1,2,3,4,5])
const orig = [1,2,3]; embaralhar(orig, rng); expect(orig).toEqual([1,2,3])
```

- [ ] **Step 3:** `npm test` → FAIL (módulos não existem).
- [ ] **Step 4:** Implementar. `normalizarNome`: NFD, remove `\p{M}`, minúsculas, colapsa espaços, trim.
- [ ] **Step 5:** `npm test` e `npm run typecheck` → PASS.
- [ ] **Step 6:** Commit `chore: setup vitest e utilitários da lógica`.

### Task 2: Leitor da lista do WhatsApp

**Files:**
- Create: `src/logic/leitor.ts`
- Test: `tests/logic/leitor.test.ts`

**Interfaces:**
- Produces:
  - `interface LinhaLida { nome: string; presente: boolean }`
  - `interface ListaLida { data: string | null; jogadores: LinhaLida[]; goleiros: LinhaLida[] }` (`data` em `YYYY-MM-DD`)
  - `lerLista(texto: string): ListaLida`

Regras: linha numerada = `/^\s*\d+\s*[-–.)]\s*(.*)$/`. Seção muda quando a linha normalizada começa com `goleiros` (→ goleiros) ou `lista de espera` (→ para de ler). Linhas numeradas antes de "Goleiros" são jogadores de linha, com ou sem cabeçalho "Lista de Presença". Remove `\([^)]*\)`, pictogramas (`\p{Extended_Pictographic}`), `️`, `‍`; colapsa espaços. Nome vazio → ignora. `presente = !linha.includes('❌')`. Data = primeiro `dd/mm/aaaa` do texto.

- [ ] **Step 1: Testes que falham**

```ts
const l18 = lerLista(fixture('lista-2026-11-18.txt'))
expect(l18.data).toBe('2026-11-18')
expect(l18.jogadores.map(j => j.nome)).toEqual(['Juninho','Márcio','Eduardo','Josué','Rafael','Derik','Fabiano','Yhan','Hugo','Junior','Herlly','Cleyton','Léo','Arllen','Leandro','Adelson','Eduardo Lucas','Matheus Rei','João Vitor','Guilherme','Paulinho','Jackson','Murilo','Pedro','Stênio'])
expect(l18.jogadores.every(j => j.presente)).toBe(true)
expect(l18.goleiros.map(g => g.nome)).toEqual(['Renan Araujo','Richard'])
// lista de espera ignorada
expect(l18.jogadores.some(j => j.nome.startsWith('Renê'))).toBe(false)

const l11 = lerLista(fixture('lista-2026-11-11.txt'))
expect(l11.jogadores).toHaveLength(20)
expect(l11.jogadores.find(j => j.nome === 'Kauã')?.presente).toBe(false)   // ❌
expect(l11.goleiros).toEqual([])
expect(l11.jogadores.some(j => j.nome === 'Thiago')).toBe(false)

// Review Focus 1
expect(lerLista(fixture18.replace(/\n/g, '\r\n'))).toEqual(l18)
expect(lerLista('1- Ana ✅\n2-   Bia   ⭐✅\nGoleiros\n1- Caio').jogadores.map(j=>j.nome)).toEqual(['Ana','Bia'])
// Review Focus 2
expect(lerLista('1- Ana ⚠️').jogadores[0]).toEqual({ nome: 'Ana', presente: true })
expect(lerLista('sem data').data).toBeNull()
```

- [ ] **Step 2:** `npx vitest run tests/logic/leitor.test.ts` → FAIL.
- [ ] **Step 3:** Implementar `lerLista`.
- [ ] **Step 4:** Rodar de novo → PASS.
- [ ] **Step 5:** Commit `feat: leitor da lista do WhatsApp`.

### Task 3: Casamento de nomes

**Files:**
- Create: `src/logic/casamento.ts`
- Test: `tests/logic/casamento.test.ts`

**Interfaces:**
- Consumes: `Jogador`, `normalizarNome`
- Produces:
  - `type ResultadoCasamento = { tipo: 'exato'; jogador: Jogador } | { tipo: 'sugestoes'; sugestoes: Jogador[] }`
  - `casarNome(texto: string, jogadores: Jogador[]): ResultadoCasamento`
  - `similaridade(a: string, b: string): number` (0 a 1, sobre nomes normalizados)

Regras: considera só `ativo`. Exato = `normalizarNome(texto)` igual ao nome (campo único; sem apelidos — decisão de 19/11). Exatamente 1 jogador exato → `exato`; 2+ → `sugestoes` com esses jogadores. Sem exato: `similaridade` = maior entre `1 − levenshtein/maiorComprimento` e `0.8` quando todas as palavras do texto mais curto aparecem no mais longo; devolve até 3, com nota ≥ 0.5, ordem decrescente.

- [ ] **Step 1: Testes que falham** (cadastro de teste com Juninho, Junior, Eduardo Lucas, Léo, João Pedro, um inativo "Felipe Gomes")

```ts
expect(casarNome('Leo', cad)).toEqual({ tipo: 'exato', jogador: leo })
expect(casarNome('  joão   PEDRO ', cad)).toMatchObject({ tipo: 'exato', jogador: joaoPedro })
expect(casarNome('jp', cad)).toMatchObject({ tipo: 'exato', jogador: joaoPedro })
const r = casarNome('Eduardo', cad)          // nunca casa com Eduardo Lucas
expect(r.tipo).toBe('sugestoes'); expect(r.sugestoes).toContain(eduardoLucas)
expect(casarNome('Juninh', cad).tipo).toBe('sugestoes')
expect(casarNome('Junior', cad)).toEqual({ tipo: 'exato', jogador: junior })   // Junior ≠ Juninho
expect(casarNome('Felipe Gomes', cad).tipo).toBe('sugestoes')  // inativo não casa
expect(casarNome('Xyzw', cad)).toEqual({ tipo: 'sugestoes', sugestoes: [] })
// Review Focus 3: dois "Pedro" no cadastro
expect(casarNome('Pedro', [pedroA, pedroB])).toEqual({ tipo: 'sugestoes', sugestoes: [pedroA, pedroB] })
```

- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: casamento de nomes com sugestões`.

### Task 4: Sorteio balanceado

**Files:**
- Create: `src/logic/sorteio.ts`
- Test: `tests/logic/sorteio.test.ts`

**Interfaces:**
- Consumes: `Time`, `TAMANHO_TIME`, `embaralhar`
- Produces:
  - `interface ParticipanteSorteio { id: string; estrelas: number; goleiro: boolean; presente: boolean }`
  - `type ResultadoSorteio = { ok: true; times: Time[] } | { ok: false; motivo: 'poucos-jogadores' | 'muitos-cinco-estrelas' }`
  - `sortearTimes(participantes: ParticipanteSorteio[], opcoes?: { rng?: () => number; tentativas?: number }): ResultadoSorteio` (padrões: `Math.random`, 1000)
  - `const MINIMO_JOGADORES = 10`, `const MAX_CINCO_ESTRELAS = 2`

Algoritmo: filtra `!goleiro && presente`. Menos de 10 → `poucos-jogadores`. Tamanhos = `floor(n/5)` times de 5 + resto (se > 0) no fim. Se nº de 5★ > soma de `min(2, tamanho)` → `muitos-cinco-estrelas`. Cada tentativa: embaralha, corta nos tamanhos, **conserta** a restrição trocando um 5★ de um time com 3+ por um não‑5★ de um time com menos de 2 (sempre possível quando viável), depois **melhora com trocas**: troca pares de jogadores entre times enquanto (diferença, soma dos quadrados das somas dos completos) diminuir e a restrição continuar valendo. (Só divisões aleatórias não chegam a diferença ≤ 1 com 5 times; com as trocas, um sorteio de 25 leva ~150 ms.) Nota = maior − menor soma dos times completos. Guarda a menor; empate substitui com probabilidade `1/k` (k = empates vistos). No fim, embaralha a ordem dos completos; incompleto fica por último.

- [ ] **Step 1: Testes que falham** (`rng = criarRng(semente)`)

```ts
// 9 de linha + 2 goleiros + 3 ausentes → poucos
expect(sortearTimes(p9)).toEqual({ ok: false, motivo: 'poucos-jogadores' })
// 25 → 5 times completos, cada id uma vez, sem goleiros/ausentes
expect(r.times.map(t => t.jogadorIds.length)).toEqual([5,5,5,5,5]); expect(todos(r)).toEqual(idsPresentes)
// 23 → [5,5,5,5,3], último completo=false
// somaEstrelas confere com as estrelas dos ids
// [5,5,4,4,3,3,2,2,1,1] → diferença 0 (15 x 15)
// 20 jogadores com 8 de 5★, 50 sementes → nenhum time com > 2 de 5★
// Review Focus 5: 10 presentes, 5 de 5★ → { ok: false, motivo: 'muitos-cinco-estrelas' }
// sementes diferentes → pelo menos uma divisão diferente em 10 sementes
```

- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: sorteio balanceado com restrição de 5 estrelas`.

### Task 5: Chegou depois

**Files:**
- Create: `src/logic/atrasados.ts`
- Test: `tests/logic/atrasados.test.ts`

**Interfaces:**
- Consumes: `Time`, `TAMANHO_TIME`
- Produces: `adicionarAtrasado(times: Time[], jogador: { id: string; estrelas: number }): Time[]` (não muta a entrada)

- [ ] **Step 1: Testes que falham**

```ts
// [5,5,5,3] + X → último vira 4 com X no fim, soma +estrelas, outros times iguais (toBe mesma referência)
// [5,5,5,4] + X → último vira 5, completo=true
// [5,5] + X → novo time [X], completo=false
// entrada não mutada
// Review Focus 4: X já está em algum time → retorna times inalterados
```

- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: atrasado entra no último time incompleto`.

### Task 6: Formatos de jogo

**Files:**
- Create: `src/logic/formatos/tipos.ts`, `src/logic/formatos/quemGanhaFica.ts`, `src/logic/formatos/todosContraTodos.ts`, `src/logic/formatos/index.ts`
- Test: `tests/logic/formatos.test.ts`

**Interfaces:**
- Produces:
  - `type FormatoId = 'quem-ganha-fica' | 'todos-contra-todos'`
  - `interface Jogo { timeA: number; timeB: number }` (números de time começando em 1; sem aviso de quem descansa — decisão de 19/11)
  - `interface SaidaFormato { jogos: Jogo[]; linhas: string[] }`
  - `interface FormatoJogo { id: FormatoId; nome: string; duracaoPadraoMin: number; gerar(numTimes: number, config: { duracaoMin: number }): SaidaFormato }`
  - `FORMATOS: Record<FormatoId, FormatoJogo>`, `formatoPadrao(numTimes: number): FormatoId`

Valores: quem ganha fica = 10 min; todos contra todos = 8 min. `formatoPadrao`: 5 → todos contra todos; qualquer outro → quem ganha fica (spec não cobre 6+; decisão deste plano).

Quem ganha fica: `jogos = [{ timeA: 1, timeB: 2 }]`; linhas:
```
Jogos (quem ganha fica, 10 min):
Começam Time 1 x Time 2. Próximos: Time 3, Time 4
Time ganhador joga no máximo 3 partidas seguidas. Empate: saem os dois times.
```
(sem "Próximos" com 2 times).

Todos contra todos, 5 times — tabela fixa (ninguém joga duas seguidas; folga entre parênteses só para conferência):
`(1x2,folga 5) (3x4,5) (1x5,4) (2x3,4) (4x5,2) (1x3,2) (2x4,1) (3x5,1) (1x4,3) (2x5,3)`.
Outros números: método do círculo (rodadas em sequência). Linhas: `Jogos (todos contra todos, 8 min):` + `1) Time 1 x Time 2`.

- [ ] **Step 1: Testes que falham**

```ts
// 5 times: 10 jogos, todos os 10 pares uma vez, nenhum time em dois jogos seguidos,
// linha 1 = 'Jogos (todos contra todos, 8 min):', linha 2 = '1) Time 1 x Time 2', nenhuma linha com 'descansa'
// 3 e 4 times todos contra todos: todos os pares
// quem ganha fica 4 times: linhas exatas acima; 2 times: sem "Próximos"
// formatoPadrao(2..4) e (6) = 'quem-ganha-fica'; formatoPadrao(5) = 'todos-contra-todos'
// duração usada vem do config (gerar(5, { duracaoMin: 10 }) → '10 min')
```

- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat: formatos quem ganha fica e todos contra todos`.

### Task 7: Texto para o WhatsApp

**Files:**
- Create: `src/logic/texto.ts`
- Test: `tests/logic/texto.test.ts`

**Interfaces:**
- Consumes: `SaidaFormato['linhas']` (nomes no texto = `jogador.nome`)
- Produces:
  - `montarTextoWhatsApp(dados: { data: string; horario: string; times: string[][]; goleiros: string[]; linhasFormato: string[] }): string`
  - `linkWhatsApp(texto: string): string` → `https://wa.me/?text=` + `encodeURIComponent(texto)`

Formato exato (blocos separados por linha em branco; bloco de goleiros omitido se vazio; dia da semana calculado em UTC):
```
⚽ Times — Quarta 18/11 · 20:30

Time 1: Juninho, Rafael, Hugo, Leandro, Pedro
Time 2: ...

🧤 Goleiros: Renan Araujo, Richard

<linhasFormato, uma por linha>
```

- [ ] **Step 1: Testes que falham**

```ts
expect(montarTextoWhatsApp(dados18)).toBe(textoEsperado)          // string completa
expect(texto).not.toMatch(/[*_~`⭐]/)
expect(montarTextoWhatsApp({ ...dados18, goleiros: [] })).not.toContain('🧤')
expect(montarTextoWhatsApp({ ...dados18, data: '2026-11-21' })).toContain('Sábado 21/11')
expect(linkWhatsApp('⚽ A\nB')).toBe('https://wa.me/?text=' + encodeURIComponent('⚽ A\nB'))
```

- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** `npm test` e `npm run typecheck` → tudo PASS.
- [ ] **Step 5:** Commit `feat: texto dos times para o WhatsApp`.
