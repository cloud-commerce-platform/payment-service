import type { DomainEvent } from "@alejotamayo28/event-contracts";
import { v7 as uuid } from "uuid";

export default abstract class Entity<T extends DomainEvent> {
	protected id: string;
	private domainEvents: T[] = [];

	constructor() {
		this.id = uuid();
	}

	public getId(): string {
		return this.id;
	}

	public setId(id: string) {
		this.id = id;
	}

	public addDomainEvent(event: T) {
		this.domainEvents.push(event);
	}

	public getDomainEvents(): T[] {
		return this.domainEvents;
	}

	public clearDomainEvents() {
		this.domainEvents = [];
	}
}
