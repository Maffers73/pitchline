# Pitchline Subscription — Next Steps

Your repo now has the scaffolding. Follow these steps to finish.

## 1. Add environment variables in Vercel

In Vercel → pitchline → Settings → Environment Variables (Production + Preview):

- `STRIPE_SECRET_KEY` = sk_test_... (from Stripe Dashboard → Developers → API keys)
- `STRIPE_WEBHOOK_SECRET` = whsec_... (you will get this after creating the webhook)
- `STRIPE_PRICE_PREMIUM_MONTHLY` = price_... (the Price ID you create in Stripe)
- `NEXT_PUBLIC_SITE_URL` = https://pitchline-delta.vercel.app

## 2. Create the product in Stripe (Test mode)

1. Stripe Dashboard → Products → Add product
2. Name: Premium Predictions
3. Add a recurring price (e.g. £9.99 / month)
4. Copy the Price ID (starts with `price_`) and put it in the env var above.

## 3. Create the webhook in Stripe

1. Developers → Webhooks → Add endpoint
2. URL: `https://pitchline-delta.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
4. Copy the Signing secret into `STRIPE_WEBHOOK_SECRET`
5. Redeploy the Vercel app so the new env vars take effect.

## 4. Wire up real session check

In `src/routes/_subscribers.tsx` replace the placeholder `getSession()` with your existing better-auth session helper (look in `src/lib/auth/`).

## 5. Move pages you want to lock

Move files like `outcomes.tsx` and `match.$id.tsx` into a new folder:

```
src/routes/_subscribers/outcomes.tsx
src/routes/_subscribers/match.$id.tsx
```

They will then be protected automatically.

## 6. Test

Use Stripe test card: 4242 4242 4242 4242, any future expiry, any CVC.

## 7. Go live

When happy, switch Stripe to live mode, create live prices, update the Vercel Stripe keys / webhook, and redeploy.

---

Files added:
- `src/lib/stripe/webhook.ts` + route
- `src/lib/stripe/checkout.ts`
- `src/lib/stripe/check-subscription.ts`
- `src/routes/_subscribers.tsx` (protection layout)
- `src/routes/pricing.tsx`
- `migrations/0003_subscriptions.sql`
