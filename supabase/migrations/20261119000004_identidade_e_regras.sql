-- Identidade da pelada (nome e avatar), regras novas dos Ajustes e apelidos dos jogadores.
-- Decisões: docs/superpowers/specs/2026-11-19-spec-adendo-wireframes.md (itens 2, 7, 9, 13 a 15).

-- 1. Configurações: nome, avatar, dia da semana e regras de jogo.
alter table public.configuracoes
  add column nome_pelada text not null default 'Pelada dos Brabos' check (trim(nome_pelada) <> ''),
  -- Nulo = avatar padrão do app (public/mascote/avatar-circulo.webp).
  add column avatar_url text,
  -- 0 = domingo … 6 = sábado.
  add column dia_semana smallint not null default 3 check (dia_semana between 0 and 6),
  add column formato_padrao text not null default 'quem-ganha-fica'
    check (formato_padrao in ('quem-ganha-fica', 'todos-contra-todos')),
  add column tempo_jogo smallint not null default 10 check (tempo_jogo between 1 and 60),
  add column max_jogos_seguidos smallint not null default 3 check (max_jogos_seguidos between 1 and 10),
  add column max_cinco_estrelas smallint not null default 2 check (max_cinco_estrelas between 1 and 5);

-- O formato deixou de depender do número de times, e o tempo de jogo virou um só (adendo, item 2).
alter table public.configuracoes
  drop column formato_ate_4,
  drop column formato_5,
  drop column duracao_quem_ganha_fica,
  drop column duracao_todos_contra_todos;

-- 2. Nome e avatar na tela de login, antes de entrar.
-- O resto das configurações continua fechado para quem não fez login.
create function public.identidade_pelada()
returns table (nome_pelada text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.nome_pelada, c.avatar_url from public.configuracoes c
$$;

revoke all on function public.identidade_pelada() from public;
grant execute on function public.identidade_pelada() to anon, authenticated;

-- 3. Avatar no Storage: bucket público para leitura (aparece no login); só admin logado envia.
insert into storage.buckets (id, name, public) values ('avatar', 'avatar', true)
on conflict (id) do nothing;

create policy avatar_admins_enviam on storage.objects
  for insert to authenticated with check (bucket_id = 'avatar');
create policy avatar_admins_trocam on storage.objects
  for update to authenticated using (bucket_id = 'avatar') with check (bucket_id = 'avatar');
create policy avatar_admins_apagam on storage.objects
  for delete to authenticated using (bucket_id = 'avatar');

-- 4. Apelidos: outros jeitos como o nome aparece na lista do WhatsApp.
create table public.apelidos (
  id uuid primary key default gen_random_uuid(),
  jogador_id uuid not null references public.jogadores (id) on delete cascade,
  texto text not null check (trim(texto) <> ''),
  criado_em timestamptz not null default now()
);

-- O mesmo apelido não pode apontar para dois jogadores (ignorando acento, maiúsculas e espaços).
create unique index apelidos_texto on public.apelidos (public.normalizar_nome(texto));
create index apelidos_jogador on public.apelidos (jogador_id);

alter table public.apelidos enable row level security;
create policy admins_tudo on public.apelidos for all to authenticated using (true) with check (true);
