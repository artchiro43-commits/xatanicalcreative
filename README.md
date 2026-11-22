# Xatanical Creative

A Vercel-ready file sharing starter using plain HTML/CSS/JS, Vercel Node.js Functions, and private Supabase Storage.

## Included
- Landing page and upload UI
- Unique share pages at `/v/ID`
- Server-created signed upload URLs
- Private bucket and time-limited download URLs
- File metadata stored in Supabase

## Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run `schema.sql`.
3. Copy `.env.example` values into Vercel Project Settings → Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side secret only; never put this in browser code)
   - `SUPABASE_BUCKET=shared-files`
4. Deploy this folder to Vercel.
5. In Vercel Project Settings → Domains, connect your domain later.

## Local development
- Install Node.js.
- Run `npm install`.
- Install Vercel CLI if needed, then run `npx vercel dev`.

## Important starter limitations
- Upload limit is 50 MB.
- No user accounts, admin dashboard, rate limiting, malware scanning, or abuse-report workflow yet.
- Anyone with a share URL can access that file. Do not upload private or sensitive documents.
- Add rate limiting and abuse controls before opening this service to the public.
- Signed upload URL behavior can vary with storage/provider settings; test an upload after configuring Supabase.
- The share page uses a clean, original dark design inspired by common file-sharing layouts; it does not copy Ametive's branding or proprietary assets.
