import Stripe from 'stripe';
import { Payment } from '../entities/payment.entity';

/**
 * Stripe service port
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
export interface StripeServicePort {
  /**
   * Create a payment session in Stripe
   */
  createPaymentSession(data: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{
    sessionId: string;
    paymentUrl: string;
  }>;
  
  /**
   * Build a webhook event from the payload and signature
   */
  constructWebhookEvent(payload: any, signature: string): Promise<Stripe.Event>;
  
  /**
   * Process a Stripe event and update the corresponding payment
   */
  processEvent(event: Stripe.Event): Promise<Payment | null>;
  
  /**
   * Cancel an existing payment
   */
  cancelPayment(paymentIntentId: string, reason?: string): Promise<boolean>;
  
  /**
   * Refund a payment
   */
  refundPayment(paymentIntentId: string, amount?: number, reason?: string): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }>;
}

export const STRIPE_SERVICE_PORT = 'STRIPE_SERVICE_PORT'; 