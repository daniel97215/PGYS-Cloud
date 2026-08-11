import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchaseReturnStatus } from "@prisma/client";
import { AddPurchaseReturnLineDto } from "./dto/add-purchase-return-line.dto";
import { CreatePurchaseReturnDto } from "./dto/create-purchase-return.dto";
import { UpdatePurchaseReturnDto } from "./dto/update-purchase-return.dto";
import {
  PurchaseReturnEmptyError,
  PurchaseReturnLineNotFoundError,
  PurchaseReturnLineReferenceError,
  PurchaseReturnOverQuantityError,
  PurchaseReturnReceiptUnavailableError,
  PurchaseReturnRecord,
  PurchaseReturnStateConflictError,
  PurchaseReturnStockRejectedError,
  PurchaseReturnWithLines,
  PurchaseReturnsRepository,
} from "./purchase-returns.repository";

@Injectable()
export class PurchaseReturnsService {
  constructor(
    private readonly purchaseReturnsRepository: PurchaseReturnsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreatePurchaseReturnDto,
  ): Promise<PurchaseReturnWithLines> {
    try {
      return await this.purchaseReturnsRepository.create({
        workspaceId,
        number: this.normalizeNumber(data.number),
        purchaseReceiptId: data.purchaseReceiptId,
        ...(data.reason === undefined ? {} : { reason: data.reason }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(workspaceId: string): Promise<PurchaseReturnRecord[]> {
    return this.purchaseReturnsRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<PurchaseReturnWithLines> {
    return this.requireReturn(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseReturnDto,
  ): Promise<PurchaseReturnWithLines> {
    await this.requireDraftReturn(workspaceId, id);

    try {
      return await this.purchaseReturnsRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.reason === undefined ? {} : { reason: data.reason }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async addLine(
    workspaceId: string,
    id: string,
    data: AddPurchaseReturnLineDto,
  ): Promise<PurchaseReturnWithLines> {
    await this.requireDraftReturn(workspaceId, id);

    try {
      return await this.purchaseReturnsRepository.addLine({
        workspaceId,
        purchaseReturnId: id,
        purchaseReceiptLineId: data.purchaseReceiptLineId,
        inventoryItemId: data.inventoryItemId,
        quantity: this.toPositiveQuantity(data.quantity),
        ...(data.reason === undefined ? {} : { reason: data.reason }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async updateLine(
    workspaceId: string,
    id: string,
    lineId: string,
    data: AddPurchaseReturnLineDto,
  ): Promise<PurchaseReturnWithLines> {
    await this.requireDraftReturn(workspaceId, id);

    try {
      return await this.purchaseReturnsRepository.updateLine(
        workspaceId,
        id,
        lineId,
        {
          purchaseReceiptLineId: data.purchaseReceiptLineId,
          inventoryItemId: data.inventoryItemId,
          quantity: this.toPositiveQuantity(data.quantity),
          ...(data.reason === undefined ? {} : { reason: data.reason }),
        },
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines> {
    const purchaseReturn = await this.requireReturn(workspaceId, id);

    if (
      purchaseReturn.status !== PurchaseReturnStatus.DRAFT &&
      purchaseReturn.status !== PurchaseReturnStatus.READY
    ) {
      throw new BadRequestException("Purchase return cannot be confirmed");
    }

    if (purchaseReturn.lines.length === 0) {
      throw new BadRequestException(
        "A purchase return without lines cannot be confirmed",
      );
    }

    try {
      return await this.purchaseReturnsRepository.confirm(workspaceId, id);
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines> {
    const purchaseReturn = await this.requireReturn(workspaceId, id);

    if (
      purchaseReturn.status !== PurchaseReturnStatus.DRAFT &&
      purchaseReturn.status !== PurchaseReturnStatus.READY
    ) {
      throw new BadRequestException("Confirmed returns cannot be cancelled");
    }

    const cancelled = await this.purchaseReturnsRepository.cancel(
      workspaceId,
      id,
    );

    if (!cancelled) {
      throw new BadRequestException("Purchase return state changed");
    }

    return cancelled;
  }

  private async requireReturn(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines> {
    const purchaseReturn = await this.purchaseReturnsRepository.findById(
      workspaceId,
      id,
    );

    if (!purchaseReturn) {
      throw new NotFoundException(`Purchase return "${id}" not found`);
    }

    return purchaseReturn;
  }

  private async requireDraftReturn(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines> {
    const purchaseReturn = await this.requireReturn(workspaceId, id);

    if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
      throw new BadRequestException("Only draft purchase returns can be modified");
    }

    return purchaseReturn;
  }

  private toPositiveQuantity(value: number): Prisma.Decimal {
    const quantity = new Prisma.Decimal(value);

    if (!quantity.isFinite() || quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Quantity must be positive");
    }

    return quantity;
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Purchase return number is required");
    }

    return normalized;
  }

  private mapMutationError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Purchase return number already exists in this workspace",
        );
      }

      if (error.code === "P2034") {
        throw new ConflictException(
          "Concurrent purchase return conflict; retry the operation",
        );
      }
    }

    if (error instanceof PurchaseReturnReceiptUnavailableError) {
      throw new BadRequestException(
        "Only confirmed purchase receipts can be returned",
      );
    }

    if (error instanceof PurchaseReturnStateConflictError) {
      throw new BadRequestException("Purchase return state changed");
    }

    if (error instanceof PurchaseReturnLineReferenceError) {
      throw new BadRequestException(
        "Return line does not match the receipt or inventory item",
      );
    }

    if (error instanceof PurchaseReturnOverQuantityError) {
      throw new BadRequestException(
        "Returned quantity exceeds received quantity",
      );
    }

    if (error instanceof PurchaseReturnLineNotFoundError) {
      throw new NotFoundException("Purchase return line not found");
    }

    if (error instanceof PurchaseReturnEmptyError) {
      throw new BadRequestException("Purchase return has no lines");
    }

    if (error instanceof PurchaseReturnStockRejectedError) {
      throw new BadRequestException(
        "Available stock is insufficient for this return",
      );
    }

    throw error;
  }
}
