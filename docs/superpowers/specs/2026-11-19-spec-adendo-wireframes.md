# Adendo à spec — decisões da revisão dos wireframes (v2 e v3)

19/11/2026 · Substitui os pontos correspondentes em `2026-11-19-pelada-sorteio-design.md`.

## Mudanças de comportamento (afetam lógica e banco)

1. **Login:** e-mail + senha pré-cadastrados no Supabase Auth (sem link mágico, sem cadastro público, sem "esqueci a senha" no app).
2. **Formato padrão:** sempre "Quem ganha fica", 10 min. A segunda opção se chama **"Estilo campeonato"** (antes "todos contra todos").
3. **Sortear de novo, seletivo:** o organizador escolhe quais times entram no novo sorteio (todos marcados por padrão). Times desmarcados ficam intactos; o balanceamento só redistribui os jogadores dos times marcados, mantendo as mesmas regras (máx. dois 5★ por time, time incompleto por último).
4. **Ação de saída única:** só "Copiar lista dos times" (sem botão "abrir WhatsApp").

## Mudanças de interface

5. **Menu de baixo:** Pelada · Cronômetro · Ajustes.
6. **Início com dois estados:** antes do sorteio (card da próxima pelada com ilustração de estádio e CTA "Sortear times") e durante a pelada (times em carrossel, "Jogadores que não chegaram" expansível com ação "Chegou agora", sortear de novo, copiar lista). Depois do sorteio o app volta para o Início.
7. **Ajustes:** concentra Jogadores (CRUD), dia/horário/local, editar data da próxima pelada, formato padrão, duração, máx. partidas seguidas, máx. de 5★ por time, sair.
8. **"Quem já chegou?"** (etapa 2/3): ordem alfabética, check, ícone de perna (linha) ou luva (goleiro), estrelas visíveis. Texto explica que só os marcados entram no sorteio e que quem chegar depois vai para os últimos times incompletos. Goleiros em seção própria: "não entram no sorteio".
9. **Confirmar nomes:** para cada nome desconhecido, uma escolha: "É o [jogador parecido]" ou "É um jogador novo" (nome preenchido + estrelas na mesma tela).
10. **Adicionar jogador:** um campo de nome que já busca no cadastro; se não achar, vira jogador novo com estrelas. CTA "Adicionar ao sorteio".
11. **Animação de sorteio** (~1,5 s, pulável, respeita "reduzir movimento"): chips com ícone caem nos times.
12. **Cronômetro:** variação B (números gigantes, botão grande na zona do polegar).

Wireframes de referência: `pelada-wireframes-v2.html`.

## Identidade da pelada (adicionado na rodada 3)

13. **Nome editável** (hoje "Pelada dos Brabos") e **avatar** (foto, escudo ou logo, recorte circular; sem avatar, mostra as iniciais). Editados em Ajustes → Pelada.
14. Aparecem no topo do Início, no login e na primeira linha do texto copiado ("⚽ Pelada dos Brabos — Times").
15. **Banco:** nova tabela `grupo` com uma linha (nome, avatar_url, dia/horário/local padrão). Avatar no Supabase Storage, num bucket acessível só para admins logados (no login, só nome e iniciais aparecem até a pessoa entrar, ou o bucket fica público se preferir mostrar o avatar já no login).

## Lista de jogadores e confirmação da lista (rodada 4, 19/11)

16. **Presença com três estados:** chegou (entra no sorteio), não chegou (pode chegar depois; aparece em "Não chegaram" com "Chegou") e não vem (avisou que não vem; ❌ na lista; não aparece em "Não chegaram"). Banco: `presencas.status` no lugar de `presencas.presente`.
17. **"Confira a lista" (etapa 2/3)** substitui "Quem é quem?" e "Quem já chegou?". Uma tela com todos os nomes da lista: jogador novo destacado (selo "Novo", estrelas obrigatórias), nome parecido com "É ele / É novo", check chegou/não chegou e "Não vem" no menu da linha. Jogadores, apelidos e presenças só são gravados em "Continuar".
18. **Estrelas editáveis na confirmação**, para qualquer jogador, salvas no cadastro. Substitui a decisão "selo de estrelas só leitura".
19. **Ajustes → Jogadores:** botão "Adicionar jogadores" com duas opções: um jogador (formulário) ou vários de uma vez (lista do WhatsApp, nomes separados por vírgula ou um por linha, ou ditado pelo microfone do teclado), seguido de uma tela de confirmação com nomes, estrelas e selos Novo / Já cadastrado / Parecido. Atalho "Lista de jogadores" no fim da aba Times.
20. **Excluir jogadores** (vários selecionados ou todos) = desativar. Somem da lista e da leitura da lista do WhatsApp, continuam nas peladas antigas e voltam pelo filtro Inativos.
21. **Selecionar do cadastro (etapa 1/3):** colar a lista continua sendo a ação principal; abaixo, um botão secundário "Selecionar do cadastro" abre "Quem vai jogar?" (busca, check por jogador, goleiros em seção própria, "Continuar · N"). Os escolhidos seguem para "Confira a lista" como já cadastrados e chegou.
