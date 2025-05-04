/**
 * @file Index file for payment controllers.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

// Export all controllers
export * from './webhook.controller';
export * from './payment-session.controller';
export * from './payment-completion.controller';
export * from './payment-cancellation.controller';
export * from './payment-refund.controller';
export * from './redirect.controller';

// Array of all controller names for easy module registration
export const PAYMENTS_V1_CONTROLLERS = [
  'WebhookController',
  'PaymentSessionController',
  'PaymentStatusController',
  'PaymentCompletionController',
  'PaymentCancellationController',
  'PaymentRefundController',
  'RedirectController',
]; 