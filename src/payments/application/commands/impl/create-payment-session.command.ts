/**
 * @file Defines the command for creating a payment session.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { PaymentSessionDto } from '../../dto/payment-session.dto';

/**
 * @class CreatePaymentSessionCommand
 * @description Represents the intent to create a payment session.
 */
export class CreatePaymentSessionCommand {
  /**
   * @constructor
   * @param {PaymentSessionDto} paymentSessionDto - Data required to create the session.
   */
  constructor(public readonly paymentSessionDto: PaymentSessionDto) {}
}