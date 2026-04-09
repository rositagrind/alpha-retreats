# Alpha Retreats

Premium men's retreat business — full-stack Next.js 14 application.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Stripe · Resend · Framer Motion · Tiptap · Vercel

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account
- [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd alpha-retreats
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see `.env.example` for descriptions).

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste and run the entire contents of `supabase/schema.sql`
   - This creates all tables, RLS policies, storage bucket, and seeds the 4 placeholder retreats
4. Copy your project URL and keys from **Settings → API** into `.env.local`

### 4. Create an admin user

1. In Supabase dashboard → **Authentication → Users** → click **Add user**
2. Enter an email and password for your admin account
3. Copy the user's UUID
4. Go to **SQL Editor** and run:

```sql
insert into profiles (id, email, role, full_name)
values (
  'PASTE-USER-UUID-HERE',
  'admin@yourdomain.com',
  'admin',
  'Admin'
);
```

5. You can now log in at `/admin/login` with those credentials.

### 5. Set up Stripe webhook locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then in a separate terminal:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret starting with `whsec_`. Paste this into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/retreats` | All retreats listing |
| `/retreats/[slug]` | Individual retreat page with booking |
| `/corporate` | Corporate enquiry page |
| `/about` | About page |
| `/contact` | Contact form |
| `/members` | Members dashboard (auth required) |
| `/members/login` | Magic link login |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin login (email + password) |
| `/admin/retreats` | Retreat management |
| `/admin/bookings` | Booking management |
| `/admin/waitlist` | Waitlist + broadcast |
| `/admin/corporate` | Corporate enquiries |
| `/admin/contact` | Contact messages |
| `/booking/success` | Post-Stripe booking confirmation |

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/waitlist` | POST | Join waitlist |
| `/api/bookings/create-checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/enquiries/corporate` | POST | Submit corporate enquiry |
| `/api/contact` | POST | Submit contact message |
| `/api/admin/waitlist/broadcast` | POST | Send email broadcast (admin) |
| `/api/admin/waitlist/export` | GET | Export waitlist as CSV (admin) |

---

## Vercel Deployment

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy
5. After deployment, add your production webhook in the Stripe dashboard:
   - **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the signing secret into Vercel env vars as `STRIPE_WEBHOOK_SECRET`
6. Update `NEXT_PUBLIC_SITE_URL` to your production URL

---

## Notes

- All images use Unsplash URLs (no attribution required for demo — add your own for production)
- Admin is protected server-side via middleware checking `profiles.role = 'admin'`
- Members area uses Supabase magic link auth
- Stripe charges are in EUR; the webhook is idempotent (safe to replay)
- Supabase RLS policies restrict public access to appropriate operations only
