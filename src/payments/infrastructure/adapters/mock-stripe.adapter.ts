/**
 * @file Mock adapter implementing the StripeServicePort for testing/development.
 * @description Simulates Stripe API interactions without making real calls.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe'; // Import Stripe type for Event object
import { randomUUID } from 'crypto';
import { CheckoutSessionRequest, StripeServicePort } from 'src/payments/domain/ports/stripe.service.port';
import { PaymentSession } from 'src/payments/domain/model/payment-session.entity';

/**
 * @class MockStripeAdapter
 * @implements StripeServicePort
 * @description Provides mock implementations for StripeServicePort methods.
 */
@Injectable()
export class MockStripeAdapter implements StripeServicePort {
  private readonly logger = new Logger(MockStripeAdapter.name);

  /**
   * Simulates the creation of a Stripe Checkout Session.
   * @async
   * @param {CheckoutSessionRequest} data - Details for the checkout session request.
   * @returns {Promise<PaymentSession>} Fake payment session details.
   */
  async createCheckoutSession(data: CheckoutSessionRequest): Promise<PaymentSession> {
    this.logger.log(`[MOCK] Creating fake checkout session for Order ID: ${data.orderId}`);
    const fakeSessionId = `sess_mock_${randomUUID()}`;
    const fakeBaseUrl = 'http://mock-stripe.test.local'; // Example mock base URL

    const mockSession = new PaymentSession(
      fakeSessionId,
      `${fakeBaseUrl}/checkout/${fakeSessionId}`,
      `${fakeBaseUrl}/cancel?session_id=${fakeSessionId}`,
      `${fakeBaseUrl}/success?session_id=${fakeSessionId}`
    );
    return Promise.resolve(mockSession);
  }

  /**
   * Simulates the construction/verification of a Stripe webhook event.
   * WARNING: This mock DOES NOT perform actual signature verification.
   * It returns a predefined 'charge.succeeded' event.
   * @async
   * @param {Buffer} rawBody - The raw request body (parsed slightly to potentially extract orderId).
   * @param {string | string[]} signature - The signature header (ignored in mock).
   * @returns {Promise<Stripe.Event>} A fake Stripe 'charge.succeeded' event.
   */
  async constructWebhookEvent(rawBody: Buffer, signature: string | string[]): Promise<Stripe.Event> {
    this.logger.warn('[MOCK] Constructing fake Stripe event - SKIPPING SIGNATURE VERIFICATION.');

    let fakeOrderId = `order_mock_${randomUUID()}`;
    try {
        const bodyJson = JSON.parse(rawBody.toString());
        const potentialOrderId = bodyJson?.data?.object?.metadata?.orderId;
         if(potentialOrderId){
             fakeOrderId = potentialOrderId;
             this.logger.log(`[MOCK] Using orderId from rawBody: ${fakeOrderId}`)
         } else {
            this.logger.log('[MOCK] Using generated fake orderId for event metadata.');
         }
    } catch(e) {
        this.logger.warn('[MOCK] Could not parse rawBody for orderId, using generated fake ID.');
    }

    const mockEvent = {
      id: `evt_mock_${randomUUID()}`,
      object: 'event',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: { id: `req_mock_${randomUUID()}`, idempotency_key: `idem_mock_${randomUUID()}` },
      type: 'charge.succeeded',
      data: {
        object: {
          id: `ch_mock_${randomUUID()}`,
          object: 'charge',
          amount: 1000, // Example amount
          amount_captured: 1000,
          metadata: { orderId: fakeOrderId },
          paid: true,
          receipt_url: `https://mock.stripe.com/receipt/${randomUUID()}`,
          status: 'succeeded',
          // Add other required Stripe.Charge fields with default/mock values
          amount_refunded: 0, application: null, application_fee: null, application_fee_amount: null,
          balance_transaction: `txn_mock_${randomUUID()}`, billing_details: { address: null, email: null, name: null, phone: null }, captured: true,
          created: Math.floor(Date.now() / 1000), currency: 'usd', customer: null, description: 'Mock charge', disputed: false,
          failure_balance_transaction: null, failure_code: null, failure_message: null, fraud_details: {}, invoice: null, livemode: false,
          on_behalf_of: null, order: null, outcome: { network_status: 'approved_by_network', reason: null, risk_level: 'normal', type: 'authorized' },
          payment_intent: `pi_mock_${randomUUID()}`, payment_method: `pm_mock_${randomUUID()}`, payment_method_details: { type: 'card', card: null },
          receipt_email: null, receipt_number: null, refunded: false, review: null, shipping: null, source: null, source_transfer: null,
          statement_descriptor: null, statement_descriptor_suffix: null, transfer_data: null, transfer_group: null,
        } as unknown as Stripe.Charge,
      },
    };
    return Promise.resolve(mockEvent as Stripe.Event);
  }
}