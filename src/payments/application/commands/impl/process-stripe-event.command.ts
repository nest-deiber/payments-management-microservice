/**
 * @file Defines the command for processing a validated Stripe webhook event.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import Stripe from 'stripe'; // Use Stripe type

/**
 * @class ProcessStripeEventCommand
 * @description Represents the intent to process a verified Stripe webhook event.
 */
export class ProcessStripeEventCommand {
  /**
   * @constructor
   * @param {Stripe.Event} stripeEvent - The verified Stripe event object.
   */
  constructor(public readonly stripeEvent: Stripe.Event) {}
}