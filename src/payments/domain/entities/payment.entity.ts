/**
 * Payment entity
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export class Payment {
  /**
   * Unique ID of the payment
   */
  id: string;
  
  /**
   * Order ID associated
   */  
  orderId: string;
  
  /**
   * User ID that made the payment
   */
  userId: string;
  
  /**
   * Payment amount
   */
  amount: number;
  
  /**
   * Payment currency
   */
  currency: string;
  
  /**
   * Current payment status
   */
  status: PaymentStatus;
  
  /**
   * Payment intent ID in the provider (e.g. Stripe)
   */
  paymentIntentId?: string;
  
  /**
   * Creation date
   */
  createdAt: Date;
  
  /**
   * Last update date
   */
  updatedAt: Date;
  
  /**
   * Completion date (if completed)
   */
  completedAt?: Date;
  
  /**
   * Cancellation date (if cancelled)
   */
  cancelledAt?: Date;
  
  /**
   * Cancellation reason (if cancelled)
   */
  cancellationReason?: string;
  
  /**
   * Refunds associated with the payment
   */
  refunds?: PaymentRefund[];
  
  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial);
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
  }
}

/**
 * Possible payment statuses
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

/**
 * Refund entity associated with a payment
 */
export class PaymentRefund {
  /**
   * Unique ID of the refund
   */
  id: string;
  
  /**
   * ID of the payment associated
   */
  paymentId: string;
  
  /**
   * Refunded amount
   */
  amount: number;
  
  /**
   * Refund reason
   */
  reason?: string;
  
  /**
   * Refund date
   */
  createdAt: Date;
  
  constructor(partial: Partial<PaymentRefund>) {
    Object.assign(this, partial);
    this.createdAt = partial.createdAt || new Date();
  }
} 