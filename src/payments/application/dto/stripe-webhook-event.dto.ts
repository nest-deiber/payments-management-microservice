import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO to represent a Stripe webhook event
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class StripeWebhookEventDTO {
  @ApiProperty({
    description: 'The payload of the Stripe event',
    example: { id: 'evt_123', type: 'payment_intent.succeeded', data: {} }
  })
  @IsNotEmpty()
  payload: any;

  @ApiProperty({
    description: 'The signature of the webhook provided by Stripe',
    example: 't=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd'
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
} 