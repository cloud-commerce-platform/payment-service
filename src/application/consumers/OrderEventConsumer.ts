import type { IncomingIntegrationEvent } from "../../infrastructure/events/IntegrationEvents";
import type { MessagingService } from "../ports/MessagingService";
import type { PaymentService } from "../services/PaymentService";
import { BaseEventConsumer } from "./BaseEventConsumer";
import type { IncomingOrderEvents, OrderCreatedPayload } from "./types/OrderEvents";

export class OrderEventConsumer extends BaseEventConsumer {
	constructor(
		messagingService: MessagingService,
		private paymentService: PaymentService
	) {
		super(messagingService);
	}

	protected setupEventListeners(): void {
		const { exchange, queue, routingKeys } = this.setUpEventConfig(
			"order_events",
			"payment_service_queue",
			["status.created"]
		);

		this.messagingService.subscribe(
			exchange,
			queue,
			routingKeys,
			async (message: IncomingIntegrationEvent<IncomingOrderEvents>) => {
				try {
					switch (message.eventType) {
						case "ORDER_CREATED":
							await this.handleOrderCreated(
								message as IncomingIntegrationEvent<OrderCreatedPayload>
							);
							break;

						default:
							break;
					}
				} catch (error) {
					console.error("Error processing payment event:", error);
					throw error;
				}
			}
		);
	}

	private async handleOrderCreated(
		message: IncomingIntegrationEvent<OrderCreatedPayload>
	): Promise<void> {
		const { payload } = message;
		console.log("[message]: ", message);
		return this.paymentService.processPayment(
			payload.orderId,
			payload.customerId,
			payload.totalAmount
		);
	}
}
