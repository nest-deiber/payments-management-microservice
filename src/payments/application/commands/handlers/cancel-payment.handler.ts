import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CancelPaymentCommand } from '../cancel-payment.command';
import { PaymentCancellationResponseDto } from '../../dto';
import { 
  EVENT_PUBLISHER_PORT,
  EventPublisherPort
} from 'src/payments/domain';

/**
 * Handler for the CancelPaymentCommand
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler implements ICommandHandler<CancelPaymentCommand, PaymentCancellationResponseDto> {
  private readonly logger = new Logger(CancelPaymentHandler.name);

  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort
  ) {}

  /**
   * Executes the command to cancel a payment
   * Does not persist data locally, only emits events for the orders microservice to process
   */
  async execute(command: CancelPaymentCommand): Promise<PaymentCancellationResponseDto> {
    const { orderId, reason } = command;
    this.logger.log(`Executing CancelPaymentCommand for Order ID: ${orderId}`);
    
    try {
      // Generate a consistent payment ID based on the orderId
      const paymentId = `payment_${orderId.substring(0, 8)}`;
      const cancelledAt = new Date().toISOString();
      
      // Publish the payment cancelled event to be processed by the orders microservice
      await this.eventPublisher.publishPaymentCancelled({
        orderId,
        paymentId,
        cancelledAt,
        reason
      });
      
      this.logger.log(`Payment cancellation event published for Order ID: ${orderId}`);
      
      // Return the response with the event information
      return {
        orderId,
        paymentId,
        cancelled: true,
        cancelledAt,
        reason
      };
    } catch (error) {
      this.logger.error(`Error emitting payment cancellation event for order ${orderId}:`, error);
      throw error;
    }
  }
} 