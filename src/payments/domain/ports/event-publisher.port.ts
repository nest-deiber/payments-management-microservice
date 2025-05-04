/**
 * Event publisher port
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export interface EventPublisherPort {
  /**
   * Publishes a successful payment event
   */
  publishPaymentSucceeded(data: {
    orderId: string;
    paymentId: string;
    amount: number;
    paidAt: string;
    stripeChargeId?: string;
  }): Promise<void>;
  
  /**
   * Publishes a failed payment event
   */
  publishPaymentFailed(data: {
    orderId: string;
    paymentId: string;
    failureReason: string;
  }): Promise<void>;
  
  /**
   * Publishes a cancelled payment event
   */
  publishPaymentCancelled(data: {
    orderId: string;
    paymentId: string;
    cancelledAt: string;
    reason: string;
  }): Promise<void>;
  
  /**
   * Publishes a refunded payment event
   */
  publishPaymentRefunded(data: {
    orderId: string;
    paymentId: string;
    refundId: string;
    amount: number;
    refundedAt: string;
    reason?: string;
  }): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = 'EVENT_PUBLISHER_PORT'; 