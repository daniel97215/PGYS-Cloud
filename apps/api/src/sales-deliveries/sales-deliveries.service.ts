import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesDeliveryStatus } from "@prisma/client";
import { AddSalesDeliveryLineDto } from "./dto/add-sales-delivery-line.dto";
import { CreateSalesDeliveryDto } from "./dto/create-sales-delivery.dto";
import {
  SalesDeliveryLineNotFoundError,
  SalesDeliveryLineReferenceError,
  SalesDeliveryOrderUnavailableError,
  SalesDeliveryOverQuantityError,
  SalesDeliveryRecord,
  SalesDeliveryStateConflictError,
  SalesDeliveryStockRejectedError,
  SalesDeliveryWithLines,
  SalesDeliveriesRepository,
} from "./sales-deliveries.repository";

@Injectable()
export class SalesDeliveriesService {
  constructor(
    private readonly salesDeliveriesRepository: SalesDeliveriesRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateSalesDeliveryDto,
  ): Promise<SalesDeliveryWithLines> {
    try {
      return await this.salesDeliveriesRepository.create({
        workspaceId,
        number: this.normalizeNumber(data.number),
        salesOrderId: data.salesOrderId,
        ...(data.deliveryAddress === undefined
          ? {}
          : {
              deliveryAddress:
                data.deliveryAddress as Prisma.InputJsonValue,
            }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(workspaceId: string): Promise<SalesDeliveryRecord[]> {
    return this.salesDeliveriesRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<SalesDeliveryWithLines> {
    return this.requireDelivery(workspaceId, id);
  }

  async addLine(
    workspaceId: string,
    id: string,
    data: AddSalesDeliveryLineDto,
  ): Promise<SalesDeliveryWithLines> {
    await this.requireDraftDelivery(workspaceId, id);
    const quantity = new Prisma.Decimal(data.quantity);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Quantity must be positive");
    }

    try {
      return await this.salesDeliveriesRepository.addLine({
        workspaceId,
        salesDeliveryId: id,
        salesOrderLineId: data.salesOrderLineId,
        inventoryItemId: data.inventoryItemId,
        quantity,
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async removeLine(
    workspaceId: string,
    id: string,
    lineId: string,
  ): Promise<void> {
    await this.requireDraftDelivery(workspaceId, id);

    try {
      await this.salesDeliveriesRepository.removeLine(
        workspaceId,
        id,
        lineId,
      );
    } catch (error) {
      this.mapMutationError(error);
    }
  }

  async ready(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines> {
    const delivery = await this.requireDelivery(workspaceId, id);

    if (delivery.status !== SalesDeliveryStatus.DRAFT) {
      throw new BadRequestException("Invalid sales delivery status transition");
    }

    if (delivery.lines.length === 0) {
      throw new BadRequestException("A delivery without lines cannot be ready");
    }

    const readyDelivery = await this.salesDeliveriesRepository.ready(
      workspaceId,
      id,
    );

    if (!readyDelivery) {
      throw new BadRequestException("Invalid sales delivery status transition");
    }

    return readyDelivery;
  }

  async ship(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines> {
    const delivery = await this.requireDelivery(workspaceId, id);

    if (delivery.status !== SalesDeliveryStatus.READY) {
      throw new BadRequestException("Only ready deliveries can be shipped");
    }

    try {
      return await this.salesDeliveriesRepository.ship(workspaceId, id);
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  deliver(workspaceId: string, id: string): Promise<SalesDeliveryWithLines> {
    return this.transition(
      workspaceId,
      id,
      SalesDeliveryStatus.SHIPPED,
      () => this.salesDeliveriesRepository.deliver(workspaceId, id),
    );
  }

  cancel(workspaceId: string, id: string): Promise<SalesDeliveryWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesDeliveryStatus.DRAFT, SalesDeliveryStatus.READY],
      () => this.salesDeliveriesRepository.cancel(workspaceId, id),
    );
  }

  private async transition(
    workspaceId: string,
    id: string,
    allowedStatus: SalesDeliveryStatus | SalesDeliveryStatus[],
    mutate: () => Promise<SalesDeliveryWithLines | null>,
  ): Promise<SalesDeliveryWithLines> {
    const delivery = await this.requireDelivery(workspaceId, id);
    const allowedStatuses = Array.isArray(allowedStatus)
      ? allowedStatus
      : [allowedStatus];

    if (!allowedStatuses.includes(delivery.status)) {
      throw new BadRequestException("Invalid sales delivery status transition");
    }

    const transitioned = await mutate();

    if (!transitioned) {
      throw new BadRequestException("Invalid sales delivery status transition");
    }

    return transitioned;
  }

  private async requireDelivery(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines> {
    const delivery = await this.salesDeliveriesRepository.findById(
      workspaceId,
      id,
    );

    if (!delivery) {
      throw new NotFoundException(`Sales delivery "${id}" not found`);
    }

    return delivery;
  }

  private async requireDraftDelivery(
    workspaceId: string,
    id: string,
  ): Promise<SalesDeliveryWithLines> {
    const delivery = await this.requireDelivery(workspaceId, id);

    if (delivery.status !== SalesDeliveryStatus.DRAFT) {
      throw new BadRequestException("Only draft deliveries can be modified");
    }

    return delivery;
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Sales delivery number is required");
    }

    return normalized;
  }

  private mapMutationError(error: unknown): never {
    if (error instanceof SalesDeliveryOrderUnavailableError) {
      throw new BadRequestException(
        "Sales order must be confirmed or processing",
      );
    }

    if (error instanceof SalesDeliveryStateConflictError) {
      throw new BadRequestException("Sales delivery state changed");
    }

    if (error instanceof SalesDeliveryLineReferenceError) {
      throw new BadRequestException("Delivery line references are inconsistent");
    }

    if (error instanceof SalesDeliveryOverQuantityError) {
      throw new BadRequestException("Delivered quantity exceeds ordered quantity");
    }

    if (error instanceof SalesDeliveryLineNotFoundError) {
      throw new NotFoundException("Sales delivery line not found");
    }

    if (error instanceof SalesDeliveryStockRejectedError) {
      throw new BadRequestException("Insufficient available stock");
    }

    throw error;
  }
}
