/**
 * @file Defines the port (interface) for interacting with the Stripe Service.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import Stripe from 'stripe'; // Import Stripe namespace for types
import { PaymentSession } from '../model/payment-session.entity';

/**
 * @interface CheckoutSessionRequest
 * @description Data needed to create a Stripe Checkout session.
 */
export interface CheckoutSessionRequest {
    orderId: string;
    currency: string;
    items: {
        name: string;
        price: number; // Price in base units (e.g., dollars)
        quantity: number;
    }[];
}

/**
 * @interface StripeServicePort
 * @description Defines the contract for interacting with the Stripe API (or its mock).
 */
export interface StripeServicePort {
  /**
   * Creates a Checkout Session via the payment provider.
   * @async
   * @param {CheckoutSessionRequest} data - Details for the checkout session.
   * @returns {Promise<PaymentSession>} Details of the created session (ID, URL, etc.).
   */
  createCheckoutSession(data: CheckoutSessionRequest): Promise<PaymentSession>;

  /**
   * Constructs and verifies a webhook event from the payment provider.
   * @async
   * @param {Buffer} rawBody - The raw request body buffer.
   * @param {string | string[]} signature - The signature header value.
   * @returns {Promise<Stripe.Event>} The verified Stripe event object (using Stripe type for structure).
   */
  constructWebhookEvent(rawBody: Buffer, signature: string | string[]): Promise<Stripe.Event>;
}

/**
 * @const {string} STRIPE_SERVICE_PORT
 * @description Injection token for the StripeServicePort.
 */
export const STRIPE_SERVICE_PORT = 'StripeServicePort';