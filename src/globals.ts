import type { PaymentService } from "./application/services/PaymentService";

let paymentService: PaymentService;

export const setPaymentService = (service: PaymentService) => {
	paymentService = service;
};

export const getPaymentService = () => {
	if (!paymentService) {
		throw new Error("Payment service not initialized");
	}
	return paymentService;
};
