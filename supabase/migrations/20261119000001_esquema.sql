-- Esquema da fase 1: jogadores, peladas, presencas e configuracoes.

create extension if not exists unaccent with schema extensions;

-- Mesmo resultado do normalizarNome de src/logic/normalizar.ts:
-- sem acento, minúsculo e com espaços simples.
create function public.normalizar_nome(texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(regexp_replace(trim(extensions.unaccent('extensions.unaccent'::regdictionary, texto)), '\s+', ' ', 'g'))
$$;

create table public.jogadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (trim(nome) <> ''),
  estrelas smallint not null check (estrelas between 1 and 5),
  tipo text not null default 'diarista' check (tipo in ('mensalista', 'diarista')),
  goleiro boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Dois jogadores ativos não podem ter o mesmo nome (ignorando acento, maiúsculas e espaços).
create unique index jogadores_nome_ativo on public.jogadores (public.normalizar_nome(nome)) where ativo;

create table public.peladas (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  horario time not null,
  local text not null,
  formato text check (formato in ('quem-ganha-fica', 'todos-contra-todos')),
  duracao_min smallint check (duracao_min between 1 and 60),
  -- { "times": Time[], "jogos": Jogo[] } — ver src/logic
  times jsonb,
  sorteada_em timestamptz,
  criada_em timestamptz not null default now()
);

create table public.presencas (
  id uuid primary key default gen_random_uuid(),
  pelada_id uuid not null references public.peladas (id) on delete cascade,
  jogador_id uuid not null references public.jogadores (id) on delete restrict,
  presente boolean not null default true,
  -- Depois de peladas.sorteada_em = chegou depois.
  marcado_presente_em timestamptz,
  origem text not null check (origem in ('lista', 'na-hora')),
  unique (pelada_id, jogador_id)
);

create index presencas_jogador on public.presencas (jogador_id);

-- Uma linha só (id sempre true).
create table public.configuracoes (
  id boolean primary key default true check (id),
  formato_ate_4 text not null default 'quem-ganha-fica' check (formato_ate_4 in ('quem-ganha-fica', 'todos-contra-todos')),
  formato_5 text not null default 'todos-contra-todos' check (formato_5 in ('quem-ganha-fica', 'todos-contra-todos')),
  duracao_quem_ganha_fica smallint not null default 10 check (duracao_quem_ganha_fica between 1 and 60),
  duracao_todos_contra_todos smallint not null default 8 check (duracao_todos_contra_todos between 1 and 60),
  horario_padrao time not null default '20:30',
  local_padrao text not null default 'Colibris Club Arena'
);

insert into public.configuracoes default values;
