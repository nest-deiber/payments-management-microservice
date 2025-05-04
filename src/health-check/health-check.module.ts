/**
 * @file Module definition for the HealthCheck feature.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';

@Module({
  controllers: [HealthCheckController]
})
export class HealthCheckModule {}