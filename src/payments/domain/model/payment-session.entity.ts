/**
 * @file Defines the PaymentSession entity for the domain layer.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

/**
 * @class PaymentSession
 * @description Represents the details of a payment session created.
 */
export class PaymentSession {
  /**
   * @property {string} id - The unique identifier of the payment session.
   */
  public readonly id: string;

  /**
   * @property {string} url - The URL for the user to complete payment.
   */
  public readonly url: string;

  /**
   * @property {string} cancelUrl - The URL for redirection upon cancellation.
   */
  public readonly cancelUrl: string;

  /**
   * @property {string} successUrl - The URL for redirection upon success.
   */
  public readonly successUrl: string;

  /**
   * @constructor
   * @param {string} id
   * @param {string} url
   * @param {string} cancelUrl
   * @param {string} successUrl
   */
  constructor(id: string, url: string, cancelUrl: string, successUrl: string) {
    this.id = id;
    this.url = url;
    this.cancelUrl = cancelUrl;
    this.successUrl = successUrl;
  }
}