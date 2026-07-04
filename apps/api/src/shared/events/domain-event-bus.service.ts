import { Injectable } from "@nestjs/common";
import { DomainEventHandler } from "./domain-event-handler.interface";
import { DomainEvent } from "./domain-event.interface";

@Injectable()
export class DomainEventBusService {
  private readonly handlers = new Map<
    string,
    Set<DomainEventHandler<DomainEvent>>
  >();

  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>,
  ): void {
    const handlers = this.handlers.get(eventType) ?? new Set();

    handlers.add(handler as DomainEventHandler<DomainEvent>);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? new Set();

    for (const handler of handlers) {
      await handler.handle(event);
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

