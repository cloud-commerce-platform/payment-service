import type { MessagingService } from "./application/ports/MessagingService";
import { PaymentService } from "./application/services/PaymentService";
import { ProcessPaymentUseCase } from "./application/use-cases/ProcessPaymentUseCase";
import { PostgresTransactionManager } from "./infrastructure/data-access/postgres/PostgresTransactionManager";
import { PostgresCustomerRepository } from "./infrastructure/data-access/postgres/repositories/PostgresCustomerRepository";
import { PostgresPaymentRepository } from "./infrastructure/data-access/postgres/repositories/PostgresPaymentRepository";
import { RabbitMQDomainEventDispatcher } from "./infrastructure/messaging/adapters/RabbitMQDomainEventDispatcher";

export class CompositionRoot {
	static async configure(messagingService: MessagingService): Promise<PaymentService> {
		const paymentRepository = new PostgresPaymentRepository();
		const customerRepository = new PostgresCustomerRepository();
		const postgresTransactionManager = new PostgresTransactionManager();

		const domainEventDispatcher = new RabbitMQDomainEventDispatcher(messagingService);

		const processPaymentUseCase = new ProcessPaymentUseCase(
			paymentRepository,
			customerRepository,
			postgresTransactionManager,
			domainEventDispatcher
		);

		return new PaymentService(processPaymentUseCase);
	}
}
