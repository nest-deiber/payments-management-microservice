import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the response to cancel a payment
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class PaymentCancellationResponseDto {
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
    description: 'Indicator of if the payment was cancelled',
    example: true
  })
  cancelled: boolean;

  @ApiProperty({
    description: 'Cancellation date',
    example: '2023-01-01T12:00:00Z'
  })
  cancelledAt: string;

  @ApiProperty({
    description: 'Cancellation reason',
    example: 'user_requested'
  })
  reason: string;
} 