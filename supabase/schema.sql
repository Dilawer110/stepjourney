create table profiles (
  id uuid primary key references auth.users(id),
  name text not null,
  role text not null default 'field' check (role in ('field','supervisor','admin')),
  created_at timestamptz default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,          -- e.g. "PIA Road"
  day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  order_booker_id uuid references profiles(id)
);

create table outlets (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  alternate_name text,
  channel text,
  sub_channel text,
  route_id uuid references routes(id),
  day text check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  order_booker_id uuid references profiles(id),
  latitude numeric,
  longitude numeric,
  photo_url text,
  is_new boolean default false,
  remarks text,
  created_at timestamptz default now()
);

create table outlet_visits (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references outlets(id) not null,
  order_booker_id uuid references profiles(id),
  visit_date date not null default current_date,
  status text not null check (status in ('visited','billed','not_found','closed','shifted')),
  latitude numeric,
  longitude numeric,
  visited_at timestamptz default now(),
  unique(outlet_id, visit_date)
);

create table competitor_surveys (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references outlets(id) not null,
  user_id uuid references profiles(id),
  survey_date date default current_date,
  competitor text,
  brand_product text,
  weight_g numeric,
  retail_price numeric,
  trade_price numeric,
  net_cost numeric,
  remarks text,
  created_at timestamptz default now()
);

create table outlet_assets (
  outlet_id uuid primary key references outlets(id),
  stand boolean default false,
  countertop boolean default false,
  wall_hanging_basket boolean default false,
  other boolean default false,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table outlets enable row level security;
alter table outlet_visits enable row level security;
alter table competitor_surveys enable row level security;
alter table outlet_assets enable row level security;

create policy "read own profile" on profiles for select using (true);
create policy "read outlets" on outlets for select using (true);
create policy "manage own visits" on outlet_visits for all
  using (order_booker_id = auth.uid()) with check (order_booker_id = auth.uid());
create policy "read surveys" on competitor_surveys for select using (true);
create policy "manage own surveys" on competitor_surveys for insert with check (true);
create policy "manage assets" on outlet_assets for all using (true) with check (true);

-- Seed (8 sample outlets, no order_booker assigned yet - visible to any logged-in user for MVP testing)
insert into routes (id, name, day) values
 ('11111111-1111-1111-1111-111111111111','PIA Road','Wednesday');

insert into outlets (code, name, channel, sub_channel, route_id, day, latitude, longitude) values
 ('N00000123','Al Madina Store','General Store','Grocery','11111111-1111-1111-1111-111111111111','Wednesday',31.5204,74.3587),
 ('N00000124','Muhammad General Store','General Store','Grocery','11111111-1111-1111-1111-111111111111','Wednesday',31.5210,74.3590),
 ('N00000125','City Mart','Mini Mart','Retail','11111111-1111-1111-1111-111111111111','Wednesday',31.5220,74.3600),
 ('N00000126','Fresh Point','General Store','Grocery','11111111-1111-1111-1111-111111111111','Wednesday',31.5230,74.3610),
 ('N00000127','Al Karim Traders','Wholesale','Distribution','11111111-1111-1111-1111-111111111111','Wednesday',31.5240,74.3620),
 ('N00000128','Zainab Store','General Store','Grocery','11111111-1111-1111-1111-111111111111','Wednesday',31.5250,74.3630),
 ('N00000129','Bilal Karyana','General Store','Grocery','11111111-1111-1111-1111-111111111111','Wednesday',31.5260,74.3640),
 ('N00000130','Sunrise Mart','Mini Mart','Retail','11111111-1111-1111-1111-111111111111','Wednesday',31.5270,74.3650);
