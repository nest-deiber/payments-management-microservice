/**
 * @file Command handler for creating a payment session.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreatePaymentSessionCommand } from '../impl/create-payment-session.command';
import { CreatePaymentSessionResponseDto } from '../../dto';
import { CheckoutSessionRequest, STRIPE_SERVICE_PORT, StripeServicePort } from 'src/payments/domain/ports/stripe.service.port';
import { PaymentSession } from 'src/payments/domain/model/payment-session.entity';

/**
 * @class CreatePaymentSessionHandler
 * @description Handles the execution of the CreatePaymentSessionCommand.
 */
@CommandHandler(CreatePaymentSessionCommand)
export class CreatePaymentSessionHandler implements ICommandHandler<CreatePaymentSessionCommand, CreatePaymentSessionResponseDto> {
  private readonly logger = new Logger(CreatePaymentSessionHandler.name);

  /**
   * @constructor
   * @param {StripeServicePort} stripeService - Injected Stripe service port implementation.
   */
  constructor(
    @Inject(STRIPE_SERVICE_PORT)
    private readonly stripeService: StripeServicePort,
  ) {}

  /**
   * Executes the create payment session command.
   * @async
   * @param {CreatePaymentSessionCommand} command - The command object.
   * @returns {Promise<CreatePaymentSessionResponseDto>} Details of the created payment session.
   * @throws {RpcException} If session creation fails via the Stripe port.
   */
  async execute(command: CreatePaymentSessionCommand): Promise<CreatePaymentSessionResponseDto> {
    const { orderId, currency, items } = command.paymentSessionDto;
    this.logger.log(`Handling CreatePaymentSessionCommand for Order ID: ${orderId}`);

    const requestData: CheckoutSessionRequest = { orderId, currency, items };

    try {
      const session: PaymentSession = await this.stripeService.createCheckoutSession(requestData);
      this.logger.log(`Checkout Session created via port: ${session.id}`);

      return {
        id: session.id,
        url: session.url,
        cancelUrl: session.cancelUrl,
        successUrl: session.successUrl,
      };
    } catch (error: any) {
      this.logger.error(`Failed handling CreatePaymentSessionCommand for Order ID ${orderId}: ${error.message}`, error.stack);
      if (error instanceof RpcException) throw error; // Re-throw if adapter already threw RpcException
      // Wrap other errors from the port
      throw new RpcException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Failed to create payment session.',
      });
    }
  }
}