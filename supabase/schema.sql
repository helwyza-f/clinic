create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  username text unique,
  role text not null default 'pasien' check (role in ('admin', 'dokter', 'pasien')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pasien (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  nik text unique,
  no_telepon text,
  tanggal_lahir date,
  jenis_kelamin text,
  alamat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dokter (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  nama_dokter text not null,
  spesialis text not null default 'Estetika & Kecantikan',
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kategori_perawatan (
  id uuid primary key default gen_random_uuid(),
  nama_kategori text not null unique,
  deskripsi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perawatan (
  id uuid primary key default gen_random_uuid(),
  kategori_id uuid not null references public.kategori_perawatan(id) on delete restrict,
  nama_perawatan text not null,
  harga_normal bigint not null default 0,
  harga_promo bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservasi (
  id uuid primary key default gen_random_uuid(),
  pasien_id uuid not null references auth.users(id) on delete cascade,
  dokter_id uuid not null references public.dokter(id) on delete restrict,
  tanggal date not null,
  jam text not null,
  keluhan text,
  status text not null default 'Menunggu'
    check (status in ('Menunggu', 'Dikonfirmasi', 'Selesai', 'Batal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rekam_medis (
  id uuid primary key default gen_random_uuid(),
  reservasi_id uuid not null unique references public.reservasi(id) on delete cascade,
  pasien_id uuid not null references auth.users(id) on delete cascade,
  diagnosa text not null default 'Menunggu Pemeriksaan',
  tindakan text,
  catatan_tambahan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.detail_tindakan (
  id uuid primary key default gen_random_uuid(),
  rekam_medis_id uuid not null references public.rekam_medis(id) on delete cascade,
  perawatan_id uuid not null references public.perawatan(id) on delete restrict,
  harga_saat_ini bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transaksi (
  id uuid primary key default gen_random_uuid(),
  rekam_medis_id uuid not null unique references public.rekam_medis(id) on delete cascade,
  total_harga bigint not null default 0,
  metode_pembayaran text not null,
  status_pembayaran text not null default 'Lunas'
    check (status_pembayaran in ('Lunas', 'Pending', 'Batal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  cta_text text not null default 'Booking Sekarang',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_pasien_full_name on public.pasien(full_name);
create index if not exists idx_pasien_nik on public.pasien(nik);
create index if not exists idx_dokter_nama on public.dokter(nama_dokter);
create index if not exists idx_perawatan_kategori on public.perawatan(kategori_id);
create index if not exists idx_reservasi_pasien on public.reservasi(pasien_id);
create index if not exists idx_reservasi_dokter_tanggal on public.reservasi(dokter_id, tanggal, jam);
create index if not exists idx_reservasi_tanggal on public.reservasi(tanggal);
create index if not exists idx_rekam_medis_pasien on public.rekam_medis(pasien_id);
create index if not exists idx_detail_tindakan_rm on public.detail_tindakan(rekam_medis_id);
create index if not exists idx_transaksi_created_at on public.transaksi(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_pasien_updated_at on public.pasien;
create trigger set_pasien_updated_at
before update on public.pasien
for each row execute function public.set_updated_at();

drop trigger if exists set_dokter_updated_at on public.dokter;
create trigger set_dokter_updated_at
before update on public.dokter
for each row execute function public.set_updated_at();

drop trigger if exists set_kategori_perawatan_updated_at on public.kategori_perawatan;
create trigger set_kategori_perawatan_updated_at
before update on public.kategori_perawatan
for each row execute function public.set_updated_at();

drop trigger if exists set_perawatan_updated_at on public.perawatan;
create trigger set_perawatan_updated_at
before update on public.perawatan
for each row execute function public.set_updated_at();

drop trigger if exists set_reservasi_updated_at on public.reservasi;
create trigger set_reservasi_updated_at
before update on public.reservasi
for each row execute function public.set_updated_at();

drop trigger if exists set_rekam_medis_updated_at on public.rekam_medis;
create trigger set_rekam_medis_updated_at
before update on public.rekam_medis
for each row execute function public.set_updated_at();

drop trigger if exists set_transaksi_updated_at on public.transaksi;
create trigger set_transaksi_updated_at
before update on public.transaksi
for each row execute function public.set_updated_at();

drop trigger if exists set_promos_updated_at on public.promos;
create trigger set_promos_updated_at
before update on public.promos
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
  new_full_name text;
  new_phone text;
begin
  new_role := coalesce(new.raw_user_meta_data->>'role', 'pasien');
  new_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  new_phone := new.raw_user_meta_data->>'no_telepon';

  insert into public.profiles (id, email, full_name, username, role)
  values (
    new.id,
    new.email,
    new_full_name,
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]+', '', 'g')),
    new_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    username = excluded.username,
    role = excluded.role;

  if new_role = 'pasien' then
    insert into public.pasien (auth_user_id, email, full_name, no_telepon)
    values (new.id, new.email, new_full_name, new_phone)
    on conflict (auth_user_id) do update
    set
      email = excluded.email,
      full_name = excluded.full_name,
      no_telepon = coalesce(excluded.no_telepon, public.pasien.no_telepon);
  elsif new_role = 'dokter' then
    insert into public.dokter (auth_user_id, nama_dokter, spesialis, email)
    values (
      new.id,
      new_full_name,
      coalesce(new.raw_user_meta_data->>'spesialis', 'Estetika & Kecantikan'),
      new.email
    )
    on conflict (auth_user_id) do update
    set
      nama_dokter = excluded.nama_dokter,
      spesialis = excluded.spesialis,
      email = excluded.email;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles disable row level security;
alter table public.pasien disable row level security;
alter table public.dokter disable row level security;
alter table public.kategori_perawatan disable row level security;
alter table public.perawatan disable row level security;
alter table public.reservasi disable row level security;
alter table public.rekam_medis disable row level security;
alter table public.detail_tindakan disable row level security;
alter table public.transaksi disable row level security;
alter table public.promos disable row level security;

insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view banners" on storage.objects;
create policy "Public can view banners"
on storage.objects
for select
to public
using (bucket_id = 'banners');

drop policy if exists "Authenticated can upload banners" on storage.objects;
create policy "Authenticated can upload banners"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'banners');

drop policy if exists "Authenticated can update banners" on storage.objects;
create policy "Authenticated can update banners"
on storage.objects
for update
to authenticated
using (bucket_id = 'banners')
with check (bucket_id = 'banners');

drop policy if exists "Authenticated can delete banners" on storage.objects;
create policy "Authenticated can delete banners"
on storage.objects
for delete
to authenticated
using (bucket_id = 'banners');

insert into public.kategori_perawatan (nama_kategori, deskripsi)
values
  ('Skinbooster', 'Perawatan hidrasi dan perbaikan tekstur kulit.'),
  ('PRP Treatment', 'Perawatan regeneratif berbasis plasma darah.'),
  ('Botox Class', 'Perawatan relaksasi otot wajah dan contouring.'),
  ('Facial Care', 'Perawatan facial dan deep cleansing.')
on conflict (nama_kategori) do nothing;

insert into public.perawatan (kategori_id, nama_perawatan, harga_normal, harga_promo, is_active)
select kp.id, seed.nama_perawatan, seed.harga_normal, seed.harga_promo, true
from (
  values
    ('Skinbooster', 'Skinbooster Basic', 350000, 310000),
    ('PRP Treatment', 'PRP Wajah', 350000, 310000),
    ('Botox Class', 'Botox Basic', 300000, 250000),
    ('Facial Care', 'Facial Glow', 150000, 110000)
) as seed(kategori, nama_perawatan, harga_normal, harga_promo)
join public.kategori_perawatan kp on kp.nama_kategori = seed.kategori
where not exists (
  select 1
  from public.perawatan p
  where p.nama_perawatan = seed.nama_perawatan
);

-- Setelah script ini jalan, buat 1 akun admin manual dari Supabase Auth:
-- 1. Authentication > Users > Add user
-- 2. Isi email/password admin
-- 3. Pada SQL Editor, jalankan:
--    update public.profiles
--    set role = 'admin', full_name = 'Administrator'
--    where email = 'email-admin-anda';
