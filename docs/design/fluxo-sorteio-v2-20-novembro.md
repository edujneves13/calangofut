# Fluxo de sorteio v2 — 20 novembro

Versão final, aprovada em 20/11/2026, para implementar. As telas de referência estão no canvas de design, na linha "Fluxo de sorteio v2 — 20 novembro (FINAL, para implementar)". Telas de outras linhas do canvas (propostas, opções A–E, v2, v3) são rascunhos: não use. Substitui o que DESIGN.md, COPY.md e HANDOFF-UI.md dizem sobre o fluxo do sorteio (telas Colar, Selecionar, Conferir e Sortear em `src/ui/telas/fluxo/`) e sobre o card da tela inicial. Em conflito, vale este arquivo.

As regras do sorteio não mudam. Mudam o leitor da lista, o layout, os textos e algumas ações.

---

## 0. Regra de cores (vale para o app inteiro)

| Cor | Significa | Exemplos |
|---|---|---|
| Verde `green-500` | Está dentro, tudo certo | No sorteio |
| Âmbar `amber` | Precisa de ação do admin | Faltam estrelas, Confirmar nome, Time incompleto |
| Cinza `text-2` | Só informação | Chegam depois, Goleiros |
| Laranja `orange-500` | Botão de ação | Continuar, Chegou, É ele |

Consequência fora do fluxo: na tela de Times, o banco "Não chegaram" passa a usar o ícone de relógio em **cinza**. A ação continua no botão laranja Chegou. O aviso "Time 5 está incompleto" continua âmbar.

## 1. Etapas

A barra de etapas (`Stepper`, constante `ETAPAS` em `Colar.tsx`) passa a ser: **1 · Lista · 2 · Sorteio · 3 · Regras**.

## 2. Tela 1: "Lista de jogadores"

- Título: **Lista de jogadores**.
- Texto: "Cole a lista do WhatsApp inteira ou digite os nomes, você também pode selecionar jogadores existentes".
- Rótulo da caixa: "Cole sua lista ou digite os nomes".
- Botões: **Colar** (lê da área de transferência) · "ou" · **Selecionar jogadores existentes** · rodapé **Continuar**.
- Abaixo da caixa, em tempo real e em verde com ícone de check: "9 jogadores e 1 goleiro encontrados". Se não achar ninguém, mantém a mensagem de erro atual.

### O leitor passa a aceitar qualquer formato

Hoje o `lerLista` só lê linhas numeradas ("1 - Nome"), e nomes soltos dão erro. Novo comportamento:

- Aceita linha numerada (`1-`, `1.`, `1)`), linha sem número, marcador (`•`, `-`, `*`), vários nomes na mesma linha separados por vírgula, ponto e vírgula ou " e ", e texto ditado.
- Continua parando em "Lista de espera" e tratando o que vem depois de "Goleiros" como goleiro.
- Ignora o cabeçalho: qualquer linha com data (dd/mm ou dd/mm/aaaa) não vira nome. A data continua sendo lida para o aviso de "lista de outro dia".
- Remove emojis, ✅ e o que estiver entre parênteses.
- **Linhas com ❌ não entram na lista** (quem não pagou sai antes da lista final).
- Nomes repetidos entram uma vez só.
- Dá para reaproveitar o `lerNomes` (que já aceita nomes soltos) dentro do `lerLista`.
- Testes: os fixtures atuais continuam passando, e entra um fixture novo bagunçado:

```
⚽ Pelada quarta 25/11
1- Juninho ✅
2. Hugo
Leandro
• Arllen
Stênio, Derik e Yhan
- Josué 🔥
Leandro ❌
Goleiros
Márcio
Lista de espera
Caio
```

Resultado esperado: jogadores Juninho, Hugo, Arllen, Stênio, Derik, Yhan, Josué; goleiro Márcio; data 25/11. Leandro sai por causa do ❌ (a regra do ❌ vale para a pessoa, mesmo que ela apareça antes sem ❌). Caio é ignorado.

## 3. Tela 2: "Quem vai pro sorteio?"

Substitui "Confira a lista". De cima para baixo:

1. Título **Quem vai pro sorteio?** e etapas (2 ativa).
2. Texto: "Marcados entram no sorteio agora. Quem ainda não chegou fica desmarcado e entra depois, no último time."
3. Busca "Buscar jogador" e, ao lado, a ordenação **A–Z | ★** (alterna; padrão A–Z; vale dentro de cada seção).
4. **Card de contagem** (ver 3.1).
5. Seções, nesta ordem, cada uma com ícone antes do título (rótulo em maiúsculas 12px, peso 700):
   - ⚠ **FALTAM ESTRELAS · N** (âmbar, ícone `WarningCircle`), com o link **Ignorar tudo** à direita e, embaixo, a linha de ajuda em `text-3` 12px: '"Ignorar tudo" dá 3★ para os novos e trata nomes parecidos como o mesmo jogador.'
   - ⚠ **CONFIRMAR NOME · N** (âmbar): linhas "Parece o Stenio Araújo" com os botões **É ele** (laranja) e **Novo** (secundário).
   - ✓ **NO SORTEIO · N** (rótulo cinza, ícone `CheckCircle` preenchido em verde).
   - 🕐 **CHEGAM DEPOIS · FORA DO SORTEIO · N** (cinza, ícone `Clock`).
   - 🧤 **GOLEIROS · FORA DO SORTEIO · N** (cinza, ícone `HandPalm`).
   - Seção vazia não aparece.
6. Rodapé fixo: **+ Novo jogador** (secundário) e o botão principal:
   - com pendências: desabilitado, "Confirme N jogadores";
   - sem pendências: **Continuar com N**.

### 3.1 Card de contagem

- `Card` (surface-1, borda, `radius-xl`), padding 16/20.
- À esquerda: o número de marcados em Montserrat 900 40px **verde**; embaixo, `CheckCircle` fill verde 18px + "no sorteio" (`type-body-l`) e "de X jogadores" (12px `text-2`).
- Uma divisória vertical.
- À direita, empilhados (13px): 🕐 **2** chegam depois · 🧤 **1** goleiro (ícones e texto em `text-2`, números em `text-1`).
- X = total de jogadores de linha da lista (sem goleiros). "No sorteio" conta todos os marcados, inclusive os que ainda têm pendência.

### 3.2 Linhas

- Check redondo à esquerda (o mesmo de hoje): marcado (verde) = no sorteio; desmarcado = chega depois. Marcar ou desmarcar move a linha entre "No sorteio" e "Chegam depois". Linhas com pendência ficam na seção da pendência até ser resolvida.
- Estrelas usam o `BadgeEstrelas` atual ("4★ ▾"). Tocar abre um menu de 5★ a 1★, com a atual marcada e a nota "Muda também no cadastro".
  - Jogador já cadastrado: salva no cadastro na hora (como hoje).
  - Jogador novo sem estrelas: "Dar estrelas" (tracejado, como hoje). Escolher as estrelas tira a pessoa de "Faltam estrelas".
- Selo "Novo" laranja ao lado do nome de quem não está no cadastro.
- **Sai a opção "Não vem"** (menu ⋯ e seção "Não vêm"). Desmarcar já tira a pessoa do sorteio.

### 3.3 Ignorar tudo

- Novos sem estrelas recebem 3★. Nomes parecidos viram "É ele" (o nome lido vira apelido do jogador sugerido, como já acontece no "É ele").
- Aviso que some sozinho, só com contagens (nunca com nomes, para caber com 15 pendências):
  - "3 pendências resolvidas: 2 novos com 3★, 1 nome igual ao cadastro." + **Desfazer**.
  - Partes com zero somem: "5 pendências resolvidas: 5 novos com 3★."
- Desfazer volta exatamente ao estado anterior.

## 4. Tela 3: "Como vai ser hoje?" (Regras)

- Etapa 3 · Regras.
- Caixa `.resumo`: "**16 jogadores no sorteio**", "3 times de 5 e 1 time com 1" e, se houver, uma linha com relógio: "2 jogadores ainda não chegaram".
- O resto (formato, tempo, regra dos craques, Sortear times) continua igual.

## 5. Editar times: texto da troca

- Botão "Trocar com alguém" vira **Trocar com outro jogador**.
- Título da folha seguinte: **Trocar de time com o [nome]**.

## 6. Tela inicial: ilustração do card "Próxima pelada"

Problema: `proxima-pelada.webp` é uma cena em formato orgânico (uma "bolha") sobre fundo escuro. No card ela usa `object-fit: cover` a 300px de altura, que corta as laterais da bolha, e o fundo da imagem não bate com o `surface-1` do card.

Solução:
- Usar a imagem nova `public/mascote/proxima-pelada-solta.webp`: a mesma ilustração com o fundo transparente e recortada até a bolha (1101 × 792).
- Em `.ilustracao`: altura automática com `aspect-ratio: 1101 / 792`, padding 16px nas laterais e no topo, `object-fit: contain`. Tirar o degradê `::after`.
- Resultado: a bolha aparece inteira, flutuando no card, sem corte em nenhuma largura de tela.
- Manter a versão antiga do arquivo até confirmar no celular.

## 7. Limpeza

Existem cópias com " 2" no nome que o Finder do Mac criou (`DESIGN 2.md`, `docs/HANDOFF-UI 2.md`, `src/logic/confirmacao 2.ts`, `src/logic/cronometro 2.ts`, `src/ui/components/* 2.*`, `src/ui/dev/Vitrine 2.tsx`, `src/ui/tokens 2.css`). Estão fora do git. Conferir que não são usadas e apagar.

## 9. Componentes: usar os que já existem

Nada de componente visual novo onde já existe um. As telas de referência foram desenhadas com os mesmos tokens e medidas do código atual.

| Na tela | Usar | Observação |
|---|---|---|
| Linha de jogador | `PlayerRow` | Check redondo de 24px (`.bolinha`) como hoje. Na seção Chegam depois, usar `apagado` (nome `text-2`, ícone `text-3`) e **não** o riscado: quem chega depois não está cancelado. |
| Selo Novo | `Badge variante="novo"` | Some na linha de "Confirmar nome", para não confundir com o botão Novo. A linha mantém o fundo de `novo`. |
| Estrelas na linha | `BadgeEstrelas` | Preenchido: "4★ ▾" (estilo `editavel`). Vazio: "Dar estrelas" (estilo `darEstrelas`, tracejado). Tocar abre o **menu de estrelas** (novo, ver abaixo), no lugar da folha `EstrelasSheet`. |
| Menu de estrelas | novo, pequeno | Popover ancorado no selo: `surface-2`, borda `border-strong`, raio `radius-m`, sombra de sheet; itens de 44px com ★ âmbar, a atual marcada com check; rodapé "Muda também no cadastro" (só para quem já está no cadastro). Fecha ao escolher ou tocar fora. Acessível como `listbox`. |
| Título de seção | `SectionLabel` | Ganha ícone opcional à esquerda (18px) e variante de aviso (cor `--warning`). Pode ter ação à direita (Ignorar tudo, como `botaoTexto` em `--warning`). |
| Busca | `SearchInput` | Igual a hoje. |
| A–Z \| ★ | `Segmented` | Ao lado da busca, só ícone/rótulo curto. |
| Card de contagem | `Card` (surface-1, borda, `radius-xl`) | Conteúdo novo descrito em 3.1. |
| Botão É ele / Novo | `Button variante="pequeno"` / `"pequeno-secundario"` | Igual a hoje. |
| Rodapé | `.rodape` + `Button` secundário (Novo jogador, `Plus`) + principal | Principal desabilitado usa o estilo `:disabled` atual. |
| Aviso de Ignorar tudo | `useToast` com tom `sucesso` e ação Desfazer | |
| Tela 1 | `Textarea`, `Button variante="secundario"` com `ClipboardText` (Colar) e `UsersThree` (Selecionar jogadores existentes), `.ou` | |
| Tela 3 | `.resumo`, `Segmented`, `.pequeno` | Linha "2 jogadores ainda não chegaram" com `Clock` 18px em `text-2`. |
| Ícones | Phosphor, como hoje | `CheckCircle` (fill) verde, `WarningCircle` âmbar, `Clock` e `HandPalm` cinza, `SneakerMove` nas linhas. |

Na tela inicial, o card segue `.hero`, só trocando a imagem e o bloco `.ilustracao` (item 6).

## 8. Textos novos ou alterados

| Onde | Texto |
|---|---|
| Etapas | Lista · Sorteio · Regras |
| Tela 1 | Lista de jogadores · Cole sua lista ou digite os nomes · Colar · Selecionar jogadores existentes · "N jogadores e M goleiro(s) encontrados" |
| Tela 2 | Quem vai pro sorteio? · no sorteio · de X jogadores · chegam depois · goleiro(s) · FALTAM ESTRELAS · CONFIRMAR NOME · NO SORTEIO · CHEGAM DEPOIS · FORA DO SORTEIO · GOLEIROS · FORA DO SORTEIO · Ignorar tudo · É ele · Novo · Novo jogador · Confirme N jogadores · Continuar com N · Muda também no cadastro |
| Aviso | N pendências resolvidas: X novos com 3★, Y nomes iguais ao cadastro. · Desfazer |
| Tela 3 | N jogadores no sorteio · N jogadores ainda não chegaram |
| Editar times | Trocar com outro jogador · Trocar de time com o [nome] |

Removidos: "Confira a lista", "Desmarque quem ainda não chegou.", "Dar estrelas" (selo), "Não vem", "Não vêm", "Vem sim", "Falta dar estrelas a N jogadores", "Selecionar do cadastro", "Colar do WhatsApp", "Trocar com alguém".
