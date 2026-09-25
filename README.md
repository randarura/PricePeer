# PriceCompare

Demand-validation landing page for PriceCompare — paste a SaaS URL, preview a sample pricing benchmark, and join the waitlist.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- PostHog (`posthog-js`) for analytics

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Analytics

Set PostHog env vars (see `.env.example`):

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (optional)

Events:

| Event | When |
| --- | --- |
| `pricecompare_page_view` | Page load |
| `saas_url_entered` | URL entered (blur / analyze) |
| `analyze_pricing_clicked` | Analyze Pricing CTA |
| `email_submitted` | Waitlist signup |

`saas_url` is included when available. Email addresses are **not** sent to analytics.

Without a PostHog key, events log to the browser console in development.

## Waitlist storage

Signups are appended to `data/waitlist.jsonl` (gitignored) when the filesystem is writable.
