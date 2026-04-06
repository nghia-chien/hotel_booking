import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    'STRIPE_SECRET_KEY is not set. Stripe integration will not work until this is configured.'
  );
}

export const stripe: Stripe | null =
  process.env.STRIPE_SECRET_KEY != null
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      })
    : null;
