# Times durante a pelada — v2

Revisão de design aprovada em 20/11/2026. Substitui o que DESIGN.md, COPY.md e HANDOFF-UI.md dizem sobre a tela **Times durante a pelada** (a tela que aparece depois do sorteio e vira o início enquanto a pelada acontece). Em conflito, vale este arquivo.

Não muda nenhuma regra do sorteio. Muda layout, textos, navegação e acrescenta edição manual dos times.

---

## 1. Ordem da tela (de cima para baixo)

1. **Cabeçalho:** avatar da pelada, nome, data e hora, e o botão **⋯** (Mais opções). O botão Copiar **sai** do cabeçalho.
2. **Abas dos times:** "Time 1 · 2 · 3 · 4 · 5". O sublinhado da aba de um time incompleto é tracejado em âmbar. Na mesma linha, à direita: botão **Copiar times**.
3. **Aviso de time incompleto** (só quando existe): "Time 5 está incompleto · 3/5", com "Ver" no fim. Tocar leva o carrossel até esse time.
4. **Carrossel com o card do time:** é a primeira coisa grande da tela.
5. **Ações, lado a lado:** **Sortear de novo** (primeiro) · **Editar times** (segundo).
6. **Não chegaram** (só quando tem alguém): seção recolhível. Ver item 3.
7. **Adicionar jogador:** botão de largura total, **sempre visível**, fora da seção Não chegaram.

Quando está tudo certo, não aparece aviso nenhum: nada de "Todos os times completos" nem de "Todo mundo chegou". Se ninguém está faltando, a seção 6 some e o botão 7 continua.

A tela rola. A barra de baixo flutua por cima. Coloque espaço no fim para o último item não ficar escondido.

O link **"Lista de jogadores" sai desta tela**. Ele continua só nos Ajustes.

## 2. Visual (opção A, "banco de reservas")

O card do time e o banco precisam ter formatos claramente diferentes.

**Card do time (forte)**
- Fundo `surface-2` (#222D39), raio 24, sombra `0 14px 30px rgba(0,0,0,.45)`, sem borda.
- Topo com faixa em degradê de `green-900` (#16351F) para `field` (#1E5A4E), padding 14/16. Dentro da faixa: nome do time (Montserrat 900, 24px) e a soma de estrelas (selo laranja `orange-500` com texto branco). Um desenho discreto de meio-campo (círculo + linha, branco a 18% de opacidade) no canto direito da faixa, decorativo, com `aria-hidden`.
- Linhas dos jogadores: 44px de altura, ícone de goleiro ou jogador em `green-500`, nome em Inter 600 15px, estrelas num selo `surface-3` com texto `text-1`. Divisória `line-strong`.
- Time incompleto: mantém o selo "Incompleto · 3/5" (âmbar, borda tracejada) no lugar da soma.

**Não chegaram (banco)**
- Sem fundo. Borda de 1,5px **tracejada** em `line-strong` (#3A4A5A), raio 20, padding lateral 16.
- O cabeçalho inteiro é um botão (52px de altura): ícone de relógio (Phosphor `Clock`) em âmbar, "Não chegaram" em Montserrat 800 15px, a contagem em âmbar, e uma seta (`CaretDown`) que gira 180° quando está aberto.
- Linhas (50px): ícone em `text-3`, nome em `text-2`, estrelas em `text-3`, botão laranja **Chegou** com ✓ (36px de altura). Divisórias tracejadas.
- Fechado: o cabeçalho mostra os primeiros nomes resumidos com reticências (ex.: "Matheus, João, Caio, Renan…").

**Outros elementos**
- **Copiar times:** botão secundário pequeno: 36px de altura, raio **12** (não é pílula), borda 1,5px `line-strong`, fundo `surface-1`, ícone de copiar e texto Inter 600 13px.
- **Aviso de time incompleto:** fundo `amber-bg` (#3B2D10), borda 1px tracejada em `amber` (#F2B441), raio 14, texto âmbar 14px 600, ícone `WarningCircle`.
- **Sortear de novo / Editar times:** botões secundários de 48px, raio 16, borda 1,5px `line-strong`, com ícones `Shuffle` e `PencilSimple`.
- **Adicionar jogador:** mesmo estilo secundário, largura total, texto e ícone (`UserPlus`) em `orange-300`.

## 3. Comportamento de Não chegaram

- **Abre sozinha quando faltam até 3 pessoas. A partir de 4, começa fechada.**
- Se o admin abrir ou fechar, o app respeita essa escolha até o fim da pelada (guardar em estado local da sessão ou em `localStorage`, por pelada).
- **Chegou:** a pessoa entra no último time incompleto (regra que já existe em `adicionarAtrasado`). Mostrar o aviso de "times mudaram" (item 6).
- Quando a última pessoa chega, a seção some com uma animação curta.

## 4. Editar times (tela nova, em tela cheia)

Abre pelo botão **Editar times**.

- **Cabeçalho:** ✕ (cancela e descarta as mudanças) · título "Editar times" · botão laranja **Concluir** (salva).
- **Busca no topo:** campo "Buscar jogador". Filtra enquanto você digita, sem diferenciar acentos nem maiúsculas. Busca nos times e em Não chegaram. Cada resultado mostra o nome (com a parte encontrada em `orange-300`), as estrelas e onde a pessoa está ("Time 1" ou "Não chegou", este em âmbar). Tocar no resultado abre a folha do jogador. Com o campo vazio, a tela mostra todos os times.
- Texto de ajuda: "Toque num jogador para mover, trocar ou tirar do time."
- **Linha de equilíbrio:** "Equilíbrio: diferença de X★ entre os times completos", onde X é a maior soma menos a menor soma, só entre os times completos.
- Times em cards compactos, um embaixo do outro. Cada linha de jogador termina com uma seta. Um time incompleto ganha a linha "+ Adicionar jogador · N vagas".

**Folha do jogador** (abre ao tocar num jogador)
- Topo: ícone, nome, estrelas, "Time 1 · 16★".
- **MOVER PARA:** um botão por time, com a prévia da soma, ex.: "Time 2 · 16★ → 19★". Um time incompleto mostra a vaga: "Time 5 · 3/5 → 4/5 · 12★".
- **Trocar com alguém:** abre a lista dos jogadores dos outros times, agrupada por time. Cada nome mostra o efeito: "mantém o equilíbrio" (em verde) ou "Time 1 +1★ · Time 2 −1★". Depois de escolher, o botão laranja diz "Trocar Hugo e Fabiano".
- **Tirar do time:** a pessoa volta para Não chegaram. Texto de apoio: 'Tirar do time leva o Hugo para "Não chegaram".'

Regras:
- Um time pode ficar com mais ou menos de 5 enquanto o admin edita. O aviso de incompleto passa a refletir isso.
- Nenhuma mudança é salva até o **Concluir**. Ao concluir com mudanças, mostrar o aviso de "times mudaram".
- A regra de no máximo dois jogadores 5★ por time **não** bloqueia a edição manual: o admin manda. Se ficar com 3, mostrar uma linha de aviso discreta no card do time.

## 5. Sortear de novo (folha)

- Título "Sortear de novo".
- Texto: "Os jogadores dos times marcados são sorteados de novo entre eles. Desmarque quem já está jogando: esse time não muda."
- Um item por time, com caixa de marcar, "Time 1 · 16★" (ou "3/5" se incompleto) e os nomes resumidos embaixo. Um time desmarcado fica apagado, com "fica igual" à direita.
- Botão laranja: "Sortear N times de novo". Desabilitado se menos de 2 times estiverem marcados.
- Botão secundário: "Cancelar".
- Usa `refazerSorteio` com os times desmarcados em `travados`.

## 6. Copiar e o aviso de "times mudaram"

- **Copiar times** usa o texto que já existe (`montarTextoWhatsApp`). Depois de copiar, mostrar o aviso "Lista copiada".
- Sempre que os times mudarem (Chegou, Editar times, Sortear de novo, Adicionar jogador), aparece um aviso acima da barra de baixo: **"Os times mudaram. Copie a lista nova."** com o botão **Copiar times**. O aviso some depois de copiar ou depois de uns 6 segundos.

## 7. Menu ⋯ (Mais opções)

- O item "Tentar novamente" vira **Iniciar novo sorteio**, com subtítulo "Cola outra lista e sorteia do zero".
- Pede confirmação: título "Iniciar um novo sorteio?", texto "A lista e os times de hoje serão apagados. Você vai colar a lista do WhatsApp de novo.", botões **Iniciar novo sorteio** (laranja) e **Cancelar**.
- Ao confirmar: apaga a lista e os times da pelada de hoje e vai para a tela de colar a lista.

## 8. Navegação: voltar sempre retorna para a origem

- Bug atual: abrindo a Lista de jogadores a partir dos Times, o voltar levava para os Ajustes. Com a saída do link (item 1), esse caminho deixa de existir.
- Regra geral: o botão voltar volta para a tela de onde o usuário veio, não para uma tela fixa. Use o histórico do roteador (`navigate(-1)`) ou passe a origem no estado da rota, em vez de um caminho fixo.

## 9. Cronômetro na barra de baixo

Quando o cronômetro está rodando ou pausado, o item **Cronômetro** da barra de baixo mostra o estado em qualquer aba:

- Um anel de progresso de 34px em volta do ícone, mais o tempo restante em Montserrat 800 14px com números de largura fixa (`tabular-nums`).
- **Rodando:** anel e texto em `orange-500`. Ex.: "07:12".
- **Último minuto:** anel e texto em `amber`.
- **Pausado:** ícone de pause, anel em `text-2` com 60% de opacidade, texto "Pausado".
- **Parado:** o item normal, sem anel e sem tempo.
- `aria-label`: "Cronômetro, 7 minutos e 12 segundos restantes" (ou "Cronômetro, pausado").
- O tempo vem do mesmo estado do cronômetro (calculado pelo horário de término). O estado precisa ficar acessível fora da tela do cronômetro, por exemplo num Context.

## 10. Textos novos ou alterados

| Onde | Texto |
|---|---|
| Linha das abas | Copiar times |
| Aviso | Time 5 está incompleto · 3/5 · Ver |
| Ações | Sortear de novo · Editar times |
| Seção | Não chegaram · N |
| Linha | Chegou |
| Botão | Adicionar jogador (substitui "Adicionar quem não estava na lista" e "Adicionar alguém") |
| Aviso que some sozinho | Os times mudaram. Copie a lista nova. · Copiar times |
| Aviso que some sozinho | Lista copiada |
| Editar times | Editar times · Concluir · Buscar jogador · Toque num jogador para mover, trocar ou tirar do time. · Equilíbrio: diferença de X★ entre os times completos · + Adicionar jogador · N vagas |
| Folha do jogador | MOVER PARA · Trocar com alguém · Tirar do time · Tirar do time leva o [nome] para "Não chegaram". |
| Trocar | Trocar [nome] com… · Cada nome mostra como fica o equilíbrio depois da troca. · mantém o equilíbrio · Trocar [A] e [B] |
| Sortear de novo | (ver item 5) |
| Menu ⋯ | Iniciar novo sorteio · Cola outra lista e sorteia do zero |
| Confirmação | Iniciar um novo sorteio? · A lista e os times de hoje serão apagados. Você vai colar a lista do WhatsApp de novo. |
| Busca | Não chegou (etiqueta) |

Removidos: "Todos os times completos", "Todo mundo chegou", "Tentar novamente", o link "Lista de jogadores" nesta tela, o ícone ↻ sozinho e o botão "Copiar lista dos times" grande.
