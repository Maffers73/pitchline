import { createFileRoute } from '@tanstack/react-router';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { authClient } from '@/lib/auth/client';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || 'anon';

  const handleSubscribe = async (priceId: string) => {
    if (!session?.user) {
      // Redirect to login or show message
      alert('Please log in first to start your 7-day free trial.');
      return;
    }
    const result = await createCheckoutSession({
      data: { priceId, userId },
    });
    if (result.url) window.location.href = result.url;
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-2">Pitchline Premium</h1>
      <p className="mb-8 text-muted">7-day free trial on registration. Then choose your plan.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-raised">
          <h2 className="text-2xl font-semibold">Weekly</h2>
          <p className="text-4xl font-bold my-4">£3<span className="text-lg">/week</span></p>
          <p className="mb-6 text-sm">Full access to locked board, lab, and all picks.</p>
          <button
            onClick={() => handleSubscribe(process.env.STRIPE_PRICE_WEEKLY || 'price_weekly')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start 7-day trial
          </button>
        </div>
        <div className="border-2 border-accent rounded-lg p-6 bg-raised">
          <h2 className="text-2xl font-semibold">Monthly</h2>
          <p className="text-4xl font-bold my-4">£10<span className="text-lg">/month</span></p>
          <p className="mb-6 text-sm">Best value — full access + priority picks.</p>
          <button
            onClick={() => handleSubscribe(process.env.STRIPE_PRICE_MONTHLY || 'price_monthly')}
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Start 7-day trial
          </button>
        </div>
      </div>
      <p className="mt-6 text-xs text-subtle">Cancel anytime. Trial starts immediately on registration.</p>
    </div>
  );
}
