import type { IncomingOrderEvents } from "@/application/consumers/types/OrderEvents";

type IncomingEvents = IncomingOrderEvents;

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
