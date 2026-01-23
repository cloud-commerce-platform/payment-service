import type { MessagingService } from "../../application/ports/MessagingService";

interface boundEvent {
	exchange: string;
	queue: string;
	routingKeys: string[];
}

export abstract class BaseEventConsumer {
	constructor(protected messagingService: MessagingService) {
		this.setupEventListeners();
	}

	protected setUpEventConfig(
		exchange: string,
		queue: string,
		routingKeys: string[]
	): boundEvent {
		return {
			exchange,
			queue,
			routingKeys,
		};
	}

	protected abstract setupEventListeners(): void;
}
