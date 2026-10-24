import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil",
});

export const PRICE_WEEKLY = process.env.STRIPE_PRICE_WEEKLY || "";
export const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || "";

/** True if the email has an active or trialing Stripe subscription. */
export async function hasActiveSubscription(email?: string | null): Promise<boolean> {
  if (!email) return false;
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return false;

    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });

    return subs.data.some(
      (s) => s.status === "active" || s.status === "trialing",
    );
  } catch (err) {
    console.error("hasActiveSubscription error", err);
    return false;
  }
}
