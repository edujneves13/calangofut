-- A hora da presença só muda quando o jogador passa de ausente para presente.
-- Assim, colar a lista de novo ou tocar "Presente" em quem já estava presente
-- não faz ninguém parecer que chegou depois do sorteio.
-- A origem (lista / na-hora) fica a de quando o jogador entrou pela primeira vez.

create function public.ajustar_hora_da_presenca()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.origem := old.origem;
    if new.presente and old.presente then
      new.marcado_presente_em := old.marcado_presente_em;
      return new;
    end if;
  end if;

  new.marcado_presente_em := case when new.presente then now() else null end;
  return new;
end;
$$;

create trigger presencas_hora
before insert or update on public.presencas
for each row execute function public.ajustar_hora_da_presenca();
