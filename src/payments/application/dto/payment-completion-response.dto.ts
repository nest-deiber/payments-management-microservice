import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the response to complete a payment
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class PaymentCompletionResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  orderId: string;

  @ApiProperty({
    description: 'Payment ID',
    example: 'payment_123e4567'
  })
  paymentId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'completed'
  })
  status: string;

  @ApiProperty({
    description: 'Completion date',
    example: '2023-01-01T12:00:00Z'
  })
  completedAt: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100.00
  })
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'usd'
  })
  currency: string;
} 