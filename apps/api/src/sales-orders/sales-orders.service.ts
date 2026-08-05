import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesOrderStatus } from "@prisma/client";
import { AddSalesOrderLineDto } from "./dto/add-sales-order-line.dto";
import {
  ConvertSalesQuoteDto,
  CreateSalesOrderDto,
} from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";
import {
  SalesOrderLineData,
  SalesOrderLineNotFoundError,
  SalesOrderQuoteAlreadyConvertedError,
  SalesOrderQuoteNotAcceptedError,
  SalesOrderRecord,
  SalesOrderSourceQuoteNotFoundError,
  SalesOrderStateConflictError,
  SalesOrderWithLines,
  SalesOrdersRepository,
} from "./sales-orders.repository";

@Injectable()
export class SalesOrdersService {
  constructor(private readonly salesOrdersRepository: SalesOrdersRepository) {}

  async create(
    workspaceId: string,
    data: CreateSalesOrderDto,
  ): Promise<SalesOrderWithLines> {
    await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    const orderDate = new Date(data.orderDate);
    const requestedDate = data.requestedDate
      ? new Date(data.requestedDate)
      : undefined;
    this.validateDates(orderDate, requestedDate);

    return this.salesOrdersRepository.create({
      workspaceId,
      number: this.normalizeNumber(data.number),
      businessPartnerId: data.businessPartnerId,
      orderDate,
      ...(requestedDate === undefined ? {} : { requestedDate }),
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
      ...(data.notes === undefined ? {} : { notes: data.notes }),
    });
  }

  async createFromQuote(
    workspaceId: string,
    salesQuoteId: string,
    data: ConvertSalesQuoteDto,
  ): Promise<SalesOrderWithLines> {
    const orderDate = new Date(data.orderDate);
    const requestedDate = data.requestedDate
      ? new Date(data.requestedDate)
      : undefined;
    this.validateDates(orderDate, requestedDate);

    try {
      return await this.salesOrdersRepository.createFromQuote(
        workspaceId,
        salesQuoteId,
        {
          number: this.normalizeNumber(data.number),
          orderDate,
          ...(requestedDate === undefined ? {} : { requestedDate }),
        },
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(workspaceId: string): Promise<SalesOrderRecord[]> {
    return this.salesOrdersRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<SalesOrderWithLines> {
    return this.requireOrder(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateSalesOrderDto,
  ): Promise<SalesOrderWithLines> {
    const order = await this.requireDraftOrder(workspaceId, id);

    if (data.businessPartnerId !== undefined) {
      await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    }

    const orderDate = data.orderDate
      ? new Date(data.orderDate)
      : order.orderDate;
    const requestedDate = data.requestedDate
      ? new Date(data.requestedDate)
      : (order.requestedDate ?? undefined);
    this.validateDates(orderDate, requestedDate);

    try {
      return await this.salesOrdersRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.businessPartnerId === undefined
          ? {}
          : { businessPartnerId: data.businessPartnerId }),
        ...(data.orderDate === undefined ? {} : { orderDate }),
        ...(data.requestedDate === undefined ? {} : { requestedDate }),
        ...(data.currencyCode === undefined
          ? {}
          : { currencyCode: this.normalizeCurrencyCode(data.currencyCode) }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async addLine(
    workspaceId: string,
    id: string,
    data: AddSalesOrderLineDto,
  ): Promise<SalesOrderWithLines> {
    await this.requireDraftOrder(workspaceId, id);
    await this.validateLineReferences(workspaceId, data);

    try {
      return await this.salesOrdersRepository.addLine(
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
    data: AddSalesOrderLineDto,
  ): Promise<SalesOrderWithLines> {
    await this.requireDraftOrder(workspaceId, id);
    await this.validateLineReferences(workspaceId, data);
    const lineData = this.toLineData(workspaceId, id, data);
    const line = {
      productId: lineData.productId,
      ...(lineData.productVariantId === undefined
        ? {}
        : { productVariantId: lineData.productVariantId }),
      description: lineData.description,
      quantity: lineData.quantity,
      unitPrice: lineData.unitPrice,
      taxRate: lineData.taxRate,
      subtotalAmount: lineData.subtotalAmount,
      taxAmount: lineData.taxAmount,
      totalAmount: lineData.totalAmount,
      sortOrder: lineData.sortOrder,
    };

    try {
      return await this.salesOrdersRepository.updateLine(
        workspaceId,
        id,
        lineId,
        line,
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
      await this.salesOrdersRepository.removeLine(workspaceId, id, lineId);
    } catch (error) {
      this.mapMutationError(error);
    }
  }

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<SalesOrderWithLines> {
    const order = await this.requireOrder(workspaceId, id);

    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException("Invalid sales order status transition");
    }

    if (order.lines.length === 0) {
      throw new BadRequestException("A sales order without lines cannot be confirmed");
    }

    return this.transition(
      workspaceId,
      id,
      [SalesOrderStatus.DRAFT],
      SalesOrderStatus.CONFIRMED,
      true,
    );
  }

  start(workspaceId: string, id: string): Promise<SalesOrderWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesOrderStatus.CONFIRMED],
      SalesOrderStatus.PROCESSING,
    );
  }

  complete(workspaceId: string, id: string): Promise<SalesOrderWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesOrderStatus.PROCESSING],
      SalesOrderStatus.COMPLETED,
    );
  }

  cancel(workspaceId: string, id: string): Promise<SalesOrderWithLines> {
    return this.transition(
      workspaceId,
      id,
      [
        SalesOrderStatus.DRAFT,
        SalesOrderStatus.CONFIRMED,
        SalesOrderStatus.PROCESSING,
      ],
      SalesOrderStatus.CANCELLED,
    );
  }

  private async transition(
    workspaceId: string,
    id: string,
    fromStatuses: SalesOrderStatus[],
    toStatus: SalesOrderStatus,
    requireLines = false,
  ): Promise<SalesOrderWithLines> {
    await this.requireOrder(workspaceId, id);
    const order = await this.salesOrdersRepository.transitionStatus(
      workspaceId,
      id,
      fromStatuses,
      toStatus,
      requireLines,
    );

    if (!order) {
      throw new BadRequestException("Invalid sales order status transition");
    }

    return order;
  }

  private async requireOrder(
    workspaceId: string,
    id: string,
  ): Promise<SalesOrderWithLines> {
    const order = await this.salesOrdersRepository.findById(workspaceId, id);

    if (!order) {
      throw new NotFoundException(`Sales order "${id}" not found`);
    }

    return order;
  }

  private async requireDraftOrder(
    workspaceId: string,
    id: string,
  ): Promise<SalesOrderWithLines> {
    const order = await this.requireOrder(workspaceId, id);

    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException("Only draft sales orders can be modified");
    }

    return order;
  }

  private async requireBusinessPartner(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const partner = await this.salesOrdersRepository.findBusinessPartner(
      workspaceId,
      id,
    );

    if (!partner) {
      throw new NotFoundException(`Business partner "${id}" not found`);
    }
  }

  private async validateLineReferences(
    workspaceId: string,
    data: AddSalesOrderLineDto,
  ): Promise<void> {
    const product = await this.salesOrdersRepository.findProduct(
      workspaceId,
      data.productId,
    );

    if (!product) {
      throw new NotFoundException(`Product "${data.productId}" not found`);
    }

    if (data.productVariantId === undefined) {
      return;
    }

    const variant = await this.salesOrdersRepository.findProductVariant(
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
    salesOrderId: string,
    data: AddSalesOrderLineDto,
  ): SalesOrderLineData {
    const quantity = new Prisma.Decimal(data.quantity);
    const unitPrice = new Prisma.Decimal(data.unitPrice);
    const taxRate = new Prisma.Decimal(data.taxRate ?? 0);

    if (quantity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Quantity must be positive");
    }

    if (unitPrice.isNegative() || taxRate.isNegative()) {
      throw new BadRequestException("Unit price and tax rate cannot be negative");
    }

    const subtotalAmount = quantity.mul(unitPrice).toDecimalPlaces(4);
    const taxAmount = subtotalAmount
      .mul(taxRate)
      .div(100)
      .toDecimalPlaces(4);
    const totalAmount = subtotalAmount.plus(taxAmount).toDecimalPlaces(4);

    return {
      workspaceId,
      salesOrderId,
      productId: data.productId,
      ...(data.productVariantId === undefined
        ? {}
        : { productVariantId: data.productVariantId }),
      description: data.description,
      quantity,
      unitPrice,
      taxRate,
      subtotalAmount,
      taxAmount,
      totalAmount,
      sortOrder: data.sortOrder ?? 0,
    };
  }

  private validateDates(orderDate: Date, requestedDate?: Date): void {
    if (requestedDate && requestedDate < orderDate) {
      throw new BadRequestException("Requested date cannot precede order date");
    }
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Sales order number is required");
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
    if (error instanceof SalesOrderSourceQuoteNotFoundError) {
      throw new NotFoundException("Source sales quote not found");
    }

    if (error instanceof SalesOrderQuoteNotAcceptedError) {
      throw new BadRequestException("Only accepted sales quotes can be converted");
    }

    if (error instanceof SalesOrderQuoteAlreadyConvertedError) {
      throw new ConflictException("Sales quote was already converted");
    }

    if (error instanceof SalesOrderLineNotFoundError) {
      throw new NotFoundException("Sales order line not found");
    }

    if (error instanceof SalesOrderStateConflictError) {
      throw new BadRequestException("Only draft sales orders can be modified");
    }

    throw error;
  }
}
