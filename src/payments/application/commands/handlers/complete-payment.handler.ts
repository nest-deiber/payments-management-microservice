import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CompletePaymentCommand } from '../complete-payment.command';
import { PaymentCompletionResponseDto } from '../../dto';
import { 
  EVENT_PUBLISHER_PORT,
  EventPublisherPort
} from 'src/payments/domain';
import { firstValueFrom } from 'rxjs';

/** 
 * Handler for the CompletePaymentCommand
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@CommandHandler(CompletePaymentCommand)
export class CompletePaymentHandler implements ICommandHandler<CompletePaymentCommand, PaymentCompletionResponseDto> {
  private readonly logger = new Logger(CompletePaymentHandler.name);

  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: EventPublisherPort,
    @Inject('ORDERS_SERVICE')
    private readonly ordersClient: ClientProxy
  ) {}

  /**
    * Executes the command to complete a payment
   * Does not persist data locally, only emits events for the orders microservice to process
   */
  async execute(command: CompletePaymentCommand): Promise<PaymentCompletionResponseDto> {
    const { orderId } = command;
    this.logger.log(`Executing CompletePaymentCommand for Order ID: ${orderId}`);
    
    try {
      // First, get the order details from the orders microservice
      const order = await firstValueFrom(
        this.ordersClient.send('findOneOrder', { id: orderId })
      );
      
      if (!order) {
        throw new HttpException(`Order with ID ${orderId} not found`, HttpStatus.NOT_FOUND);
      }
      
      this.logger.log(`Retrieved order details for Order ID: ${orderId}`);
      
      // Use the actual order information
      const paymentId = `payment_${orderId.substring(0, 8)}`;
      const completedAt = new Date().toISOString();
      const amount = order.totalAmount;
      const currency = 'usd';
      
      // Publish the payment succeeded event with correct data
      await this.eventPublisher.publishPaymentSucceeded({
        orderId,
        paymentId,
        amount,
        paidAt: completedAt,
        stripeChargeId: paymentId // Add stripeChargeId for the orders microservice
      });
      
      this.logger.log(`Payment success event published for Order ID: ${orderId} with amount: ${amount}`);
      
      // Return the response with the event information
      return {
        orderId,
        paymentId,
        status: 'completed',
        completedAt,
        amount,
        currency
      };
    } catch (error) {
      this.logger.error(`Error emitting payment completion event for order ${orderId}:`, error);
      throw error;
    }
  }
} 