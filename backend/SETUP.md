# Cauvery Resorts — Backend Setup Guide

## What this backend does
- Saves every enquiry to a PostgreSQL database
- Sends the owner an email with full guest details + a "Call Guest" button
- Sends the guest a confirmation email (if they provided their email)
- Has a password-protected admin panel at `/admin` to manage all enquiries

---

## Step 1 — Vercel Postgres (Database)

1. Go to [vercel.com](https://vercel.com) → your project → **Storage** tab
2. Click **Create Database** → choose **Postgres**
3. Link it to your project — Vercel auto-adds `POSTGRES_URL` to your environment variables

---

## Step 2 — Resend (Email)

1. Go to [resend.com](https://resend.com) → Sign up free
2. **API Keys** → Create Key → copy it
3. Add it as an environment variable in Vercel: `RESEND_API_KEY`

> **Note:** The free Resend plan allows 100 emails/day — more than enough.
> You must verify your domain or use `onboarding@resend.dev` as the FROM address (already set in mailer.js).

---

## Step 3 — Set Environment Variables in Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `POSTGRES_URL` | Auto-added when you link Vercel Postgres |
| `RESEND_API_KEY` | From Resend dashboard (starts with `re_`) |
| `OWNER_EMAIL` | `cauveryresorts@gmail.com` |
| `ADMIN_PASSWORD` | Choose a strong password for the admin panel |
| `ADMIN_SECRET` | Any long random string (used for JWT signing) |
| `FRONTEND_URL` | `https://www.cauveryresorts.com` |

---

## Step 4 — Deploy to Vercel

The project is already configured via `vercel.json` at the root. Just push to your connected GitHub repo — Vercel deploys automatically.

Or deploy manually:
```bash
npm i -g vercel
vercel --prod
```

---

## Step 5 — Verify it works

1. Visit `https://www.cauveryresorts.com/enquiry.html`
2. Submit a test enquiry with your own email
3. Check that:
   - You receive an owner notification email
   - The guest gets a confirmation email
   - The enquiry appears in the admin panel at `/admin`

---

## Admin Panel

| URL | Purpose |
|-----|---------|
| `/admin` | View and manage all enquiries |
| `/health` | API health check |

Login with the `ADMIN_PASSWORD` you set above.

---

## Local Development

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
# API runs at: http://localhost:3000
# Admin panel: http://localhost:3000/admin
```
