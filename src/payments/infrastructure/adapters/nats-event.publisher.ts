/**
 * @file NATS adapter implementing the EventPublisherPort.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventPublisherPort } from 'src/payments/domain';
import { NATS_SERVICE } from 'src/config';

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
  constructor(
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy
  ) {}

  /**
   * Publishes the 'payment.succeeded' event to NATS using emit (fire-and-forget).
   * @async
   * @param {PaymentSucceededEventPayload} payload - The event data.
   * @returns {Promise<void>} Resolves immediately after emitting.
   */
  async publishPaymentSucceeded(data: {
    orderId: string;
    paymentId: string;
    amount: number;
    paidAt: string;
    stripeChargeId?: string;
  }): Promise<void> {
    this.logger.log(`Emitting payment.succeeded event for Order ID: ${data.orderId}`);
    this.natsClient.emit('payment.succeeded', data);
  }

  /**
   * Publishes a failed payment event
   */
  async publishPaymentFailed(data: {
    orderId: string;
    paymentId: string;
    failureReason: string;
  }): Promise<void> {
    this.logger.log(`Emitting payment.failed event for Order ID: ${data.orderId}`);
    this.natsClient.emit('payment.failed', data);
  }

  /**
   * Publishes a cancelled payment event
   */
  async publishPaymentCancelled(data: {
    orderId: string;
    paymentId: string;
    cancelledAt: string;
    reason: string;
  }): Promise<void> {
    this.logger.log(`Emitting payment.cancelled event for Order ID: ${data.orderId}`);
    this.natsClient.emit('payment.cancelled', data);
  }

  /**
   * Publishes a refunded payment event
   */
  async publishPaymentRefunded(data: {
    orderId: string;
    paymentId: string;
    refundId: string;
    amount: number;
    refundedAt: string;
    reason?: string;
  }): Promise<void> {
    this.logger.log(`Emitting payment.refunded event for Order ID: ${data.orderId}`);
    this.natsClient.emit('payment.refunded', data);
  }
}