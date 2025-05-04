/**
 * Command to cancel a payment
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class CancelPaymentCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason: string
  ) {}
} 