/**
 * @file Commands for the payments application
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

export * from './process-stripe-event.command';
export * from './complete-payment.command';
export * from './cancel-payment.command';

import { CreatePaymentSessionHandler } from './handlers/create-payment-session.handler';
import { ProcessStripeEventHandler } from './handlers/process-stripe-event.handler';
import { CompletePaymentHandler } from './handlers/complete-payment.handler';
import { CancelPaymentHandler } from './handlers/cancel-payment.handler';

// Export array of handlers for the module
export const CommandHandlers = [
  CreatePaymentSessionHandler,
  ProcessStripeEventHandler,
  CompletePaymentHandler,
  CancelPaymentHandler
];