/**
 * @file Controller handling payment-related HTTP requests and NATS messages.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Get, Post, Req, Res, Logger, Inject, HttpStatus, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { STRIPE_SERVICE_PORT, StripeServicePort } from 'src/payments/domain';
import { CreatePaymentSessionResponseDto, PaymentSessionDto } from 'src/payments/application/dto';
import { CreatePaymentSessionCommand, ProcessStripeEventCommand } from 'src/payments/application/commands';

/**
 * @class PaymentsController
 * @description Handles HTTP endpoints and NATS messages for payments. Uses mock Stripe adapter.
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsV1Controller {
  private readonly logger = new Logger(PaymentsV1Controller.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus.
   * @param {StripeServicePort} stripeService - Injected Stripe service port (mock).
   */
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(STRIPE_SERVICE_PORT)
    private readonly stripeService: StripeServicePort
  ) {}

  /**
   * HTTP GET Handler: Success redirect endpoint.
   * @returns {object} Simple success message.
   */
  @Get('success')
  @ApiOperation({ summary: 'Success redirection endpoint for payments' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment completed successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Payment successful redirection endpoint.' }
      }
    }
  })
  success() {
    this.logger.log('Handling HTTP GET /v1/payments/success');
    return { ok: true, message: 'Payment successful redirection endpoint.' };
  }

  /**
   * HTTP GET Handler: Cancellation redirect endpoint.
   * @returns {object} Simple cancellation message.
   */
  @Get('cancel')
  @ApiOperation({ summary: 'Cancellation redirection endpoint for payments' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment cancelled by user',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Payment cancelled redirection endpoint.' }
      }
    }
  })
  cancel() {
    this.logger.log('Handling HTTP GET /v1/payments/cancel');
    return { ok: false, message: 'Payment cancelled redirection endpoint.' };
  }

  /**
   * HTTP POST Handler: Stripe webhook endpoint (using mock).
   * @param {Request} req - Express request object (with rawBody).
   * @param {Response} res - Express response object.
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook to receive Stripe events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stripe event processed successfully',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Error in request format' })
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] || 'mock-signature'; // Use mock signature if none provided
    this.logger.log('Handling HTTP POST /v1/payments/webhook');

    if (!req.body) {
        this.logger.error('Webhook request body is not available');
        throw new BadRequestException('Webhook handler requires request body.');
    }

    let event: Stripe.Event;
    try {
        event = await this.stripeService.constructWebhookEvent(req.body, signature);
        this.logger.log(`[MOCK] Webhook event constructed: ID=${event.id}, Type=${event.type}`);
    } catch (err: any) {
        this.logger.error(`Webhook event construction failed (even with mock?): ${err.message}`);
        res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Event is "valid" (mocked), dispatch command to process it
    try {
        this.logger.log(`Dispatching ProcessStripeEventCommand for event: ${event.id}`);
        await this.commandBus.execute<ProcessStripeEventCommand, void>(
            new ProcessStripeEventCommand(event)
        );
        // Acknowledge receipt
        res.status(HttpStatus.OK).json({ received: true });
        this.logger.log(`Webhook event ${event.id} processed and acknowledged.`);
    } catch (error: any) {
         this.logger.error(`Error processing Stripe event ${event.id}: ${error.message}`, error.stack);
         // Still acknowledge receipt
         res.status(HttpStatus.OK).json({ received: true, warning: 'Internal processing error occurred.' });
    }
  }

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
    return this.commandBus.execute<CreatePaymentSessionCommand, CreatePaymentSessionResponseDto>(
      new CreatePaymentSessionCommand(paymentSessionDto),
    );
  }

  /**
   * NATS Message Handler: Gets the status of a specific payment.
   * @param {string} paymentId - Payment identifier.
   * @returns {Promise<object>} Payment status details.
   */
  @MessagePattern('get.payment.status')
  async getPaymentStatus(@Payload() paymentId: string): Promise<object> {
    this.logger.log(`Handling NATS 'get.payment.status' for Payment ID: ${paymentId}`);
    // Real implementation would use a specific command handler
    return {
      paymentId,
      status: 'completed', // Possible values: pending, completed, failed, cancelled
      updatedAt: new Date().toISOString(),
      amount: 100.00,
      currency: 'usd'
    };
  }

  /**
   * NATS Message Handler: Cancels an in-progress payment.
   * @param {string} paymentId - Payment identifier to cancel.
   * @returns {Promise<object>} Cancellation result.
   */
  @MessagePattern('cancel.payment')
  async cancelPayment(@Payload() paymentId: string): Promise<object> {
    this.logger.log(`Handling NATS 'cancel.payment' for Payment ID: ${paymentId}`);
    // Real implementation would use a specific command handler
    return {
      paymentId,
      cancelled: true,
      cancelledAt: new Date().toISOString(),
      reason: 'user_requested',
      refundId: 're_mock_' + Math.random().toString(36).substring(2, 10)
    };
  }

  /**
   * NATS Message Handler: Lists payments associated with a user.
   * @param {object} data - Query data.
   * @returns {Promise<object>} List of user payments.
   */
  @MessagePattern('list.user.payments')
  async listUserPayments(@Payload() data: { userId: string, limit?: number, offset?: number }): Promise<object> {
    const { userId, limit = 10, offset = 0 } = data;
    this.logger.log(`Handling NATS 'list.user.payments' for User ID: ${userId}`);
    // Real implementation would use a specific query handler
    return {
      userId,
      payments: [
        {
          id: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
          amount: 39.99,
          currency: 'usd',
          status: 'completed',
          createdAt: new Date(Date.now() - 1000000).toISOString(),
          orderId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          id: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
          amount: 129.50,
          currency: 'usd',
          status: 'completed',
          createdAt: new Date(Date.now() - 5000000).toISOString(),
          orderId: '223e4567-e89b-12d3-a456-426614174001'
        }
      ],
      pagination: {
        total: 2,
        limit,
        offset,
        hasMore: false
      }
    };
  }

  /**
   * NATS Message Handler: Processes a refund for a payment.
   * @param {object} data - Refund data.
   * @returns {Promise<object>} Refund result.
   */
  @MessagePattern('process.refund')
  async processRefund(@Payload() data: { paymentId: string, amount?: number, reason?: string }): Promise<object> {
    const { paymentId, amount, reason = 'requested_by_customer' } = data;
    this.logger.log(`Handling NATS 'process.refund' for Payment ID: ${paymentId}`);
    // Real implementation would use a specific command handler
    return {
      paymentId,
      refundId: 're_mock_' + Math.random().toString(36).substring(2, 10),
      amount: amount || 100.00, // If no amount specified, refund everything
      currency: 'usd',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
      reason
    };
  }
} 