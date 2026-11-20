# Guia para fazer as telas

O que já existe e o que cada tela chama. Toda regra (sorteio, leitura da lista, formatos, texto) já está pronta e testada: as telas só mostram dados e chamam estas funções.

## Rodar o app

1. Abra o Docker Desktop.
2. `npm run db:start` (liga o banco local).
3. `npm run dev` e abra http://localhost:5173.
4. Login local: código de acesso `senha-de-teste` (usuário `acesso@calangofut.app`, criado pelo `supabase/seed.sql`).

O `.env.local` já aponta para o banco local. Quando o projeto real existir (veja `docs/supabase.md`), troque os dois valores.

## Onde fica cada coisa

| Pasta | O que é | Pode importar React? |
| --- | --- | --- |
| `src/logic/` | Regras puras: leitor, casamento, sorteio, formatos, texto | Não |
| `src/data/` | Leitura e gravação no Supabase | Não |
| `src/ui/` | Telas. `src/ui/db.ts` exporta o `db` já conectado | Sim |
| `public/` | Arquivos fixos. Avatar padrão da pelada: `public/mascote/avatar-circulo.webp` | — |

Todas as funções de `src/data/` recebem o `db` como primeiro argumento: `listarJogadores(db)`.

Erros do banco chegam como `ErroDados` com um `codigo`: `'nome-duplicado'`, `'apelido-duplicado'`, `'data-duplicada'`, `'nao-encontrado'`, `'sem-permissao'`, `'desconhecido'`. Use o código para escolher a mensagem na tela.

## Por tela

### Login
- Fase de teste: só o código de acesso. `db.auth.signInWithPassword({ email: 'acesso@calangofut.app', password: codigo })`. Sem link mágico e sem cadastro.
- `lerIdentidade(db)` → `{ nomePelada, avatarUrl }`, funciona sem login (`src/data/configuracoes.ts`).
- `db.auth.getSession()` e `db.auth.onAuthStateChange(...)` para saber se está logado.

### Times
- `peladaAtual(db, new Date())` → a pelada de hoje em diante; se não houver, abre a do próximo dia da semana dos Ajustes. Vira à meia-noite e respeita "Mudar só a próxima" (`src/data/peladas.ts`).
- "Mudar só a próxima": `atualizarPelada(db, id, { data })`.
- "Tentar novamente": `recomecarPelada(db, id)` apaga a lista e os times.

### Jogadores
- Vários de uma vez: `lerNomes(texto)` → `[{ nome, goleiro }]` (`src/logic/leitor.ts`); `montarConfirmacao(nomes, jogadores)` → cada item `existente | parecido | novo` (`src/logic/confirmacao.ts`); `criarJogadores(db, novos)` grava todos ou nenhum.
- Excluir (vários ou todos): `desativarJogadores(db, ids)`.
- `listarJogadores(db, { incluirInativos })`, `criarJogador(db, { nome, estrelas, tipo?, goleiro? })`, `atualizarJogador(db, id, mudancas)`, `desativarJogador(db, id)` (`src/data/jogadores.ts`).
- Apelidos: `adicionarApelido(db, jogadorId, texto)`, `removerApelido(db, jogadorId, texto)`. `jogador.apelidos` vem junto em `listarJogadores`.
- Nome repetido → `ErroDados` com `codigo: 'nome-duplicado'`; apelido repetido → `'apelido-duplicado'`.

### Pelada do dia — 1. Colar lista e 2. Confira a lista
- `lerLista(texto)` → `{ data, jogadores, goleiros }`, cada um com `nome` e `presente` (`src/logic/leitor.ts`).
- Aviso de outra data: compare `lista.data` com `pelada.data`.
- "Selecionar do cadastro": `listarJogadores(db)` para a lista; os escolhidos viram itens com `confirmacaoDoCadastro(escolhidos)` (todos `existente`, status inicial `'chegou'`) e vão para a mesma "Confira a lista". Sem aviso de data.
- Classificar os nomes: `montarConfirmacao(nomes, jogadores)` (usa `casarNome`, que casa por nome ou apelido). Parecido sempre pede escolha.
- Status inicial: `presente` da linha lida → `'chegou'`; ❌ → `'ausente'` ("Não vem" na tela).
- Em "Continuar": `criarJogadores(db, novos)`, `adicionarApelido(db, jogador.id, nomeDaLista)` para cada "É ele", `atualizarJogador(db, id, { estrelas })` para estrelas mudadas, e `salvarPresencasDaLista(db, peladaId, [{ jogadorId, status }])` (`src/data/presencas.ts`).
- Status: `'chegou' | 'nao-chegou' | 'ausente'`. Mudar depois: `marcarPresenca(db, peladaId, jogadorId, status)`.
- "Adicionar": `adicionarNaHora(db, peladaId, jogadorId)`.

### Pelada do dia — 3. Sortear e times
- `sortearTimes(participantes)` → `{ ok: true, times }` ou `{ ok: false, motivo: 'poucos-jogadores' | 'muitos-cinco-estrelas' }` (`src/logic/sorteio.ts`). `participantes` = `{ id, estrelas, goleiro, presente: status === 'chegou' }` de cada presença. Passe `{ maxCincoEstrelas: config.maxCincoEstrelas }`; em "Sortear assim mesmo", `{ maxCincoEstrelas: Infinity }`.
- Sortear de novo: `refazerSorteio(participantes, timesAtuais, [índices dos desmarcados], opcoes)`. Desmarcado = travado.
- Formato: começa em `config.formatoPadrao` e `config.tempoJogo`. `FORMATOS[id].nome` para o rótulo; `FORMATOS[id].gerar(times.length, { duracaoMin })` → `{ jogos, linhas }` (`src/logic/formatos/`).
- Salvar: `salvarSorteio(db, peladaId, { times: { times, jogos }, formato, duracaoMin })`.
- Texto: `montarTextoWhatsApp({ nomePelada, data, horario, times: [{ nomes, completo }], goleiros, linhasFormato: linhas })` (`src/logic/texto.ts`). Use o nome do cadastro. A tela só copia (`navigator.clipboard.writeText`).
- Soma de estrelas de cada time: `time.somaEstrelas` (só na tela, nunca no texto).

### Chegou depois
- "Não chegaram" (só status `'nao-chegou'`) → toque em "Chegou": `marcarPresenca(db, peladaId, jogadorId, 'chegou')`, depois `adicionarAtrasado(times, { id, estrelas })` (`src/logic/atrasados.ts`) e `salvarTimes(db, peladaId, { times: novos, jogos })`.
- "Desfazer" (6 s): guarde os times de antes; `salvarTimes(db, peladaId, timesDeAntes)` e `marcarPresenca(db, peladaId, jogadorId, 'nao-chegou')`.

### Configurações
- `lerConfiguracoes(db)` e `salvarConfiguracoes(db, mudancas)` (`src/data/configuracoes.ts`): nome da pelada, avatar, dia da semana, horário, local, formato padrão, tempo de jogo, quem ganha fica até, craques por time.
- Avatar: `enviarAvatar(db, arquivo)` envia ao Storage e grava a URL.

## Checagens antes de commitar

`npm test` (lógica), `npm run test:integration` e `npm run db:test` (banco, com o Docker ligado), `npx tsc --noEmit` (tipos).
