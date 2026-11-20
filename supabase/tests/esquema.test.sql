begin;
select plan(23);

select has_table('public', 'jogadores', 'tabela jogadores existe');
select has_table('public', 'peladas', 'tabela peladas existe');
select has_table('public', 'presencas', 'tabela presencas existe');
select has_table('public', 'configuracoes', 'tabela configuracoes existe');
select has_table('public', 'apelidos', 'tabela apelidos existe');

-- normalizar_nome igual ao normalizarNome do código
select is(public.normalizar_nome('  João   PEDRO '), 'joao pedro', 'normalizar_nome tira acento, maiúsculas e espaços');

-- jogadores
select throws_ok($$insert into jogadores (nome, estrelas) values ('Ana', 6)$$, '23514', null, 'estrelas acima de 5 falha');
select throws_ok($$insert into jogadores (nome, estrelas) values ('   ', 3)$$, '23514', null, 'nome vazio falha');
insert into jogadores (nome, estrelas) values ('Léo', 3);
select throws_ok($$insert into jogadores (nome, estrelas) values ('  LEO ', 4)$$, '23505', null, 'nome repetido entre ativos falha');
update jogadores set ativo = false where nome = 'Léo';
select lives_ok($$insert into jogadores (nome, estrelas) values ('Leo', 4)$$, 'nome de jogador desativado pode repetir');

-- peladas
insert into peladas (data, horario, local) values ('2026-11-25', '20:30', 'Colibris Club Arena');
select throws_ok($$insert into peladas (data, horario, local) values ('2026-11-25', '20:30', 'X')$$, '23505', null, 'uma pelada por data');

-- presencas
insert into presencas (pelada_id, jogador_id, origem)
  select p.id, j.id, 'lista' from peladas p, jogadores j where p.data = '2026-11-25' and j.nome = 'Leo';
select throws_ok($$insert into presencas (pelada_id, jogador_id, origem)
  select p.id, j.id, 'lista' from peladas p, jogadores j where p.data = '2026-11-25' and j.nome = 'Leo'$$,
  '23505', null, 'presença repetida falha');
select throws_ok($$delete from jogadores where nome = 'Leo'$$, '23503', null, 'apagar jogador com presença falha');
select is((select status from presencas limit 1), 'chegou', 'presença começa como chegou');
select throws_ok($$update presencas set status = 'talvez'$$, '23514', null, 'status só aceita chegou, nao-chegou ou ausente');
delete from peladas where data = '2026-11-25';
select is((select count(*)::int from presencas), 0, 'apagar pelada apaga as presenças');

-- configuracoes
select is((select count(*)::int from configuracoes), 1, 'configuracoes tem uma linha');
select is((select local_padrao from configuracoes), 'Colibris Club Arena', 'local padrão');
select throws_ok($$insert into configuracoes (id) values (false)$$, '23514', null, 'só existe uma linha de configurações');
select is((select max_cinco_estrelas from configuracoes), 2::smallint, 'craques por time começa em 2');

-- apelidos
insert into jogadores (nome, estrelas) values ('Kauã', 4);
insert into apelidos (jogador_id, texto) select id, 'Kaká' from jogadores where nome = 'Kauã';
select throws_ok($$insert into apelidos (jogador_id, texto) select id, ' KAKA ' from jogadores where nome = 'Leo'$$,
  '23505', null, 'apelido repetido falha');
delete from jogadores where nome = 'Kauã';
select is((select count(*)::int from apelidos), 0, 'apagar jogador apaga os apelidos');
select throws_ok($$update configuracoes set dia_semana = 7$$, '23514', null, 'dia da semana vai de 0 a 6');

select * from finish();
rollback;
