# 🏢 Aadhaar Seva Kendra — Batang, Raipur

A digital presence for a Common Service Centre (CSC) in Batang, Raipur,
Chhattisgarh — built to help a local CSC operator showcase government
services, publish notices, and share downloadable forms/documents online,
with a fully working admin panel to manage everything in real time.

**Live site:** https://aadhaar-seva-kendra-batang.vercel.app/

---

## ✨ Features

- 📋 **Services listing** — government services offered, required documents, and downloadable application forms
- 📢 **Notices board** — admin-published announcements shown to all visitors in real time
- 📄 **Documents/Forms** — PDF/image uploads that visitors can view & download
- 💳 **Payment info** — UPI ID + QR code for service payments
- 📞 **Contact section** — phone, WhatsApp, email, address, office hours
- 🌗 **Dark/Light theme** toggle
- 🌐 **Multi-language hero** (Hindi / English / Chhattisgarhi) for the landing banner
- 🔐 **Admin Panel** — secure, login-protected dashboard to manage all of the above
- 📱 Fully responsive, mobile-first design

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework, no build step) |
| Backend | [Supabase](https://supabase.com) — Postgres Database, Auth, Storage |
| Hosting | Netlify / Vercel (static hosting) |

No Node.js, no bundler, no `npm install` — it's plain static HTML/CSS/JS
files that talk directly to Supabase's REST API from the browser.

---

## 🗂️ Project Structure

```
├── index.html      # page markup (HTML structure only)
├── style.css       # all styling
├── script.js       # all app logic — Supabase calls, admin panel, rendering
└── README.md       # you are here
```

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/aadhaar-seva-kendra-batang.git
cd aadhaar-seva-kendra-batang
```

### 2. Set up Supabase
This project needs a Supabase project with 4 tables, 2 storage buckets,
and Row Level Security policies. Full SQL scripts and step-by-step
instructions are in **[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)**.

### 3. Add your Supabase credentials
Open `script.js`, find these lines near the top:
```js
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```
Replace with your project's URL and **anon public key** (found in
Supabase Dashboard → Project Settings → API).

> The anon key is safe to expose in client-side code — write access is
> restricted entirely by Row Level Security policies, not by hiding the key.

### 4. Run locally
Serve the file with any static server (opening via `file://` can cause
cross-origin script issues):
```bash
python3 -m http.server 8000
```
Visit `http://localhost:8000`.

---

## 🔑 Admin Access

Admin login uses Supabase Auth (email + password). Create an admin user
from Supabase Dashboard → Authentication → Users (see
[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for details). Once logged in
via the site's "Admin Login" button, the admin can manage Services,
Notices, Documents, Hero content, Payment/QR info, and Contact details —
changes reflect to all visitors instantly.

---

## 📦 Deployment

This is a static site — deploy `index.html`, `style.css`, and `script.js`
together (same folder) to any static host:

- **Netlify** — drag-and-drop, or connect this GitHub repo for
  auto-deploy on every push
- **Vercel** — import this repo, no build settings needed
- **GitHub Pages** — enable Pages on this repo, serve from root

After deploying, add your live URL to Supabase Dashboard →
Authentication → URL Configuration (Site URL + Redirect URLs).

---

## 🤝 Contributing

This is a client project for a local CSC operator. Issues and suggestions
are welcome via GitHub Issues.

---

## 📄 License

This project is provided as-is for the CSC Batang, Raipur operation.
