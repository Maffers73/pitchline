# Stripe Integration TODO

This file is the single source of truth for remaining Stripe setup steps after the Checkout Session parameters were configured.

## Values to Replace

The following values are placeholders or need real production values before going live.

**Files containing placeholders:**
- [src/lib/stripe/checkout.ts](src/lib/stripe/checkout.ts)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| line_items[].price | data.priceId (passed from pricing page) | Your actual Stripe Price IDs (weekly £3 and monthly £10) from the Dashboard (https://dashboard.stripe.com/prices). Set STRIPE_PRICE_WEEKLY and STRIPE_PRICE_MONTHLY env vars and use them in the pricing page. |
| success_url | https://pitchline-delta.vercel.app/success?session_id={CHECKOUT_SESSION_ID} | Confirm or update to your real success page URL. Keep the {CHECKOUT_SESSION_ID} template. |
| cancel_url | https://pitchline-delta.vercel.app/pricing | Confirm or update to your real cancel/return page URL. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [src/lib/stripe/checkout.ts](src/lib/stripe/checkout.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | hosted |
| billing_address_collection | auto |
| phone_number_collection | { enabled: true } |
| automatic_tax | { enabled: false } |
| allow_promotion_codes | true |
| payment_method_collection | always |
| submit_type | auto |
| name_collection | { individual: { enabled: true } } |
| saved_payment_method_options | { payment_method_save: "enabled" } |
| integration_identifier | hosted_mobile_app_0001 |
| origin_context | mobile_app |
| mode | subscription |

## Setup and next steps

1. **Environment variables** (Vercel → pitchline → Settings → Environment Variables, for Production + Preview):
   - `STRIPE_SECRET_KEY` = sk_test_... (or sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` = whsec_...
   - `STRIPE_PRICE_WEEKLY` = price_... (weekly £3)
   - `STRIPE_PRICE_MONTHLY` = price_... (monthly £10)
   - `NEXT_PUBLIC_SITE_URL` = https://pitchline-delta.vercel.app

2. **Create products and prices** in Stripe Dashboard (Test mode first):
   - Product: Pitchline Premium
   - Price 1: £3 / week
   - Price 2: £10 / month
   - Copy the Price IDs into the env vars above.

3. **Webhook**:
   - Endpoint: `https://pitchline-delta.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

4. **Dependencies**: `stripe` package is already listed in package.json (^18.0.0). Run `npm install` if needed.

5. **How it works**:
   - User clicks "Start 7-day trial" on /pricing.
   - Calls `createCheckoutSession` server function.
   - Creates a hosted Stripe Checkout Session with 7-day trial.
   - Redirects user to Stripe-hosted page.
   - On success, webhook updates the subscriptions table.

6. **Testing**:
   - Use Stripe test card: 4242 4242 4242 4242, any future expiry, any CVC.
   - Test mode only until ready for live keys.

7. **Next steps**:
   - Wire real better-auth session into the pricing page and _subscribers layout.
   - Create the /success page if it does not exist.
   - Switch to live mode when ready (live keys, live prices, live webhook).

Resources: https://support.stripe.com and https://docs.stripe.com
