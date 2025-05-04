/**
 * @file Payments module definition. Uses Mock Stripe Adapter.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Controllers
import {
  WebhookController,
  PaymentSessionController,
  PaymentCompletionController,
  PaymentCancellationController,
  PaymentRefundController,
  RedirectController,
} from './infrastructure/controllers/v1';

// Command Handlers
import { ProcessStripeEventHandler } from './application/commands/handlers/process-stripe-event.handler';
import { CreatePaymentSessionHandler } from './application/commands/handlers/create-payment-session.handler';
import { CompletePaymentHandler } from './application/commands/handlers/complete-payment.handler';
import { CancelPaymentHandler } from './application/commands/handlers/cancel-payment.handler';

// Ports and Adapters
import { EVENT_PUBLISHER_PORT } from './domain';
import { NatsEventPublisher } from './infrastructure/adapters/nats-event.publisher';
import { MockStripeAdapter } from './infrastructure/adapters/mock-stripe.adapter';
import { STRIPE_SERVICE_PORT } from './domain/ports/stripe.service.port';
import { NATS_SERVICE } from '../config/services';
import { envs } from '../config/envs';

// Add the command handlers
const CommandHandlers = [
  CreatePaymentSessionHandler, 
  ProcessStripeEventHandler,
  CompletePaymentHandler,
  CancelPaymentHandler
];

/**
 * @module PaymentsModule
 * @description Principal module for payments functionality. Uses CQRS architecture.
 */
@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        }
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        }
      }
    ])
  ],
  controllers: [
    // HTTP & NATS Controllers
    WebhookController,
    PaymentSessionController,
    PaymentCompletionController,
    PaymentCancellationController,
    PaymentRefundController,
    RedirectController,
  ],
  providers: [
    // Command Handlers for CQRS
    ...CommandHandlers,
    
    // Stripe service port (mock implementation)
    {
      provide: STRIPE_SERVICE_PORT,
      useClass: MockStripeAdapter,
    },
    
    // Event Publisher port (NATS implementation)
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: NatsEventPublisher,
    },
  ],
})
export class PaymentsModule {}