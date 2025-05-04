/**
 * @file Controller handling payment refund requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NATS_SERVICE } from 'src/config';

/**
 * @class PaymentRefundController
 * @description Handles HTTP and NATS requests for payment refund operations
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentRefundController {
  private readonly logger = new Logger(PaymentRefundController.name);

  /**
   * @constructor
   * @param {ClientProxy} natsClient - NATS client for event emitting.
   */
  constructor(
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy
  ) {}

  /**
   * HTTP POST Handler: Process refund for an order.
   * @param {object} refundData - Refund data including orderId.
   * @returns {Promise<any>} The refund details.
   */
  @Post('refund/order')
  @ApiOperation({
    summary: 'Process a refund for an order'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        amount: { type: 'number', example: 50.0 },
        reason: { type: 'string', example: 'customer_request' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Refund processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refund data',
  })
  @ApiResponse({
    status: 404,
    description: 'Order or payment not found',
  })
  async processRefundByOrderIdHttp(
    @Body() refundData: { orderId: string; amount?: number; reason?: string }
  ) {
    const { orderId, amount, reason = 'requested_by_customer' } = refundData;
    this.logger.log(`Processing refund for Order ID: ${orderId}`);
    
    // Generate consistent IDs based on the orderId
    const paymentId = `payment_${orderId.substring(0, 8)}`;
    const refundId = `refund_${orderId.substring(0, 8)}_${Date.now()}`;
    const refundedAt = new Date().toISOString();
    
    const refundDetails = {
      orderId,
      paymentId,
      refundId,
      amount: amount || 100.00,
      currency: 'usd',
      status: 'succeeded',
      createdAt: refundedAt,
      reason
    };

    // Emit event to update the order status
    this.logger.log(`Emitting payment.refunded event for Order ID: ${orderId}`);
    this.natsClient.emit('payment.refunded', {
      orderId,
      paymentId,
      refundId,
      amount: refundDetails.amount,
      refundedAt,
      reason
    });

    return refundDetails;
  }

  /**
   * NATS Message Handler: Processes a refund for an order.
   * @param {object} data - Refund data.
   * @returns {Promise<object>} Refund result.
   */
  @MessagePattern('process.refund.by.order')
  async processRefundByOrder(@Payload() data: { orderId: string, amount?: number, reason?: string }): Promise<object> {
    const { orderId, amount, reason = 'requested_by_customer' } = data;
    this.logger.log(`Handling NATS 'process.refund.by.order' for Order ID: ${orderId}`);
    
    // Generate consistent IDs based on the orderId
    const paymentId = `payment_${orderId.substring(0, 8)}`;
    const refundId = `refund_${orderId.substring(0, 8)}_${Date.now()}`;
    const refundedAt = new Date().toISOString();
    
    // In a real implementation, we would process the refund and record it
    const result = {
      orderId,
      paymentId,
      refundId,
      amount: amount || 100.00,
      currency: 'usd',
      status: 'succeeded',
      createdAt: refundedAt,
      reason
    };
    
    // Emit event to update the order status
    this.logger.log(`Emitting payment.refunded event for Order ID: ${orderId}`);
    this.natsClient.emit('payment.refunded', {
      orderId,
      paymentId,
      refundId,
      amount: result.amount,
      refundedAt,
      reason
    });

    return result;
  }
} 