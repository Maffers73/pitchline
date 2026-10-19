import Stripe from 'stripe';
import { createServerFn } from '@tanstack/react-start';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: { priceId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
