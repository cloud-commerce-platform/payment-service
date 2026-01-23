import type { MessagingService } from "../ports/MessagingService";
import type { PaymentService } from "../services/PaymentService";
import { OrderEventConsumer } from "./OrderEventConsumer";

export class EventConsumerRegistry {
	constructor(
		private messagingService: MessagingService,
		private paymentService: PaymentService
	) {}

	public async initializeAllConsumers(): Promise<void> {
		new OrderEventConsumer(this.messagingService, this.paymentService);
	}
}
