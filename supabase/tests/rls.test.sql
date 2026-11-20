begin;
select plan(17);

-- Uma linha em cada tabela, criada como dono do banco.
insert into jogadores (nome, estrelas) values ('Craque', 5);
insert into peladas (data, horario, local) values ('2026-11-25', '20:30', 'Colibris Club Arena');
insert into presencas (pelada_id, jogador_id, origem)
  select p.id, j.id, 'lista' from peladas p, jogadores j;
insert into apelidos (jogador_id, texto) select id, 'Fera' from jogadores;

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relrowsecurity
     and c.relname in ('jogadores', 'peladas', 'presencas', 'configuracoes', 'apelidos')),
  5, 'RLS ligado nas 5 tabelas');

-- Deslogado (anon): não vê nada, não grava nada.
set local role anon;
select is_empty($$select * from jogadores$$, 'deslogado não vê jogadores (nem estrelas)');
select is_empty($$select * from peladas$$, 'deslogado não vê peladas');
select is_empty($$select * from presencas$$, 'deslogado não vê presenças');
select is_empty($$select * from configuracoes$$, 'deslogado não vê configurações');
select is_empty($$select * from apelidos$$, 'deslogado não vê apelidos');
select throws_ok($$insert into jogadores (nome, estrelas) values ('Hacker', 5)$$, '42501', null, 'deslogado não cadastra jogador');
select is((select nome_pelada from public.identidade_pelada()), 'Pelada dos Brabos', 'deslogado vê o nome da pelada (login)');
select throws_ok($$insert into storage.objects (bucket_id, name) values ('avatar', 'x.png')$$, '42501', null, 'deslogado não envia avatar');
reset role;

-- Logado (authenticated): lê e grava tudo.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select isnt_empty($$select * from jogadores$$, 'admin vê jogadores');
select isnt_empty($$select * from peladas$$, 'admin vê peladas');
select isnt_empty($$select * from presencas$$, 'admin vê presenças');
select isnt_empty($$select * from configuracoes$$, 'admin vê configurações');
select lives_ok($$insert into jogadores (nome, estrelas) values ('Admin Cria', 3)$$, 'admin cadastra jogador');
select isnt_empty($$select * from apelidos$$, 'admin vê apelidos');
select lives_ok($$update configuracoes set tempo_jogo = 8$$, 'admin muda configurações');
select lives_ok($$delete from peladas where data = '2026-11-25'$$, 'admin apaga pelada');
reset role;

select * from finish();
rollback;
