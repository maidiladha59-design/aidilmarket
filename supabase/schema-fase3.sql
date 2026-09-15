-- =========================================================
-- AIDIL STORE — Migrasi Fase 3
-- Jalankan SETELAH supabase/schema.sql
--
-- PENTING: jalankan baris "alter type ... add value" di bawah ini SENDIRIAN
-- dulu (select, run), baru jalankan sisa file ini. Postgres tidak mengizinkan
-- nilai enum baru dipakai dalam transaksi yang sama saat ia ditambahkan.
-- =========================================================

-- Tambahan metode "wallet" untuk pembayaran order pakai saldo (Bagian 23)
alter type payment_method_type add value if not exists 'wallet';

-- ⬆️ Jalankan baris di atas dulu secara terpisah, baru lanjutkan ke bawah ⬇️

create type topup_status as enum ('WAITING_PAYMENT', 'PAYMENT_REVIEW', 'VERIFIED', 'REJECTED');


create table wallet_topup_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  method payment_method_type not null,
  proof_file_url text,
  status topup_status not null default 'WAITING_PAYMENT',
  rejection_reason text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table wallet_topup_requests enable row level security;

create policy "topup milik sendiri - lihat" on wallet_topup_requests
  for select using (auth.uid() = user_id);
create policy "topup milik sendiri - buat" on wallet_topup_requests
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- Fungsi ATOMIK untuk mengubah saldo wallet.
-- Jangan pernah UPDATE profiles.wallet_balance secara langsung dari kode
-- aplikasi — selalu lewat fungsi ini, dipanggil dari admin client
-- (service role) di Route Handler / Server Action yang sudah memverifikasi
-- otorisasi. Fungsi ini SECURITY DEFINER supaya bisa insert ke wallet_ledger
-- dan update profiles dalam satu transaksi walau dipanggil dengan anon key
-- dari user yang membayar pakai saldo sendiri (lihat policy exec di bawah).
-- ---------------------------------------------------------
create or replace function apply_wallet_transaction(
  p_user_id uuid,
  p_type wallet_transaction_type,
  p_amount numeric, -- boleh negatif (mengurangi) atau positif (menambah)
  p_reference_order_id uuid default null,
  p_note text default null
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance numeric;
  v_new_balance numeric;
begin
  select wallet_balance into v_current_balance from profiles where id = p_user_id for update;

  if v_current_balance is null then
    raise exception 'Profil pengguna tidak ditemukan';
  end if;

  v_new_balance := v_current_balance + p_amount;

  if v_new_balance < 0 then
    raise exception 'Saldo tidak mencukupi';
  end if;

  update profiles set wallet_balance = v_new_balance, updated_at = now() where id = p_user_id;

  insert into wallet_ledger (user_id, type, amount, balance_after, reference_order_id, note)
  values (p_user_id, p_type, p_amount, v_new_balance, p_reference_order_id, p_note);

  return v_new_balance;
end;
$$;

-- Hanya boleh dieksekusi lewat kode server (anon/service role terautentikasi),
-- bukan langsung dari client secara sembarangan — di aplikasi, fungsi ini
-- SELALU dipanggil dari Server Action setelah validasi (lihat lib/actions/payments.ts).
revoke execute on function apply_wallet_transaction from public;
revoke execute on function apply_wallet_transaction from authenticated;
grant execute on function apply_wallet_transaction to service_role;

-- Approval top up dibuat atomik agar double-click/concurrent admin tidak
-- bisa menambah saldo dua kali untuk request yang sama.
create or replace function approve_wallet_topup(
  p_topup_id uuid,
  p_admin_id uuid
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topup wallet_topup_requests%rowtype;
  v_balance numeric;
begin
  select * into v_topup
  from wallet_topup_requests
  where id = p_topup_id
  for update;

  if not found then
    raise exception 'Top up tidak ditemukan';
  end if;

  if v_topup.status not in ('WAITING_PAYMENT', 'PAYMENT_REVIEW') then
    raise exception 'Top up sudah diproses';
  end if;

  if not exists (
    select 1 from admin_users
    where id = p_admin_id and is_active = true
  ) then
    raise exception 'Admin tidak valid';
  end if;

  v_balance := apply_wallet_transaction(
    v_topup.user_id,
    'topup',
    v_topup.amount,
    null,
    'Top up saldo disetujui admin'
  );

  update wallet_topup_requests
  set status = 'VERIFIED',
      verified_by = p_admin_id,
      verified_at = now()
  where id = p_topup_id;

  return v_balance;
end;
$$;

revoke execute on function approve_wallet_topup from public;
revoke execute on function approve_wallet_topup from authenticated;
grant execute on function approve_wallet_topup to service_role;

-- ---------------------------------------------------------
-- Storage buckets yang perlu dibuat manual di Supabase Dashboard:
-- 1. "materials"        (privat) — materi upload customer, sudah dijelaskan di README Fase 2
-- 2. "payment-proofs"   (privat) — bukti transfer pembayaran & topup
-- 3. "digital-products" (privat) — file produk digital, HANYA diakses lewat signed URL
-- 4. "results"          (privat) — hasil pengerjaan admin untuk customer
-- 5. "chat-files"        (privat) — lampiran gambar/dokumen di chat per-order
--
-- Storage policies.
-- materials & payment-proofs memakai folder pertama = auth.uid().
-- chat-files/results memakai folder pertama = orderId dan hanya customer
-- pemilik order atau admin yang boleh mengakses sesuai kebutuhan aplikasi.
-- digital-products hanya service role/admin.
--
-- Jalankan blok ini setelah bucket dibuat. "drop policy if exists" membuat
-- migrasi lebih aman bila policy pernah dibuat sebelumnya.

drop policy if exists "materials user upload sendiri" on storage.objects;
create policy "materials user upload sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "materials user baca sendiri" on storage.objects;
create policy "materials user baca sendiri" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "payment proofs user upload sendiri" on storage.objects;
create policy "payment proofs user upload sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "payment proofs user baca sendiri" on storage.objects;
create policy "payment proofs user baca sendiri" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat customer upload order sendiri" on storage.objects;
create policy "chat customer upload order sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "chat admin upload" on storage.objects;
create policy "chat admin upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "chat admin baca" on storage.objects;
create policy "chat admin baca" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "chat customer baca order sendiri" on storage.objects;
create policy "chat customer baca order sendiri" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "results admin upload" on storage.objects;
create policy "results admin upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'results'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "results admin baca" on storage.objects;
create policy "results admin baca" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'results'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "digital products admin upload" on storage.objects;
create policy "digital products admin upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'digital-products'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "digital products admin baca" on storage.objects;
create policy "digital products admin baca" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'digital-products'
    and exists (
      select 1 from public.admin_users a
      where a.id = auth.uid() and a.is_active = true
    )
  );

-- Service role tetap dapat bypass policy untuk signed URL dan operasi server.
