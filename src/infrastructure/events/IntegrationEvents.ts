import type { OrderDomainEvent } from "@alejotamayo28/event-contracts";

type IncomingEvents = OrderDomainEvent;

export interface OutgoingIntegrationEvent<T = unknown> {
	eventId: string;
	eventType: string;
	payload: T;
	correlationId?: string;
	version: string;
	occurredAt: string;
	exchange: string;
	routingKey: string;
	source: string;
}

export interface IncomingIntegrationEvent<T extends IncomingEvents> {
	eventId: string;
	eventType: string;
	payload: T;
	correlationId?: string;
	version: string;
	occurredAt: string;
	exchange: string;
	routingKey: string;
	source: string;
}
