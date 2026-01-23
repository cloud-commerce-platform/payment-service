import type {
	OrderCancelledPayload,
	OrderCreatedPayload,
} from "@alejotamayo28/event-contracts";

/**
 * Representa la unión de todos los eventos que este servicio puede recibir de 'Order'
 */
export type IncomingOrderEvents = OrderCreatedPayload | OrderCancelledPayload;

/**
 * Re-exportamos los payloads específicos para uso en los handlers
 */
export type { OrderCreatedPayload, OrderCancelledPayload };
