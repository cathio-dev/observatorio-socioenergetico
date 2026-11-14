-- Observatório Socioenergético de Salvador
-- Execute no SQL Editor do projeto Supabase antes de importar o seed.
create table if not exists public.territories (
  code text primary key,
  name text not null,
  parent_name text not null,
  geography_level text not null check (geography_level in ('bairro','município','estado','país','setor censitário')),
  area_km2 numeric
);

create table if not exists public.sources (
  code text primary key,
  institution text not null,
  title text not null,
  url text not null,
  accessed_on date not null default current_date
);

create table if not exists public.indicators (
  code text primary key,
  name text not null,
  unit text not null,
  dimension text not null,
  description text not null,
  classification text not null check (classification in ('observado','derivado','proxy')),
  formula text,
  limitations text not null
);

create table if not exists public.observations (
  id bigint generated always as identity primary key,
  territory_code text not null references public.territories(code),
  indicator_code text not null references public.indicators(code),
  source_code text not null references public.sources(code),
  year integer not null,
  value numeric not null,
  classification text not null check (classification in ('observado','derivado','proxy')),
  definition text not null,
  geography text not null,
  limitations text not null,
  unique (territory_code, indicator_code, source_code, year)
);

create index if not exists observations_filter_idx
  on public.observations (territory_code, year, indicator_code);

alter table public.territories enable row level security;
alter table public.sources enable row level security;
alter table public.indicators enable row level security;
alter table public.observations enable row level security;

drop policy if exists "Public read territories" on public.territories;
create policy "Public read territories" on public.territories for select to anon, authenticated using (true);
drop policy if exists "Public read sources" on public.sources;
create policy "Public read sources" on public.sources for select to anon, authenticated using (true);
drop policy if exists "Public read indicators" on public.indicators;
create policy "Public read indicators" on public.indicators for select to anon, authenticated using (true);
drop policy if exists "Public read observations" on public.observations;
create policy "Public read observations" on public.observations for select to anon, authenticated using (true);

create or replace view public.dashboard_observations
with (security_invoker = true)
as
select
  o.territory_code,
  o.source_code,
  t.name as territory_name,
  t.geography_level as geography,
  o.indicator_code,
  i.name as indicator_name,
  i.unit,
  o.year,
  o.value,
  s.institution || ' - ' || s.title as source,
  s.url as source_url,
  o.classification,
  o.definition,
  o.limitations
from public.observations o
join public.territories t using (territory_code)
join public.indicators i using (indicator_code)
join public.sources s using (source_code);

grant select on public.territories, public.sources, public.indicators, public.observations, public.dashboard_observations to anon, authenticated;
