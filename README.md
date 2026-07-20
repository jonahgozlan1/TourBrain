# Tourbase

Turn messy tour documents into a clean, searchable show database.

> **AI extracts. The database is the source of truth. Humans review.**

## Product wedge

Not another full tour OS (Roadcase / ABOSS). Tourbase is the **ingestion layer**:

```text
PDFs / emails / notes
        ↓
   AI structured extract
        ↓
   Human review + gaps
        ↓
   Show-centric tour DB
```

## MVP scope (locked)

| In | Out |
|---|---|
| One tour in the UI | Multi-tour switcher |
| Shows as the core object | Fees / deposits / accounting |
| Manual show shell + demo data | Gmail / WhatsApp / Slack |
| Import UI + extraction schemas | Crew, setlists, payroll |
| Gap detection (“still needed”) | Native mobile app |
| Contracts → flights → hotels (sequenced) | Doc embeddings / vector search |
| Ask against structured tour data | Full chat / agent write-back |

First user: friend artist.

## Stack

- **Next.js** (App Router) + React + TypeScript + Tailwind
- **Supabase** — Postgres, auth, storage
- **OpenAI** — document classification + structured extraction + tour Q&A
- **Vercel** — hosting

## Project structure

```text
src/
  app/
    page.tsx                 # Landing
    (app)/
      tour/page.tsx          # Tour dashboard (one tour)
      tour/shows/[showId]/  # Show page (core screen)
      tour/import/           # Upload + review shell
      tour/ask/              # Phase 4 — ask structured tour data
    api/extract/             # Phase 2 extraction endpoint (501 stub)
  components/
    tour/ show/ import/ ask/ layout/
  lib/
    types/domain.ts          # Core domain model
    extraction/schemas.ts    # Strict AI JSON shapes
    ask/                     # Tour Q&A context + OpenAI call
    gaps/showGaps.ts         # Missing-field detection
    mock/demoTour.ts         # UI works before Supabase
    supabase/                # Browser + server clients
supabase/
  migrations/
    001_initial_schema.sql   # Tours → shows → travel/hotels/docs/contacts
```

## User flow

```text
Create Tour → Upload Information → Review → Use Tour OS
```

Screens:

1. **Tour dashboard** — date-ordered shows + gap counts  
2. **Show page** — schedule, travel, hotel, people, docs, still needed  
3. **Import** — upload → extract → confirm  
4. **Ask** — question → answer from structured data + source links

## Local setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (required once)

1. Open the [Supabase SQL editor](https://supabase.com/dashboard/project/xdbzclrsfqzzuldcgvgz/sql/new)
2. Run `supabase/migrations/001_initial_schema.sql`
3. (Optional for local testing) Auth → Providers → Email → disable **Confirm email**

Then: **Sign up → Create tour → Add show**.

## Build sequence

1. **Phase 1** ✅ Auth + tours + manual shows on Supabase  
2. **Phase 2** ✅ Contract upload → AI extract → review → write shows  
3. **Phase 3** ✅ Travel (flight/bus/train) + hotel extract → attach to shows  
4. **Phase 4** ✅ Ask questions against structured data (+ optional doc retrieval later)

### Phase 2–3 setup

1. Run migrations in order in the SQL editor:
   - `001_initial_schema.sql`
   - `002_phase2_documents_storage.sql` (storage bucket)
   - `003_phase3_travel_document_type.sql` (adds `travel` doc type)
2. Ensure `OPENAI_API_KEY` is in `.env.local`
3. `npm run dev` → Import contracts / travel / hotels → review → Confirm

Travel and hotels **attach to an existing show** (picker on review). You can also add them manually on the show page.

### Phase 4 — Ask

Open **Ask** in the nav (`/tour/ask`). Questions are answered from the structured tour graph (shows, travel, hotels, contacts, gaps). Answers include source links to show pages. Document raw-text retrieval is not included yet.

## Design rule

Do not make the AI the database. Prefer `null` over invented times. Always show gaps.
