---
name: Alpha Retreats Project
description: Full-stack Next.js 14 app for a premium men's retreat business — B2C retreats and B2B corporate offsites
type: project
---

Complete full-stack Next.js 14 App Router application built at C:\Users\salva\Desktop\alpha-retreats.

**Why:** User wanted a production-ready website for a men's retreat business with full admin panel, Stripe payments, and Supabase backend.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase (auth + db + storage) · Stripe · Resend · Framer Motion · Tiptap

**Key credentials (in .env.local):**
- Supabase project: bjcsggbhfiagcwscemvg.supabase.co
- Stripe: live keys present
- Resend: API key present

**How to apply:** Run `npm run dev` to start. Schema must be applied in Supabase SQL editor (supabase/schema.sql). Admin user must be manually inserted into profiles table with role='admin'.

**Build status:** Passes `npm run build` with zero TypeScript/ESLint errors as of build date.
