-- Presença com três estados (adendo, item 16):
--   chegou      → está na pelada e entra no sorteio
--   nao-chegou  → está na lista, mas ainda não chegou; aparece em "Não chegaram" com "Chegou"
--   ausente     → avisou que não vem (❌ na lista); não aparece em "Não chegaram"

alter table public.presencas
  add column status text not null default 'chegou' check (status in ('chegou', 'nao-chegou', 'ausente'));

update public.presencas set status = case when presente then 'chegou' else 'nao-chegou' end;

-- A hora da chegada passa a olhar o status. Mesma regra de antes: ela só muda quando o jogador
-- passa a "chegou" vindo de outro estado, para colar a lista de novo não parecer atraso.
create or replace function public.ajustar_hora_da_presenca()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.origem := old.origem;
    if new.status = 'chegou' and old.status = 'chegou' then
      new.marcado_presente_em := old.marcado_presente_em;
      return new;
    end if;
  end if;

  new.marcado_presente_em := case when new.status = 'chegou' then now() else null end;
  return new;
end;
$$;

alter table public.presencas drop column presente;
