import "reflect-metadata";

import { EventConsumerRegistry } from "./application/consumers/EventConsumerRegistry";
import { CompositionRoot } from "./composition-root";
import { setPaymentService } from "./globals";
import { RabbitMQMessagingService } from "./infrastructure/messaging/adapters/RabbitMQMessagingService";

async function start() {
	try {
		const messagingService = new RabbitMQMessagingService();

		const MAX_RETRIES = 5;
		let retries = 0;
		while (retries < MAX_RETRIES) {
			await messagingService.connect();
			if (messagingService.isConnected()) {
				console.log("Successfully connected to RabbitMQ");
				break;
			}
			retries++;
			console.log(
				`Failed to connect to RabbitMQ (attempt ${retries}/${MAX_RETRIES}). Retrying in 5 seconds...`
			);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		if (!messagingService.isConnected()) {
			throw new Error("Could not connect to RabbitMQ after multiple attempts");
		}

		const paymentService = await CompositionRoot.configure(messagingService);
		setPaymentService(paymentService);

		const eventConsumerRegistry = new EventConsumerRegistry(
			messagingService,
			paymentService
		);
		await eventConsumerRegistry.initializeAllConsumers();

		console.log("Payment service is running and listening for events...");
	} catch (error) {
		console.error("Failed to start payment service:", error);
		process.exit(1);
	}
}

start();
