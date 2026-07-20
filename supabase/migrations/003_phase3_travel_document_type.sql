-- Phase 3: travel document type (flights, bus, train, etc.)

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'document_type' and e.enumlabel = 'travel'
  ) then
    alter type public.document_type add value 'travel';
  end if;
end $$;
