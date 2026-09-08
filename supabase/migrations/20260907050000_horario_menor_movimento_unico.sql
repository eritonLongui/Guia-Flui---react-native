-- Apenas um intervalo de menor movimento por eletroposto.
update public.stations
set horario_menor_movimento = btrim(split_part(horario_menor_movimento, ' e ', 2))
where horario_menor_movimento like '% e %';
