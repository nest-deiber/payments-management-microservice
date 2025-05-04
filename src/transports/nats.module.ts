/**
 * @file Module for configuring and exporting the NATS client proxy.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, envs } from '../config';

/**
 * @module NatsModule
 * @description Configures the NATS client connection.
 */
@Module({
  imports: [
    ClientsModule.register([
      { name: NATS_SERVICE, transport: Transport.NATS, options: { servers: envs.natsServers } },
    ]),
  ],
  exports: [
    ClientsModule.register([
      { name: NATS_SERVICE, transport: Transport.NATS, options: { servers: envs.natsServers } },
    ]),
  ],
})
export class NatsModule {}