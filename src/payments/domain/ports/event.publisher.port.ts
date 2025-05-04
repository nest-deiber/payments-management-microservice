/**
 * @file Defines the port (interface) for publishing domain events.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { PaymentSucceededEventPayload } from '../model/payment-success.event';

/**
 * @interface EventPublisherPort
 * @description Defines the contract for publishing events to the message broker (NATS).
 */
export interface EventPublisherPort {
  /**
   * Publishes a 'payment.succeeded' event.
   * @async
   * @param {PaymentSucceededEventPayload} payload - The event data.
   * @returns {Promise<void>} Resolves when the event is sent for publishing.
   */
  publishPaymentSucceeded(payload: PaymentSucceededEventPayload): Promise<void>;
}

/**
 * @const {string} EVENT_PUBLISHER_PORT
 * @description Injection token for the EventPublisherPort.
 */
export const EVENT_PUBLISHER_PORT = 'EventPublisherPort';