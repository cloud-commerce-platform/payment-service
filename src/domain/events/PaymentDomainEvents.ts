import type { DomainEvent } from "@alejotamayo28/event-contracts";

export interface PaymentProcessedPayload {
	paymentId: string;
	orderId: string;
	customerId: string;
	amount: number;
	status: string;
}

export interface PaymentFailedPayload {
	paymentId: string;
	orderId: string;
	customerId: string;
	amount: number;
	reason: string;
}

export type PaymentVerifiedEvent = DomainEvent<
	PaymentProcessedPayload,
	"Payment",
	"PAYMENT_VERIFIED"
>;

export type PaymentFailedEvent = DomainEvent<
	PaymentFailedPayload,
	"Payment",
	"PAYMENT_FAILED"
>;

export type PaymentDomainEvent = PaymentVerifiedEvent | PaymentFailedEvent;
