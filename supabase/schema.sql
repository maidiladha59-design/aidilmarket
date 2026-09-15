-- =========================================================
-- AIDIL STORE — Skema Database (Fase 1)
-- Jalankan di Supabase SQL Editor, urut dari atas ke bawah.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- ENUM
-- ---------------------------------------------------------
create type admin_role as enum ('SUPER_ADMIN', 'ADMIN', 'STAFF');
create type price_type as enum ('fixed', 'per_page', 'per_slide', 'per_question', 'per_sheet', 'custom');
create type material_status as enum ('available', 'unavailable');
create type order_status as enum (
  'PENDING_PAYMENT',
  'PAYMENT_REVIEW',
  'PAYMENT_VERIFIED',
  'PROCESSING',
  'REVISION_REQUESTED',
  'REVISION_PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED'
);
create type payment_status as enum ('WAITING_PAYMENT', 'PAYMENT_REVIEW', 'PAYMENT_VERIFIED', 'PAYMENT_REJECTED');
create type payment_method_type as enum ('bank_jago', 'dana', 'gopay', 'qris');
create type discount_type as enum ('percentage', 'fixed');
create type wallet_transaction_type as enum ('topup', 'purchase', 'refund', 'adjustment');
create type chat_message_type as enum ('text', 'image', 'document');

-- ---------------------------------------------------------
-- PROFILES (1:1 dengan auth.users, untuk customer)
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  whatsapp text,
  wallet_balance numeric(14,2) not null default 0, -- read model; sumber kebenaran tetap wallet_ledger
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Otomatis membuat baris profiles setiap ada user baru daftar (email/password
-- maupun Google OAuth) — tanpa ini, login akan berhasil tapi data profil kosong.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------
-- ADMIN USERS (terpisah dari customer, login via /admin/login)
-- ---------------------------------------------------------
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role admin_role not null default 'STAFF',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- KATEGORI
-- ---------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PRODUK
-- ---------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  price_type price_type not null default 'fixed',
  base_price numeric(14,2) not null default 0,
  price_unit text, -- contoh: "halaman", "slide", "sheet", "soal"
  estimated_time text, -- contoh: "1-2 hari kerja"
  revision_limit integer not null default 0,
  is_digital boolean not null default false, -- false = jasa, true = produk digital (Bagian 24)
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  popular boolean not null default false,
  image text,
  gallery jsonb not null default '[]'::jsonb,
  express_fee_percent numeric(5,2), -- null = tidak ada express fee untuk produk ini
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on products(category_id);
create index idx_products_status on products(status);

-- Variasi produk (Bagian 9) — contoh: "Sudah ada materi" vs "Belum ada materi"
create table product_variations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price numeric(14,2) not null,
  description text,
  extra_fee numeric(14,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

-- Field konfigurasi dinamis per produk (Bagian 14) — jumlah halaman, slide, dst.
create table product_configuration_fields (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  field_key text not null, -- contoh: "jumlah_slide"
  field_label text not null, -- contoh: "Jumlah Slide"
  field_type text not null check (field_type in ('number', 'text', 'select', 'textarea', 'date')),
  options jsonb, -- untuk field_type = 'select'
  is_required boolean not null default true,
  sort_order integer not null default 0
);

-- Produk digital: file & batas download (Bagian 24-26)
create table digital_product_files (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null, -- path di bucket privat Supabase Storage, BUKAN URL publik
  file_name text not null,
  file_size_bytes bigint,
  download_limit integer, -- null = tanpa batas
  expires_at timestamptz, -- null = tidak kedaluwarsa
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table wishlists enable row level security;
create policy "wishlist milik sendiri" on wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- BANNERS (Bagian 4 & 39 — dikelola admin, tampil di homepage)
-- ---------------------------------------------------------
create table banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table banners enable row level security;
create policy "banner aktif dapat dibaca publik" on banners
  for select using (is_active = true);


create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variation_id uuid references product_variations(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  configuration jsonb not null default '{}'::jsonb, -- jawaban field konfigurasi
  material_status material_status not null default 'unavailable',
  material_text text,
  material_files jsonb not null default '[]'::jsonb, -- array path storage
  deadline_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- VOUCHER & PROMO (Bagian 18-19)
-- ---------------------------------------------------------
create table vouchers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null,
  discount_amount numeric(14,2) not null,
  minimum_purchase numeric(14,2) not null default 0,
  maximum_discount numeric(14,2),
  start_date timestamptz not null,
  end_date timestamptz not null,
  usage_limit integer, -- null = tanpa batas total
  user_usage_limit integer not null default 1,
  applicable_product_ids uuid[] default '{}',
  applicable_category_ids uuid[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table voucher_usages (
  id uuid primary key default uuid_generate_v4(),
  voucher_id uuid not null references vouchers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid, -- diisi FK setelah tabel orders dibuat (lihat alter di bawah)
  used_at timestamptz not null default now()
);

create table promos (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('product_promo', 'flash_sale', 'discount_campaign', 'bundle', 'student_promo')),
  name text not null,
  description text,
  product_ids uuid[] default '{}',
  discount_type discount_type,
  discount_amount numeric(14,2),
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PAYMENT METHODS (dikelola admin, Bagian 20)
-- ---------------------------------------------------------
create table payment_methods (
  id uuid primary key default uuid_generate_v4(),
  type payment_method_type not null unique,
  is_enabled boolean not null default true,
  account_number text, -- untuk bank_jago/dana/gopay
  account_name text,
  qris_image_url text, -- untuk qris
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique, -- contoh: AS-20260913-0001, digenerate di aplikasi
  user_id uuid not null references profiles(id) on delete restrict,
  status order_status not null default 'PENDING_PAYMENT',
  subtotal numeric(14,2) not null default 0,
  express_fee numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  voucher_id uuid references vouchers(id) on delete set null,
  total numeric(14,2) not null default 0,
  customer_agreement boolean not null default false, -- Bagian 17: persetujuan data benar
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);

alter table voucher_usages
  add constraint voucher_usages_order_fk foreign key (order_id) references orders(id) on delete set null;

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  variation_id uuid references product_variations(id) on delete set null,
  product_name_snapshot text not null, -- snapshot supaya histori aman walau produk diedit
  quantity integer not null default 1,
  unit_price numeric(14,2) not null,
  configuration jsonb not null default '{}'::jsonb,
  material_status material_status not null default 'unavailable',
  material_text text,
  material_files jsonb not null default '[]'::jsonb,
  deadline_at timestamptz,
  notes text,
  revision_used integer not null default 0,
  revision_limit integer not null default 0,
  result_files jsonb not null default '[]'::jsonb, -- hasil pengerjaan dari admin (Bagian 31)
  created_at timestamptz not null default now()
);
create index idx_order_items_order on order_items(order_id);

create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  changed_by uuid, -- admin_users.id, null jika perubahan sistem
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- REVISI (Bagian 32)
-- ---------------------------------------------------------
create table order_revisions (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  description text not null,
  files jsonb not null default '[]'::jsonb,
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PEMBAYARAN (manual, Bagian 21) — siap diperluas ke gateway (Bagian 22)
-- ---------------------------------------------------------
create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method_type not null,
  amount numeric(14,2) not null,
  status payment_status not null default 'WAITING_PAYMENT',
  proof_file_url text, -- path storage bukti transfer
  rejection_reason text,
  verified_by uuid, -- admin_users.id
  verified_at timestamptz,
  -- Kolom di bawah ini kosong untuk pembayaran manual, disiapkan untuk
  -- payment gateway otomatis di Fase 3 (Bagian 22) tanpa perlu migrasi baru.
  gateway_provider text,
  gateway_reference_id text,
  gateway_raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index idx_payments_order on payments(order_id);

-- ---------------------------------------------------------
-- WALLET / SALDO (ledger, Bagian 23) — jangan pernah update saldo langsung
-- ---------------------------------------------------------
create table wallet_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type wallet_transaction_type not null,
  amount numeric(14,2) not null, -- positif = menambah saldo, negatif = mengurangi
  balance_after numeric(14,2) not null, -- hasil akumulasi saat baris ini dibuat
  reference_order_id uuid references orders(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index idx_wallet_ledger_user on wallet_ledger(user_id);

-- ---------------------------------------------------------
-- DOWNLOAD PRODUK DIGITAL (Bagian 25-26)
-- ---------------------------------------------------------
create table digital_product_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CHAT PER ORDER (Bagian 30)
-- ---------------------------------------------------------
create table order_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'admin')),
  sender_id uuid not null,
  message_type chat_message_type not null default 'text',
  content text, -- untuk text
  file_url text, -- untuk image/document
  created_at timestamptz not null default now()
);
create index idx_chat_order on order_chat_messages(order_id);

-- ---------------------------------------------------------
-- REVIEW (Bagian 33)
-- ---------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now()
);
create index idx_reviews_product on reviews(product_id) where status = 'approved';
create unique index uq_reviews_order_item_user on reviews(order_item_id, user_id);

-- ---------------------------------------------------------
-- NOTIFIKASI (Bagian 34)
-- ---------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  reference_order_id uuid references orders(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id) where is_read = false;

-- =========================================================
-- ROW LEVEL SECURITY — Fase 1 (kebijakan lanjutan ditambah per fitur)
-- =========================================================
alter table profiles enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table wallet_ledger enable row level security;
alter table order_chat_messages enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table digital_product_purchases enable row level security;
alter table admin_users enable row level security;

-- Semua tabel yang berisi data bisnis/internal wajib RLS.
alter table product_variations enable row level security;
alter table product_configuration_fields enable row level security;
alter table digital_product_files enable row level security;
alter table vouchers enable row level security;
alter table voucher_usages enable row level security;
alter table promos enable row level security;
alter table payment_methods enable row level security;
alter table order_status_history enable row level security;
alter table order_revisions enable row level security;

create policy "admin dapat melihat baris dirinya sendiri" on admin_users
  for select using (auth.uid() = id);
-- Sengaja tidak ada policy insert/update/delete untuk admin_users — akun admin
-- hanya dibuat/diubah lewat service role (admin.ts), tidak bisa self-service.


-- Produk & kategori: dapat dibaca publik (untuk katalog), tulis hanya via service role (admin)
alter table products enable row level security;
alter table categories enable row level security;

create policy "profil milik sendiri" on profiles
  for select using (auth.uid() = id);
create policy "update profil milik sendiri" on profiles
  for update using (auth.uid() = id);

-- Batasi kolom yang boleh diubah customer. wallet_balance dan is_suspended
-- hanya boleh dimutasi oleh server/admin.
revoke update on profiles from anon, authenticated;
grant update (full_name, avatar_url, whatsapp, updated_at) on profiles to authenticated;

create policy "produk published dapat dibaca publik" on products
  for select using (status = 'published');
create policy "kategori aktif dapat dibaca publik" on categories
  for select using (is_active = true);

create policy "cart milik sendiri" on cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "order milik sendiri - lihat" on orders
  for select using (auth.uid() = user_id);
create policy "order milik sendiri - buat" on orders
  for insert with check (auth.uid() = user_id);

create policy "order item ikut order milik sendiri" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );

create policy "payment ikut order milik sendiri" on payments
  for select using (
    exists (select 1 from orders o where o.id = payments.order_id and o.user_id = auth.uid())
  );

create policy "wallet ledger milik sendiri" on wallet_ledger
  for select using (auth.uid() = user_id);

create policy "chat hanya order milik sendiri" on order_chat_messages
  for select using (
    exists (select 1 from orders o where o.id = order_chat_messages.order_id and o.user_id = auth.uid())
  );
create policy "kirim chat di order milik sendiri" on order_chat_messages
  for insert with check (
    sender_type = 'customer' and sender_id = auth.uid() and
    exists (select 1 from orders o where o.id = order_chat_messages.order_id and o.user_id = auth.uid())
  );

create policy "review milik sendiri - buat" on reviews
  for insert with check (auth.uid() = user_id);
create policy "review approved dapat dibaca publik" on reviews
  for select using (status = 'approved' or auth.uid() = user_id);

create policy "notifikasi milik sendiri" on notifications
  for select using (auth.uid() = user_id);
create policy "notifikasi milik sendiri - update dibaca" on notifications
  for update using (auth.uid() = user_id);

create policy "purchase digital milik sendiri" on digital_product_purchases
  for select using (auth.uid() = user_id);

-- Katalog publik: variasi & field konfigurasi hanya untuk produk published.
create policy "variasi produk published dapat dibaca publik" on product_variations
  for select using (
    is_active = true and exists (
      select 1 from products p
      where p.id = product_variations.product_id and p.status = 'published'
    )
  );

create policy "field konfigurasi produk published dapat dibaca publik" on product_configuration_fields
  for select using (
    exists (
      select 1 from products p
      where p.id = product_configuration_fields.product_id and p.status = 'published'
    )
  );

-- Payment method publik hanya boleh dibaca. Mutasi tetap service role/admin.
create policy "metode pembayaran aktif dapat dibaca publik" on payment_methods
  for select using (is_enabled = true);

-- Riwayat status & revisi hanya dapat dilihat oleh pemilik order.
create policy "status history milik order sendiri" on order_status_history
  for select using (
    exists (select 1 from orders o where o.id = order_status_history.order_id and o.user_id = auth.uid())
  );

create policy "revisi milik order sendiri - lihat" on order_revisions
  for select using (
    exists (
      select 1 from order_items oi
      join orders o on o.id = oi.order_id
      where oi.id = order_revisions.order_item_id and o.user_id = auth.uid()
    )
  );

-- Customer hanya boleh membuat revisi pada item miliknya yang sudah selesai.
create policy "revisi milik sendiri - buat" on order_revisions
  for insert with check (
    exists (
      select 1
      from order_items oi
      join orders o on o.id = oi.order_id
      where oi.id = order_revisions.order_item_id
        and o.user_id = auth.uid()
        and o.status = 'COMPLETED'
        and oi.revision_used < oi.revision_limit
    )
  );

-- Voucher usage tidak boleh ditulis langsung oleh customer; checkout server
-- menggunakan service role setelah seluruh validasi selesai.
-- Voucher/promo/digital file tetap internal/admin-only.

-- Customer boleh membuat payment hanya melalui server action yang valida
-- dan memakai service role; tidak ada INSERT/UPDATE policy di payments.

-- Review hanya boleh dibuat untuk item yang sudah selesai dan milik sendiri.
drop policy if exists "review milik sendiri - buat" on reviews;
create policy "review milik sendiri - buat" on reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from order_items oi
      join orders o on o.id = oi.order_id
      where oi.id = reviews.order_item_id
        and oi.product_id = reviews.product_id
        and o.user_id = auth.uid()
        and o.status = 'COMPLETED'
    )
  );

-- Catatan: tabel internal/admin (vouchers, promos, payment_methods,
-- product_variations, digital_product_files, voucher_usages, dst.) memakai
-- RLS tanpa policy customer untuk operasi tulis. Admin mengaksesnya melalui
-- lib/supabase/admin.ts (service role) setelah autentikasi/otorisasi admin.
