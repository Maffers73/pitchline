import { createFileRoute } from '@tanstack/react-router';
import { createCheckoutSession } from '@/lib/stripe/checkout';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const handleSubscribe = async () => {
    // TODO: get real userId from session
    const result = await createCheckoutSession({
      data: { priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_xxx', userId: 'user_placeholder' },
    });
    if (result.url) window.location.href = result.url;
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Premium Predictions</h1>
      <p className="mb-6">Unlock full match outcomes, advanced stats, and unlimited access.</p>
      <button
        onClick={handleSubscribe}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Subscribe — £9.99/month
      </button>
    </div>
  );
}
