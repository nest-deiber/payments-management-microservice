/**
 * @file NATS adapter implementing the EventPublisherPort.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventPublisherPort, PaymentSucceededEventPayload } from '../../domain';
import { NATS_SERVICE } from '../../../config';

/**
 * @class NatsEventPublisher
 * @implements EventPublisherPort
 * @description Publishes domain events to NATS.
 */
@Injectable()
export class NatsEventPublisher implements EventPublisherPort {
  private readonly logger = new Logger(NatsEventPublisher.name);

  /**
   * @constructor
   * @param {ClientProxy} client - Injected NATS client proxy.
   */
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  /**
   * Publishes the 'payment.succeeded' event to NATS using emit (fire-and-forget).
   * @async
   * @param {PaymentSucceededEventPayload} payload - The event data.
   * @returns {Promise<void>} Resolves immediately after emitting.
   */
  async publishPaymentSucceeded(payload: PaymentSucceededEventPayload): Promise<void> {
    this.logger.log(`Publishing NATS event 'payment.succeeded' for Order ID: ${payload.orderId}`);
    try {
      this.client.emit('payment.succeeded', payload);
    } catch (error: any) {
      this.logger.error(`Error publishing NATS event 'payment.succeeded': ${error.message}`, error.stack);
      throw new Error(`Failed to publish event: ${error.message}`);
    }
    return Promise.resolve();
  }
}