/**
 * @file HTTP controller for basic health check.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {
  @Get()
  healthCheck(): string {
    return 'Payments Service is up and running!';
  }
}