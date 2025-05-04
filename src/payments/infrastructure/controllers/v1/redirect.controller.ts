/**
 * @file Controller handling payment redirect endpoints.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * @class RedirectController
 * @description Handles HTTP redirect endpoints for payments.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class RedirectController {
  private readonly logger = new Logger(RedirectController.name);

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
} 