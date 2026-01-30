import type { PaymentDomainEvent } from "@alejotamayo28/event-contracts";
import { v7 as uuid } from "uuid";
import type { DomainEventDispatcher } from "../../../application/ports/DomainEventDispatcher";
import type { MessagingService } from "../../../application/ports/MessagingService";
import type { OutgoingIntegrationEvent } from "../../events/IntegrationEvents";

export class RabbitMQDomainEventDispatcher implements DomainEventDispatcher {
	constructor(private readonly messagingService: MessagingService) {}

	async dispatch(events: PaymentDomainEvent[]): Promise<void> {
		for (const event of events) {
			const mainMapping = this.getMainEventMapping(event);

			if (!mainMapping) {
				console.warn(`No mapping found for event ${event.type}`);
				continue;
			}

			const outgoing: OutgoingIntegrationEvent<typeof event.data> = {
				eventId: uuid(),
				eventType: event.type,
				payload: event.data,
				correlationId: event.aggregateId,
				version: "1.0",
				occurredAt: new Date().toISOString(),
				exchange: mainMapping.exchange,
				routingKey: mainMapping.routingKey,
				source: "payment-service",
			};

			await this.messagingService.publish(
				outgoing.exchange,
				outgoing.routingKey,
				outgoing
			);
		}
	}

	private getMainEventMapping(event: PaymentDomainEvent): {
		exchange: string;
		routingKey: string;
	} | null {
		const eventMappings: Record<
			PaymentDomainEvent["type"],
			{ exchange: string; routingKey: string }
		> = {
			PAYMENT_DEDUCTED: {
				exchange: "payment_events",
				routingKey: "payment.verification.verified",
			},
			PAYMENT_DEDUCTED_FAILED: {
				exchange: "payment_events",
				routingKey: "payment.verification.failed",
			},
		};
		return eventMappings[event.type] ?? null;
	}
}
