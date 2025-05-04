import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the response to payment status
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class PaymentStatusResponseDto {
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
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']
  })
  status: string;

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

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T12:00:00Z'
  })
  updatedAt: string;
} 