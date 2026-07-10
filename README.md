# D'Aesthetic Clinic

Sistem informasi klinik kecantikan berbasis `Next.js` dan `Supabase` untuk mengelola:

- autentikasi multi-role
- dashboard admin, dokter, dan pasien
- reservasi dan antrean
- rekam medis
- billing dan riwayat transaksi
- master layanan/perawatan
- promo banner

Project ini sudah bukan starter template Supabase biasa. Beberapa file bawaan starter masih ada, tetapi aplikasi utamanya adalah sistem operasional klinik.

## Ringkasan

Stack utama:

- `Next.js` App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Realtime`
- `Supabase Storage`

Role yang digunakan:

- `admin`
- `dokter`
- `pasien`

## Fitur Utama

### Admin

- melihat dashboard ringkasan harian
- membuat reservasi untuk pasien
- melihat dan mengubah status antrean
- mengelola data pasien
- mengelola data dokter
- mengelola kategori perawatan dan layanan
- melihat rekam medis
- memproses pembayaran
- melihat riwayat transaksi
- melihat laporan aktivitas klinik
- mengelola banner promo

### Dokter

- melihat antrean pasien
- mengubah status kunjungan
- mengisi dan memperbarui rekam medis
- melihat riwayat pasien

### Pasien

- registrasi dan login
- membuat reservasi
- melihat dashboard kunjungan hari ini
- melihat riwayat reservasi
- membatalkan reservasi tertentu
- melihat detail rekam medis yang sudah selesai
- memperbarui profil

## Arsitektur Singkat

### Frontend

- `app/` memakai App Router
- `components/` berisi komponen reusable dan `shadcn/ui`
- `lib/` berisi utilitas umum dan helper Supabase

### Backend

Backend utama memakai Supabase:

- `Auth` untuk login/logout dan manajemen user
- `Database` untuk data aplikasi
- `Storage` untuk banner promo
- `Realtime` untuk pembaruan data antrean dan dashboard

### Proteksi Akses

Proteksi route dilakukan lewat:

- [`proxy.ts`](./proxy.ts)
- [`lib/supabase/proxy.ts`](./lib/supabase/proxy.ts)

Logika utamanya:

- user belum login diarahkan ke `/auth/login`
- user login tidak boleh masuk ke dashboard role lain
- halaman `/auth/*` akan diarahkan ke dashboard role jika user sudah login

## Struktur Folder

Struktur penting:

```text
app/
  (dashboard)/
    admin/
    dokter/
    pasien/
  actions/
  auth/
components/
  ui/
lib/
  supabase/
  utils/
supabase/
  schema.sql
```

Keterangan:

- `app/(dashboard)/admin` berisi halaman admin
- `app/(dashboard)/dokter` berisi halaman dokter
- `app/(dashboard)/pasien` berisi halaman pasien
- `app/actions` berisi server action yang memakai service role
- `lib/supabase` berisi client/server/proxy helper Supabase
- `supabase/schema.sql` berisi bootstrap schema database

## Database

Schema bootstrap ada di:

- [`supabase/schema.sql`](./supabase/schema.sql)

Table utama yang dipakai aplikasi:

- `profiles`
- `pasien`
- `dokter`
- `kategori_perawatan`
- `perawatan`
- `reservasi`
- `rekam_medis`
- `detail_tindakan`
- `transaksi`
- `promos`

Relasi bisnis utama:

- `profiles.id -> auth.users.id`
- `pasien.auth_user_id -> auth.users.id`
- `dokter.auth_user_id -> auth.users.id`
- `reservasi.pasien_id -> pasien.auth_user_id`
- `reservasi.dokter_id -> dokter.id`
- `rekam_medis.reservasi_id -> reservasi.id`
- `rekam_medis.pasien_id -> pasien.auth_user_id`
- `detail_tindakan.rekam_medis_id -> rekam_medis.id`
- `detail_tindakan.perawatan_id -> perawatan.id`
- `transaksi.rekam_medis_id -> rekam_medis.id`

## Setup Lokal

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan environment

Copy `.env.example` menjadi `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_FONNTE_TOKEN=your-fonnte-token
```

Catatan:

- `SUPABASE_SERVICE_ROLE_KEY` wajib untuk server action pembuatan akun dokter dan pasien
- `NEXT_PUBLIC_FONNTE_TOKEN` hanya dipakai untuk fitur WhatsApp reminder, dan saat ini implementasinya masih berada di sisi client sehingga belum ideal untuk production

### 3. Siapkan database Supabase

Di SQL Editor Supabase:

1. jalankan seluruh isi [`supabase/schema.sql`](./supabase/schema.sql)
2. jika perlu, tambahkan seed layanan tambahan secara manual
3. buat user admin pertama lewat `Authentication > Users`
4. ubah role admin di tabel `profiles`

Contoh query untuk menjadikan user sebagai admin:

```sql
update public.profiles
set role = 'admin', full_name = 'Administrator'
where email = 'email-admin-anda';
```

### 4. Jalankan aplikasi

```bash
npm run dev
```

Lalu buka:

- [http://localhost:3000](http://localhost:3000)

## Deployment Vercel

Environment variable yang harus di-set di Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_FONNTE_TOKEN`

Set minimal di environment:

- `Production`
- `Preview`

Jika memakai Vercel untuk development cloud preview, set juga di `Development`.

Setelah mengubah env:

1. simpan perubahan di Vercel
2. lakukan redeploy

## Alur Auth dan Role

### Registrasi Pasien

Registrasi dari halaman publik akan membuat user Auth Supabase dengan metadata role `pasien`.

Trigger database `handle_new_user()` akan:

- membuat row di `profiles`
- membuat row di `pasien`

### Pembuatan Akun Pasien oleh Admin

Admin membuat pasien lewat modal admin.

Flow:

1. server action membuat user di Supabase Auth
2. metadata role diisi `pasien`
3. data profil pasien dilengkapi di tabel `pasien`

File penting:

- [`app/actions/pasien.ts`](./app/actions/pasien.ts)

### Pembuatan Akun Dokter oleh Admin

Admin membuat dokter lewat modal admin.

Flow:

1. server action membuat user di Supabase Auth
2. metadata role diisi `dokter`
3. data dokter di-upsert ke tabel `dokter`
4. data profil dasar di-upsert ke `profiles`

File penting:

- [`app/actions/dokter.ts`](./app/actions/dokter.ts)

### Login

Saat login:

1. user login dengan email/password
2. aplikasi membaca `profiles.role`
3. metadata auth user di-update agar middleware/proxy tahu role terbaru
4. user diarahkan ke dashboard sesuai role

File penting:

- [`components/login-form.tsx`](./components/login-form.tsx)
- [`lib/supabase/proxy.ts`](./lib/supabase/proxy.ts)

## Alur Reservasi dan Rekam Medis

### Reservasi dari Pasien atau Admin

Saat reservasi dibuat:

1. insert ke `reservasi`
2. insert otomatis lanjutan ke `rekam_medis`
3. jika ada layanan dipilih, insert ke `detail_tindakan`

File penting:

- [`app/(dashboard)/pasien/reservasi/page.tsx`](./app/(dashboard)/pasien/reservasi/page.tsx)
- [`app/(dashboard)/admin/jadwal/_component/reservasi-modal.tsx`](./app/(dashboard)/admin/jadwal/_component/reservasi-modal.tsx)

### Pemeriksaan Dokter

Dokter mengubah status dan melengkapi:

- `diagnosa`
- `tindakan`
- `catatan_tambahan`
- item `detail_tindakan`

File penting:

- [`app/(dashboard)/dokter/antrean/page.tsx`](./app/(dashboard)/dokter/antrean/page.tsx)
- [`app/(dashboard)/dokter/_component/rekam-medis-modal.tsx`](./app/(dashboard)/dokter/_component/rekam-medis-modal.tsx)

### Billing

Data billing admin diambil dari:

- `rekam_medis` yang diagnosanya bukan `Menunggu Pemeriksaan`
- belum punya row transaksi

File penting:

- [`app/(dashboard)/admin/transaksi/page.tsx`](./app/(dashboard)/admin/transaksi/page.tsx)
- [`app/(dashboard)/admin/transaksi/_components/bayar-modal.tsx`](./app/(dashboard)/admin/transaksi/_components/bayar-modal.tsx)

## Realtime

Beberapa halaman berlangganan Supabase Realtime:

- dashboard pasien
- jadwal admin
- billing admin
- antrean dokter
- riwayat pasien

Tujuannya agar update status dan data kunjungan muncul tanpa refresh manual.

## Storage

Bucket yang dipakai:

- `banners`

Dipakai untuk upload gambar promo admin.

File penting:

- [`app/(dashboard)/admin/promo/_components/promo-modal-form.tsx`](./app/(dashboard)/admin/promo/_components/promo-modal-form.tsx)

## Seed Layanan

`schema.sql` hanya berisi seed awal minimal.

Jika butuh katalog perawatan lebih banyak:

- tambahkan data lewat SQL Editor
- atau gunakan UI admin `Perawatan`

Tabel terkait:

- `kategori_perawatan`
- `perawatan`

## Known Issues

### 1. README starter sebelumnya tidak sesuai aplikasi

Sudah diganti dengan dokumentasi project ini.

### 2. Lint belum bersih

`npm run lint` saat ini belum bisa dianggap health check final karena:

- banyak issue lama di codebase
- folder `.next` bisa ikut terbaca pada kondisi tertentu

Jadi lint belum boleh dijadikan indikator tunggal apakah aplikasi rusak atau tidak.

### 3. Fitur WhatsApp reminder belum production-safe

Implementasi Fonnte masih mengandalkan token publik di sisi client:

- [`lib/utils/fonnte.ts`](./lib/utils/fonnte.ts)

Idealnya dipindahkan ke API route atau server action agar token tidak terekspos ke browser.

### 4. Konsistensi schema dan code harus dijaga

Beberapa bug sebelumnya berasal dari mismatch nama kolom, misalnya:

- `spesialis` vs `spesialisasi`
- foreign key `reservasi.pasien_id`
- trigger `handle_new_user()`

Jika mengubah nama kolom di database, pastikan:

1. code frontend
2. server action
3. schema SQL
4. query relation Supabase

semuanya ikut diperbarui.

## Troubleshooting

### User tidak bisa dibuat dari Supabase Auth

Kemungkinan:

- trigger `handle_new_user()` error
- schema `profiles` tidak sinkron

Cek:

```sql
select * from public.profiles order by created_at desc;
```

### Akun dokter gagal dibuat dari admin

Kemungkinan:

- `SUPABASE_SERVICE_ROLE_KEY` di Vercel salah
- kolom schema dokter tidak sinkron dengan code
- unique constraint email/auth user bentrok

File yang perlu dicek:

- [`app/actions/dokter.ts`](./app/actions/dokter.ts)

### Jadwal masuk database tapi tidak tampil di list

Kemungkinan:

- filter tanggal aktif
- relasi foreign key `reservasi.pasien_id` salah
- query embed Supabase gagal

File yang perlu dicek:

- [`app/(dashboard)/admin/jadwal/page.tsx`](./app/(dashboard)/admin/jadwal/page.tsx)

### Pasien bisa register tapi role/login salah arah

Cek:

- tabel `profiles.role`
- metadata user Supabase
- file [`lib/supabase/proxy.ts`](./lib/supabase/proxy.ts)

## File Penting

- [`package.json`](./package.json)
- [`proxy.ts`](./proxy.ts)
- [`lib/supabase/client.ts`](./lib/supabase/client.ts)
- [`lib/supabase/server.ts`](./lib/supabase/server.ts)
- [`lib/supabase/proxy.ts`](./lib/supabase/proxy.ts)
- [`app/actions/pasien.ts`](./app/actions/pasien.ts)
- [`app/actions/dokter.ts`](./app/actions/dokter.ts)
- [`supabase/schema.sql`](./supabase/schema.sql)

## Command Referensi

Install dependency:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Catatan Keamanan

- jangan commit `.env.local`
- jangan expose `SUPABASE_SERVICE_ROLE_KEY`
- jika key pernah dibagikan ke chat atau screenshot, segera rotate
- pertimbangkan memindahkan seluruh operasi sensitif ke server action atau route handler

## Lisensi

Belum ditentukan. Tambahkan `LICENSE` jika project ini ingin dibuka secara publik dengan lisensi tertentu.
