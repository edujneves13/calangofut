# DESIGN.md — Pelada dos Brabos

Design system do app de sorteio da pelada. Fonte da verdade para tudo que é visual: cores, tipografia, espaçamento, componentes, motion e regras de uso. Quem implementa (pessoa ou Claude Code) segue este arquivo; se algo não estiver aqui, pergunte antes de inventar.

- Direção visual: **Noite de Jogo** (escura, grafite azulado + verde do mascote + laranja das meias).
- Plataforma: web mobile (PWA instalável), React + Vite + TypeScript.
- Idioma da interface: português do Brasil.

---

## 1. Princípios

1. **Feito pra quadra à noite.** Fundo escuro, alto contraste, nada que dependa de brilho máximo.
2. **Uma mão, um polegar.** Ações principais na metade de baixo da tela. Alvos de toque de no mínimo 48 px.
3. **Menos de 1 minuto.** Cada tela tem uma ação principal clara. Se uma tela pede duas decisões, ela está errada.
4. **Uma cor de ação.** Laranja = "faça isso agora". Só uma ação laranja por tela.
5. **O mascote dá a personalidade; a interface fica quieta.** Ilustração e mascote podem ser expressivos; botões, listas e textos são sóbrios.
6. **Motion explica, não enfeita.** Toda animação mostra de onde algo veio ou para onde foi. Nada atrasa o fluxo.

---

## 2. Cores

### 2.1 Paleta base

| Token | Hex | Uso |
| --- | --- | --- |
| `--gray-950` | `#0E141B` | Fundo |
| `--gray-900` | `#18212B` | Superfície 1 |
| `--gray-850` | `#222D39` | Superfície 2 |
| `--gray-800` | `#2C3946` | Superfície 3 / linhas |
| `--gray-700` | `#3A4A5A` | Linha forte |
| `--gray-500` | `#6B7885` | Texto terciário |
| `--gray-300` | `#9AA7B4` | Texto secundário |
| `--gray-50` | `#F2F5F7` | Texto principal |
| `--green-300` | `#7FD394` | Verde claro |
| `--green-500` | `#4CB86A` | Verde do mascote |
| `--green-700` | `#2E7D45` | Verde escuro |
| `--green-900` | `#16351F` | Verde fundo |
| `--orange-300` | `#F08A5A` | Laranja claro |
| `--orange-500` | `#C24B17` | Laranja das meias |
| `--orange-600` | `#A33E10` | Laranja pressionado |
| `--orange-900` | `#3A1A0C` | Laranja fundo |
| `--amber-400` | `#F2B441` | Âmbar |
| `--amber-900` | `#3B2D10` | Âmbar fundo |
| `--red-400` | `#F2555A` | Vermelho |
| `--red-900` | `#3D1517` | Vermelho fundo |
| `--field-700` | `#1E5A4E` | Gramado escuro (só ilustração) |
| `--field-500` | `#2A7A60` | Gramado claro (só ilustração) |

### 2.2 Tokens semânticos (use estes no código, nunca o hex direto)

| Token semântico | Aponta para | Quando usar |
| --- | --- | --- |
| `--bg` | gray-950 | Fundo de toda tela |
| `--surface-1` | gray-900 | Cards, menu de baixo, bottom sheet |
| `--surface-2` | gray-850 | Inputs, chips, selo de nível, botão desabilitado |
| `--surface-3` | gray-800 | Estado pressionado de linhas e cards |
| `--border` | gray-800 | Bordas de card, divisórias de lista |
| `--border-strong` | gray-700 | Input em foco, tracejados, botão secundário |
| `--text-1` | gray-50 | Títulos, nomes, valores |
| `--text-2` | gray-300 | Datas, legendas, labels, texto de apoio |
| `--text-3` | gray-500 | Placeholder e desabilitado. Nunca para informação necessária |
| `--action` | orange-500 | Botão principal, aba ativa, selo de soma de estrelas |
| `--action-pressed` | orange-600 | Botão principal pressionado |
| `--action-soft` | orange-900 | Fundo de destaque suave |
| `--on-action` | `#FFFFFF` | Texto e ícone sobre `--action` |
| `--link` | orange-300 | Links e ações de texto ("Desfazer") |
| `--brand` | green-500 | Ícone de jogador, "chegou", check marcado |
| `--brand-label` | green-300 | Label de seção em destaque ("PRÓXIMA PELADA") |
| `--success-bg` | green-900 | Fundo de toast de sucesso |
| `--success-fg` | green-300 | Texto de toast de sucesso |
| `--warning` | amber-400 | Time incompleto, último minuto do cronômetro |
| `--warning-bg` | amber-900 | Selo "Incompleto" |
| `--danger` | red-400 | Erro, ação destrutiva |
| `--danger-bg` | red-900 | Fundo de mensagem de erro |
| `--focus` | orange-300 | Anel de foco de teclado |
| `--scrim` | `rgba(6, 10, 14, 0.64)` | Fundo atrás de sheet e modal |
| `--team-card-bg` | `surface-2` | Card do time durante a pelada (v2) |
| `--team-card-shadow` | `0 14px 30px rgba(0,0,0,.45)` | Sombra do card do time (v2) |
| `--team-band-start` / `--team-band-end` | `green-900` → `field-700` | Faixa no topo do card do time (v2) |
| `--team-band-mark` | `rgba(255,255,255,.18)` | Desenho de meio-campo na faixa (v2) |

### 2.3 Regras de uso

- **Laranja é só ação.** Nunca em título, ícone decorativo ou fundo de seção. Uma ação laranja por tela.
- **Verde é identidade e confirmação.** Nunca em botão principal. Nunca para indicar erro ou atenção.
- **Âmbar é atenção, não erro.** "Incompleto", "último minuto". Sempre acompanhado de texto ou tracejado (não depender só da cor).
- **Vermelho só para erro e destruição** (login falhou, desativar jogador).
- **Gramado só em ilustração.** Nunca em texto, borda ou botão.
- **Sem gradientes na interface.** Exceção: o fade do rodapé da ilustração no card da próxima pelada (ilustração → `--surface-1`).
- **Contraste medido** (sobre `--bg`): text-1 15,9:1 · text-2 7,6:1 · text-3 4,1:1 · green-500 7,4:1 · amber 10:1 · red 5,5:1 · branco sobre action 4,9:1. Qualquer cor nova precisa passar 4,5:1 para texto até 18 px e 3:1 para texto grande e ícones.

### 2.4 Modo claro

Não existe nesta versão. O app é escuro sempre (`color-scheme: dark`). Não implementar `prefers-color-scheme: light`.

---

## 3. Tipografia

### 3.1 Famílias

| Papel | Família | Pesos | Fallback |
| --- | --- | --- | --- |
| Display (títulos, números) | **Montserrat** | 800, 900 | `system-ui, sans-serif` |
| Texto (todo o resto) | **Inter** | 400, 500, 600, 700 | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |

- Carregar via Google Fonts com `display=swap`, ou self-host (preferível no PWA, para funcionar offline). Só os pesos listados.
- Números que mudam (cronômetro, contadores, soma de estrelas) usam `font-variant-numeric: tabular-nums`.

### 3.2 Escala

Tamanhos em `rem` (base 16 px). Line-height sem unidade.

| Token | Família / peso | Tamanho | Line-height | Letter-spacing | Uso |
| --- | --- | --- | --- | --- | --- |
| `display-xl` | Montserrat 900 | 6rem (96 px) | 1 | -0.02em | Cronômetro |
| `display-l` | Montserrat 900 | 2.125rem (34 px) | 1.05 | -0.02em | Data da próxima pelada |
| `display-m` | Montserrat 900 | 1.625rem (26 px) | 1.1 | -0.015em | Nome do time no card |
| `title` | Montserrat 800 | 1.1875rem (19 px) | 1.2 | -0.01em | Nome da pelada, título de tela, título de sheet |
| `button` | Montserrat 800 | 1.0625rem (17 px) | 1 | 0 | Botão principal e secundário grande |
| `body-l` | Inter 600 | 1rem (16 px) | 1.4 | 0 | Nome do jogador em lista |
| `body` | Inter 400/500 | 0.9375rem (15 px) | 1.45 | 0 | Texto corrido, valores de ajustes |
| `body-s` | Inter 500 | 0.8125rem (13 px) | 1.4 | 0 | Datas, legendas, notas de ajuda |
| `label` | Inter 700 | 0.75rem (12 px) | 1.2 | 0.1em, CAIXA ALTA | Labels de seção ("PRÓXIMA PELADA", "GOLEIROS") |
| `badge` | Inter 700 | 0.75rem (12 px) | 1 | 0 | Selos ("4★", "Incompleto · 3/5") |

### 3.3 Regras

- **Inputs sempre com 16 px ou mais** (evita o zoom automático do iOS).
- Montserrat só para o que é título ou número de destaque. Nunca em parágrafo.
- Caixa alta só no `label`. Nunca em botão ou título.
- Máximo de 3 tamanhos diferentes por tela, fora o tab bar.
- Nomes de jogadores nunca truncam no meio: se não couber, quebra linha (lista) ou reduz para `body` (card estreito).

---

## 4. Espaçamento e layout

### 4.1 Escala (grade de 4 px)

| Token | Valor | Uso típico |
| --- | --- | --- |
| `--space-1` | 4 px | Ícone ↔ texto colado, ajustes finos |
| `--space-2` | 8 px | Entre ícone e texto, entre selos |
| `--space-3` | 12 px | Gap entre itens de um grupo, padding de chip |
| `--space-4` | 16 px | Padding interno de card pequeno, gap entre cards |
| `--space-5` | 20 px | **Margem lateral da tela**, padding de card |
| `--space-6` | 24 px | Entre seções dentro de uma tela |
| `--space-8` | 32 px | Entre blocos grandes |
| `--space-10` | 40 px | Respiro acima de estados vazios |

Nunca usar valores fora da escala. Se 16 parece pouco e 20 parece muito, use 16.

### 4.2 Estrutura de tela

```
┌───────────────────────────┐  ← safe-area-inset-top + 16 px
│ Cabeçalho (avatar + nome) │  altura 56 px
├───────────────────────────┤  ← 16–24 px
│ Conteúdo                  │  margem lateral 20 px
│                           │
│ Ação principal            │  sempre acima do tab bar
├───────────────────────────┤  ← 16 px
│   [ tab bar flutuante ]   │  64 px + 28 px do rodapé + safe-area-inset-bottom
└───────────────────────────┘
```

- **Margem lateral:** 20 px em todas as telas.
- **Área reservada do tab bar:** o conteúdo rolável termina com `padding-bottom: calc(64px + 28px + 16px + env(safe-area-inset-bottom))`.
- **Ação principal fixa** (ex.: "Continuar", "Sortear times" nas etapas): fica fixa acima do teclado/tab bar, com fundo `--bg` e 16 px de padding vertical.
- **Altura da tela:** usar `100dvh` (não `100vh`), por causa da barra do navegador no celular.

### 4.3 Responsivo

O app é desenhado para celular em pé. Em telas maiores ele não "estica": vira uma coluna centralizada.

| Faixa | Largura | Comportamento |
| --- | --- | --- |
| Celular pequeno | 320–359 px | Margem lateral cai para 16 px. `display-l` cai para 30 px. Cronômetro `display-xl` cai para 80 px. |
| Celular padrão (base do design) | 360–429 px | Tudo como especificado. Referência: 390 × 844. |
| Celular grande | 430–599 px | Igual ao padrão; o conteúdo só ganha largura. |
| Tablet / desktop | ≥ 600 px | Coluna centralizada com `max-width: 480px`, fundo `--bg` em volta. Tab bar acompanha a coluna. |
| Celular deitado | altura < 500 px | Cronômetro mostra só números + botão principal lado a lado. Demais telas apenas rolam. |

- Unidades: `rem` para texto, `px` para bordas e raios, `%`/`fr` para larguras.
- Breakpoints por `min-width` (mobile first): `@media (min-width: 600px)`.
- Carrossel de times: cada card ocupa `calc(100% - 56px)`, deixando o próximo aparecer (peek) e indicando que dá para deslizar. Usar `scroll-snap-type: x mandatory`.

### 4.4 PWA e áreas seguras

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- `<meta name="theme-color" content="#0E141B">` e no manifest: `background_color` e `theme_color` = `#0E141B`, `display: "standalone"`, `orientation: "portrait"`.
- iOS: `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` + padding com `env(safe-area-inset-*)` no topo e no rodapé.
- **Ícone do app: o calango** (cabeça e ombros) sobre `--bg`. Arquivos: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (cabeça dentro do círculo central de 80%), `apple-touch-icon.png` (180 × 180, sem transparência), `favicon-32.png`. Origem: uma arte de 1024 × 1024 (ver `docs/design/MASCOTE.md`).
- `overscroll-behavior-y: none` no body (evita o "puxar para atualizar" acidental na quadra).
- Sheets e campos de texto: quando o teclado abre, o botão de ação sobe junto (usar `visualViewport` ou `interactive-widget=resizes-content` no viewport).

---

## 5. Forma: raios, bordas e elevação

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-s` | 8 px | Selos, checkbox |
| `--radius-m` | 14 px | Inputs, chips, toasts |
| `--radius-l` | 20 px | Botões |
| `--radius-xl` | 26 px | Cards de time, card da próxima pelada |
| `--radius-sheet` | 28 px 28 px 0 0 | Bottom sheet |
| `--radius-full` | 999 px | Tab bar, avatar, aba ativa |

- **Bordas:** 1 px `--border` em cards e superfícies. 1,5 px tracejada `--border-strong` para "incompleto", "não chegaram" e espaços vazios.
- **Elevação:** a interface é plana. Só dois elementos têm sombra:
  - Tab bar: `0 12px 30px rgba(0,0,0,0.35)`
  - Bottom sheet e modal: `0 -8px 40px rgba(0,0,0,0.45)`
- Profundidade se faz com superfície mais clara (`surface-1` → `surface-2`), não com sombra.

---

## 6. Ícones

- **Estilo:** linha (outline), traço 1,75–2 px, pontas e junções arredondadas, grade de 24 × 24, monocromático (`currentColor`). Mesmo estilo do set de referência de futebol.
- **Biblioteca: Phosphor Icons** (`@phosphor-icons/react`), peso **Regular**. Escolhida por ser a mais fácil de implementar: um pacote React, todos os ícones do app existem nela (conferido na versão 2.1), importa só o que usa. Não misturar com outra biblioteca.
- **Tamanhos:** 20 px (dentro de botão e tab bar ativa), 22 px (listas e tab bar inativa), 18 px (metadados como horário e local).
- **Ícones-chave do app:**

| Conceito | Componente Phosphor | Onde |
| --- | --- | --- |
| Jogador de linha | `SneakerMove` | Listas, "Quem já chegou?" |
| Goleiro | `HandPalm` | Listas, seção de goleiros |
| Aba Times | `SoccerBall` | Tab bar |
| Aba Cronômetro | `Timer` | Tab bar |
| Aba Ajustes | `SlidersHorizontal` | Tab bar |
| Sortear | `Shuffle` | Botão "Sortear times" |
| Sortear de novo | `ArrowClockwise` | Cabeçalho durante a pelada |
| Copiar | `Copy` | Botão "Copiar lista dos times" |
| Horário / local | `Clock` / `MapPin` | Card da próxima pelada |
| Chegou / check | `Check` | "Chegou", check de presença |
| Adicionar | `Plus` / `UserPlus` | "Adicionar", novo jogador |
| Buscar / limpar | `MagnifyingGlass` / `X` | Campo de busca |
| Mais opções | `DotsThreeVertical` | Menu ⋯ (Tentar novamente) |
| Voltar / expandir | `ArrowLeft` / `CaretDown` | Cabeçalho, "Não chegaram" |
| Mostrar senha | `Eye` / `EyeSlash` | Login |
| Sem internet | `WifiSlash` | Faixa de offline |
| Aviso | `Warning` | Avisos (menos de 10, regra dos 5★) |
| Sair | `SignOut` | Ajustes |

- Uso: `<SoccerBall size={22} weight="regular" aria-hidden />`. Um componente `Icon` do app centraliza tamanho e cor (`currentColor`).
- Peso `fill` só no item ativo do tab bar, se quiser mais destaque (opcional).

- **Proibido:** emoji na interface. (No texto copiado para o WhatsApp, emoji é permitido: ⚽ e 🧤.)
- Ícone sozinho, sem texto, sempre com `aria-label`.

---

## 7. Componentes

Medidas para o tamanho padrão. Todo componente interativo tem estados: padrão, pressionado, foco (teclado), desabilitado.

### 7.1 Botões

| Variante | Fundo | Texto | Borda | Altura | Uso |
| --- | --- | --- | --- | --- | --- |
| Principal | `--action` | `--on-action`, `button` | — | 58–60 px | A ação da tela. Um por tela. |
| Secundário | transparente | `--text-1`, Inter 600 15 px | 1,5 px `--border-strong` | 52 px | Ações alternativas ("Cancelar", "Manter times") |
| Tracejado | transparente | `--text-1` | 1,5 px tracejada `--border-strong` | 54 px | Expansores ("Não chegaram") |
| Pequeno | `--action` ou secundário | 14 px 700 | — | 40 px | Ações dentro de linha ("Chegou") |
| Ícone | `--surface-1` | `--text-1` | 1 px `--border` | 44 × 44, redondo | "Sortear de novo" |

- Raio `--radius-l`. Largura total na margem de 20 px (exceto pequeno e ícone).
- Ícone + texto: ícone à esquerda, gap 10 px.
- **Pressionado:** principal vai para `--action-pressed` e `scale(0.98)`; secundário ganha fundo `--surface-3`.
- **Desabilitado:** fundo `--surface-2`, texto `--text-3`. Sempre com explicação visível do porquê (ex.: "Precisa de pelo menos 10 de linha").
- **Carregando:** texto continua, ícone vira spinner de 20 px. Nunca trocar o texto por "Carregando...".

### 7.2 Cabeçalho

- Avatar 44 px (borda 2 px `--action`) + nome da pelada em `title` + opcional subtítulo em `body-s` `--text-2` (ex.: "Qua 25/11 · 20:30").
- Ação à direita: botão ícone 44 px.
- Telas internas: botão voltar (ícone 44 px) no lugar do avatar.

### 7.3 Tab bar flutuante

- Pílula `--surface-1`, borda 1 px `--border`, altura 64 px, flutuando a 20 px das laterais e 28 px do rodapé (+ safe area). Sombra da tab bar.
- 3 itens: **Times** · **Cronômetro** · **Ajustes** (nome confirmado).
- Item ativo: pílula `--action` 48 px de altura, ícone 20 px + rótulo 14 px 700, `--on-action`.
- Item inativo: só ícone 22 px `--text-2`, área de toque 52 × 48, com `aria-label`.
- Troca de aba: a pílula ativa desliza até o novo item (motion `base`).
- **Cronômetro em outra aba** (v2, `docs/design/times-durante-v2.md` item 9): rodando ou pausado, o item Cronômetro mostra um anel de 34 px em volta do ícone e o tempo em Montserrat 800 14 px `tabular-nums`. Rodando: `--action`. Último minuto: `--warning`. Pausado: ícone `Pause`, anel `--text-2` a 60%, texto "Pausado". Parado, ou na própria aba do cronômetro: item normal.

### 7.4 Card da próxima pelada

- `--surface-1`, raio `--radius-xl`, borda `--border`.
- Ilustração do mascote no topo, 300 px de altura, `object-fit: cover`, com fade de 90 px no rodapé até `--surface-1`.
- Conteúdo com padding 22 px: `label` em `--brand-label` → data em `display-l` → horário e local (`body`, `--text-2`, ícones 18 px) → botão principal "Sortear times".

### 7.5 Card de time (carrossel)

Revisado em 20/11/2026: vale `docs/design/times-durante-v2.md` (itens 1 e 2). Resumo:

- Card forte: `--team-card-bg` (`surface-2`), raio 24, sombra `--team-card-shadow`, sem borda.
- Faixa no topo em degradê `--team-band-start` → `--team-band-end` (verde → campo), padding 14/16: nome em Montserrat 900 24 px e selo de soma (`--action`). Desenho de meio-campo em `--team-band-mark`, decorativo (`aria-hidden`).
- Linhas de 44 px: chuteira `--brand`, nome Inter 600 15 px, estrelas em selo `surface-3` com `text-1`, divisória `--border-strong`.
- **Time incompleto:** selo âmbar "Incompleto · 3/5" no lugar da soma e vagas vazias com círculo tracejado.
- Mais de N craques (5★) no time: linha discreta em `--warning` no fim do card.
- Abas acima do carrossel, com **Copiar times** na mesma linha (36 px, raio 12, borda 1,5 px `--border-strong`, fundo `surface-1`). Ativa em `--text-1` 700 com sublinhado `--action`; time incompleto com sublinhado tracejado `--warning`.
- Aviso "Time 5 está incompleto · 3/5 · Ver": fundo `--warning-bg`, borda 1 px tracejada `--warning`, raio 14, ícone `WarningCircle`.
- **Não chegaram** (o "banco"): sem fundo, borda 1,5 px tracejada `--border-strong`, raio 20. Cabeçalho-botão de 52 px com `Clock` âmbar, título Montserrat 800 15 px, contagem âmbar e `CaretDown` que gira 180°. Linhas de 50 px apagadas, botão **Chegou** laranja de 36 px.
- Ações **Sortear de novo** (`Shuffle`) · **Editar times** (`PencilSimple`): secundários de 48 px, raio 16. **Adicionar jogador** (`UserPlus`): secundário de largura total em `--link`.
- Pontos de paginação abaixo: ativo 18 × 6 px `--action`, inativos 6 × 6 px `--border`.
- **Editar times** (tela cheia): ✕ · título · **Concluir**; busca; linha de equilíbrio; times em cards compactos `surface-1`; folha do jogador com Mover para / Trocar com alguém / Tirar do time.

### 7.6 Linha de jogador

| Contexto | Esquerda | Centro | Direita |
| --- | --- | --- | --- |
| Quem já chegou? | check (marcado: `--brand`; desmarcado: círculo `--border-strong`) + ícone chuteira/luva | nome (`body-l`); desmarcado: `--text-3` riscado | selo de nível |
| Card de time | ícone chuteira | nome | selo de nível |
| Não chegaram | ícone chuteira | nome | botão pequeno "Chegou" |
| Ajustes → Jogadores | ícone chuteira/luva | nome + tipo (`body-s`) | selo de nível + chevron |

- Altura mínima 52 px, divisória 1 px `--border`. A linha inteira é a área de toque (exceto onde há botão próprio).
- Lista em ordem alfabética, sempre.

### 7.7 Selos

| Selo | Fundo | Texto | Borda |
| --- | --- | --- | --- |
| Nível ("4★") — **só leitura** | `--surface-2` | `--text-2`, `badge` | — |
| Soma do time ("16★") | `--action` | `--on-action` | — |
| Incompleto | `--warning-bg` | `--warning` | 1 px tracejada `--warning` |
| Goleiro | `--surface-2` | `--text-2` | — |

Selos de nível nunca parecem editáveis: sem estrelas grandes, sem cor de ação. Estrelas editáveis só existem no formulário do jogador (7.9).

**Proposta (rodada 4, aguardando aprovação):**

| Selo | Fundo | Texto | Borda |
| --- | --- | --- | --- |
| Novo (jogador fora do cadastro) | `--action-soft` | `--link`, `badge` | — |
| Já cadastrado | `--surface-2` | `--text-3`, `badge` | — |
| Nível editável ("4★", só em "Confira a lista") | `--surface-2` | `--text-2`, `badge` + ícone `CaretDown` 12 px | 1 px `--border-strong` |
| Dar estrelas (novo sem estrelas) | transparente | `--link`, `badge` | 1 px tracejada `--border-strong` |

Linha de jogador novo em "Confira a lista" e na confirmação do lote: fundo `--action-soft` a 40% e o selo "Novo". Tocar no selo de nível abre o seletor de estrelas (7.9) numa sheet pequena.

### 7.8 Inputs e busca

- Altura 52 px, `--surface-2`, raio `--radius-m`, texto 16 px `--text-1`, placeholder `--text-3`.
- Foco: borda 1,5 px `--border-strong` + anel `--focus`.
- Busca: ícone lupa 20 px à esquerda, botão limpar (×) à direita quando há texto.
- Área de colar lista: textarea com borda tracejada, fonte monoespaçada 13 px, altura flexível.
- Label sempre visível acima (`body-s`, `--text-2`). Nunca usar só placeholder como label.

### 7.9 Seletor de estrelas (formulário)

- 5 estrelas de 32 px com 8 px de gap, área de toque 44 px cada.
- Preenchida: `--warning` (âmbar). Vazia: contorno `--border-strong`.
- Toque na mesma estrela que já está ativa não zera (mínimo 1 estrela).

### 7.10 Toggle, check e controle segmentado

- **Toggle:** 48 × 28 px, ligado `--brand`, desligado `--surface-3`, bolinha branca.
- **Check de presença:** círculo 24 px; marcado = preenchido `--brand` com check branco.
- **Segmentado** (formato, duração, mensalista/diarista): trilho `--surface-2` raio `--radius-m`, opção ativa `--surface-1` + texto `--text-1` 600; inativa `--text-2`. Altura 44 px.

### 7.11 Bottom sheet

- `--surface-1`, raio `--radius-sheet`, sombra de sheet, alça 40 × 5 px `--border-strong` no topo.
- Padding 20 px + safe-area-inset-bottom. Título `title`. Ação principal no fim.
- Fundo `--scrim`. Fecha ao tocar no scrim, ao arrastar para baixo e com Esc.
- Usado em: adicionar jogador, editar jogador, sortear de novo.

### 7.12 Modal de confirmação

- Só para ações que desfazem trabalho (refazer o sorteio inteiro). Centralizado, `--surface-1`, raio `--radius-xl`, padding 22 px.
- Título curto em pergunta + uma frase de consequência + botão principal + secundário.

### 7.13 Toast

- Aparece 16 px acima do tab bar, largura total na margem. Raio `--radius-m`, padding 12 × 14 px, `body` 600.
- Sucesso: `--success-bg` / `--success-fg`. Erro: `--danger-bg` / `--danger`.
- Ação opcional à direita ("Desfazer") em `--text-1` sublinhado.
- Dura 4 s (6 s se tiver "Desfazer"). Um por vez; o novo substitui o antigo.

### 7.14 Stepper (etapas do sorteio)

- 3 barras de 5 px de altura, gap 6 px, raio total. Concluída/atual: `--action`. Futura: `--surface-2`.
- Rótulos abaixo em `body-s`; o da etapa atual em `--text-1` 700.

### 7.15 Cronômetro

**Direção escolhida: B1 · Anel clássico** (canvas "Variações da B"). Ilustração do calango segurando um cronômetro (`docs/design/MASCOTE.md`, cena 10) num círculo de 200 px no centro; anel de 12 px com marcações de relógio em volta, esvaziando em `--action` (âmbar no último minuto); bola de 32 px correndo na ponta do anel; números em `display-xl` (80 px) abaixo. Parado: escolha **8 min · 10 min · Outro** acima de "Começar" ("Outro" abre sheet com −/+ de 1 a 30 min e atalhos 5, 6, 7, 12, 15; vale só para hoje). Rodando: a escolha some; fica "+1 min".

**Tela acesa:** não mostrar indicador quando funciona. Só quando o celular não permite manter a tela acesa, mostrar o aviso do `COPY.md`.


| Estado | Número | Fundo | Extras |
| --- | --- | --- | --- |
| Parado | `display-xl` `--text-1` | `--bg` | Anel cheio, ilustração `cronometro-inicio`, "Pronto para o próximo jogo", segmentado 8 min · 10 min · Outro, botão "Começar" (76 px) |
| Rodando | `display-xl` `--text-1` | `--bg` | Anel esvaziando (`--action` sobre `--surface-2`) com a bola na ponta; "Pausar" (grande), "Zerar" e "+1 min" |
| Último minuto | `display-xl` `--warning` | `--bg` | Anel e bola âmbar; selo "ÚLTIMO MINUTO" (`--warning-bg`, borda tracejada); vibração curta ao entrar |
| Pausado | `display-xl` `--text-1`, piscando devagar | `--bg` | Anel com opacidade 0,5, ilustração `cronometro-pausa`, selo "PAUSADO"; "Continuar" (grande), "Zerar" e "+1 min" |
| Fim | `display-xl` `--on-action` | `--action` (tela toda) | Anel branco cheio com raios curtos para fora, ilustração `cronometro-fim` com borda branca, "Fim de jogo" + "Zerar para o próximo" (branco) e "Parar apito"; menu de baixo escondido |

Troca de ilustração com crossfade de 220 ms. Com `prefers-reduced-motion`: sem crossfade, sem piscar e sem a bola.

### 7.16 Estados vazios e avisos

- Ilustração ou ícone 56 px + título `title` + uma frase `body` `--text-2` + uma ação.
- Avisos dentro de tela (ex.: menos de 10 jogadores): caixa com borda tracejada `--warning`, texto `body`, sempre dizendo o que fazer.

### 7.17 Avatar

- Círculo. Tamanhos: 44 px (cabeçalho), 64 px (ajustes), 110 px (editar pelada).
- Sem imagem: iniciais da pelada ("PB") em Montserrat 800, fundo `--surface-2`, texto `--text-1`.

---

## 8. Motion

### 8.1 Tokens

| Token | Duração | Curva | Uso |
| --- | --- | --- | --- |
| `--motion-fast` | 120 ms | `cubic-bezier(0.2, 0, 0, 1)` | Pressionar botão, check, toggle |
| `--motion-base` | 220 ms | `cubic-bezier(0.2, 0, 0, 1)` | Troca de etapa, aba, expandir/recolher |
| `--motion-slow` | 320 ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom sheet, modal, carrossel |
| `--motion-spring` | ~400 ms | spring (rigidez 400, amortecimento 30) | Nome entrando no time, pílula da tab bar |

- Saídas são 20–30% mais rápidas que entradas.
- Implementação: biblioteca **Motion** (antiga Framer Motion) para springs e layout; CSS transitions para o resto.

### 8.2 Animações do app

| Momento | O que acontece | Duração |
| --- | --- | --- |
| **Sorteio** | Chips com ícone de chuteira embaralham no centro e caem nos times, um por vez, em ordem de time. Termina com os cards montados e a tela indo para Times. Sem interação. | ~1,5 s no total |
| **Chegou** | O nome sai da lista de "não chegaram" e voa até a vaga do time incompleto; o selo atualiza (3/5 → 4/5) com um pulso. Toast com "Desfazer". | spring |
| **Check de presença** | Check preenche com leve escala (0.8 → 1); desmarcar risca o nome da esquerda para a direita. | fast |
| **Bola rolando (cronômetro)** | Uma bola de 20 px rola sobre a barra de progresso acompanhando o tempo, girando proporcional à distância. No fim, quica duas vezes e para. | contínuo |
| **Último minuto** | Número muda para âmbar com uma pulsação a cada 10 s; vibração curta ao entrar. | base |
| **Fim de jogo** | Tela inteira transiciona para laranja; número dá um "bump" de escala; apito + vibração longa. | slow |
| **Tab bar** | Pílula ativa desliza e se ajusta ao novo item. | spring |
| **Bottom sheet** | Sobe de baixo com scrim aparecendo junto; acompanha o dedo ao arrastar. | slow |
| **Card da próxima pelada** | Ao abrir o app, ilustração entra com leve subida (8 px) e fade. Uma vez por sessão. | slow |

### 8.3 Reduzir movimento

Com `prefers-reduced-motion: reduce`:
- Sorteio: sem voo de chips; os times aparecem com fade de 200 ms.
- Chegou: nome aparece no time com fade; selo atualiza sem pulso.
- Bola rolando: some; fica só a barra.
- Nada pisca ou pulsa. Vibração continua (não é movimento visual).

---

## 9. Mascote e ilustração

- O mascote é o **calango** (lagarto de uniforme grafite com detalhes laranja e apito). É a marca da pelada: as cores da interface derivam dele.
- **Onde aparece:** card da próxima pelada, ícone do app, avatar, login, sorteando, fim de jogo, estados vazios e de espera. Lista completa de cenas, tamanhos e prompts em **`docs/design/MASCOTE.md`**.
- **Onde não aparece:** dentro de listas, botões, selos, toasts e **mensagens de erro** (erro é sério; o calango não brinca com problema).
- Formato: PNG ou WebP com fundo transparente, em 2× do tamanho de uso. Exceções: card da próxima pelada (cena completa com estádio) e ícone do app (fundo `--bg`).
- Estilo de ilustrações novas: flat vetorial, sem contorno preto, sombras em blocos, paleta de gramado (`--field-*`) + cores do mascote.

---

## 10. Voz e texto

- **Tom:** de quem organiza a pelada: direto, informal, sem gíria forçada. "Quem já chegou?", não "Confirme a presença dos participantes".
- **Botões são verbos:** "Sortear times", "Copiar lista dos times", "Adicionar ao sorteio", "Chegou", "Continuar".
- **Nomes fixos** (não variar; lista completa em `COPY.md`):
  - "Próxima pelada", "Quem já chegou?", "Não chegaram", "Sortear de novo", "Tentar novamente", "Incompleto", "Quem ganha fica", "Estilo campeonato", "Fim de jogo".
  - Abas: "Times", "Cronômetro", "Ajustes".
- **Mensagens de erro dizem o que fazer:** "Faltam 2 jogadores para fechar dois times. Marque quem chegou ou adicione alguém."
- **Datas:** "Quarta, 25/11" no destaque; "Qua 25/11" em subtítulo. Horas "20:30". Durações "10 min".
- **Texto copiado para o WhatsApp:** texto puro, sem `*`, `_` ou `**`; emojis permitidos (⚽ 🧤); primeira linha "⚽ Pelada dos Brabos — Times"; nomes como estão no cadastro (não apelidos); sem estrelas.
- **Virada da pelada:** à meia-noite do dia da pelada, a tela Times volta para "Próxima pelada" com a semana seguinte.

---

## 11. Acessibilidade

- Contraste conforme 2.3. Informação nunca só por cor (incompleto = âmbar + tracejado + texto).
- Alvos de toque ≥ 48 × 48 px (ícones isolados: 44 px mínimo com área extra invisível).
- Elementos reais: `<button>`, `<a>`, `<input>` com `<label>`. Nada clicável feito com `<div>`.
- Foco de teclado visível: anel 2 px `--focus` com 2 px de afastamento.
- Ícones decorativos com `aria-hidden="true"`; botões só de ícone com `aria-label`.
- Toasts anunciados com `role="status"`; erros com `role="alert"`.
- Cronômetro: o número tem `aria-live="off"` enquanto roda; anuncia "Último minuto" e "Fim de jogo".
- Texto deve aguentar zoom de 200% sem cortar (usar `rem`).

---

## 12. Implementação

### 12.1 tokens.css

```css
:root {
  color-scheme: dark;

  /* base */
  --gray-950: #0E141B; --gray-900: #18212B; --gray-850: #222D39; --gray-800: #2C3946;
  --gray-700: #3A4A5A; --gray-500: #6B7885; --gray-300: #9AA7B4; --gray-50: #F2F5F7;
  --green-300: #7FD394; --green-500: #4CB86A; --green-700: #2E7D45; --green-900: #16351F;
  --orange-300: #F08A5A; --orange-500: #C24B17; --orange-600: #A33E10; --orange-900: #3A1A0C;
  --amber-400: #F2B441; --amber-900: #3B2D10; --red-400: #F2555A; --red-900: #3D1517;
  --field-700: #1E5A4E; --field-500: #2A7A60;

  /* semânticos */
  --bg: var(--gray-950); --surface-1: var(--gray-900); --surface-2: var(--gray-850); --surface-3: var(--gray-800);
  --border: var(--gray-800); --border-strong: var(--gray-700);
  --text-1: var(--gray-50); --text-2: var(--gray-300); --text-3: var(--gray-500);
  --action: var(--orange-500); --action-pressed: var(--orange-600); --action-soft: var(--orange-900);
  --on-action: #FFFFFF; --link: var(--orange-300); --focus: var(--orange-300);
  --brand: var(--green-500); --brand-label: var(--green-300);
  --success-bg: var(--green-900); --success-fg: var(--green-300);
  --warning: var(--amber-400); --warning-bg: var(--amber-900);
  --danger: var(--red-400); --danger-bg: var(--red-900);
  --scrim: rgba(6, 10, 14, 0.64);
  /* card do time durante a pelada (docs/design/times-durante-v2.md, item 2) */
  --team-card-bg: var(--surface-2);
  --team-card-shadow: 0 14px 30px rgba(0, 0, 0, 0.45);
  --team-band-start: var(--green-900); --team-band-end: var(--field-700);
  --team-band-mark: rgba(255, 255, 255, 0.18);

  /* tipografia */
  --font-display: "Montserrat", system-ui, sans-serif;
  --font-text: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* espaço */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --screen-margin: var(--space-5);

  /* forma */
  --radius-s: 8px; --radius-m: 14px; --radius-l: 20px; --radius-xl: 26px; --radius-full: 999px;
  --shadow-tabbar: 0 12px 30px rgba(0, 0, 0, 0.35);
  --shadow-sheet: 0 -8px 40px rgba(0, 0, 0, 0.45);

  /* motion */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
  --motion-fast: 120ms; --motion-base: 220ms; --motion-slow: 320ms;

  /* layout */
  --tabbar-height: 64px;
  --tabbar-offset: 28px;
  --content-bottom: calc(var(--tabbar-height) + var(--tabbar-offset) + var(--space-4) + env(safe-area-inset-bottom));
  --app-max-width: 480px;
}

@media (max-width: 359px) {
  :root { --screen-margin: var(--space-4); }
}

@media (prefers-reduced-motion: reduce) {
  :root { --motion-fast: 0ms; --motion-base: 200ms; --motion-slow: 200ms; }
}

html, body {
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--font-text);
  -webkit-font-smoothing: antialiased;
  overscroll-behavior-y: none;
}
```

### 12.2 Regras para quem implementa

- Componentes leem **só tokens semânticos**. Hex direto em componente = erro de revisão.
- Um arquivo `tokens.css` importado uma vez no app. Se usar Tailwind, mapear o `theme.extend` para as variáveis CSS, sem criar cores novas.
- Componentes base em `src/ui/components/`: `Button`, `IconButton`, `Header`, `TabBar`, `Card`, `TeamCard`, `PlayerRow`, `Badge`, `Input`, `SearchInput`, `StarPicker`, `Toggle`, `Segmented`, `Sheet`, `ConfirmModal`, `Toast`, `Stepper`, `EmptyState`, `Avatar`, `Icon`.
- `Icon` recebe um nome e renderiza o SVG da biblioteca escolhida (ou o desenhado à mão) com `currentColor`.
- Toda tela nova é conferida em 360, 390 e 430 px de largura antes de ser dada como pronta.

### 12.3 Som do apito

Sem arquivo de áudio: o apito é **gerado no próprio app** com a Web Audio API. Funciona offline, não pesa nada e não tem questão de licença.

```ts
// src/ui/sound/whistle.ts
let ctx: AudioContext | null = null;

// Chamar no primeiro toque em "Começar" (iOS só libera som depois de um toque).
export function unlockAudio() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
}

// Um silvo: tom alto com trinado rápido, como apito de juiz.
function blast(start: number, duration: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const trill = ctx.createOscillator();
  const trillGain = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 2900;
  trill.frequency.value = 38;          // velocidade do trinado (bolinha do apito)
  trillGain.gain.value = 180;          // quanto a frequência oscila
  trill.connect(trillGain).connect(osc.frequency);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.35, start + 0.02);
  gain.gain.setValueAtTime(0.35, start + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, start + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(start); trill.start(start);
  osc.stop(start + duration); trill.stop(start + duration);
}

// Fim de jogo: dois curtos e um longo.
export function finalWhistle() {
  if (!ctx) return;
  const t = ctx.currentTime;
  blast(t, 0.25);
  blast(t + 0.35, 0.25);
  blast(t + 0.7, 1.1);
  navigator.vibrate?.([200, 100, 200, 100, 600]);
}
```

- Volume e timbre ajustáveis depois de ouvir no celular (frequência entre 2.600 e 3.200 Hz).
- Se o grupo preferir um apito gravado, o caminho é um som CC0 do Freesound ou da biblioteca de efeitos do Pixabay, em MP3 de até 50 KB; a função `finalWhistle` passa a tocar o arquivo.

---

## 13. Pendências

- [x] Nome da aba principal: **Times**.
- [x] Biblioteca de ícones: **Phosphor** (goleiro com `HandPalm`).
- [x] Som do apito: gerado no app (12.3).
- [ ] Imagens do calango conforme `docs/design/MASCOTE.md` (Eduardo gera).
- [ ] Ícone do app a partir da arte 1024 × 1024 do calango.
