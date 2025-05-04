/**
 * @file Controller handling payment completion requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Post, Param, Logger, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompletePaymentCommand } from 'src/payments/application/commands';
import { PaymentCompletionResponseDto } from 'src/payments/application/dto';

/**
 * @class PaymentCompletionController
 * @description Handles HTTP and NATS requests for payment completion operations.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentCompletionController {
  private readonly logger = new Logger(PaymentCompletionController.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus for CQRS.
   */
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  /**
   * HTTP POST Handler: Complete payment for an order.
   * @param {string} orderId - The order ID to mark as paid.
   * @returns {Promise<PaymentCompletionResponseDto>} The payment details.
   */
  @Post('complete/order/:orderId')
  @ApiOperation({
    summary: 'Complete payment for an order'
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to mark as paid',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment completed successfully',
    type: PaymentCompletionResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async completePaymentHttp(@Param('orderId', ParseUUIDPipe) orderId: string): Promise<PaymentCompletionResponseDto> {
    this.logger.log(`Completing payment for Order ID: ${orderId}`);
    return this.commandBus.execute(new CompletePaymentCommand(orderId));
  }

  /**
   * NATS Message Handler: Completes a payment for a specific order.
   * @param {object} data - Payment data.
   * @returns {Promise<object>} Completion result.
   */
  @MessagePattern('complete.payment')
  async completePayment(
    @Payload() data: { orderId: string }
  ): Promise<PaymentCompletionResponseDto> {
    const { orderId } = data;
    this.logger.log(`Handling NATS 'complete.payment' for Order ID: ${orderId}`);
    return this.commandBus.execute(new CompletePaymentCommand(orderId));
  }
} 