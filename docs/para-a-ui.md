# Guia para fazer as telas

O que já existe e o que cada tela chama. Toda regra (sorteio, leitura da lista, formatos, texto) já está pronta e testada: as telas só mostram dados e chamam estas funções.

## Rodar o app

1. Abra o Docker Desktop.
2. `npm run db:start` (liga o banco local).
3. `npm run dev` e abra http://localhost:5173.
4. Login local: `admin@teste.local` / `senha-de-teste`.

O `.env.local` já aponta para o banco local. Quando o projeto real existir (veja `docs/supabase.md`), troque os dois valores.

## Onde fica cada coisa

| Pasta | O que é | Pode importar React? |
| --- | --- | --- |
| `src/logic/` | Regras puras: leitor, casamento, sorteio, formatos, texto | Não |
| `src/data/` | Leitura e gravação no Supabase | Não |
| `src/ui/` | Telas. `src/ui/db.ts` exporta o `db` já conectado | Sim |
| `public/` | Arquivos fixos. Coloque aqui o avatar (`public/avatar.png`, quadrado, 512×512 ou maior) | — |

Todas as funções de `src/data/` recebem o `db` como primeiro argumento: `listarJogadores(db)`.

Erros do banco chegam como `ErroDados` com um `codigo`: `'nome-duplicado'`, `'data-duplicada'`, `'nao-encontrado'`, `'sem-permissao'`, `'desconhecido'`. Use o código para escolher a mensagem na tela.

## Por tela

### Login
- `db.auth.signInWithPassword({ email, password })` ou `db.auth.signInWithOtp({ email })` (link mágico).
- `db.auth.getSession()` e `db.auth.onAuthStateChange(...)` para saber se está logado.

### Início
- `proximaQuarta(new Date())` → data da próxima pelada (`src/logic/datas.ts`).
- `abrirPelada(db, data)` → cria ou devolve a pelada dessa data (`src/data/peladas.ts`).

### Jogadores
- `listarJogadores(db, { incluirInativos })`, `criarJogador(db, { nome, estrelas, tipo?, goleiro? })`, `atualizarJogador(db, id, mudancas)`, `desativarJogador(db, id)` (`src/data/jogadores.ts`).
- Nome repetido → `ErroDados` com `codigo: 'nome-duplicado'`.

### Pelada do dia — 1. Colar lista
- `lerLista(texto)` → `{ data, jogadores, goleiros }`, cada um com `nome` e `presente` (`src/logic/leitor.ts`).
- Para cada nome: `casarNome(nome, jogadores)` → `{ tipo: 'exato', jogador }` ou `{ tipo: 'sugestoes', sugestoes }` (`src/logic/casamento.ts`). Sugestão sempre pede confirmação.
- Nome não cadastrado → `criarJogador(db, { nome, estrelas })`.
- Depois: `salvarPresencasDaLista(db, peladaId, [{ jogadorId, presente }])` (`src/data/presencas.ts`).

### Pelada do dia — 2. Conferir
- `listarPresencas(db, peladaId)`.
- Um toque: `marcarPresenca(db, peladaId, jogadorId, presente)`.
- "+ adicionar jogador": `adicionarNaHora(db, peladaId, jogadorId)`.

### Pelada do dia — 3. Sortear e times
- `sortearTimes(participantes)` → `{ ok: true, times }` ou `{ ok: false, motivo: 'poucos-jogadores' | 'muitos-cinco-estrelas' }` (`src/logic/sorteio.ts`). `participantes` = `{ id, estrelas, goleiro, presente }` de cada presença.
- Refazer travando times: `refazerSorteio(participantes, timesAtuais, [índices dos travados])`.
- Formato: `formatoPadrao(times.length)` e `FORMATOS[id].gerar(times.length, { duracaoMin })` → `{ jogos, linhas }` (`src/logic/formatos/`).
- Salvar: `salvarSorteio(db, peladaId, { times: { times, jogos }, formato, duracaoMin })`.
- Texto: `montarTextoWhatsApp({ data, horario, times: nomes, goleiros, linhasFormato: linhas })` e `linkWhatsApp(texto)` (`src/logic/texto.ts`).
- Soma de estrelas de cada time: `time.somaEstrelas` (só na tela, nunca no texto).

### Chegou depois
- Ausentes abaixo dos times → toque em "Presente": `marcarPresenca(db, peladaId, jogadorId, true)`, depois `adicionarAtrasado(times, { id, estrelas })` (`src/logic/atrasados.ts`) e `salvarTimes(db, peladaId, { times: novos, jogos })`.

### Configurações
- `lerConfiguracoes(db)` e `salvarConfiguracoes(db, mudancas)` (`src/data/configuracoes.ts`).

## Checagens antes de commitar

`npm test` (lógica), `npm run test:integration` e `npm run db:test` (banco, com o Docker ligado), `npx tsc --noEmit` (tipos).
