import type { OrderCreatedEvent, OrderDomainEvent } from "@alejotamayo28/event-contracts";
import type { IncomingIntegrationEvent } from "../../infrastructure/events/IntegrationEvents";
import type { MessagingService } from "../ports/MessagingService";
import type { PaymentService } from "../services/PaymentService";
import { BaseEventConsumer } from "./BaseEventConsumer";

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
			["status.created", "status.confirmed", "payment.rollback"]
		);

		this.messagingService.subscribe(
			exchange,
			queue,
			routingKeys,
			async (message: IncomingIntegrationEvent<OrderDomainEvent>) => {
				try {
					switch (message.eventType as OrderDomainEvent["type"]) {
						case "ORDER_CREATED":
							await this.handleOrderCreated(
								message as IncomingIntegrationEvent<OrderCreatedEvent>
							);
							break;

						case "ORDER_PAYMENT_ROLLBACK_REQUESTED":
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
		message: IncomingIntegrationEvent<OrderCreatedEvent>
	): Promise<void> {
		const { data } = message.payload;
		return this.paymentService.processPayment(
			data.orderId,
			data.customerId,
			data.totalAmount
		);
	}
}
