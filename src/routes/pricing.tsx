import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { createServerFn } from "@tanstack/react-start";
import { stripe, PRICE_WEEKLY, PRICE_MONTHLY } from "@/lib/stripe";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const createCheckout = createServerFn({ method: "POST" })
  .validator((data: { priceId: string; email?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.priceId) throw new Error("Missing price");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: data.email,
      line_items: [{ price: data.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pitchline-delta.vercel.app"}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pitchline-delta.vercel.app"}/pricing?canceled=1`,
    });
    return { url: session.url };
  });

function PricingPage() {
  const { userId, user } = useAuth();
  const email = user?.primaryEmailAddress?.emailAddress;

  async function start(priceId: string) {
    if (!userId) {
      alert("Please sign in first");
      return;
    }
    const res = await createCheckout({ data: { priceId, email } });
    if (res.url) window.location.href = res.url;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-center font-display text-3xl tracking-tight">Unlock Pitchline</h1>
      <p className="mt-2 text-center text-sm text-muted">
        7-day free trial, then £3/week or £10/month. Cancel anytime.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl">Weekly</h2>
          <p className="mt-1 text-3xl font-semibold">£3<span className="text-base text-muted">/week</span></p>
          <p className="mt-2 text-sm text-muted">Billed every week after trial.</p>
          <button
            onClick={() => start(PRICE_WEEKLY)}
            className="mt-6 w-full rounded-sm bg-accent py-2.5 text-sm font-medium text-accent-fg hover:bg-accent/90"
          >
            Start 7-day trial
          </button>
        </div>

        <div className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] ring-1 ring-accent/30">
          <h2 className="font-display text-xl">Monthly</h2>
          <p className="mt-1 text-3xl font-semibold">£10<span className="text-base text-muted">/month</span></p>
          <p className="mt-2 text-sm text-muted">Best value. Billed monthly after trial.</p>
          <button
            onClick={() => start(PRICE_MONTHLY)}
            className="mt-6 w-full rounded-sm bg-accent py-2.5 text-sm font-medium text-accent-fg hover:bg-accent/90"
          >
            Start 7-day trial
          </button>
        </div>
      </div>

      {!userId && (
        <p className="mt-8 text-center text-sm text-muted">
          <Link to="/" className="underline">Sign in</Link> first to start a trial.
        </p>
      )}
    </div>
  );
}
