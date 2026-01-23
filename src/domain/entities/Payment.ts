import type { PaymentDomainEvent } from "../events/PaymentDomainEvents";
import Entity from "./Entity";

export class Payment extends Entity<PaymentDomainEvent> {
	private orderId: string;
	private customerId: string;
	private amount: number;
	private status: string;

	constructor(orderId: string, customerId: string, amount: number, status = "PENDING") {
		super();
		this.orderId = orderId;
		this.customerId = customerId;
		this.amount = amount;
		this.status = status;
	}

	public getOrderId(): string {
		return this.orderId;
	}

	public getCustomerId(): string {
		return this.customerId;
	}

	public getAmount(): number {
		return this.amount;
	}

	public getStatus(): string {
		return this.status;
	}

	public markAsCompleted() {
		this.status = "COMPLETED";
		this.addDomainEvent({
			type: "PAYMENT_VERIFIED",
			timestamp: new Date(),
			aggregateId: this.getId(),
			aggregateType: "Payment",
			data: {
				paymentId: this.getId(),
				orderId: this.orderId,
				customerId: this.customerId,
				amount: this.amount,
				status: this.status,
			},
		});
	}

	public markAsFailed(reason: string) {
		this.status = "FAILED";
		this.addDomainEvent({
			type: "PAYMENT_FAILED",
			timestamp: new Date(),
			aggregateId: this.getId(),
			aggregateType: "Payment",
			data: {
				paymentId: this.getId(),
				orderId: this.orderId,
				customerId: this.customerId,
				amount: this.amount,
				reason: reason,
			},
		});
	}
}
