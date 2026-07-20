-- Phase 2: raw text on documents + private storage for uploads

alter table public.documents
  add column if not exists raw_text text;

alter table public.documents
  add column if not exists extraction_error text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tour-documents',
  'tour-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'text/plain',
    'text/csv',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do nothing;

-- Path convention: {user_id}/{tour_id}/{document_id}/{filename}

drop policy if exists "Users read own tour documents" on storage.objects;
drop policy if exists "Users upload own tour documents" on storage.objects;
drop policy if exists "Users update own tour documents" on storage.objects;
drop policy if exists "Users delete own tour documents" on storage.objects;

create policy "Users read own tour documents"
  on storage.objects for select
  using (
    bucket_id = 'tour-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users upload own tour documents"
  on storage.objects for insert
  with check (
    bucket_id = 'tour-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own tour documents"
  on storage.objects for update
  using (
    bucket_id = 'tour-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own tour documents"
  on storage.objects for delete
  using (
    bucket_id = 'tour-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
