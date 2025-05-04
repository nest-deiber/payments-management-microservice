/**
 * @file Controller handling payment cancellation requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Post, Param, Logger, ParseUUIDPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CancelPaymentCommand } from 'src/payments/application/commands';
import { PaymentCancellationResponseDto } from 'src/payments/application/dto';

/**
 * @class PaymentCancellationController
 * @description Handles HTTP and NATS requests for payment cancellation operations.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentCancellationController {
  private readonly logger = new Logger(PaymentCancellationController.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus for CQRS.
   */
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  /**
   * HTTP POST Handler: Cancel payment for an order.
   * @param {string} orderId - The order ID to cancel payment for.
   * @returns {Promise<PaymentCancellationResponseDto>} The cancellation details.
   */
  @Post('cancel/order/:orderId')
  @ApiOperation({
    summary: 'Cancel payment for an order'
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to cancel payment for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled successfully',
    type: PaymentCancellationResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Order or payment not found',
  })
  async cancelPaymentByOrderIdHttp(
    @Param('orderId', ParseUUIDPipe) orderId: string
  ): Promise<PaymentCancellationResponseDto> {
    this.logger.log(`Cancelling payment for Order ID: ${orderId}`);
    return this.commandBus.execute(new CancelPaymentCommand(orderId, 'user_requested'));
  }
} 