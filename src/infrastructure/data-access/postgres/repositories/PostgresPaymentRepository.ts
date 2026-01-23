import { Payment } from "../../../../domain/entities/Payment";
import type { PaymentRepository } from "../../../../domain/repositories/PaymentRepository";
import { DbContext } from "../dbContext";

export class PostgresPaymentRepository implements PaymentRepository {
	async save(payment: Payment): Promise<void> {
		const sql = `
			INSERT INTO payments.payments (id, order_id, customer_id, amount, status)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				status = EXCLUDED.status
		`;

		try {
			const client = DbContext.getClient();
			await client.query(sql, [
				payment.getId(),
				payment.getOrderId(),
				payment.getCustomerId(),
				payment.getAmount(),
				payment.getStatus(),
			]);
		} catch (error) {
			throw new Error(
				`Failed to save payment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	async findById(id: string): Promise<Payment | null> {
		const sql = `
			SELECT id, order_id, customer_id, amount, status
			FROM payments.payments
			WHERE id = $1
		`;

		try {
			const client = DbContext.getClient();
			const { rows, rowCount } = await client.query(sql, [id]);

			if (rowCount === 0) {
				return null;
			}

			const row = rows[0];
			const payment = new Payment(
				row.order_id,
				row.customer_id,
				Number(row.amount),
				row.status
			);
			payment.setId(row.id);
			return payment;
		} catch (error) {
			throw new Error(
				`Failed to find payment: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	async findByOrderId(orderId: string): Promise<Payment | null> {
		const sql = `
			SELECT id, order_id, customer_id, amount, status
			FROM payments.payments
			WHERE order_id = $1
		`;

		try {
			const client = DbContext.getClient();
			const { rows, rowCount } = await client.query(sql, [orderId]);

			if (rowCount === 0) {
				return null;
			}

			const row = rows[0];
			const payment = new Payment(
				row.order_id,
				row.customer_id,
				Number(row.amount),
				row.status
			);
			payment.setId(row.id);
			return payment;
		} catch (error) {
			throw new Error(
				`Failed to find payment by order id: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}
}
