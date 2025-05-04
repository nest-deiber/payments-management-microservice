import { Payment } from '../entities/payment.entity';

/**
 * Payment repository port
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export interface PaymentRepositoryPort {
  /**
   * Find a payment by its ID
   */
  findById(id: string): Promise<Payment | null>;
  
  /**
   * Find a payment by the associated order ID
   */
  findByOrderId(orderId: string): Promise<Payment | null>;
  
  /**
   * Save a new payment or update an existing one
   */
  save(payment: Payment): Promise<Payment>;
  
  /**
   * List the payments associated with a user
   */
  findByUserId(userId: string, limit?: number, offset?: number): Promise<{ payments: Payment[], total: number }>;
}

export const PAYMENT_REPOSITORY_PORT = 'PAYMENT_REPOSITORY_PORT'; 