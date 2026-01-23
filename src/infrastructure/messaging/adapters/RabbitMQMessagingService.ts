import type { MessagingService } from "@application/ports/MessagingService";
import * as amqp from "amqplib";
import { rabbitmqConfig } from "../config";

type RabbitConnection = amqp.Connection | any;
type RabbitChannel = amqp.Channel | any;

export class RabbitMQMessagingService implements MessagingService {
	private connection: RabbitConnection | null = null;
	private channel: RabbitChannel | null = null;

	constructor() {}

	public isConnected(): boolean {
		return this.connection !== null && this.channel !== null;
	}

	public getChannel(): amqp.Channel | null {
		return this.channel;
	}

	async connect() {
		try {
			this.connection = await amqp.connect(rabbitmqConfig.url!);
			this.channel = await this.connection.createChannel();
			console.log("Connected to RabbitMQ");
		} catch (error) {
			console.error("Failed to connect to RabbitMQ", error);
		}
	}

	async publish(exchange: string, routingKey: string, message: any): Promise<void> {
		if (!this.channel) {
			throw new Error("RabbitMQ channel is not available.");
		}
		await this.channel.assertExchange(exchange, "topic", { durable: false });
		console.log(
			"RabbitMQ. Evento publicado:",
			JSON.stringify(
				{
					exchange,
					routingKey,
					message,
				},
				null,
				2
			)
		);
		this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
	}

	async subscribe(
		exchange: string,
		queue: string,
		routingKeys: string[],
		handler: (message: any) => void
	): Promise<void> {
		if (!this.channel) {
			throw new Error("RabbitMQ channel is not available.");
		}
		await this.channel.assertExchange(exchange, "topic", { durable: false });
		await this.channel.assertQueue(queue, { durable: false });

		for (const routingKey of routingKeys) {
			await this.channel.bindQueue(queue, exchange, routingKey);
		}

		this.channel.consume(queue, (msg: any) => {
			if (msg) {
				try {
					const content = JSON.parse(msg.content.toString());
					handler(content);
					this.channel?.ack(msg);
				} catch (error) {
					console.error("Error processing message:", error);
					this.channel?.nack(msg, false, false);
				}
			}
		});
	}
}
