import { Customer } from "../../../../domain/entities/Customer";
import type { CustomerRepository } from "../../../../domain/repositories/CustomerRepository";
import { DbContext } from "../dbContext";

export class PostgresCustomerRepository implements CustomerRepository {
	async findById(id: string): Promise<Customer | null> {
		const sql = `
			SELECT id, balance, card_number, bank
			FROM payments.customers
			WHERE id = $1
		`;

		try {
			const client = DbContext.getClient();
			const { rows, rowCount } = await client.query(sql, [id]);

			if (rowCount === 0) {
				return null;
			}

			const row = rows[0];
			return new Customer(row.id, Number(row.balance), row.card_number, row.bank);
		} catch (error) {
			throw new Error(
				`Failed to find customer: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	async updateBalance(customerId: string, newBalance: number): Promise<void> {
		const sql = `
			UPDATE payments.customers
			SET balance = $1, updated_at = CURRENT_TIMESTAMP
			WHERE id = $2
		`;

		try {
			const client = DbContext.getClient();
			await client.query(sql, [newBalance, customerId]);
		} catch (error) {
			throw new Error(
				`Failed to update customer balance: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}
}
