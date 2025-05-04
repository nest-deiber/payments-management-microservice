/**
 * @file Controller handling Stripe webhook requests.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Post, Req, Res, Logger, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessStripeEventCommand } from 'src/payments/application/commands';
import { StripeWebhookEventDTO } from 'src/payments/application/dto/stripe-webhook-event.dto';

/**
 * @class WebhookController
 * @description Handles HTTP webhook requests from Stripe.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  /**
   * @constructor
   * @param {CommandBus} commandBus - Injected CommandBus for CQRS.
   */
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  /**
   * HTTP POST Handler: Stripe webhook endpoint.
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
  async webhook(@Req() req: Request, @Res() res: Response) {
    this.logger.log('Handling HTTP POST /v1/payments/webhook');

    try {
      // Create DTO with the event information and signature
      const webhookEventDTO: StripeWebhookEventDTO = {
        payload: req.body,
        signature: req.headers['stripe-signature'] as string
      };

      await this.commandBus.execute(
        new ProcessStripeEventCommand(webhookEventDTO)
      );

      // Acknowledge receipt
      res.status(HttpStatus.OK).json({ received: true });
    } catch (error: any) {
      this.logger.error(`Error processing Stripe webhook: ${error.message}`, error.stack);
      // Still acknowledge receipt to prevent Stripe retries
      res.status(HttpStatus.OK).json({ received: true, warning: 'Internal processing error occurred.' });
    }
  }
} 