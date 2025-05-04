import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ProcessStripeEventCommand } from '../process-stripe-event.command';
import { 
  EVENT_PUBLISHER_PORT,
  EventPublisherPort
} from 'src/payments/domain';
import { STRIPE_SERVICE_PORT, StripeServicePort } from 'src/payments/domain/ports/stripe.service.port';

/**
 * Handler for processing Stripe webhook events
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@CommandHandler(ProcessStripeEventCommand)
export class ProcessStripeEventHandler implements ICommandHandler<ProcessStripeEventCommand> {
  private readonly logger = new Logger(ProcessStripeEventHandler.name);

  constructor(
    @Inject(STRIPE_SERVICE_PORT)
    private readonly stripeService: StripeServicePort,
    
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort
  ) {}

  /**
   * Executes the command to process a Stripe event
   * Does not persist data locally, only emits events for the orders microservice to process
   */
  async execute(command: ProcessStripeEventCommand): Promise<void> {
    const { eventData } = command;
    this.logger.log(`Processing Stripe webhook event`);

    try {
      // Build the event from the payload and signature
      const event = await this.stripeService.constructWebhookEvent(
        eventData.payload,
        eventData.signature
      );
      
      this.logger.log(`Stripe event constructed: ID=${event.id}, Type=${event.type}`);
      
      // Extract data from the object
      const paymentObject = event.data.object as any;
      const orderId = paymentObject.metadata?.orderId;
      
      if (!orderId) {
        this.logger.warn('No orderId found in Stripe event metadata');
        return;
      }
      
      // Generate a consistent payment ID based on the orderId
      const paymentId = paymentObject.id ?? `payment_${orderId.substring(0, 8)}`;
      
      // Publish the corresponding event based on the Stripe event type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.eventPublisher.publishPaymentSucceeded({
            orderId,
            paymentId,
            amount: paymentObject.amount_received / 100, // Convertir de centavos a dólares
            paidAt: new Date().toISOString()
          });
          this.logger.log(`Published payment.succeeded event for Order ID: ${orderId}`);
          break;
          
        case 'payment_intent.payment_failed':
          await this.eventPublisher.publishPaymentFailed({
            orderId,
            paymentId,
            failureReason: paymentObject.last_payment_error?.message ?? 'Unknown error'
          });
          this.logger.log(`Published payment.failed event for Order ID: ${orderId}`);
          break;
          
        case 'payment_intent.canceled':
          await this.eventPublisher.publishPaymentCancelled({
            orderId,
            paymentId,
            cancelledAt: new Date().toISOString(),
            reason: 'cancelled_by_user'
          });
          this.logger.log(`Published payment.cancelled event for Order ID: ${orderId}`);
          break;
          
        case 'charge.refunded':
          await this.eventPublisher.publishPaymentRefunded({
            orderId,
            paymentId: paymentObject.payment_intent ?? paymentId,
            refundId: `refund_${orderId.substring(0, 8)}_${Date.now()}`,
            amount: paymentObject.amount_refunded / 100, // Convertir de centavos a dólares
            refundedAt: new Date().toISOString(),
            reason: 'customer_requested'
          });
          this.logger.log(`Published payment.refunded event for Order ID: ${orderId}`);
          break;
          
        default:
          this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
      }
      
      this.logger.log(`Stripe event ${event.id} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing Stripe event: ${error.message}`, error.stack);
      throw error;
    }
  }
}