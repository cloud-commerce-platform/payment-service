export class Customer {
	private id: string;
	private balance: number;
	private cardNumber: string;
	private bank: string;

	constructor(id: string, balance: number, cardNumber: string, bank: string) {
		this.id = id;
		this.balance = balance;
		this.cardNumber = cardNumber;
		this.bank = bank;
	}

	public getId(): string {
		return this.id;
	}

	public getBalance(): number {
		return this.balance;
	}

	public getCardNumber(): string {
		return this.cardNumber;
	}

	public getBank(): string {
		return this.bank;
	}

	public hasSufficientBalance(amount: number): boolean {
		return this.balance >= amount;
	}

	public deductBalance(amount: number): void {
		this.balance -= amount;
	}

	public updateBalance(newBalance: number): void {
		this.balance = newBalance;
	}
}
