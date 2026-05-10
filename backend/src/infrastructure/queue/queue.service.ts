import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private channel?: amqp.Channel;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      const conn = await amqp.connect(
        this.config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
      );
      this.channel = await conn.createChannel();
    } catch (error) {
      this.logger.warn(`RabbitMQ not connected: ${(error as Error).message}`);
    }
  }

  async publish(queue: string, payload: Record<string, unknown>) {
    if (!this.channel) return;
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }
}
