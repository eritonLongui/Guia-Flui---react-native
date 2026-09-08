-- Rota / Guia Flui — schema, RLS, triggers e seed (Fase 2)

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  avatar text,
  reputacao numeric not null default 0,
  criado_em timestamptz not null default now()
);

create table public.stations (
  id text primary key,
  nome text not null,
  endereco text not null,
  cidade text not null,
  estado text not null,
  latitude double precision not null,
  longitude double precision not null,
  nota numeric not null default 0,
  quantidade_avaliacoes integer not null default 0,
  pontuacao_seguranca numeric not null,
  descricao_seguranca text not null,
  tempo_fila_minutos integer not null,
  tempo_carga_minutos integer not null,
  pontuacao_compatibilidade integer not null,
  pontuacao_recomendacao integer not null,
  nivel_compatibilidade text not null,
  nivel_seguranca text not null,
  tem_comida boolean not null default false,
  tem_banheiro boolean not null default false,
  tem_estacionamento boolean not null default false,
  aberto_agora boolean not null default true,
  horario_funcionamento text not null,
  horario_menor_movimento text not null,
  carregadores_disponiveis integer not null default 0,
  carregadores_total integer not null default 0,
  conectores jsonb not null default '[]'::jsonb,
  imagem_url text not null
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  station_id text not null references public.stations (id) on delete cascade,
  user_id uuid not null,
  nome_usuario text not null,
  nota integer not null check (nota between 1 and 5),
  comentario text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (user_id, station_id)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  station_id text not null references public.stations (id) on delete cascade,
  unique (user_id, station_id)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  marca text not null,
  modelo text not null,
  ano integer not null,
  capacidade_bateria numeric not null,
  autonomia_km integer not null,
  tipos_conector text[] not null default '{}',
  potencia_maxima_carregamento integer not null,
  ativo boolean not null default false
);

create index reviews_station_id_idx on public.reviews (station_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index favorites_user_id_idx on public.favorites (user_id);
create index vehicles_user_id_idx on public.vehicles (user_id);

-- Perfil criado automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nome',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'motorista'), '@', 1)
    ),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recalcula nota média da estação
create or replace function public.refresh_station_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sid text;
begin
  sid := coalesce(new.station_id, old.station_id);

  update public.stations
  set
    nota = coalesce(
      (select round(avg(nota)::numeric, 1) from public.reviews where station_id = sid),
      0
    ),
    quantidade_avaliacoes = (
      select count(*)::integer from public.reviews where station_id = sid
    )
  where id = sid;

  return null;
end;
$$;

create trigger reviews_refresh_station_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_station_rating();

create or replace function public.set_review_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_review_updated_at();

alter table public.profiles enable row level security;
alter table public.stations enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.vehicles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "stations_select_public"
  on public.stations for select
  using (true);

create policy "reviews_select_public"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "vehicles_select_own"
  on public.vehicles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "vehicles_insert_own"
  on public.vehicles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "vehicles_update_own"
  on public.vehicles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed: 12 eletropostos em São Paulo
insert into public.stations (
  id, nome, endereco, cidade, estado, latitude, longitude,
  pontuacao_seguranca, descricao_seguranca, tempo_fila_minutos, tempo_carga_minutos,
  pontuacao_compatibilidade, pontuacao_recomendacao, nivel_compatibilidade, nivel_seguranca,
  tem_comida, tem_banheiro, tem_estacionamento, aberto_agora, horario_funcionamento,
  horario_menor_movimento, carregadores_disponiveis, carregadores_total, conectores, imagem_url
) values
  (
    'ep-1', 'Eletroposto Pinheiros Premium', 'Av. Brigadeiro Faria Lima, 1000', 'São Paulo', 'SP',
    -23.5645, -46.6902, 4.7,
    'Área bem iluminada com vigilância 24h e movimentação constante.',
    5, 25, 95, 92, 'compativel', 'seguro',
    true, true, true, true, '24 horas', '14:00–16:00', 3, 4,
    '[{"tipo":"CCS2","potenciaKw":150,"quantidade":2},{"tipo":"Tipo 2","potenciaKw":22,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'
  ),
  (
    'ep-2', 'Charge Pinheiros', 'Rua dos Pinheiros, 750', 'São Paulo', 'SP',
    -23.5692, -46.6865, 4.5,
    'Local movimentado com boa iluminação noturna.',
    8, 30, 90, 88, 'compativel', 'seguro',
    true, true, false, true, '06:00 - 23:00', '09:00–11:00', 2, 3,
    '[{"tipo":"CCS2","potenciaKw":120,"quantidade":3}]'::jsonb,
    'https://images.unsplash.com/photo-1646148762218-9af0b4e307ec?w=800'
  ),
  (
    'ep-3', 'Pinheiros Fast Charge', 'Rua Teodoro Sampaio, 1440', 'São Paulo', 'SP',
    -23.5658, -46.6972, 4.3,
    'Estacionamento privado com câmeras de segurança.',
    12, 35, 85, 82, 'compativel', 'moderado',
    false, true, true, true, '24 horas', '15:00–17:00', 1, 2,
    '[{"tipo":"CCS2","potenciaKw":180,"quantidade":1},{"tipo":"Tipo 2","potenciaKw":22,"quantidade":1}]'::jsonb,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800'
  ),
  (
    'ep-4', 'Moema Green Station', 'Av. Ibirapuera, 3103', 'São Paulo', 'SP',
    -23.6038, -46.6638, 4.9,
    'Ambiente premium com segurança reforçada e área coberta.',
    3, 20, 98, 96, 'compativel', 'seguro',
    true, true, true, true, '24 horas', '14:00–16:00', 4, 5,
    '[{"tipo":"CCS2","potenciaKw":200,"quantidade":3},{"tipo":"Tipo 2","potenciaKw":22,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
  ),
  (
    'ep-5', 'Jardins Charge Hub', 'Rua Cardeal Arcoverde, 892', 'São Paulo', 'SP',
    -23.5712, -46.6892, 4.2,
    'Bairro residencial de alto padrão com boa visibilidade.',
    15, 40, 70, 75, 'parcial', 'moderado',
    true, false, true, false, '07:00 - 22:00', '09:00–11:00', 0, 2,
    '[{"tipo":"Tipo 2","potenciaKw":22,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'
  ),
  (
    'ep-6', 'Brooklin Power Station', 'Av. Santo Amaro, 5000', 'São Paulo', 'SP',
    -23.6107, -46.6889, 3.8,
    'Área com iluminação moderada, recomendado durante o dia.',
    20, 45, 60, 65, 'parcial', 'atencao',
    false, false, true, true, '08:00 - 20:00', '10:00–12:00', 1, 2,
    '[{"tipo":"CHAdeMO","potenciaKw":50,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'
  ),
  (
    'ep-7', 'Santana Express Charge', 'Av. Cruzeiro do Sul, 1100', 'São Paulo', 'SP',
    -23.5005, -46.6234, 4.0,
    'Próximo ao metrô com fluxo constante de pessoas.',
    10, 30, 88, 80, 'compativel', 'moderado',
    true, true, false, true, '06:00 - 22:00', '09:00–11:00', 2, 3,
    '[{"tipo":"CCS2","potenciaKw":100,"quantidade":3}]'::jsonb,
    'https://images.unsplash.com/photo-1646148762218-9af0b4e307ec?w=800'
  ),
  (
    'ep-8', 'Tatuapé EV Center', 'Rua Tuiuti, 515', 'São Paulo', 'SP',
    -23.5408, -46.5763, 4.6,
    'Shopping próximo com segurança integrada.',
    7, 28, 92, 90, 'compativel', 'seguro',
    true, true, true, true, '10:00 - 22:00', '14:00–16:00', 3, 4,
    '[{"tipo":"CCS2","potenciaKw":150,"quantidade":2},{"tipo":"Tipo 2","potenciaKw":22,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800'
  ),
  (
    'ep-9', 'Campo Belo Station', 'Av. Ibirapuera, 2332', 'São Paulo', 'SP',
    -23.6182, -46.6712, 4.1,
    'Condomínio comercial com acesso controlado.',
    18, 38, 75, 70, 'parcial', 'moderado',
    false, true, true, true, '07:00 - 21:00', '09:00–11:00', 1, 2,
    '[{"tipo":"CCS2","potenciaKw":80,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
  ),
  (
    'ep-10', 'Pinheiros Charge Point', 'Rua dos Pinheiros, 610', 'São Paulo', 'SP',
    -23.5662, -46.6948, 4.4,
    'Campus universitário com segurança no local.',
    5, 22, 40, 55, 'incompativel', 'seguro',
    true, true, true, true, '07:00 - 19:00', '10:00–12:00', 2, 3,
    '[{"tipo":"CHAdeMO","potenciaKw":50,"quantidade":3}]'::jsonb,
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'
  ),
  (
    'ep-11', 'Santo Amaro Mega Charge', 'Av. das Nações Unidas, 12901', 'São Paulo', 'SP',
    -23.6533, -46.7108, 4.5,
    'Centro empresarial com estacionamento coberto.',
    6, 26, 93, 89, 'compativel', 'seguro',
    true, true, true, true, '24 horas', '14:00–16:00', 5, 6,
    '[{"tipo":"CCS2","potenciaKw":250,"quantidade":4},{"tipo":"Tipo 2","potenciaKw":22,"quantidade":2}]'::jsonb,
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'
  ),
  (
    'ep-12', 'Lapa Riverside Charge', 'Rua Coriolano, 2100', 'São Paulo', 'SP',
    -23.5265, -46.7045, 3.5,
    'Área isolada à noite, prefira horários diurnos.',
    25, 50, 55, 50, 'incompativel', 'atencao',
    false, false, false, false, '08:00 - 18:00', '09:00–11:00', 0, 1,
    '[{"tipo":"Tipo 2","potenciaKw":7,"quantidade":1}]'::jsonb,
    'https://images.unsplash.com/photo-1646148762218-9af0b4e307ec?w=800'
  );

-- Avaliações de outros motoristas (user_id sintético, sem conta auth).
-- ep-3, ep-5, ep-6, ep-7, ep-9, ep-10 e ep-12 ficam sem review para o usuário logado avaliar.
insert into public.reviews (id, station_id, user_id, nome_usuario, nota, comentario, criado_em) values
  ('11111111-1111-4111-8111-111111111111', 'ep-1', '22222222-2222-4222-8222-222222222221', 'Carlos Mendes', 5, 'Carregamento rápido e local seguro. Banheiro limpo e cafeteria ao lado.', '2026-05-10T14:30:00Z'),
  ('11111111-1111-4111-8111-111111111112', 'ep-1', '22222222-2222-4222-8222-222222222222', 'Ana Paula', 4, 'Bom eletroposto, mas a fila pode demorar no horário de pico.', '2026-05-08T09:15:00Z'),
  ('11111111-1111-4111-8111-111111111113', 'ep-1', '22222222-2222-4222-8222-222222222223', 'Roberto Lima', 5, 'Excelente compatibilidade com meu BYD. Recomendo!', '2026-05-05T18:45:00Z'),
  ('11111111-1111-4111-8111-111111111114', 'ep-2', '22222222-2222-4222-8222-222222222224', 'Mariana Dias', 4, 'Fácil de achar e CCS2 funcionou de primeira.', '2026-05-14T12:10:00Z'),
  ('11111111-1111-4111-8111-111111111115', 'ep-2', '22222222-2222-4222-8222-222222222225', 'Pedro Nunes', 5, 'Gostei da iluminação e do comércio em volta.', '2026-05-13T19:40:00Z'),
  ('11111111-1111-4111-8111-111111111116', 'ep-4', '22222222-2222-4222-8222-222222222226', 'Fernanda Costa', 5, 'O melhor da região. Ambiente premium e carregadores potentes.', '2026-05-12T11:00:00Z'),
  ('11111111-1111-4111-8111-111111111117', 'ep-4', '22222222-2222-4222-8222-222222222227', 'Lucas Alves', 5, 'Sem fila e carga super rápida com CCS2 200kW.', '2026-05-11T16:20:00Z'),
  ('11111111-1111-4111-8111-111111111118', 'ep-4', '22222222-2222-4222-8222-222222222228', 'Juliana Rocha', 4, 'Ótimo local, preço um pouco acima da média.', '2026-05-09T08:30:00Z'),
  ('11111111-1111-4111-8111-111111111119', 'ep-8', '22222222-2222-4222-8222-222222222229', 'Thiago Martins', 5, 'Perto do shopping, dá para esperar a carga com conforto.', '2026-05-15T15:05:00Z'),
  ('11111111-1111-4111-8111-11111111111a', 'ep-8', '22222222-2222-4222-8222-22222222222a', 'Beatriz Cunha', 4, 'Bom, mas o horário encerra cedo para quem viaja à noite.', '2026-05-16T10:22:00Z'),
  ('11111111-1111-4111-8111-11111111111b', 'ep-11', '22222222-2222-4222-8222-22222222222b', 'Henrique Prado', 5, 'Potência absurda. Ideal para viagem longa.', '2026-05-17T08:50:00Z');
