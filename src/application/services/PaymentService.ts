import type { ProcessPaymentUseCase } from "../use-cases/ProcessPaymentUseCase";

export class PaymentService {
	constructor(private processPaymentUseCase: ProcessPaymentUseCase) {}

	async processPayment(
		orderId: string,
		customerId: string,
		amount: number
	): Promise<void> {
		return this.processPaymentUseCase.execute(orderId, customerId, amount);
	}
}
