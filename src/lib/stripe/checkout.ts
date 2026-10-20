import Stripe from 'stripe';
import { createServerFn } from '@tanstack/react-start';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: { priceId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'hosted',
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      allow_promotion_codes: true,
      payment_method_collection: 'always',
      submit_type: 'auto',
      name_collection: { individual: { enabled: true } },
      saved_payment_method_options: { payment_method_save: 'enabled' },
      integration_identifier: 'hosted_mobile_app_0001',
      origin_context: 'mobile_app',
      line_items: [{ price: data.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pitchline-delta.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pitchline-delta.vercel.app'}/pricing`,
      metadata: { userId: data.userId },
    });
    return { url: session.url };
  });
