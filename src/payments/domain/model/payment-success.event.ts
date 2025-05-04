/**
 * @file Defines the domain event payload for successful payment.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class PaymentSucceededEventPayload
 * @description Data structure for the payment succeeded event.
 */
export class PaymentSucceededEventPayload {
  /**
   * @property {string} stripePaymentId - The payment intent or charge ID.
   */
  public readonly stripePaymentId: string;

  /**
   * @property {string} orderId - The ID of the order associated with the payment.
   */
  public readonly orderId: string;

  /**
   * @property {string} receiptUrl - The URL to the payment receipt.
   */
  public readonly receiptUrl: string;

  /**
   * @constructor
   * @param {string} stripePaymentId
   * @param {string} orderId
   * @param {string} receiptUrl
   */
  constructor(stripePaymentId: string, orderId: string, receiptUrl: string) {
    this.stripePaymentId = stripePaymentId;
    this.orderId = orderId;
    this.receiptUrl = receiptUrl;
  }
}