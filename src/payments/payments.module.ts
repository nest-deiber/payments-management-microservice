/**
 * @file Payments module definition. Uses Mock Stripe Adapter.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NatsModule } from '../transports/nats.module';

// Application Layer
import { CommandHandlers } from './application/commands';

// Domain Layer (Ports)
import { STRIPE_SERVICE_PORT, EVENT_PUBLISHER_PORT } from './domain';

// Infrastructure Layer (Adapters & Controller)
import { MockStripeAdapter } from './infrastructure/adapters/mock-stripe.adapter'; // Using Mock!
import { NatsEventPublisher } from './infrastructure/adapters/nats-event.publisher';
import { PaymentsV1Controller } from './infrastructure/controllers/v1/payments.controller';

const infrastructureProviders: Provider[] = [
  { provide: STRIPE_SERVICE_PORT, useClass: MockStripeAdapter }, // Provide Mock
  { provide: EVENT_PUBLISHER_PORT, useClass: NatsEventPublisher },
];

const applicationProviders: Provider[] = [...CommandHandlers];

@Module({
  imports: [ CqrsModule, NatsModule ],
  controllers: [PaymentsV1Controller, PaymentsV1Controller],
  providers: [ ...applicationProviders, ...infrastructureProviders ],
})
export class PaymentsModule {}