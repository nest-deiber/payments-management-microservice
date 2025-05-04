/**
 * @file Command handler for processing validated Stripe webhook events.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { EventPublisherPort, EVENT_PUBLISHER_PORT, PaymentSucceededEventPayload } from '../../../domain';
import { ProcessStripeEventCommand } from '../impl/process-stripe-event.command';

/**
 * @class ProcessStripeEventHandler
 * @description Handles the ProcessStripeEventCommand, publishing domain events based on Stripe event type.
 */
@CommandHandler(ProcessStripeEventCommand)
export class ProcessStripeEventHandler implements ICommandHandler<ProcessStripeEventCommand, void> {
  private readonly logger = new Logger(ProcessStripeEventHandler.name);

  /**
   * @constructor
   * @param {EventPublisherPort} eventPublisher - Injected event publisher port implementation.
   */
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  /**
   * Executes the process stripe event command.
   * @async
   * @param {ProcessStripeEventCommand} command - The command containing the verified Stripe event.
   * @returns {Promise<void>}
   */
  async execute(command: ProcessStripeEventCommand): Promise<void> {
    const { stripeEvent } = command;
    this.logger.log(`Handling ProcessStripeEventCommand: ${stripeEvent.id}, Type: ${stripeEvent.type}`);

    switch (stripeEvent.type) {
      case 'charge.succeeded':
        const chargeSucceeded = stripeEvent.data.object as Stripe.Charge;
        const orderId = chargeSucceeded.metadata?.orderId;
        const stripePaymentId = chargeSucceeded.id;
        const receiptUrl = chargeSucceeded.receipt_url;

        if (!orderId || !stripePaymentId || !receiptUrl) {
            this.logger.error(
                `Missing required data in charge.succeeded event ${stripeEvent.id}: orderId=${orderId}, stripePaymentId=${stripePaymentId}, receiptUrl=${receiptUrl}`
            );
            return; // Log and ignore missing data
        }

        const payload = new PaymentSucceededEventPayload( stripePaymentId, orderId, receiptUrl );

        try {
            await this.eventPublisher.publishPaymentSucceeded(payload);
            this.logger.log(`Published payment.succeeded event for Order ID: ${orderId}`);
        } catch (error: any) {
            this.logger.error(`Failed to publish payment.succeeded event for Order ID ${orderId}: ${error.message}`, error.stack);
            // Implement retry or dead-letter logic if needed for critical events
        }
        break;

      // Add handling for other relevant Stripe event types here if necessary

      default:
        this.logger.log(`Unhandled Stripe event type received: ${stripeEvent.type}`);
    }
  }
}