/**
 * @file Root application module for Payments MS.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
      PaymentsModule,
      HealthCheckModule,
    ],
})
export class AppModule {}