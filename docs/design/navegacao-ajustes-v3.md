# Navegação, Jogadores e Ajustes v3 (20/11/2026)

Decidido em 20/11/2026, numa crítica de design dos fluxos (Eduardo e Claude). Muda a barra de baixo, tira o cadastro de jogadores de dentro de Ajustes, reorganiza Ajustes e ajusta o tempo de jogo no sorteio e no cronômetro.

Em conflito com `HANDOFF-UI.md`, `DESIGN.md`, `COPY.md` ou `docs/design/fluxo-sorteio-v2-20-novembro.md`, vale este arquivo nos pontos que ele trata. O resto daqueles arquivos continua valendo.

**Fora do escopo:** histórico de peladas, campeonato e onboarding. Os três ficam para depois, cada um com escopo próprio. A tela inicial **não** ganha ícone de histórico agora.

---

## 1. Barra de baixo com 4 abas

**Times · Jogadores · Cronômetro · Ajustes**, nesta ordem.

- Por quê: o cadastro de jogadores é usado toda semana (estrelas, jogadores novos, inativos). Ajustes quase nunca. Hoje o cadastro está escondido em dois lugares: o link no rodapé da tela inicial e uma linha dentro de Ajustes.
- O comportamento da barra continua o mesmo (`DESIGN.md` 7.3): a aba ativa mostra ícone e rótulo; as inativas, só o ícone. Isso ajuda as 4 abas a caberem.
- Ícone da aba Jogadores: `UsersThree` (Phosphor), o mesmo que já aparece na linha de Ajustes e no link da tela inicial.
- O item Cronômetro continua mostrando anel e tempo quando o cronômetro está rodando e a pessoa está em outra aba (`estadoNaBarra`).
- **Conferir em 360 px** com o cronômetro rodando e a aba Jogadores ativa. Essa é a combinação mais larga (rótulo "Jogadores" + anel com tempo + 2 ícones).

Código: `Aba` e `ABAS` em `src/ui/components/TabBar.tsx`; o `Shell` (`src/ui/telas/Shell.tsx`) passa a renderizar `Jogadores` direto na aba nova.

## 2. Aba Jogadores

A tela é a mesma de hoje (`src/ui/telas/ajustes/Jogadores.tsx`, COPY 6.2 e 9.2), agora como aba.

- **Cabeçalho:** título "Jogadores", sem botão voltar (é uma aba).
- **Sai da tela inicial** o link "Lista de jogadores · N" (`LinkJogadores` em `Times.tsx`).
- **Sai de Ajustes** a linha "Jogadores · N".
- O estado vazio de "Selecionar jogadores existentes" no fluxo do sorteio ("Nenhum jogador no cadastro ainda." + "Adicionar jogadores") leva para a aba Jogadores. Hoje leva para Ajustes → Jogadores.
- A lógica de "voltar para a aba de origem" (`origem` no `Shell`, usada por `irParaAjustes('jogadores')`) deixa de ser necessária para Jogadores. Continua para "Nome e avatar", se ainda houver outro caminho até essa tela. Se não houver, simplificar.

### 2.1 Modo seleção

Hoje o modo seleção só serve para excluir. Não tem "Selecionar todos", e "Excluir todos" fica escondido no menu ⋯. No fluxo do sorteio, a mesma lista em modo seleção já tem "Selecionar todos / Limpar" (`Selecionar.tsx`). As duas telas passam a se comportar igual.

- O botão de texto "Selecionar" continua: excluir é raro e não deve ficar a um toque acidental.
- **No modo seleção entra "Selecionar todos" / "Limpar"**, na mesma posição e com o mesmo comportamento do fluxo do sorteio:
  - vale para o que está visível, respeitando filtro (Todos, Linha, Goleiros) e busca;
  - vira "Limpar" quando todos os visíveis estão marcados.
- **Sai "Excluir todos" do menu ⋯.** Com "Selecionar todos" ele fica redundante. Como era a única opção do menu, o botão ⋯ também sai.
- **Uma saída só do modo seleção.** Hoje o cabeçalho tem voltar e o rodapé tem "Cancelar". Fica só o "Cancelar" do rodapé; o cabeçalho mostra "N selecionados" sem botão voltar.
- A confirmação usa o texto atual de "Excluir N jogadores?". Quando a pessoa seleciona todos, o título fica "Excluir todos os N jogadores?" (texto que já existe no COPY 9.2).

## 3. Ajustes: "como a nossa pelada funciona"

Ajustes guarda os **padrões** da pelada. O sorteio usa esses padrões já marcados e deixa mudar só para o dia. No futuro, o onboarding vai fazer essas mesmas perguntas em formato de passo a passo; por isso a ordem da tela já segue a ordem do onboarding. O onboarding não entra agora.

Nova tela, de cima para baixo:

1. **Pelada**: nome e avatar (como hoje).
2. **TODA SEMANA**: Dia e horário · Local · Mudar só a próxima (como hoje).
3. **REGRAS PADRÃO** (junta as seções JOGO e SORTEIO de hoje):
   - Formato padrão
   - Tempo de jogo (padrão 10 min)
   - Quem ganha fica até
   - Craques (5★) por time
   - Nota embaixo da seção, em `text-3` 12px: texto a aprovar (ver seção 6).
4. **Sair**.

Saem:
- a linha "Jogadores · N" (virou aba);
- a linha "Jogadores por time · 5": não dá para mudar, é só ruído.

### 3.1 Tempo de jogo em Ajustes

- A folha "Tempo de jogo" ganha **8 min · 10 min · Outro**, igual ao sorteio e ao cronômetro. "Outro" abre a folha de tempo personalizado (seção 5).
- O padrão para pelada nova continua 10 min.

## 4. Sorteio, etapa 3 "Regras"

- O tempo de jogo passa a ter **8 min · 10 min · Outro**. Hoje tem só 8 e 10 (e o valor de Ajustes, se for outro).
- Vem marcado o tempo padrão de Ajustes.
- "Outro" abre a mesma folha de tempo personalizado do cronômetro (`TempoSheet`). Depois de escolher, o segmento mostra o tempo escolhido ("12 min"), como já acontece no cronômetro.
- Formato continua igual: vem marcado o formato padrão de Ajustes.

### 4.1 O tempo do sorteio vira o tempo do cronômetro

Hoje o cronômetro parado começa no tempo de Ajustes (`config.tempoJogo`, em `Shell.tsx`), mesmo quando o sorteio escolheu outro tempo.

Novo comportamento: o cronômetro parado começa em `pelada.duracaoMin` (escolhido no sorteio). Se a pelada ainda não foi sorteada, começa no tempo de Ajustes. É a mesma regra que `Durante.tsx` já usa (`pelada.duracaoMin ?? config.tempoJogo`).

Mudar o tempo no próprio cronômetro continua valendo só para aquele jogo.

## 5. Tempo personalizado sem limite de 30 minutos

Hoje o tempo personalizado vai de 1 a 30 minutos. **O limite de 30 sai.**

- O mínimo continua 1 minuto, em minutos inteiros.
- Sem máximo na interface: o botão "+" não trava.
- Código: `MAX_MINUTOS`, `minutosValidos` e `limitarMinutos` em `src/logic/cronometro.ts`; o `RangeError` de `criarCronometro`; os testes em `tests/logic/cronometro.test.ts` ("valida de 1 a 30 minutos inteiros" e `limitarMinutos(45)`); o botão "+" em `TempoSheet.tsx`. Conferir também se "+1 min" com o jogo rodando tem algum teto.
- Não existe restrição de tamanho no banco para `tempo_jogo` ou `duracao_min`.
- Os atalhos da folha (5, 6, 7, 12, 15 min) continuam.
- A ajuda da folha muda (ver seção 6), porque hoje cita "De 1 a 30 minutos".

## 6. Textos (aprovados em 20/11/2026)

Aprovados pelo Eduardo e já passados para o `COPY.md` (seções 2.6, 5, 6.1, 6.2, 7, 9.1 e 9.2).

| Onde | Hoje | Proposta | Motivo |
| --- | --- | --- | --- |
| Aba | — | **Jogadores** | Mesmo termo da tela. |
| Acessibilidade, abas inativas (COPY 7) | Times · Cronômetro · Ajustes | Times · Jogadores · Cronômetro · Ajustes | Aba nova. |
| Ajustes, título da seção | JOGO · SORTEIO | **REGRAS PADRÃO** | Uma seção só para os padrões. |
| Ajustes, nota da seção | — | **Dá para mudar no dia, na hora do sorteio.** | Explica que é padrão, não regra fixa. |
| Jogadores, modo seleção | — | **Selecionar todos** · **Limpar** | Mesmo texto do fluxo do sorteio (COPY 9.8). |
| Tempo personalizado, ajuda | De 1 a 30 minutos. Vale só para hoje; o padrão muda em Ajustes. | **Vale só para hoje. O padrão muda em Ajustes.** | O limite saiu. |
| Sorteio e Ajustes, tempo | 8 min · 10 min | **8 min · 10 min · Outro** | Igual ao cronômetro. |

Removidos: "Lista de jogadores · N" (link da tela inicial), "Jogadores · N" (linha de Ajustes), "Jogadores por time · 5", "Excluir todos" (menu ⋯), "De 1 a 30 minutos.", títulos de seção "JOGO" e "SORTEIO" em Ajustes.

## 7. Componentes

Nada de componente novo.

| Na tela | Usar |
| --- | --- |
| Aba nova | `TabBar` com item a mais |
| Selecionar todos / Limpar | `botaoTexto`, como em `Selecionar.tsx` |
| Seção Regras padrão | `SectionLabel` + `Linha` atuais; nota com `t.pequeno` |
| Tempo 8 · 10 · Outro | `Segmented` + `TempoSheet` (os mesmos do cronômetro) |
