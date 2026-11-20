# Handoff da interface — leia antes de fazer qualquer tela

Tudo que foi decidido sobre a interface em 19/11/2026 (conversa de design entre Eduardo e Claude). A lógica e o banco já existem e estão testados; este documento diz **como as telas devem ficar e se comportar** e onde isso encosta no código que já existe.

## 1. Arquivos e ordem de prioridade

Quando dois arquivos discordarem, vale o que está mais acima:

1. **`docs/superpowers/specs/2026-11-19-spec-adendo-wireframes.md`**: decisões tomadas depois da spec (login com senha, sortear de novo seletivo, nome e avatar da pelada etc.).
2. **`COPY.md`**: todos os textos da interface. Use a coluna **"Final"**. Nunca invente texto de botão.
3. **`DESIGN.md`**: cores, tipografia, espaçamento, componentes, motion, ícones (Phosphor), som do apito.
4. **`docs/prototipo/`**: protótipo navegável aprovado. Abra `docs/prototipo/index.html` no navegador (com a largura de um celular). Mostra como cada tela fica e como cada interação funciona.
5. **`docs/wireframes/pelada-wireframes-v3.html`**: estrutura das telas com numeração (1.1, 2.4, 3.1…). Onde o protótipo e o wireframe divergem, vale o protótipo.
6. **`docs/superpowers/specs/2026-11-19-pelada-sorteio-design.md`**: spec original (escopo da fase 1).
7. **`docs/para-a-ui.md`**: qual função de `src/logic/` e `src/data/` cada tela chama.

Imagens do mascote: `public/mascote/*.webp`. Ícones do app: `public/icon-*.png`, `public/apple-touch-icon.png`, `public/favicon-32.png`. Cenas que ainda faltam e como gerar: `docs/design/MASCOTE.md`.

## 2. Regra mais importante sobre o protótipo

**O protótipo é referência visual e de comportamento, não código para copiar.** Ele foi feito em JavaScript puro, num arquivo só, para testar o fluxo rápido. Em especial:

- **Não use `docs/prototipo/logic.js`.** A lógica oficial é a de `src/logic/`, com testes. O `logic.js` do protótipo é uma cópia simplificada para ele funcionar sozinho.
- `docs/prototipo/roster.js` tem **estrelas inventadas**. Os dados reais vêm do banco.
- As telas reais são componentes React em `src/ui/`, usando os tokens e componentes do `DESIGN.md` (seção 12).

## 3. Telas (fase 1)

Menu de baixo flutuante com 3 abas: **Times · Cronômetro · Ajustes**.

| Tela | O que tem | Funções (ver `docs/para-a-ui.md`) |
| --- | --- | --- |
| Login | E-mail + senha (com "Mostrar"), sem link mágico, sem cadastro | `db.auth.signInWithPassword` |
| Times — antes do sorteio | Cabeçalho com avatar + nome da pelada; card com ilustração do estádio, "Próxima pelada", data, horário, local, botão "Sortear times"; link "Lista de jogadores" no fim (abre Ajustes → Jogadores) | `peladaAtual`, `lerConfiguracoes` |
| 1/3 Cole a lista do WhatsApp | Texto de ajuda, área de colar, aviso se não achou jogadores; abaixo, "ou" + botão secundário "Selecionar jogadores" (adendo 21) | `lerLista` |
| 1/3 Quem vai jogar? (selecionar jogadores) | Busca, jogadores ativos em ordem alfabética com check (todos desmarcados), goleiros em seção própria, "Selecionar todos / Limpar", "Continuar · N" (travado com 0); cadastro vazio leva a Ajustes → Jogadores. Segue para a 2/3 | `listarJogadores`, `confirmacaoDoCadastro` |
| 2/3 Confira a lista | Substitui "Quem é quem?" e "Quem já chegou?" (adendo 17). Todos os nomes em ordem alfabética: check chegou/não chegou, selo de estrelas editável (salva no cadastro), jogador novo destacado com selo "Novo" e estrelas obrigatórias, nome parecido com "É ele / É novo" (salva apelido), "Não vem" no menu da linha e seção recolhida no fim; goleiros em seção própria; busca; "Adicionar". Grava tudo em "Continuar" | `montarConfirmacao`, `criarJogadores`, `adicionarApelido`, `atualizarJogador`, `salvarPresencasDaLista`, `adicionarNaHora` |
| Adicionar jogador (sheet) | Um campo que busca no cadastro; se não achar, "Adicionar 'X' como jogador novo" com estrelas e "É goleiro" | `criarJogador`, `adicionarNaHora` |
| 3/3 Como vai ser hoje? | Total de jogadores, "N times de 5 e 1 time com M", formato (Quem ganha fica / Estilo campeonato), tempo (8/10 min), botão "Sortear times"; menos de 10 → aviso | `sortearTimes`, `formatoPadrao` |
| Sorteando… | Ilustração do calango sorteando + chips caindo nos times (~1,9 s, sem interação) | — |
| Times — durante a pelada | Vira a tela inicial depois do sorteio. Link "Lista de jogadores" no fim. Índice discreto "Time 1 · 2 · 3…", carrossel de cards de time (soma de estrelas ou selo "Incompleto · 3/5" com vagas vazias), pontos, "Não chegaram" expansível com "Chegou" (só status não chegou; quem não vem fica fora), "Copiar lista dos times"; ↻ sortear de novo; ⋯ "Tentar novamente" | `salvarSorteio`, `adicionarAtrasado`, `salvarTimes`, `refazerSorteio`, `montarTextoWhatsApp` |
| Sortear de novo (sheet) | Times marcados são misturados; desmarcados ficam iguais; mínimo 2 | `refazerSorteio` (desmarcados = travados) |
| Cronômetro | Layout B1 · Anel clássico (`DESIGN.md` 7.15; o protótipo está desatualizado): calango no centro, anel de progresso com a bola na ponta, 8 · 10 · Outro (sheet de 1 a 30 min), Começar/Pausar/Continuar/Zerar, +1 min, último minuto em âmbar, pausado piscando, fim de jogo em tela laranja com apito | `src/logic/cronometro.ts`, `DESIGN.md` 12.3 (apito) |
| Ajustes → Jogadores | Busca, filtros, editar; "Adicionar jogadores" (um jogador ou vários de uma vez: colar, vírgulas ou ditado pelo teclado) com tela de confirmação (selos Novo / Já cadastrado / Parecido); "Selecionar" → "Excluir (N)" e "Excluir todos" (= desativar) | `lerNomes`, `montarConfirmacao`, `criarJogadores`, `desativarJogadores` |
| Ajustes | Nome e avatar da pelada; Jogadores; toda semana (dia/horário, local, mudar só a próxima); formato padrão; tempo de jogo; quem ganha fica até N jogos; craques (5★) por time; sair | `lerConfiguracoes`, `salvarConfiguracoes`, funções de jogadores |

## 4. Pontos onde o código atual precisa ser ajustado

O protótipo e o adendo pedem coisas que o código de hoje talvez ainda não faça. **Confira cada uma no código antes de fazer a tela**; se não existir, implemente em `src/logic/` ou `src/data/` com teste, seguindo o padrão do projeto.

1. **Sorteio impossível pelos 5★.** Hoje `sortearTimes` devolve `{ ok: false, motivo: 'muitos-cinco-estrelas' }`. A interface oferece **"Sortear assim mesmo"** (modal no `COPY.md`, seção 2.6). Precisa de uma opção para sortear ignorando essa regra.
2. **Login só com senha.** Remover o caminho de link mágico das telas (o adendo decidiu senha pré-cadastrada).
3. **Nome e avatar da pelada editáveis** (adendo, itens 13 a 15). Verificar se `configuracoes` já guarda nome e avatar; se não, adicionar (migration + tipos + teste). O avatar padrão é `public/mascote/avatar-circulo.webp`.
4. **Configurações novas:** formato padrão, tempo de jogo, "quem ganha fica até" (padrão 3), "craques (5★) por time" (padrão 2), data só da próxima pelada. Conferir o que `configuracoes` já cobre.
5. **Texto copiado:** conferir se `montarTextoWhatsApp` gera exatamente o modelo do `COPY.md`, seção 6: primeira linha com o nome da pelada, "(incompleto)" no time com menos de 5, nomes do cadastro (não apelidos), sem estrelas e sem `*`/`_`. A interface **só copia**, não abre o WhatsApp.
6. **Aviso de lista de outra data:** `lerLista` já devolve a data; a tela compara com a data da pelada.
7. **Virada da pelada à meia-noite:** depois da meia-noite do dia da pelada, a aba Times volta para "Próxima pelada" da semana seguinte. Conferir `proximaQuarta`.
8. **"Chegou" com desfazer:** o toast tem "Desfazer" por 6 s; desfazer volta o jogador para "Não chegaram" e os times para como estavam.

## 5. Ordem de construção sugerida

1. `src/ui/tokens.css` (copiar de `DESIGN.md` 12.1), fontes (Montserrat 800/900 + Inter), `@phosphor-icons/react`.
2. Componentes base da seção 12.2 do `DESIGN.md`, com uma página de desenvolvimento que mostra todos nos seus estados. **Eduardo revisa essa página antes das telas.**
3. Telas, um fluxo por vez, comparando lado a lado com o protótipo: login → Times antes do sorteio → colar lista (e selecionar do cadastro) → confira a lista → sortear → sorteando → durante a pelada → cronômetro → ajustes (com Jogadores em lote). As telas da rodada 4 não existem no protótipo: seguir `COPY.md` seção 9 depois de aprovada.
4. PWA: manifest com as cores e ícones do `DESIGN.md` 4.4.
5. Conferir cada tela em 360, 390 e 430 px de largura.

## 6. Decisões já fechadas (não reabrir sem o Eduardo)

- Direção visual **Noite de Jogo** (escura): grafite + verde do mascote + laranja das meias como única cor de ação.
- Aba principal chama **Times**. Pelada vira para a próxima **à meia-noite**. Texto copiado usa **nome do cadastro**.
- Ícones **Phosphor** (goleiro = `HandPalm`). Sem emoji na interface.
- Apito **gerado no app** com Web Audio (sem arquivo de som).
- Saída para lista errada: **"Tentar novamente"**; botão de sem internet: **"Recarregar"**.
- Estrelas se editam em Ajustes → Jogadores **e** na etapa "Confira a lista" (salvam no cadastro). Nos cards de time continuam só leitura. (Mudou em 19/11, adendo 18.)
- Presença tem três estados: chegou, não chegou, não vem (adendo 16). "Excluir" jogador = desativar (adendo 20).
- Calango não aparece em telas de erro.
