// Stripe webhook handler for subscription events
// Place this logic in a server route at src/routes/api/webhooks/stripe.ts

import Stripe from 'stripe';
import { getSql } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function handleStripeWebhook(request: Request): Promise<Response> {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook Error', { status: 400 });
  }

  const sql = await getSql();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await sql`
          INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status)
          VALUES (${userId}, ${session.customer as string}, ${session.subscription as string}, 'active')
          ON CONFLICT (user_id) DO UPDATE
          SET stripe_subscription_id = EXCLUDED.stripe_subscription_id, status = 'active'
        `;
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'canceled';
      await sql`
        UPDATE subscriptions SET status = ${status} WHERE stripe_subscription_id = ${sub.id}
      `;
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
