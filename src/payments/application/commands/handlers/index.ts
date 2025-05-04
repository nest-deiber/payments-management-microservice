/**
 * @file Index of command handlers
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { CreatePaymentSessionHandler } from './create-payment-session.handler';
import { ProcessStripeEventHandler } from './process-stripe-event.handler';
import { CompletePaymentHandler } from './complete-payment.handler';

export const CommandHandlers = [
  CreatePaymentSessionHandler,
  ProcessStripeEventHandler,
  CompletePaymentHandler
]; 