-- 1. users
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    phone text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. courier_companies
create table if not exists public.courier_companies (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    code text unique not null,
    logo_url text,
    website text,
    tracking_url text,
    active boolean default true,
    created_at timestamptz default now()
);

-- Örnek kargo firmaları ekleme
insert into public.courier_companies (name, code)
values 
    ('Aras Kargo', 'aras'),
    ('Yurtiçi Kargo', 'yurtici'),
    ('MNG Kargo', 'mng'),
    ('PTT Kargo', 'ptt'),
    ('UPS Kargo', 'ups')
on conflict (code) do nothing;

-- 3. shipments
create table if not exists public.shipments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade,
    company_id uuid references public.courier_companies(id),
    tracking_number text not null,
    title text,
    sender text,
    receiver text,
    current_status text,
    last_location text,
    estimated_delivery date,
    delivered_at timestamptz,
    is_archived boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. shipment_events
create table if not exists public.shipment_events (
    id uuid default gen_random_uuid() primary key,
    shipment_id uuid references public.shipments(id) on delete cascade,
    status text not null,
    description text,
    location text,
    event_time timestamptz,
    created_at timestamptz default now()
);

-- 5. notifications
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade,
    shipment_id uuid references public.shipments(id) on delete cascade,
    title text,
    body text,
    is_read boolean default false,
    created_at timestamptz default now()
);

-- 6. favorites
create table if not exists public.favorites (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade,
    shipment_id uuid references public.shipments(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, shipment_id)
);

-- 7. user_settings
create table if not exists public.user_settings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid unique references public.users(id) on delete cascade,
    language text default 'tr',
    theme text default 'system',
    notifications_enabled boolean default true,
    biometric_enabled boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- İndeksler
create index if not exists idx_shipments_user on public.shipments(user_id);
create index if not exists idx_shipments_tracking on public.shipments(tracking_number);
create index if not exists idx_shipments_company on public.shipments(company_id);
create index if not exists idx_events_shipment on public.shipment_events(shipment_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- Row Level Security (RLS) Etkinleştirme
alter table public.users enable row level security;
alter table public.courier_companies enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;
alter table public.user_settings enable row level security;

-- RLS Politikaları
-- courier_companies (Herkes okuyabilir)
create policy "Allow read access to courier companies" on public.courier_companies for select using (true);

-- users
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- shipments
create policy "Users can view own shipments" on public.shipments for select using (auth.uid() = user_id);
create policy "Users can insert own shipments" on public.shipments for insert with check (auth.uid() = user_id);
create policy "Users can update own shipments" on public.shipments for update using (auth.uid() = user_id);
create policy "Users can delete own shipments" on public.shipments for delete using (auth.uid() = user_id);

-- shipment_events
create policy "Users can view events for their shipments" on public.shipment_events for select using (
    exists (select 1 from public.shipments where id = shipment_events.shipment_id and user_id = auth.uid())
);
create policy "Users can insert events for their shipments" on public.shipment_events for insert with check (
    exists (select 1 from public.shipments where id = shipment_events.shipment_id and user_id = auth.uid())
);

-- notifications
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on public.notifications for delete using (auth.uid() = user_id);

-- favorites
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- user_settings
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);

-- Yeni kullanıcı kaydolduğunda otomatik public.users ve user_settings kaydı oluşturan tetikleyici (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
