# Wedding Gift Registry (Vite + React + Supabase, PWA)

Couples list meaningful gifts; guests chip in any amount via a UPI QR code and leave a wish.
No custom server. Free tiers of Supabase and Cloudflare Pages are enough. No file uploads: icons are built in and photos are optional external https links.

## Try it locally

```bash
npm install
cp .env.example .env     # fill in after step 1 below; skip to use demo mode only
npm run dev
```
Without `.env` the app runs in demo mode (`/demo`) with local sample data.

## 1. Set up Supabase

1. Create a project at supabase.com (free tier).
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, run.
3. **Project Settings → API**: copy the Project URL and `anon` public key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Authentication → Providers → Google**: enable it. Create OAuth credentials in Google Cloud Console (type: Web application) and paste the Client ID and secret into Supabase. Add Supabase’s callback URL (shown on that page) as an authorised redirect URI in Google.
5. **Authentication → URL Configuration**: set *Site URL* to your Cloudflare Pages URL and add these under *Redirect URLs*: `http://localhost:5173/**` and `https://YOUR-SITE.pages.dev/**` (plus your custom domain if any).
6. Email magic links work out of the box (Supabase’s built-in email has a low hourly limit; add custom SMTP for a big guest list).

## 2. Deploy to Cloudflare Pages (free)

1. Push this folder to a GitHub repo (`.env` is git-ignored).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings: framework preset **Vite**, build command `npm run build`, output directory `dist`.
4. Under **Environment variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then deploy.
5. `public/_redirects` makes deep links like `/w/aarav-priya` work.

## Install as an app

Open the site in Chrome (Android) → menu → *Install app*, or Safari (iOS) → Share → *Add to Home Screen*. Icons are in `public/` (`icon-192.png`, `icon-512.png`). Replace them with your own artwork if you like.

## How it works

- **Money never touches this app.** The QR encodes a standard `upi://pay` link to the couple’s UPI ID. “I’ve Completed the Payment” records a pledge as *unverified*; the couple checks their UPI app and taps **Mark Verified** or **Remove**.
- **Totals** (`wishlist_items.raised_amount`) are maintained by a database trigger from the sum of contributions, so removing a bad entry lowers the total. Clients cannot write that column.
- **Anonymous gifts** store the text “Anonymous Well-Wisher”, never the guest’s real name.
- **Security** is enforced by Row-Level Security (see `schema.sql`): the public can read and add contributions; only the signed-in owner can edit their registry, verify, or delete.
- **Anti-spam** is a 30-second client cooldown plus DB constraints on amount (₹1 to ₹10,00,000) and text length. For stronger protection add Cloudflare Turnstile or a Supabase Edge Function.
- Guests see all pledges including unverified ones, because contributions are publicly readable by design.
