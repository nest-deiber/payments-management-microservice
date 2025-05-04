/**
 * @file Controller handling payment session creation requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreatePaymentSessionResponseDto, PaymentSessionDto } from 'src/payments/application/dto';
import { CreatePaymentSessionCommand } from 'src/payments/application/commands/impl/create-payment-session.command';

/**
 * @class PaymentSessionController
 * @description Handles HTTP and NATS requests for payment session creation.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentSessionController {
  private readonly logger = new Logger(PaymentSessionController.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus for CQRS.
   */
  constructor(
    private readonly commandBus: CommandBus
  ) {}


  /**
   * NATS Message Handler: Creates a payment session.
   * @param {PaymentSessionDto} paymentSessionDto - Data for the session.
   * @returns {Promise<CreatePaymentSessionResponseDto>} Session details.
   */
  @MessagePattern('create.payment.session')
  async createPaymentSession(
    @Payload() paymentSessionDto: PaymentSessionDto
  ): Promise<CreatePaymentSessionResponseDto> {
    this.logger.log(`Handling NATS 'create.payment.session' for Order ID: ${paymentSessionDto.orderId}`);
    return this.commandBus.execute(
      new CreatePaymentSessionCommand(paymentSessionDto),
    );
  }
} 