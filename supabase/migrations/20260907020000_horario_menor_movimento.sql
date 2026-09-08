-- Horário de menor movimento cadastrado em cada eletroposto (não vem do Google).
alter table public.stations
  add column if not exists horario_menor_movimento text;

update public.stations
set horario_menor_movimento = case id
  when 'ep-1' then '14:00–16:00'
  when 'ep-2' then '09:00–11:00'
  when 'ep-3' then '15:00–17:00'
  when 'ep-4' then '14:00–16:00'
  when 'ep-5' then '09:00–11:00'
  when 'ep-6' then '10:00–12:00'
  when 'ep-7' then '09:00–11:00'
  when 'ep-8' then '14:00–16:00'
  when 'ep-9' then '09:00–11:00'
  when 'ep-10' then '10:00–12:00'
  when 'ep-11' then '14:00–16:00'
  when 'ep-12' then '09:00–11:00'
  else coalesce(horario_menor_movimento, '09:00–11:00')
end
where horario_menor_movimento is null or btrim(horario_menor_movimento) = '';

alter table public.stations
  alter column horario_menor_movimento set not null;
