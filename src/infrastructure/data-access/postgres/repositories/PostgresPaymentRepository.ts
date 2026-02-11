import type { PoolClient } from "pg";
import { Payment } from "../../../../domain/entities/Payment";
import type { PaymentRepository } from "../../../../domain/repositories/PaymentRepository";
import { type PaymentDbStructure, saveStructures } from "../bulkOperations";
import { DbContext } from "../dbContext";

export class PostgresPaymentRepository implements PaymentRepository {
	static paymentSql = `
  payments.id AS payments_id,
  payments.order_id AS payments_order_id,
  payments.customer_id AS payments_customer_id,
  payments.amount AS payments_amount,
  payments.status AS payments_status
`;

	private loadPayment(row: any): Payment {
		return Payment.loadPayment(
			row.payments_id,
			row.payments_order_id,
			row.payments_customer_id,
			row.payments_amount,
			row.payment_status
		);
	}

	private getPaymentDbStructure(payment: Payment): PaymentDbStructure {
		return {
			id: payment.getId(),
			order_id: payment.getOrderId(),
			customer_id: payment.getCustomerId(),
			amount: payment.getAmount(),
			status: payment.getStatus(),
		};
	}

	async savePayment(payment: Payment, poolClient: PoolClient): Promise<void> {
		await this.savePayments([payment], poolClient);
	}

	async savePayments(payments: Payment[], poolClient: PoolClient): Promise<void> {
		try {
			await saveStructures(
				payments
					.filter((payment) => {
						return payment.getWasUpdated();
					})
					.map((payment) => {
						return this.getPaymentDbStructure(payment);
					}),
				"payments.payments",
				poolClient
			);
		} catch (error) {
			console.error("Error saving multiple payments:", error);
			throw new Error(
				`Failed to save orders: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	async save(payment: Payment): Promise<void> {
		const client = DbContext.getClient();
		await this.savePayment(payment, client);
	}

	async saveMany(payments: Payment[]): Promise<void> {
		const client = DbContext.getClient();
		await this.savePayments(payments, client);
	}

	async findById(id: string): Promise<Payment | null> {
		const sql = `
			SELECT ${PostgresPaymentRepository.paymentSql} 
			FROM payments.payments
			WHERE payments.id = $1
      FOR UPDATE
		`;

		try {
			const client = DbContext.getClient();
			const { rows, rowCount } = await client.query(sql, [id]);

			if (rowCount === 0) {
				return null;
			}

			return this.loadPayment(rows[0]);
		} catch (error) {
			throw new Error(
				`Failed to find payment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	async findByOrderId(orderId: string): Promise<Payment | null> {
		const sql = `
			SELECT ${PostgresPaymentRepository.paymentSql} 
			FROM payments.payments
			WHERE payments.order_id = $1
		`;

		try {
			const client = DbContext.getClient();
			const { rows, rowCount } = await client.query(sql, [orderId]);

			if (rowCount === 0) {
				return null;
			}

			return this.loadPayment(rows[0]);
		} catch (error) {
			throw new Error(
				`Failed to find payment by order id: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}
}
