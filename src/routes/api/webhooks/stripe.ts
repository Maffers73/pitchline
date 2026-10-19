import { createFileRoute } from '@tanstack/react-router';
import { handleStripeWebhook } from '@/lib/stripe/webhook';

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => handleStripeWebhook(request),
    },
  },
});
