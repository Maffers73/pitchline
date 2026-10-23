import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil",
});

export const PRICE_WEEKLY = process.env.STRIPE_PRICE_WEEKLY || "";
export const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || "";
