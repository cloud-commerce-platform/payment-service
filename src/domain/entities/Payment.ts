import type {
	CancellationReason,
	PaymentDomainEvent,
} from "@alejotamayo28/event-contracts";
import Entity from "./Entity";

export class Payment extends Entity<PaymentDomainEvent> {
	static loadPayment(
		id: string,
		orderId: string,
		customerId: string,
		amount: number,
		status: string
	): Payment {
		const payment = new Payment(orderId, customerId, amount, status);
		payment.setId(id);
		payment.setWasUpdated(false);

		return payment;
	}

	private orderId: string;
	private customerId: string;
	private amount: number;
	private status: string;
	private wasUpdated: boolean;

	constructor(orderId: string, customerId: string, amount: number, status = "PENDING") {
		super();
		this.orderId = orderId;
		this.customerId = customerId;
		this.amount = amount;
		this.status = status;
		this.wasUpdated = true;
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

	public getWasUpdated(): boolean {
		return this.wasUpdated;
	}

	public setWasUpdated(wasUpdated: boolean) {
		this.wasUpdated = wasUpdated;
	}

	public markAsCompleted() {
		this.status = "COMPLETED";
		this.addDomainEvent({
			type: "PAYMENT_DEDUCTION_COMPLETED",
			timestamp: new Date(),
			aggregateId: this.getId(),
			aggregateType: "Payment",
			data: {
				type: "PAYMENT_DEDUCTION_COMPLETED",
				orderId: this.orderId,
			},
		});
	}

	public markAsFailed(reason: CancellationReason) {
		this.status = "FAILED";
		this.addDomainEvent({
			type: "PAYMENT_DEDUCTION_FAILED",
			timestamp: new Date(),
			aggregateId: this.getId(),
			aggregateType: "Payment",
			data: {
				type: "PAYMENT_DEDUCTION_FAILED",
				orderId: this.orderId,
				reason: reason,
			},
		});
	}
}
