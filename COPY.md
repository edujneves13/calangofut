# COPY.md — Pelada dos Brabos

Análise de UX copy dos wireframes v3 e texto final de cada tela. Complementa o `DESIGN.md` (seção 10, Voz e texto). Quem implementa usa **a coluna "Final"**; se um texto não estiver aqui, segue o glossário e os princípios.

---

## 1. Achados principais (por prioridade)

1. **Termos variando para a mesma coisa.** "Presente", "Chegou agora", "no sorteio", "fora", "ausentes", "não chegaram" falam do mesmo estado. Fixar dois termos: **"chegou"** e **"não chegou"** (seção 2).
2. **Estados que ainda não têm texto.** Cronômetro pausado, sem internet, lista colada que o app não entende, sorteio impossível pela regra dos 5★, recomeçar a pelada, troca automática para a próxima pelada. Sem texto definido, cada um vira improviso no código (seção 5).
3. **"Próximo jogo" no fim do cronômetro é ambíguo.** Não diz o que acontece. Trocar por **"Zerar para o próximo"**.
4. **Instrução longa demais em "Quem já chegou?".** Três frases num momento de pressa. Reduzir para uma frase de ação + uma dica curta.
5. **Ajustes com nomes técnicos.** "Máx. partidas seguidas" e "Máx. de 5★ por time" não explicam a regra. Reescrever como frases que o organizador reconhece.
6. **Botão "+" sem rótulo** em "Quem já chegou?". Ícone sozinho na ação mais importante depois do "Continuar". Trocar por **"Adicionar"**.
7. **Falta saída para lista errada.** Depois do sorteio, não há como recomeçar com outra lista. Ação **"Tentar novamente"** (com confirmação), no menu ⋯.
8. **Números sem contexto** no resumo do sorteio ("23 jogadores · 4 times completos + Time 5 com 3"). Mais claro: **"4 times de 5 e 1 time com 3"**.

---

## 2. Glossário (termos fixos)

| Use | Não use | Observação |
| --- | --- | --- |
| **pelada** | jogo, evento, partida (para a noite inteira) | A noite de quarta é "a pelada". |
| **jogo** | partida, rodada | Cada disputa de 8/10 min dentro da pelada. Usado no cronômetro. |
| **time** | equipe, grupo | "Time 1", "Time 5". |
| **jogador** | atleta, participante, membro | Inclui goleiro quando genérico. |
| **jogador de linha** | — | Só quando precisa diferenciar de goleiro. |
| **goleiro** | — | Nunca entra no sorteio. |
| **chegou / não chegou** | presente, ausente, fora, check-in | Estado de presença na noite. |
| **sortear** | gerar, distribuir, montar | "Sortear times", "Sortear de novo". |
| **estrelas** | nível, nota, rating | Só os organizadores veem. Selo "4★". |
| **incompleto** | faltando, aberto | Time com menos de 5. |
| **lista do WhatsApp** | mensagem, texto, lista de presença | O que é colado no início. |
| **lista dos times** | resultado, sorteio | O que é copiado no fim. |
| **Ajustes** | Configurações, Settings | Aba e tela. |
| **organizador** | admin, administrador | Quem usa o app. |

---

## 3. Princípios de microcopy

1. **Botão = verbo + objeto.** "Sortear times", não "Sortear" nem "OK".
2. **Uma instrução por tela, em uma frase.** Detalhe vai em dica pequena ou some.
3. **Diga o que fazer, não o que deu errado.** "Faltam 2 jogadores para sortear" > "Jogadores insuficientes".
4. **Números concretos.** "4 times de 5 e 1 time com 3", "Faltam 2", "Sortear 4 times".
5. **Sem jargão de sistema.** Nada de "erro", "falha", "inválido", "usuário", "registro".
6. **Tom de organizador:** direto e informal, sem gíria forçada. Pode ter graça no mascote e nos estados vazios, nunca nos erros.
7. **Sem ponto final em botões, títulos e selos.** Ponto final em frases de ajuda e mensagens.
8. **Datas e horas:** "Quarta, 25/11" (destaque), "Qua 25/11" (subtítulo), "20:30", "10 min".

---

## 4. Copy deck por tela

Formato: **Atual** (wireframe v3) → **Final** (o que implementar). "=" quando o atual já está certo.

### 1. Acesso

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Pelada dos Brabos | = | |
| Subtítulo | Acesso dos organizadores | Entrada dos organizadores | Mais natural. |
| Label campo 1 | E-mail (placeholder) | Label "E-mail", placeholder "seu@email.com" | Label visível (acessibilidade). |
| Label campo 2 | Senha (placeholder) | Label "Senha" + botão "Mostrar" | Senha digitada na rua erra fácil. |
| Botão | Entrar | = | |
| Erro | E-mail ou senha incorretos. Fale com outro organizador se esqueceu. | E-mail ou senha não conferem. Esqueceu? Peça para outro organizador trocar sua senha. | Diz o caminho concreto. |
| Sem internet | — | Sem internet. Conecte e tente de novo. | Faltava. |

**Fase de teste (proposta, 19/11):** login com um código só, sem e-mail. Quando os 3 organizadores tiverem conta, volta a tabela acima.

| Elemento | Proposta |
| --- | --- |
| Subtítulo | Digite o código de acesso |
| Label do campo | Código de acesso + botão "Mostrar" |
| Botão | Entrar |
| Erro | Código não confere. |

### 2.1 Times — antes do sorteio

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Label | PRÓXIMA PELADA | = | |
| Data | Quarta, 25/11 | = (no dia: **"Hoje, 25/11"**) | No dia da pelada, "Hoje" orienta mais rápido. |
| Horário | 20:30 – 22:00 | = | |
| Local | Colibris Club Arena | = | |
| Botão | Sortear times | = | |
| Alt da ilustração | — | Calango, mascote da Pelada dos Brabos, no gramado | Faltava. |

### 2.2 Lista do WhatsApp (etapa 1/3)

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Lista do WhatsApp | Cole a lista do WhatsApp | Título vira a instrução. |
| Etapas | Colar lista · Quem chegou · Sortear | Lista · Quem chegou · Sortear | Rótulos curtos, cabem em 360 px. |
| Ajuda (título) | Cole a lista de presença do grupo | (remover, o título já diz) | Redundante. |
| Ajuda (texto) | Copie a mensagem inteira no WhatsApp (segurar → Copiar) e cole aqui. O app separa jogadores, goleiros e ignora a lista de espera. | No WhatsApp, segure a mensagem da lista e toque em Copiar. Pode colar inteira: o app separa jogadores e goleiros e ignora a lista de espera. | Passo a passo na ordem real do gesto. |
| Campo vazio (placeholder) | — | Cole a mensagem aqui | |
| Botão secundário | Colar | Colar do WhatsApp | Diz de onde vem. |
| Botão | Continuar | = | |
| Lista sem jogadores reconhecidos | — | Não encontrei jogadores nesse texto. Copie a mensagem da lista de presença inteira e cole de novo. | Faltava. |
| Data diferente da pelada | — | Essa lista é de 18/11. Usar mesmo assim? · [Usar esta lista] [Colar outra] | Evita sortear com a lista da semana passada. |

### 2.3 Confirmar nomes

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Confirmar 2 nomes | Quem é quem? (2) | Mais leve; contador mantém a dimensão. |
| Instrução | Estes nomes da lista não estão no cadastro. Escolha quem é ou adicione como jogador novo. | Esses nomes não estão no cadastro. Escolha quem é cada um. | Uma frase, uma ação. |
| Label | NA LISTA | ESCRITO NA LISTA | Deixa claro que é o texto como veio. |
| Opção existente | É o Stenio Araújo | = | |
| Opção nova | É um jogador novo | É jogador novo | Mais curto. |
| Campo do novo | (nome preenchido) | Label "Nome completo" | |
| Estrelas do novo | (seletor) | Label "Estrelas" | |
| Ajuda após escolher existente | (implícito) | "Stênio" vai ser lembrado como apelido do Stenio Araújo. | Explica por que não vai perguntar de novo. |
| Botão | Continuar | = (desabilitado até resolver todos: "Falta escolher 1 nome") | Diz por que está travado. |

### 2.4 Quem já chegou? (etapa 2/3)

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Quem já chegou? | = | |
| Instrução | Desmarque quem ainda não chegou. Só os marcados entram no sorteio. Quem chegar depois entra nos últimos times incompletos. | Desmarque quem ainda não chegou. | Uma ação. |
| Dica (abaixo, pequena) | — | Quem chegar depois entra no último time. | A regra separada, em dica. |
| Contador | 23 no sorteio · 2 fora | 23 chegaram · 2 não chegaram | Glossário. |
| Busca | Buscar | Buscar jogador | |
| Seção goleiros | Goleiros · não entram no sorteio | GOLEIROS · fora do sorteio | Mais curto. |
| Item goleiro (direita) | goleiro | (remover, a seção já diz) | Redundante. |
| Botão "+" | ＋ | Adicionar | Rótulo visível. |
| Botão | Continuar | = | |
| Nenhum desmarcado (ok) | — | (nada) | |
| Todos desmarcados | — | Ninguém marcado. Marque quem já chegou. | Faltava. |

### 2.5 / 2.5b Adicionar jogador (sheet)

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Adicionar jogador | = | |
| Campo | (busca) | Label "Nome", placeholder "Digite o nome" | |
| Resultado novo | Novo jogador: "Re" | + Adicionar "Renê" como jogador novo | Mostrar só a partir de 3 letras, com o nome digitado. |
| Já está na lista | — | Renê já está na lista de hoje. | Faltava (evita duplicar). |
| 2.5b aviso | Ninguém com esse nome. Vai entrar como jogador novo: | Jogador novo. Quantas estrelas? | Direto à pergunta que falta. |
| Toggle | É goleiro | = | |
| Botão | Adicionar ao sorteio | = (se goleiro: **"Adicionar como goleiro"**) | Goleiro não entra no sorteio. |
| Toast | — | Renê adicionado. | |

### 2.6 Sortear (etapa 3/3)

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Sortear | Como vai ser hoje? | Título pergunta o que a tela decide. |
| Destaque | 23 jogadores | = | |
| Subtítulo | 4 times completos + Time 5 com 3 | 4 times de 5 e 1 time com 3 | Leitura direta. |
| Label | Formato | Formato | = |
| Opções | Quem ganha fica · Estilo campeonato | = | |
| Label | Duração da partida | Tempo de jogo | Mais falado. |
| Opções | 8 min · 10 min | = | |
| Ajuda | Padrão: quem ganha fica, 10 min. Máx. dois 5★ por time. Goleiros fora do sorteio. | Times equilibrados pelas estrelas, com no máximo dois craques (5★) por time. | Explica o sorteio, não os padrões. |
| Botão | Sortear times | = | |
| Sorteio impossível (5★) | — | Tem 11 craques (5★) para 5 times: não dá para ter no máximo dois por time. Sortear sem essa regra? · [Sortear assim mesmo] [Voltar] | Faltava. Regra pode travar o sorteio. |

### 2.7 Sorteando

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Sorteando… | = | |
| Subtítulo | Equilibrando as estrelas | Equilibrando os times | Jogador pode ver a tela por cima do ombro. |

### 3.1 / 3.1b Times — durante a pelada

Revisado em 20/11/2026: vale `docs/design/times-durante-v2.md` (seção 10). Em conflito, vale ele.

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Cabeçalho | Pelada dos Brabos / Qua 25/11 · 20:30 | = (só o botão ⋯ à direita) | v2: o Copiar sai do cabeçalho. |
| Índice | Time 1 · 2 · 3 · 4 · 5 | = | |
| Linha das abas | Copiar lista dos times (botão grande) | Copiar times | v2: botão pequeno na linha das abas. |
| Aviso | — | Time 5 está incompleto · 3/5 · Ver | v2. Só aparece quando existe. |
| Selo soma | 16★ | = (aria-label "16 estrelas") | |
| Selo incompleto | Incompleto · 3/5 | = | |
| Vaga vazia | vaga | Vaga | |
| Alerta no card | — | 3 craques neste time | v2: a edição manual pode passar do limite; só avisa. |
| Ações | ↻ | Sortear de novo · Editar times | v2. |
| Botão | Adicionar quem não estava na lista / Adicionar alguém | Adicionar jogador | v2. Sempre visível. |
| Aviso que some sozinho | — | Os times mudaram. Copie a lista nova. · Copiar times | v2. Sempre que os times mudam. |
| Menu ⋯ | Tentar novamente | Iniciar novo sorteio · Cola outra lista e sorteia do zero | v2. |
| Confirmação | Começar de novo com outra lista? | **Iniciar um novo sorteio?** A lista e os times de hoje serão apagados. Você vai colar a lista do WhatsApp de novo. · [Iniciar novo sorteio] [Cancelar] | v2. |

Removidos (v2): "Todos os times completos", "Todo mundo chegou", "Tentar novamente", o link "Lista de jogadores" nesta tela, o ↻ sozinho e o botão "Copiar lista dos times".

### 3.2 / 3.3 Não chegaram

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Seção | Não chegaram · 2 | Não chegaram · N (fechada: primeiros nomes, ex.: "Matheus, João, Caio, Renan…") | v2. Abre sozinha com até 3; fecha com 4 ou mais. |
| Botão da linha | Chegou agora | Chegou | Mais curto, cabe em 360 px. |
| Toast | Matheus Rei entrou no Time 5 · Desfazer | Matheus Rei entrou no Time 5 · Desfazer · Copiar times | v2: o aviso de "times mudaram" vai junto, num toast só. |
| Toast novo time | João Vitor abriu o Time 6 · Desfazer | João Vitor começou o Time 6 · Desfazer · Copiar times | |

### 3.3b Editar times (tela nova, v2)

| Elemento | Final |
| --- | --- |
| Cabeçalho | ✕ (aria-label "Cancelar") · Editar times · Concluir |
| Busca | Buscar jogador |
| Ajuda | Toque num jogador para mover, trocar ou tirar do time. |
| Equilíbrio | Equilíbrio: diferença de X★ entre os times completos |
| Etiqueta na busca | Time 1 · Não chegou |
| Time com vaga | Adicionar jogador · N vagas (1 vaga) |
| Folha do jogador | MOVER PARA · Time 5 · 3/5 → 4/5 · 12★ · Trocar com alguém · Tirar do time · Tirar do time leva o [nome] para "Não chegaram". |
| Trocar | Trocar [nome] com… · Cada nome mostra como fica o equilíbrio depois da troca. · mantém o equilíbrio · Time 1 +1★ · Time 2 −1★ · Trocar [A] e [B] |

Nenhum time passa de 5 (decisão de 20/11): "Mover para" só lista times com vaga.

### 3.4 Sortear de novo (sheet)

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Sortear de novo | = | |
| Instrução | Marque os times que vão ser misturados. Os outros ficam iguais. | Os jogadores dos times marcados são sorteados de novo entre eles. Desmarque quem já está jogando: esse time não muda. | v2: explica o que faz. |
| Item | Time 1 · 16★ | Time 1 · 16★ (ou 3/5) + nomes resumidos embaixo | v2. |
| Item desmarcado | mantém | fica igual (linha apagada) | |
| Botão | Sortear 4 times | Sortear 4 times de novo (dinâmico) | v2. |
| 1 time marcado | — | Botão desabilitado + "Marque pelo menos 2 times." | |
| Secundário | Cancelar | = | |
| Toast depois | Times 1, 2, 4 e 5 sorteados de novo. Copie a lista nova. | Os times mudaram. Copie a lista nova. · Copiar times | v2: mesmo aviso de toda mudança. |

### 3.5 Lista copiada

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Toast | ✓ Copiado. Cole no grupo do WhatsApp | Lista copiada | v2: mais curto. |
| Falha ao copiar | — | Não deu para copiar. Toque e segure o texto para copiar manualmente. (mostra o texto selecionável) | Faltava (navegadores bloqueiam às vezes). |

### 4.1 Menos de 10

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Destaque | 8 jogadores | = | |
| Subtítulo | Precisa de pelo menos 10 de linha | Faltam 2 para sortear | Número que importa. |
| Aviso | Faltam 2 jogadores para fechar dois times. Marque quem chegou ou adicione alguém. | O sorteio precisa de pelo menos 10 jogadores de linha. Marque quem chegou ou adicione alguém. | Explica a regra uma vez. |
| Botões | Voltar para "Quem já chegou?" · + Adicionar jogador | Ver quem chegou · Adicionar jogador | Mais curtos. |

### 4.2 Time só com quem chegou depois

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Aviso | Time formado por quem chegou depois: não é balanceado. Use "Sortear de novo" se quiser equilibrar. | Esse time foi montado por ordem de chegada, sem equilibrar. Para equilibrar, use Sortear de novo. | "Balanceado" é jargão. |

### 5. Cronômetro

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Cronômetro | = | |
| Segmentado | 8 min · 10 min | 8 min · 10 min · Outro | "Outro" abre o tempo personalizado; depois mostra o tempo escolhido ("12 min") com um lápis. | |
| Parado | Iniciar | Começar | Mais falado. |
| Rodando | Pausar | = | |
| **Pausado** | — | **Continuar** · Zerar | Faltava o estado inteiro. |
| Ajuste | −1 min · +1 min | +1 min (rodando e pausado) | Decidido em 19/11: sem −1 min; parado só escolhe o tempo. |
| Indicador | ☀ tela acesa | (remover) | Quando funciona, não precisa avisar. Só aparece o aviso de "sem suporte" abaixo. |
| Último minuto | ÚLTIMO MINUTO | = | |
| Fim — título | Fim de jogo | = | |
| Fim — subtítulo | Apito tocando | (remover) | Óbvio pelo som. |
| Fim — botão | Próximo jogo | **Zerar para o próximo** | Diz o que acontece. |
| Fim — secundário | Parar apito | = | |
| Sem suporte a tela acesa | — | Seu celular pode apagar a tela durante o jogo. O tempo continua contando. | Faltava (alguns navegadores). |
| Tempo personalizado (sheet) | — | Título "Tempo de jogo" · número + "minutos" · atalhos 5, 6, 7, 12, 15 min · ajuda "De 1 a 30 minutos. Vale só para hoje; o padrão muda em Ajustes." · botão "Usar 12 min" | Faltava. |
| Primeiro uso do som | — | Toque em Começar para liberar o apito. | iOS só toca som após um toque. |
| Linha de apoio (parado) | — | Pronto para o próximo jogo | Aprovado em 19/11. Rodando, não há linha de apoio (sem contagem de jogos). |
| Selo (pausado) | — | PAUSADO | Aprovado em 19/11. Mesmo estilo do selo de último minuto. |

### 6.1 Ajustes

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Ajustes | = | |
| Pelada | Pelada dos Brabos · Nome e avatar | = | |
| Jogadores | Jogadores · 48 cadastrados | Jogadores · 48 | "Cadastrados" sobra. |
| Seção | PELADA RECORRENTE | TODA SEMANA | Linguagem do grupo. |
| Item | Dia e horário · Qua · 20:30–22:00 | = | |
| Item | Local · Colibris | = | |
| Item | Próxima pelada · Editar data | Mudar só a próxima · 25/11 | Diferencia de mudar a regra semanal. |
| Seção | JOGO | JOGO | = |
| Item | Formato padrão · Quem ganha fica | = | |
| Item | Duração · 10 min | Tempo de jogo · 10 min | Mesmo termo da 2.6. |
| Item | Máx. partidas seguidas · 3 | Quem ganha fica até · 3 jogos | Explica a regra. |
| Seção | SORTEIO | = | |
| Item | Máx. de 5★ por time · 2 | Craques (5★) por time · até 2 | Explica a regra. |
| Item | — | Jogadores por time · 5 | (já previsto no v1; manter) |
| Sair | Sair da conta | Sair | Confirmação: "Sair do app neste celular?" |

### 6.2 Jogadores

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Busca | Buscar por nome ou apelido | = | |
| Filtros | Todos 48 · Linha · Goleiros · Inativos | = | |
| Subtítulo da linha | Mensalista / Diarista / Goleiro | = | |
| Lista vazia | — | Nenhum jogador ainda. Cole uma lista do WhatsApp na próxima pelada e cadastre todos de uma vez. | |
| Busca sem resultado | — | Ninguém com "Xyz". · [Cadastrar "Xyz"] | |

### 6.3 Editar jogador

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Editar jogador (novo: "Novo jogador") | = | |
| Campos | Nome completo · Apelidos (opcional) · Estrelas | = | |
| Botão apelido | + apelido | + Apelido | |
| Ajuda apelidos | — | Como o nome aparece na lista do WhatsApp. | Explica para que serve. |
| Segmentado | Mensalista · Diarista | = | |
| Toggles | Goleiro · Ativo | Goleiro · Ativo | = |
| Ajuda "Ativo" | — | Inativo some da busca e não é reconhecido na lista. | Faltava. |
| Botão | Salvar | = | |
| Toast | — | Jogador salvo. | |
| Nome duplicado | (2.11 v1) | Já existe um Eduardo. Use o nome completo para diferenciar, como "Eduardo Lucas". | |

### 6.4 Nome e avatar

| Elemento | Atual | Final | Motivo |
| --- | --- | --- | --- |
| Título | Pelada | Nome e avatar | Diz o que se edita. |
| Botão | Trocar foto | = (sem foto: "Escolher foto") | |
| Ajuda | Foto do grupo, escudo ou logo. Recorte em círculo. | Foto do grupo, escudo ou mascote. Aparece em círculo. | |
| Label | Nome da pelada | = | |
| Ajuda | Aparece no topo do app, no login e no texto copiado para o WhatsApp. | Aparece no app e na lista dos times copiada. | Mais curto. |
| Botão | Salvar | = | |

---

## 5. Estados e mensagens do sistema (novos)

| Situação | Onde | Texto |
| --- | --- | --- |
| Carregando dados | Qualquer tela | (esqueleto da tela, sem texto) |
| Sem internet, com dados salvos | Faixa no topo | Sem internet. O que você fizer agora é salvo quando a conexão voltar. |
| Sem internet, sem dados | Tela | Sem internet. Conecte para carregar a pelada. · [Recarregar] |
| Erro ao salvar | Toast erro | Não deu para salvar. O app tenta de novo sozinho. |
| Sessão expirou | Login | Sua sessão acabou. Entre de novo. |
| Iniciar novo sorteio (confirmação) | Modal | Ver 3.1 (v2). |
| Pelada acabou | Times, à meia-noite do dia da pelada | Troca sozinha para a próxima pelada. Faixa no dia seguinte: "Pelada de 25/11 encerrada." |
| Desativar jogador | Confirmação | **Desativar Kauã?** Ele some da busca, mas continua nas peladas antigas. · [Desativar] [Cancelar] |
| Sair | Confirmação | **Sair do app neste celular?** · [Sair] [Cancelar] |

---

## 6. Texto copiado para o WhatsApp

```
⚽ Pelada dos Brabos — Times
Quarta, 25/11 · 20:30

Time 1: Juninho, Rafael, Hugo, Leandro, Pedro
Time 2: Eduardo, Derik, Yhan, Murilo, Jackson
Time 3: Josué, Fabiano, Herlly, Léo, Paulinho
Time 4: Junior, Cleyton, Arllen, Adelson, Stênio
Time 5 (incompleto): Márcio, Guilherme, Eduardo Lucas

🧤 Goleiros: Renan Araujo, Richard

Quem ganha fica · 10 min
```

Regras:
- Texto puro, sem `*`, `_`, `~` ou `**`.
- Nome do jogador como está no cadastro (não o apelido).
- "(incompleto)" só no time que tiver menos de 5.
- Linha final com formato e tempo. No estilo campeonato, a linha final vira a ordem dos jogos.
- Sem estrelas, nunca.

---

## 7. Textos de acessibilidade

| Elemento | aria-label / alt |
| --- | --- |
| Avatar no cabeçalho | Pelada dos Brabos |
| Ilustração do card | Calango, mascote da Pelada dos Brabos, no gramado |
| Botão ↻ | Sortear de novo |
| Abas inativas | Times · Cronômetro · Ajustes |
| Selo "16★" | 16 estrelas |
| Selo "4★" | 4 estrelas |
| Check de presença | Chegou: [nome] (marcado) / Não chegou: [nome] |
| Pontos do carrossel | Time 1 de 5 |
| Cronômetro (anúncios) | "Último minuto" · "Fim de jogo" |
| Fechar sheet | Fechar |

---

## 8. Decisões fechadas

- Aba principal: **Times**.
- Texto copiado usa o **nome do cadastro**.
- A pelada vira para a próxima **à meia-noite** do dia.
- Saída para lista errada: **"Iniciar novo sorteio"** (era "Tentar novamente" até a v2 de 20/11). O botão de recarregar sem internet continua **"Recarregar"**.

---

## 9. Rodada 4 — propostas (aguardando aprovação do Eduardo)

Decisões de 19/11: lista de jogadores com cadastro em lote, "Confira a lista" no lugar de "Quem é quem?" + "Quem já chegou?", e presença com três estados. Até a aprovação, a coluna **Proposta** não vale como "Final". Depois de aprovada, cada linha passa para a tabela da tela correspondente.

**Ponto para decidir:** o glossário (seção 2) proíbe "ausente". Para o terceiro estado, a proposta é **"Não vem"** (avisou que não vem). Se preferir "Ausente", troque nas linhas marcadas com †.

### 9.1 Times — link para a lista de jogadores (só antes do sorteio; v2 tirou da tela durante a pelada)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Link no fim da tela | Lista de jogadores · 48 | Atalho para Ajustes → Jogadores sem passar por Ajustes. |

### 9.2 Ajustes → Jogadores (complementa a 6.2)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Botão principal (topo) | Adicionar jogadores | Visível e explícito, como pedido. |
| Botão de texto | Selecionar | Entra no modo de excluir vários. |
| Menu ⋯ | Excluir todos | |
| Modo seleção — título | 3 selecionados | Número concreto. |
| Modo seleção — botão | Excluir (3) | |
| Modo seleção — secundário | Cancelar | |
| Confirmação — título | **Excluir 3 jogadores?** | |
| Confirmação — texto | Eles saem da lista, mas continuam nas peladas antigas. Dá para trazer de volta em Inativos. | Explica que nada se perde. |
| Confirmação — botões | [Excluir] [Cancelar] | |
| Excluir todos — título | **Excluir todos os 48 jogadores?** | |
| Excluir todos — texto | = texto acima | |
| Toast | 3 jogadores excluídos. · Desfazer | |

### 9.3 Adicionar jogadores (sheet)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Título | Adicionar jogadores | |
| Opção 1 | Um jogador · Nome, apelidos e estrelas | Abre o formulário da 6.3 ("Novo jogador"). |
| Opção 2 | Vários de uma vez · Cole uma lista ou dite os nomes | |

### 9.4 Vários de uma vez

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Título | Vários de uma vez | |
| Ajuda | Cole a lista do WhatsApp ou escreva os nomes separados por vírgula. Para ditar, toque no microfone do teclado. | Ensina as três formas sem botão novo. |
| Placeholder | Pedro, João Vitor, Maria… | Mostra o formato. |
| Botão secundário | Colar do WhatsApp | Mesmo termo da 2.2. |
| Botão | Continuar | |
| Nenhum nome | Não encontrei nomes nesse texto. Separe os nomes por vírgula ou um por linha. | |

### 9.5 Confirme os jogadores (lote)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Título | Confirme os jogadores (12) | |
| Instrução | Confira os nomes e dê as estrelas de quem é novo. | Uma ação. |
| Selo | Novo | Destaca quem vai entrar no cadastro. |
| Selo | Já cadastrado | Não é criado de novo. |
| Linha parecida | Parece o Stenio Araújo · [É ele] [É novo] | |
| Ajuda após "É ele" | "Stênio" vai ser lembrado como apelido do Stenio Araújo. | = 2.3. |
| Remover linha | aria-label "Tirar Pedro da lista" | |
| Toggle | Goleiro | |
| Botão | Adicionar 9 jogadores | Número de quem será criado. |
| Botão travado | Falta dar estrelas a 2 jogadores | Diz por que está travado. |
| Botão travado (parecidos) | Falta escolher 1 nome | = 2.3. |
| Toast | 9 jogadores adicionados. | |

### 9.6 Confira a lista (etapa 2/3, substitui 2.3 e 2.4)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Etapas | Lista · Conferir · Sortear | Rótulo curto da nova etapa. |
| Título | Confira a lista | |
| Instrução | Desmarque quem ainda não chegou. | = 2.4. |
| Dica | Toque nas estrelas para mudar. Quem chegar depois entra no último time. | Estrelas agora são editáveis aqui. |
| Contador | 21 chegaram · 2 não chegaram · 2 não vêm † | Três estados. |
| Selo | Novo | Jogador fora do cadastro, em destaque. |
| Estrelas do novo (vazio) | Dar estrelas | Chamada para a ação que falta. |
| Linha parecida | Parece o Stenio Araújo · [É ele] [É novo] | = 9.5. |
| Menu ⋯ da linha | Não vem † | Marca o terceiro estado. |
| Seção | NÃO VÊM · 2 † | Recolhida no fim. |
| Ação na seção | Vem sim † | Volta para "não chegou". |
| Seção goleiros | GOLEIROS · fora do sorteio | = 2.4. |
| Busca | Buscar jogador | = 2.4. |
| Botão | Adicionar | = 2.4. |
| Botão | Continuar | |
| Botão travado | Falta dar estrelas a 2 jogadores · Falta escolher 1 nome | = 9.5. |
| Toast ao mudar estrelas | Estrelas do Juninho: 4★. | Confirma que salvou no cadastro. |

### 9.7 Não chegaram (complementa a 3.2)

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Regra | Quem "não vem" † não aparece aqui. | Lista só com quem pode chegar. |

### 9.8 Selecionar do cadastro (etapa 1/3, ação secundária)

Caminho para quando não tem lista no WhatsApp: escolher direto do cadastro. Depois segue para "Confira a lista" (9.6), com todos como chegou.

| Elemento | Proposta | Motivo |
| --- | --- | --- |
| Separador (abaixo da área de colar) | ou † | Mostra que é um caminho alternativo. |
| Botão secundário (1/3) | Selecionar do cadastro † | Diz de onde vêm os nomes. |
| Título | Quem vai jogar? † | Pergunta direta, uma ação. |
| Busca | Buscar jogador | = 2.4. |
| Ação de texto | Selecionar todos † · Limpar † | Atalho para pelada com quase todo mundo. |
| Seção goleiros | GOLEIROS · fora do sorteio | = 2.4. |
| Botão principal | Continuar · 12 † | Número concreto de selecionados. |
| Botão travado | Selecione quem vai jogar † | Diz o que falta. |
| Cadastro vazio | Nenhum jogador no cadastro ainda. † · [Adicionar jogadores] | Leva para Ajustes → Jogadores. |
| Voltar | aria-label "Voltar para colar a lista" † | |
