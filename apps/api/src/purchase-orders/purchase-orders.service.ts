import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";
import { AddPurchaseOrderLineDto } from "./dto/add-purchase-order-line.dto";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import {
  PurchaseOrderLineData,
  PurchaseOrderLineNotFoundError,
  PurchaseOrderRecord,
  PurchaseOrderStateConflictError,
  PurchaseOrderWithLines,
  PurchaseOrdersRepository,
} from "./purchase-orders.repository";

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrderWithLines> {
    await this.requireSupplier(workspaceId, data.supplierId);
    await this.requireWarehouse(workspaceId, data.warehouseId);
    const orderDate = new Date(data.orderDate);
    const expectedDate = data.expectedDate
      ? new Date(data.expectedDate)
      : undefined;
    this.validateDates(orderDate, expectedDate);

    return this.purchaseOrdersRepository.create({
      workspaceId,
      number: this.normalizeNumber(data.number),
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      orderDate,
      ...(expectedDate === undefined ? {} : { expectedDate }),
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
      ...(data.supplierReference === undefined
        ? {}
        : { supplierReference: data.supplierReference }),
      ...(data.notes === undefined ? {} : { notes: data.notes }),
    });
  }

  list(workspaceId: string): Promise<PurchaseOrderRecord[]> {
    return this.purchaseOrdersRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<PurchaseOrderWithLines> {
    return this.requireOrder(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrderWithLines> {
    const order = await this.requireDraftOrder(workspaceId, id);

    if (data.supplierId !== undefined) {
      await this.requireSupplier(workspaceId, data.supplierId);
    }

    if (data.warehouseId !== undefined) {
      await this.requireWarehouse(workspaceId, data.warehouseId);
    }

    const orderDate = data.orderDate
      ? new Date(data.orderDate)
      : order.orderDate;
    const expectedDate = data.expectedDate
      ? new Date(data.expectedDate)
      : (order.expectedDate ?? undefined);
    this.validateDates(orderDate, expectedDate);

    try {
      return await this.purchaseOrdersRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.supplierId === undefined
          ? {}
          : { supplierId: data.supplierId }),
        ...(data.warehouseId === undefined
          ? {}
          : { warehouseId: data.warehouseId }),
        ...(data.orderDate === undefined ? {} : { orderDate }),
        ...(data.expectedDate === undefined ? {} : { expectedDate }),
        ...(data.currencyCode === undefined
          ? {}
          : { currencyCode: this.normalizeCurrencyCode(data.currencyCode) }),
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
    data: AddPurchaseOrderLineDto,
  ): Promise<PurchaseOrderWithLines> {
    await this.requireDraftOrder(workspaceId, id);
    await this.validateLineReferences(workspaceId, data);

    try {
      return await this.purchaseOrdersRepository.addLine(
        this.toLineData(workspaceId, id, data),
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async updateLine(
    workspaceId: string,
    id: string,
    lineId: string,
    data: AddPurchaseOrderLineDto,
  ): Promise<PurchaseOrderWithLines> {
    await this.requireDraftOrder(workspaceId, id);
    await this.validateLineReferences(workspaceId, data);
    const lineData = this.toLineData(workspaceId, id, data);

    try {
      return await this.purchaseOrdersRepository.updateLine(
        workspaceId,
        id,
        lineId,
        {
          productId: lineData.productId,
          ...(lineData.productVariantId === undefined
            ? {}
            : { productVariantId: lineData.productVariantId }),
          description: lineData.description,
          quantity: lineData.quantity,
          unitCost: lineData.unitCost,
          taxRate: lineData.taxRate,
          subtotalAmount: lineData.subtotalAmount,
          taxAmount: lineData.taxAmount,
          totalAmount: lineData.totalAmount,
          sortOrder: lineData.sortOrder,
        },
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async removeLine(
    workspaceId: string,
    id: string,
    lineId: string,
  ): Promise<void> {
    await this.requireDraftOrder(workspaceId, id);

    try {
      await this.purchaseOrdersRepository.removeLine(workspaceId, id, lineId);
    } catch (error) {
      this.mapMutationError(error);
    }
  }

  async send(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    const order = await this.requireOrder(workspaceId, id);

    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException("Invalid purchase order status transition");
    }

    if (order.lines.length === 0) {
      throw new BadRequestException(
        "A purchase order without lines cannot be sent",
      );
    }

    return this.transition(
      workspaceId,
      id,
      [PurchaseOrderStatus.DRAFT],
      PurchaseOrderStatus.SENT,
      true,
    );
  }

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    const order = await this.requireOrder(workspaceId, id);

    if (order.status !== PurchaseOrderStatus.SENT) {
      throw new BadRequestException("Invalid purchase order status transition");
    }

    if (order.lines.length === 0) {
      throw new BadRequestException(
        "A purchase order without lines cannot be confirmed",
      );
    }

    return this.transition(
      workspaceId,
      id,
      [PurchaseOrderStatus.SENT],
      PurchaseOrderStatus.CONFIRMED,
      true,
    );
  }

  cancel(workspaceId: string, id: string): Promise<PurchaseOrderWithLines> {
    return this.transition(
      workspaceId,
      id,
      [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SENT],
      PurchaseOrderStatus.CANCELLED,
    );
  }

  private async transition(
    workspaceId: string,
    id: string,
    fromStatuses: PurchaseOrderStatus[],
    toStatus: PurchaseOrderStatus,
    requireLines = false,
  ): Promise<PurchaseOrderWithLines> {
    await this.requireOrder(workspaceId, id);
    const order = await this.purchaseOrdersRepository.transitionStatus(
      workspaceId,
      id,
      fromStatuses,
      toStatus,
      requireLines,
    );

    if (!order) {
      throw new BadRequestException("Invalid purchase order status transition");
    }

    return order;
  }

  private async requireOrder(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    const order = await this.purchaseOrdersRepository.findById(workspaceId, id);

    if (!order) {
      throw new NotFoundException(`Purchase order "${id}" not found`);
    }

    return order;
  }

  private async requireDraftOrder(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseOrderWithLines> {
    const order = await this.requireOrder(workspaceId, id);

    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException("Only draft purchase orders can be modified");
    }

    return order;
  }

  private async requireSupplier(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const supplier = await this.purchaseOrdersRepository.findSupplier(
      workspaceId,
      id,
    );

    if (!supplier) {
      throw new NotFoundException(`Supplier "${id}" not found`);
    }

    const isLegacySupplier = supplier.type.toLowerCase() === "supplier";

    if (!isLegacySupplier && supplier.roleAssignments.length === 0) {
      throw new BadRequestException(
        "Business partner does not have the supplier role",
      );
    }
  }

  private async requireWarehouse(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const warehouse = await this.purchaseOrdersRepository.findWarehouse(
      workspaceId,
      id,
    );

    if (!warehouse) {
      throw new NotFoundException(`Warehouse "${id}" not found`);
    }
  }

  private async validateLineReferences(
    workspaceId: string,
    data: AddPurchaseOrderLineDto,
  ): Promise<void> {
    const product = await this.purchaseOrdersRepository.findProduct(
      workspaceId,
      data.productId,
    );

    if (!product) {
      throw new NotFoundException(`Product "${data.productId}" not found`);
    }

    if (data.productVariantId === undefined) {
      return;
    }

    const variant = await this.purchaseOrdersRepository.findProductVariant(
      workspaceId,
      data.productVariantId,
    );

    if (!variant) {
      throw new NotFoundException(
        `Product variant "${data.productVariantId}" not found`,
      );
    }

    if (variant.productId !== data.productId) {
      throw new BadRequestException("Product variant does not belong to product");
    }
  }

  private toLineData(
    workspaceId: string,
    purchaseOrderId: string,
    data: AddPurchaseOrderLineDto,
  ): PurchaseOrderLineData {
    const quantity = new Prisma.Decimal(data.quantity);
    const unitCost = new Prisma.Decimal(data.unitCost);
    const taxRate = new Prisma.Decimal(data.taxRate ?? 0);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Quantity must be positive");
    }

    if (unitCost.isNegative() || taxRate.isNegative()) {
      throw new BadRequestException("Unit cost and tax rate cannot be negative");
    }

    const subtotalAmount = quantity.mul(unitCost).toDecimalPlaces(4);
    const taxAmount = subtotalAmount
      .mul(taxRate)
      .div(100)
      .toDecimalPlaces(4);
    const totalAmount = subtotalAmount.plus(taxAmount).toDecimalPlaces(4);

    return {
      workspaceId,
      purchaseOrderId,
      productId: data.productId,
      ...(data.productVariantId === undefined
        ? {}
        : { productVariantId: data.productVariantId }),
      description: data.description,
      quantity,
      unitCost,
      taxRate,
      subtotalAmount,
      taxAmount,
      totalAmount,
      sortOrder: data.sortOrder ?? 0,
    };
  }

  private validateDates(orderDate: Date, expectedDate?: Date): void {
    if (expectedDate && expectedDate < orderDate) {
      throw new BadRequestException("Expected date cannot precede order date");
    }
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Purchase order number is required");
    }

    return normalized;
  }

  private normalizeCurrencyCode(currencyCode: string): string {
    const normalized = currencyCode.trim().toUpperCase();

    if (normalized.length !== 3) {
      throw new BadRequestException("Currency code must use ISO-4217 format");
    }

    return normalized;
  }

  private mapMutationError(error: unknown): never {
    if (error instanceof PurchaseOrderLineNotFoundError) {
      throw new NotFoundException("Purchase order line not found");
    }

    if (error instanceof PurchaseOrderStateConflictError) {
      throw new BadRequestException("Only draft purchase orders can be modified");
    }

    throw error;
  }
}
