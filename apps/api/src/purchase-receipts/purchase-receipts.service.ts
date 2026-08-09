import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchaseReceiptStatus } from "@prisma/client";
import { AddPurchaseReceiptLineDto } from "./dto/add-purchase-receipt-line.dto";
import { CreatePurchaseReceiptDto } from "./dto/create-purchase-receipt.dto";
import { UpdatePurchaseReceiptDto } from "./dto/update-purchase-receipt.dto";
import {
  PurchaseReceiptEmptyError,
  PurchaseReceiptLineNotFoundError,
  PurchaseReceiptLineReferenceError,
  PurchaseReceiptOrderUnavailableError,
  PurchaseReceiptOverQuantityError,
  PurchaseReceiptRecord,
  PurchaseReceiptStateConflictError,
  PurchaseReceiptStockRejectedError,
  PurchaseReceiptWithLines,
  PurchaseReceiptsRepository,
} from "./purchase-receipts.repository";

@Injectable()
export class PurchaseReceiptsService {
  constructor(
    private readonly purchaseReceiptsRepository: PurchaseReceiptsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreatePurchaseReceiptDto,
  ): Promise<PurchaseReceiptWithLines> {
    try {
      return await this.purchaseReceiptsRepository.create({
        workspaceId,
        number: this.normalizeNumber(data.number),
        purchaseOrderId: data.purchaseOrderId,
        warehouseId: data.warehouseId,
        ...(data.supplierReference === undefined
          ? {}
          : { supplierReference: data.supplierReference }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(workspaceId: string): Promise<PurchaseReceiptRecord[]> {
    return this.purchaseReceiptsRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<PurchaseReceiptWithLines> {
    return this.requireReceipt(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseReceiptDto,
  ): Promise<PurchaseReceiptWithLines> {
    await this.requireDraftReceipt(workspaceId, id);

    try {
      return await this.purchaseReceiptsRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.supplierReference === undefined
          ? {}
          : { supplierReference: data.supplierReference }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async addLine(
    workspaceId: string,
    id: string,
    data: AddPurchaseReceiptLineDto,
  ): Promise<PurchaseReceiptWithLines> {
    await this.requireDraftReceipt(workspaceId, id);
    const quantity = this.toPositiveQuantity(data.quantity);

    try {
      return await this.purchaseReceiptsRepository.addLine({
        workspaceId,
        purchaseReceiptId: id,
        purchaseOrderLineId: data.purchaseOrderLineId,
        inventoryItemId: data.inventoryItemId,
        quantity,
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async updateLine(
    workspaceId: string,
    id: string,
    lineId: string,
    data: AddPurchaseReceiptLineDto,
  ): Promise<PurchaseReceiptWithLines> {
    await this.requireDraftReceipt(workspaceId, id);
    const quantity = this.toPositiveQuantity(data.quantity);

    try {
      return await this.purchaseReceiptsRepository.updateLine(
        workspaceId,
        id,
        lineId,
        {
          purchaseOrderLineId: data.purchaseOrderLineId,
          inventoryItemId: data.inventoryItemId,
          quantity,
        },
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines> {
    const receipt = await this.requireReceipt(workspaceId, id);

    if (
      receipt.status !== PurchaseReceiptStatus.DRAFT &&
      receipt.status !== PurchaseReceiptStatus.READY
    ) {
      throw new BadRequestException("Purchase receipt cannot be confirmed");
    }

    if (receipt.lines.length === 0) {
      throw new BadRequestException(
        "A purchase receipt without lines cannot be confirmed",
      );
    }

    try {
      return await this.purchaseReceiptsRepository.confirm(workspaceId, id);
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines> {
    const receipt = await this.requireReceipt(workspaceId, id);

    if (
      receipt.status !== PurchaseReceiptStatus.DRAFT &&
      receipt.status !== PurchaseReceiptStatus.READY
    ) {
      throw new BadRequestException("Confirmed receipts cannot be cancelled");
    }

    const cancelled = await this.purchaseReceiptsRepository.cancel(
      workspaceId,
      id,
    );

    if (!cancelled) {
      throw new BadRequestException("Purchase receipt state changed");
    }

    return cancelled;
  }

  private async requireReceipt(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines> {
    const receipt = await this.purchaseReceiptsRepository.findById(
      workspaceId,
      id,
    );

    if (!receipt) {
      throw new NotFoundException(`Purchase receipt "${id}" not found`);
    }

    return receipt;
  }

  private async requireDraftReceipt(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReceiptWithLines> {
    const receipt = await this.requireReceipt(workspaceId, id);

    if (receipt.status !== PurchaseReceiptStatus.DRAFT) {
      throw new BadRequestException("Only draft purchase receipts can be modified");
    }

    return receipt;
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
      throw new BadRequestException("Purchase receipt number is required");
    }

    return normalized;
  }

  private mapMutationError(error: unknown): never {
    if (error instanceof PurchaseReceiptOrderUnavailableError) {
      throw new BadRequestException(
        "Purchase order is unavailable or warehouse is inconsistent",
      );
    }

    if (error instanceof PurchaseReceiptStateConflictError) {
      throw new BadRequestException("Purchase receipt state changed");
    }

    if (error instanceof PurchaseReceiptLineReferenceError) {
      throw new BadRequestException(
        "Receipt line does not match the order, inventory item or warehouse",
      );
    }

    if (error instanceof PurchaseReceiptOverQuantityError) {
      throw new BadRequestException(
        "Received quantity exceeds ordered quantity",
      );
    }

    if (error instanceof PurchaseReceiptLineNotFoundError) {
      throw new NotFoundException("Purchase receipt line not found");
    }

    if (error instanceof PurchaseReceiptEmptyError) {
      throw new BadRequestException("Purchase receipt has no lines");
    }

    if (error instanceof PurchaseReceiptStockRejectedError) {
      throw new BadRequestException(
        "Stock update rejected because the inventory item is inactive",
      );
    }

    throw error;
  }
}
