import { StripeWebhookEventDTO } from '../dto';

/**
 * Command to process a Stripe webhook event
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class ProcessStripeEventCommand {
  constructor(public readonly eventData: StripeWebhookEventDTO) {}
} 