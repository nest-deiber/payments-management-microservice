/**
 * @file Data Transfer Object for the create payment session response.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * @class CreatePaymentSessionResponseDto
 * @description Structure of the response after creating a payment session.
 */
export class CreatePaymentSessionResponseDto {
  /**
   * @property {string} id - The unique identifier of the payment session.
   */
  @ApiProperty({
    description: 'Unique identifier of the payment session',
    example: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
  })
  id: string;

  /**
   * @property {string} url - The URL for the user to complete payment.
   */
  @ApiProperty({
    description: 'URL to redirect the user to complete the payment',
    example: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0',
  })
  url: string;

  /**
   * @property {string} cancelUrl - The URL for redirection upon cancellation.
   */
  @ApiProperty({
    description: 'URL to redirect the user in case of cancellation',
    example: 'https://myapp.com/payments/cancel',
  })
  cancelUrl: string;

  /**
   * @property {string} successUrl - The URL for redirection upon success.
   */
  @ApiProperty({
    description: 'URL to redirect the user in case of success',
    example: 'https://myapp.com/payments/success',
  })
  successUrl: string;
}