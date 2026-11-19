-- Regras de acesso: admin logado lê e grava tudo; deslogado não vê nada.
-- Sem policy para "anon" = zero linhas para quem não fez login.

alter table public.jogadores enable row level security;
alter table public.peladas enable row level security;
alter table public.presencas enable row level security;
alter table public.configuracoes enable row level security;

create policy admins_tudo on public.jogadores for all to authenticated using (true) with check (true);
create policy admins_tudo on public.peladas for all to authenticated using (true) with check (true);
create policy admins_tudo on public.presencas for all to authenticated using (true) with check (true);
create policy admins_tudo on public.configuracoes for all to authenticated using (true) with check (true);
