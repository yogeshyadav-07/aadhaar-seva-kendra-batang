# CSC Centre Website — Supabase Backend Setup (Full Migration)

Ab website **poori tarah Supabase-backed** hai. Admin Panel me jo bhi change
hoga (Services, Notices, Documents, Hero, Popup, Ticker, Payment/QR,
Contact) — wo turant sabhi customers ko dikhega, chahe wo kisi bhi
browser/phone se site khol rahe hon. Design bilkul same hai, sirf backend
badla hai.

**Sirf ye 2 cheezein LocalStorage me hain** (jaanbujh kar — ye per-device UI
settings hain, admin-editable "content" nahi):
- Dark/Light theme (har visitor apni pasand khud set karta hai)
- Visitor counter (sirf ek local dikhawa counter, real analytics nahi)

Baaki sab kuch — Services, Notices, Documents, Hero text, Popup, Ticker,
Payment/QR, Contact info — **Supabase database + storage** me hai.

---

## Step 1 — Supabase Project Banayein

1. [supabase.com](https://supabase.com) pe sign up / login karein.
2. **New Project** → naam do (jaise `csc-batang`), password set karein,
   region **South Asia (Mumbai)** rakhein.
3. 1-2 minute me project ready ho jayega.

---

## Step 2 — Tables, Buckets aur RLS Policies (SQL)

Dashboard me **SQL Editor** → **New query** → poora neeche wala SQL paste
karke **Run** karein:

```sql
-- Extension (agar pehle se enabled na ho)
create extension if not exists pgcrypto;

-- ═══════════ SERVICES TABLE ═══════════
create table services (
  id uuid primary key default gen_random_uuid(),
  icon text default '📋',
  name text not null,
  description text,
  doc_required text,
  form_file_url text,
  form_file_path text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "public_read_services"
  on services for select to anon, authenticated using (true);

create policy "authenticated_write_services_insert"
  on services for insert to authenticated with check (true);

create policy "authenticated_write_services_update"
  on services for update to authenticated using (true);

create policy "authenticated_write_services_delete"
  on services for delete to authenticated using (true);


-- ═══════════ NOTICES TABLE ═══════════
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  date text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table notices enable row level security;

create policy "public_read_active_notices"
  on notices for select to anon using (is_active = true);

create policy "authenticated_read_all_notices"
  on notices for select to authenticated using (true);

create policy "authenticated_insert_notices"
  on notices for insert to authenticated with check (true);

create policy "authenticated_update_notices"
  on notices for update to authenticated using (true);

create policy "authenticated_delete_notices"
  on notices for delete to authenticated using (true);


-- ═══════════ DOCUMENTS TABLE ═══════════
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  file_url text not null,
  file_path text,
  uploaded_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "public_read_documents"
  on documents for select to anon, authenticated using (true);

create policy "authenticated_insert_documents"
  on documents for insert to authenticated with check (true);

create policy "authenticated_update_documents"
  on documents for update to authenticated using (true);

create policy "authenticated_delete_documents"
  on documents for delete to authenticated using (true);


-- ═══════════ SITE CONTENT TABLE (Hero / Popup / Ticker / Payment / Contact) ═══════════
create table site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table site_content enable row level security;

create policy "public_read_site_content"
  on site_content for select to anon, authenticated using (true);

create policy "authenticated_insert_site_content"
  on site_content for insert to authenticated with check (true);

create policy "authenticated_update_site_content"
  on site_content for update to authenticated using (true);

create policy "authenticated_delete_site_content"
  on site_content for delete to authenticated using (true);


-- ═══════════ STORAGE BUCKET #1 — documents (Documents feature) ═══════════
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "public_read_documents_bucket"
  on storage.objects for select using (bucket_id = 'documents');

create policy "authenticated_upload_documents_bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'documents');

create policy "authenticated_delete_documents_bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'documents');


-- ═══════════ STORAGE BUCKET #2 — site-assets (Service files + QR code) ═══════════
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public_read_site_assets_bucket"
  on storage.objects for select using (bucket_id = 'site-assets');

create policy "authenticated_upload_site_assets_bucket"
  on storage.objects for insert to authenticated with check (bucket_id = 'site-assets');

create policy "authenticated_update_site_assets_bucket"
  on storage.objects for update to authenticated using (bucket_id = 'site-assets');

create policy "authenticated_delete_site_assets_bucket"
  on storage.objects for delete to authenticated using (bucket_id = 'site-assets');
```

Ye pura chalne ke baad ban jayega:
- 4 tables: `services`, `notices`, `documents`, `site_content`
- 2 storage buckets: `documents`, `site-assets`

---

## Step 3 — Admin User Banayein (Supabase Auth)

Admin Login ab Supabase Auth se chalta hai (email + password), purane
"username: yogesh" system ki jagah.

1. Dashboard → **Authentication → Users** → **Add user** → **Create new user**
2. Email: kuch bhi (real hona zaroori nahi), jaise `admin@cscbatang.com`
3. Password: strong password set karein
4. **Auto Confirm User** ✅ zaroor check karein
5. **Create user** click karein

Yahi email + password website ke Admin Login form me use hoga.

> 🔐 Baad me password badalna ho to website ke Admin Panel → Settings tab →
> "Change Password" se seedha badal sakte hain.

---

## Step 4 — API Keys Website me Daalein

1. Dashboard → **Project Settings → API**
2. Copy karein: **Project URL** aur **anon public** key
3. HTML file me `<script>` tag ke shuru me ye lines dhoondhein:

```js
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

4. Apne actual values se replace karein:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi....(lambi string)....";
```

> ℹ️ **anon key public karna safe hai** — ye sirf utna hi access deti hai
> jitna RLS policies me define kiya gaya hai (sirf logged-in admin likh/
> delete kar sakta hai, baaki sab sirf padh sakte hain). Isliye ye key
> seedha HTML/JS file me rakhna normal practice hai. Ye plain static HTML
> site hai (koi Node/React build step nahi), isliye traditional `.env`
> file yahan directly kaam nahi karti — agar future me Netlify/Vercel pe
> deploy karein to unke "Environment Variables" + ek chhota build-script
> se inject kar sakte hain, par abhi ke liye seedha file me daalna hi
> sabse simple tareeka hai.

---

## Step 5 — Website Test Karein

1. File save karke browser me kholein.
2. **"⚙ Admin Login"** button dabayein → Step 3 wala email + password daalein.
3. Admin Panel me:
   - **Services** tab me ek service add/edit karein
   - **Notices** tab me ek notice add karein
   - **Documents** tab me ek PDF/image upload karein
   - **Settings** tab me Hero text, Payment UPI/QR, Contact info save karein
4. Panel band karke homepage refresh karein — har jagah wahi naya data
   dikhna chahiye.
5. Ab isi website ko doosre browser/phone se kholein — wahan bhi bilkul
   wahi data dikhega, kyunki sab kuch ab Supabase database me store hai,
   kisi ek browser ki LocalStorage me nahi.

---

## "Script error" / Backend connect na ho to

Agar page load hote hi koi generic **"Script error"** ya backend-related
error toast dikhe:

1. Sabse pehle check karein ki Step 4 wali `SUPABASE_URL` aur
   `SUPABASE_ANON_KEY` sahi se paste hui hain (placeholder text jaise
   `YOUR_SUPABASE_...` to nahi reh gaya).
2. File ko seedha double-click karke (`file://...`) kholne ki bajaye,
   ek simple local server se serve karein — jaise VS Code ka
   "Live Server" extension, ya terminal me:
   ```
   python3 -m http.server 8000
   ```
   phir browser me `http://localhost:8000/final2_updated.html` kholein.
   (Kuch browsers `file://` se load hone par cross-origin scripts —
   jaise Supabase library CDN — ko properly load/report nahi karte,
   isse generic "Script error" aata hai.)
3. Browser me **F12 → Console** tab kholke dekhein — wahan asli error
   message (jaise galat URL/key, ya RLS policy missing) clearly dikhega.

---

## Troubleshooting

| Problem | Reason / Fix |
|---|---|
| Login fail ho raha hai | Email/password Step 3 se match karke check karein. User confirm na ho to Dashboard me manually confirm karein. |
| Kuch bhi load nahi ho raha, blank sections | `SUPABASE_URL`/`SUPABASE_ANON_KEY` galat/placeholder hai — Step 4 dobara check karein. Console (F12) me exact error dikhega. |
| Upload fail ho raha hai | Step 2 ka poora SQL bina error ke chala tha ya nahi confirm karein (especially bucket + storage policies). |
| Admin change kiya par customer side nahi dikh raha | Browser cache/hard-refresh try karein (Ctrl+Shift+R). Notices ke liye `is_active` column check karein. |
| "Script error" aa raha hai | Upar wala "Script error" section follow karein — zyada tar `file://` se khaulne ya galat keys ki wajah se hota hai. |

---

Ab website **100% Supabase-backed** hai — Aman bhai Admin Panel me jo bhi
change karenge (Services, Notices, Documents, Hero, Popup, Ticker,
Payment/QR, Contact), wo turant sabhi customers ko real data se dikhega,
chahe wo kisi bhi device se site khol rahe hon.
