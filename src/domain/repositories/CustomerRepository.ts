import type { Customer } from "../entities/Customer";

export interface CustomerRepository {
	findById(id: string): Promise<Customer | null>;
	updateBalance(customerId: string, newBalance: number): Promise<void>;
}
