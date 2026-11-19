# App de Sorteio da Pelada — Design da Fase 1

19/11/2026 · Eduardo Neves · Status: aprovado

## Objetivo

Um app web instalável, usado por 3 admins, que faz em menos de 1 minuto o sorteio balanceado da pelada de quarta (20:30–22:00, Colibris Club Arena, João Pessoa) e entrega o texto dos times pronto para o WhatsApp.

Hoje o sorteio é feito à mão com um histórico no ChatGPT: demora e erra com frequência. Sucesso é o organizador colar a lista, desmarcar quem faltou, sortear e mandar no grupo, sem conta de cabeça e sem reclamação de time desequilibrado.

## Escopo

### Dentro da fase 1

- Login dos 3 admins (sem cadastro público)
- Cadastro de jogadores com busca: nome (um campo só, nome e sobrenome, igual aparece na lista), estrelas 1–5, mensalista/diarista (toggle), goleiro (toggle), ativo
- Pelada do dia: colar lista do WhatsApp → conferir presença → sortear → copiar texto
  - A tela de times precisa funcionar como uma lista de fácil visualização, para quem não quiser mandar no WhatsApp
  - O texto copiado precisa colar no WhatsApp sem problemas de formatação (nada de `**` aparecendo)
  - Na mensagem do WhatsApp a lista é numerada com os jogadores que já pagaram; os goleiros vêm em lista separada e não entram no sorteio
- Adicionar jogador na hora, inclusive quem não está cadastrado (só nome completo + estrelas)
- Sorteio balanceado por estrelas; atrasados vão para os últimos times. Atrasados são os que, na hora do sorteio, estão com presença marcada como "Não"
- Formato do jogo: quem ganha fica (padrão) ou todos contra todos só com a ordem dos jogos (opcional, segunda opção)
- Cronômetro de partida em aba separada
- Instalável na tela inicial (ícone, tela cheia — PWA)

### Fora da fase 1

- Placar, tabela de pontos e campeão (fase 2)
- Pagamentos e mensalidades
- Tela de histórico (os dados ficam salvos, mas não aparecem)
- Lista de espera (continua só no WhatsApp; o app ignora essa seção)
- IA ou comandos de voz
- Estatística por jogador

### Seria fracasso mesmo funcionando

- Estrelas visíveis para qualquer pessoa além dos admins
- Fluxo da quarta que leve mais de 1 minuto ou exija digitar a lista
- Editor de regras genérico na interface
- Um time final com mais de dois jogadores 5 estrelas
- O app não ler a lista corretamente quando o texto é colado
- O texto final, depois de enviado no WhatsApp, mostrar `**` ou outros marcadores que atrapalham a leitura

## Fluxo da quarta

Um único celular opera o sorteio na quadra; não há sincronização em tempo real entre admins.

1. **Abrir a próxima pelada** na tela inicial. Ela já vem criada como recorrente (quarta, 20:30, Colibris Club Arena); data, horário e local são editáveis como informação secundária.
2. **Colar a lista** do WhatsApp. O app separa jogadores de linha e goleiros, ignora a lista de espera e casa cada nome com o cadastro.
3. **Resolver nomes não reconhecidos:** escolher um jogador sugerido ou cadastrar na hora (nome completo + estrelas).
4. **Conferir:** todos começam com Presente = sim (exceto ❌, ver Lógica). Um toque muda para não. Busca no topo; "+ adicionar jogador" para quem não está na lista.
5. **Escolher formato** e **sortear**. Pode refazer o sorteio, com confirmação.
6. **Tela de times:** mostra os times (com soma de estrelas, só no app). O usuário pode copiar o texto ou abrir direto no WhatsApp com a mensagem pré-escrita.
7. **Quem chega depois:** abaixo dos times fica a lista de ausentes com a ação "Presente". Marcar presente coloca a pessoa direto no último time incompleto (ex.: 3 times completos + Time 4 incompleto → atrasado vai para o Time 4). Sem mexer nos outros times. O texto pode ser copiado de novo.
8. **Cronômetro** durante os jogos.

Tudo é salvo no banco a cada ação: se a página recarregar, o estado volta igual.

## Telas

Pensadas para uso com uma mão, à noite, na beira da quadra: botões grandes, alto contraste, nada essencial fora do alcance do polegar.

| Tela | O que tem | Estados que precisam de desenho |
| --- | --- | --- |
| Login | E-mail + link mágico ou senha | Link enviado, erro |
| Início | Abas: Sorteio e Cronômetro. Na aba Sorteio, a próxima pelada em destaque e o acesso a Jogadores e Configurações | Nenhuma pelada criada |
| Pelada do dia | 3 etapas: Colar lista → Conferir → Times (+ ausentes abaixo) | Nome não reconhecido, presentes que não fecham times de 5, menos de 10 presentes, sorteio refeito, atrasado entrando |
| Jogadores | Lista com busca, criar/editar/desativar | Lista vazia, nome duplicado |
| Configurações | Formato padrão por nº de times, duração da partida, dados padrão da pelada recorrente | — |

## Modelo de dados

Três tabelas no Postgres do Supabase; o resultado do sorteio fica dentro da pelada.

| Tabela | Campos | Observações |
| --- | --- | --- |
| jogadores | id, nome, estrelas (1–5), tipo (mensalista/diarista), goleiro, ativo, criado_em | Desativar em vez de apagar, para não quebrar peladas antigas |
| peladas | id, data, horario, local, formato, config (tamanho do time = 5, duração da partida), times (resultado do sorteio), sorteada_em, criada_em | `times` guarda a lista de times com os ids dos jogadores e a ordem dos jogos |
| presencas | id, pelada_id, jogador_id, presente (bool), marcado_presente_em, origem (lista/na hora) | `marcado_presente_em` depois de `sorteada_em` = chegou depois |

Goleiros entram em `presencas` para aparecer no texto, mas nunca no sorteio.

## Lógica

Toda a lógica é código puro (sem tela, sem banco), coberto por testes automáticos, e roda no celular. Fixtures reais em `tests/fixtures/`.

### Leitor da lista

- Linhas no formato `N- Nome ...` são jogadores. Remove número, emojis (⭐ ✅ ✅️ ⚠️ 👤 ❌) e parênteses como "(cvd. Jackson)" ou "(convidado juninho)".
- Seção "Goleiros" → goleiros. Seção "Lista de Espera" e tudo depois → ignorado. Linhas vazias, `_`, e numeração sem nome (`3-`) → ignoradas.
- Cabeçalho (data, horário, local, Pix, endereço, mensalidade, legenda) → ignorado; a data pode ser lida para conferir a pelada.
- **Pagamento:** ✅ (pago) entra como Presente = sim. ❌ (não pago) normalmente já é removido antes da lista final; se aparecer, o jogador entra como Presente = não, e o organizador pode mudar com um toque.

### Casamento de nomes

- Compara sem acento, sem maiúsculas e sem espaços extras, contra o nome do cadastro.
- Igualdade exata ganha. Sem match exato: sugere os nomes mais parecidos e pede confirmação; nunca casa sozinho por semelhança ("Junior" e "Juninho" são pessoas diferentes; "Eduardo" e "Eduardo Lucas" também).

### Sorteio balanceado

1. Entram só jogadores de linha com Presente = sim.
2. Número de times completos = presentes ÷ 5 (arredondado para baixo). O resto forma um último time incompleto, escolhido pelo próprio balanceamento.
3. Com menos de 10 jogadores de linha presentes, o app não sorteia e avisa.
4. **Restrição obrigatória:** nenhum time pode ter mais de dois jogadores 5 estrelas. Divisões que violam isso são descartadas.
5. O app testa milhares de divisões aleatórias e fica com a de menor diferença entre a maior e a menor soma de estrelas dos times completos. Empates são desfeitos ao acaso, para os times não se repetirem toda semana.
6. A ordem dos times (Time 1, Time 2...) é sorteada entre os completos; o incompleto é sempre o último.

### Chegou depois

- Entra na próxima vaga do time incompleto. Sem vaga, abre um novo time no fim. Os outros times não mudam.
- Um time formado só por atrasados não é balanceado; a soma de estrelas aparece para o organizador decidir se troca alguém manualmente.

### Formatos de jogo (modos trocáveis)

Cada formato é um módulo com a mesma entrada (times + config) e a mesma saída (ordem dos jogos + texto). Um formato novo entra sem mexer no resto.

| Formato | Padrão quando | Duração | Saída | Regras |
| --- | --- | --- | --- | --- |
| Quem ganha fica | até 4 times | 10 min | Times em ordem; Time 1 x Time 2 começam | Time ganhador joga no máximo 3 partidas seguidas, mesmo que ganhe as 3. Empate: saem os dois times |
| Todos contra todos | 5 times | 8 ou 10 min | Ordem dos jogos: 10 jogos com 5 times (80 min de bola em 90 min); ninguém joga duas seguidas | — |

O organizador pode trocar o formato e a duração antes de sortear. Os padrões ficam na tela de Configurações.

### Texto para o WhatsApp

Sem marcação markdown (nada de `**`). Só texto simples e emojis. Sem estrelas no texto. Botões: copiar e abrir no WhatsApp (`wa.me/?text=`).

```
⚽ Times — Quarta 18/11 · 20:30

Time 1: Juninho, Rafael, Hugo, Leandro, Pedro
Time 2: ...

🧤 Goleiros: Renan Araujo, Richard

Jogos (todos contra todos, 8 min):
1) Time 1 x Time 2
...
```

## Cronômetro

Aba própria na tela inicial, só cronômetro: sem placar e sem vínculo com os jogos nesta fase.

- Duração pré-definida pelo formato (8 ou 10 min), ajustável com +1/−1 min.
- Botões grandes: iniciar, pausar, zerar.
- Tela sempre acesa enquanto a aba estiver aberta (Screen Wake Lock API).
- Conta pelo relógio do sistema (timestamps), não por ticks: se a tela apagar ou o app for para segundo plano, o tempo continua certo ao voltar.
- Apito e vibração no fim, e aviso no último minuto.

**Limitação assumida:** com a tela bloqueada o apito não toca, porque o navegador congela apps web. Resolver isso exigiria app nativo, fora do escopo.

## Abordagem técnica

Escolhida: **React (Vite) + TypeScript + Supabase, publicado no Netlify**, sem servidor próprio.

| Abordagem | Pró | Contra | Decisão |
| --- | --- | --- | --- |
| React (Vite) + Supabase + Netlify | Simples, sem servidor, lógica isolada e testável, Eduardo já usa Netlify e estuda front-end | Mais montagem à mão | Escolhida |
| Next.js + Supabase na Vercel | Servidor pronto para futuro envio automático ou páginas públicas | Mais coisa para entender e manter, sem ganho hoje | Descartada |
| Gerado no v0 / no-code + Supabase | Primeira versão em horas | Lógica do sorteio misturada no código gerado, difícil de trocar | Descartada |
| Planilha Google + script | Custo zero de início | Frágil para login e histórico | Descartada |

**Estrutura do código:** `src/logic/` (leitor, casamento, sorteio, formatos, texto) sem dependência de tela ou banco; `src/data/` (acesso ao Supabase); `src/ui/` (telas). Testes com Vitest. Instalável via manifesto e service worker (PWA).

## Acesso e deploy

- **Login:** Supabase Auth, cadastro público desligado, 3 admins convidados por e-mail. Sessão longa no celular.
- **Regras de acesso no banco (RLS):** usuário logado lê e grava tudo; deslogado não vê nada. Sem papéis diferentes entre admins.
- **Publicação:** Netlify, deploy a cada push no repositório; URL e anon key do Supabase em variáveis de ambiente. A service_role key nunca vai para o front nem para o repositório.
- **Plano grátis do Supabase:** pausa após 7 dias sem uso. Um ping agendado (a cada 3 dias) evita a pausa em semanas sem pelada.
- **Ordem de construção:** lógica com testes → banco e regras → telas → cronômetro → deploy → teste com a lista real de 18/11, comparando com o sorteio feito à mão.

## Decisões aprovadas

1. A próxima pelada já vem criada como recorrente (quarta, 20:30, Colibris); data, horário e local editáveis.
2. Com menos de 10 jogadores de linha presentes, o app não sorteia e avisa.
3. Quem sobra da divisão por 5 forma o último time incompleto, escolhido pelo balanceamento.
4. O sorteio pode ser refeito com confirmação. Depois do sorteio, a tela mostra os times e, abaixo, a lista de ausentes com a ação "Presente", que coloca a pessoa direto no último time incompleto.
5. Nome parecido nunca casa sozinho.
6. Soma de estrelas só no app.
7. Alerta no último minuto do cronômetro.

## Fase 2 (resumo, a desenhar depois)

Tela de jogo com placar e o cronômetro juntos; tabela com pontos (vitória 3, empate 1, derrota 0) e desempate por saldo → gols marcados → confronto direto → pênaltis/sorteio; campeão da noite com texto pro WhatsApp. Nova tabela `jogos` (ordem, time A, time B, gols, status). A estrutura de formatos da fase 1 já comporta isso.
