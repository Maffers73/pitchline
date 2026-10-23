import { createAPIFileRoute } from "@tanstack/react-start/api";
import { stripe } from "@/lib/stripe";

export const APIRoute = createAPIFileRoute("/api/stripe/webhook")({
  POST: async ({ request }) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response("Missing signature", { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook error", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Log for now — expand later to store subscription status
    console.log("Stripe event", event.type, event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
