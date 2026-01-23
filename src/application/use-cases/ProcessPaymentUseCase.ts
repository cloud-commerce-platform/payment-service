import { Payment } from "../../domain/entities/Payment";
import type { CustomerRepository } from "../../domain/repositories/CustomerRepository";
import type { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import type { DomainEventDispatcher } from "../ports/DomainEventDispatcher";
import type { TransactionManager } from "../ports/TransactionManager";

export class ProcessPaymentUseCase {
	constructor(
		private paymentRepository: PaymentRepository,
		private customerRepository: CustomerRepository,
		private transactionManager: TransactionManager,
		private domainEventDispatcher: DomainEventDispatcher
	) {}

	async execute(orderId: string, customerId: string, amount: number): Promise<void> {
		await this.transactionManager.runInTransaction(async () => {
			const payment = new Payment(orderId, customerId, amount);

			const customer = await this.customerRepository.findById(customerId);

			if (!customer) {
				payment.markAsFailed("CUSTOMER_NOT_FOUND");
				await this.paymentRepository.save(payment);
				await this.domainEventDispatcher.dispatch(payment.getDomainEvents());
				payment.clearDomainEvents();
				return;
			}

			if (!customer.hasSufficientBalance(amount)) {
				payment.markAsFailed("INSUFFICIENT_FUNDS");
				await this.paymentRepository.save(payment);
				await this.domainEventDispatcher.dispatch(payment.getDomainEvents());
				payment.clearDomainEvents();
				return;
			}

			customer.deductBalance(amount);
			await this.customerRepository.updateBalance(
				customer.getId(),
				customer.getBalance()
			);

			payment.markAsCompleted();
			await this.paymentRepository.save(payment);
			await this.domainEventDispatcher.dispatch(payment.getDomainEvents());
			payment.clearDomainEvents();
		});
	}
}
