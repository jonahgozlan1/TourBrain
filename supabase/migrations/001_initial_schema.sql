-- Tourbase initial schema
-- Source of truth: structured tour data (AI extracts into these tables)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tours (V1 UI is single-tour; table supports multi-tour later)
-- ---------------------------------------------------------------------------
create table public.tours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  artist_name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tours_user_id_idx on public.tours (user_id);

-- ---------------------------------------------------------------------------
-- Shows (core object)
-- ---------------------------------------------------------------------------
create type public.show_status as enum (
  'draft',
  'confirmed',
  'cancelled',
  'completed'
);

create table public.shows (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  date date not null,
  city text,
  country text,
  venue text,
  promoter text,
  status public.show_status not null default 'draft',
  load_in_time time,
  soundcheck_time time,
  doors_time time,
  show_time time,
  curfew time,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shows_tour_id_idx on public.shows (tour_id);
create index shows_date_idx on public.shows (date);

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.show_contacts (
  show_id uuid not null references public.shows (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  primary key (show_id, contact_id)
);

-- ---------------------------------------------------------------------------
-- Travel (flights / ground / rail)
-- ---------------------------------------------------------------------------
create type public.travel_type as enum (
  'flight',
  'train',
  'bus',
  'car',
  'other'
);

create table public.travel (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows (id) on delete cascade,
  type public.travel_type not null default 'flight',
  date date,
  departure text,
  arrival text,
  departure_time time,
  arrival_time time,
  confirmation_number text,
  notes text,
  created_at timestamptz not null default now()
);

create index travel_show_id_idx on public.travel (show_id);

-- ---------------------------------------------------------------------------
-- Hotels
-- ---------------------------------------------------------------------------
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows (id) on delete cascade,
  name text,
  address text,
  check_in date,
  check_out date,
  confirmation_number text,
  notes text,
  created_at timestamptz not null default now()
);

create index hotels_show_id_idx on public.hotels (show_id);

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------
create type public.document_type as enum (
  'contract',
  'flight',
  'hotel',
  'rider',
  'hospitality_rider',
  'email',
  'spreadsheet',
  'other'
);

create type public.extraction_status as enum (
  'pending',
  'processing',
  'ready_for_review',
  'applied',
  'failed'
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  show_id uuid references public.shows (id) on delete set null,
  file_url text not null,
  file_name text not null,
  document_type public.document_type not null default 'other',
  extraction_status public.extraction_status not null default 'pending',
  extracted_json jsonb,
  uploaded_at timestamptz not null default now()
);

create index documents_tour_id_idx on public.documents (tour_id);
create index documents_show_id_idx on public.documents (show_id);

-- ---------------------------------------------------------------------------
-- Extraction review queue (optional audit of AI proposals)
-- ---------------------------------------------------------------------------
create table public.extraction_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  proposed_payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tours_set_updated_at
before update on public.tours
for each row execute function public.set_updated_at();

create trigger shows_set_updated_at
before update on public.shows
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tours enable row level security;
alter table public.shows enable row level security;
alter table public.contacts enable row level security;
alter table public.show_contacts enable row level security;
alter table public.travel enable row level security;
alter table public.hotels enable row level security;
alter table public.documents enable row level security;
alter table public.extraction_reviews enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own tours"
  on public.tours for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage shows on own tours"
  on public.shows for all
  using (
    exists (
      select 1 from public.tours t
      where t.id = shows.tour_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tours t
      where t.id = shows.tour_id and t.user_id = auth.uid()
    )
  );

create policy "Users manage own contacts"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage show_contacts on own shows"
  on public.show_contacts for all
  using (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = show_contacts.show_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = show_contacts.show_id and t.user_id = auth.uid()
    )
  );

create policy "Users manage travel on own shows"
  on public.travel for all
  using (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = travel.show_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = travel.show_id and t.user_id = auth.uid()
    )
  );

create policy "Users manage hotels on own shows"
  on public.hotels for all
  using (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = hotels.show_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shows s
      join public.tours t on t.id = s.tour_id
      where s.id = hotels.show_id and t.user_id = auth.uid()
    )
  );

create policy "Users manage documents on own tours"
  on public.documents for all
  using (
    exists (
      select 1 from public.tours t
      where t.id = documents.tour_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tours t
      where t.id = documents.tour_id and t.user_id = auth.uid()
    )
  );

create policy "Users manage extraction reviews on own documents"
  on public.extraction_reviews for all
  using (
    exists (
      select 1
      from public.documents d
      join public.tours t on t.id = d.tour_id
      where d.id = extraction_reviews.document_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.documents d
      join public.tours t on t.id = d.tour_id
      where d.id = extraction_reviews.document_id and t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage bucket for tour documents (run in dashboard or via API)
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('tour-documents', 'tour-documents', false);
