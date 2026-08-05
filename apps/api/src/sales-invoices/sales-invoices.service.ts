import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesInvoiceStatus } from "@prisma/client";
import {
  ConvertSalesOrderToInvoiceDto,
  CreateSalesInvoiceDto,
  SalesInvoiceLineDto,
} from "./dto/create-sales-invoice.dto";
import { UpdateSalesInvoiceDto } from "./dto/update-sales-invoice.dto";
import {
  SalesInvoiceLineInput,
  SalesInvoiceOrderAlreadyInvoicedError,
  SalesInvoiceRecord,
  SalesInvoiceSourceOrderNotFoundError,
  SalesInvoiceStateConflictError,
  SalesInvoiceWithLines,
  SalesInvoicesRepository,
} from "./sales-invoices.repository";

@Injectable()
export class SalesInvoicesService {
  constructor(
    private readonly salesInvoicesRepository: SalesInvoicesRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateSalesInvoiceDto,
  ): Promise<SalesInvoiceWithLines> {
    await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    const issueDate = new Date(data.issueDate);
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.validateDates(issueDate, dueDate);
    const lines = data.lines ?? [];
    await this.validateLineReferences(workspaceId, lines);

    return this.salesInvoicesRepository.create({
      workspaceId,
      number: this.normalizeNumber(data.number),
      businessPartnerId: data.businessPartnerId,
      issueDate,
      ...(dueDate === undefined ? {} : { dueDate }),
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
      ...(data.notes === undefined ? {} : { notes: data.notes }),
      lines: lines.map((line) => this.toLineInput(workspaceId, line)),
    });
  }

  async createFromOrder(
    workspaceId: string,
    salesOrderId: string,
    data: ConvertSalesOrderToInvoiceDto,
  ): Promise<SalesInvoiceWithLines> {
    const issueDate = new Date(data.issueDate);
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.validateDates(issueDate, dueDate);

    try {
      return await this.salesInvoicesRepository.createFromOrder(
        workspaceId,
        salesOrderId,
        {
          number: this.normalizeNumber(data.number),
          issueDate,
          ...(dueDate === undefined ? {} : { dueDate }),
        },
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(workspaceId: string): Promise<SalesInvoiceRecord[]> {
    return this.salesInvoicesRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<SalesInvoiceWithLines> {
    return this.requireInvoice(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateSalesInvoiceDto,
  ): Promise<SalesInvoiceWithLines> {
    const invoice = await this.requireDraftInvoice(workspaceId, id);

    if (data.businessPartnerId !== undefined) {
      await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    }

    const issueDate = data.issueDate
      ? new Date(data.issueDate)
      : invoice.issueDate;
    const dueDate = data.dueDate
      ? new Date(data.dueDate)
      : (invoice.dueDate ?? undefined);
    this.validateDates(issueDate, dueDate);

    if (data.lines !== undefined) {
      await this.validateLineReferences(
        workspaceId,
        data.lines,
        invoice.salesOrderId ?? undefined,
      );
    }

    try {
      return await this.salesInvoicesRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.businessPartnerId === undefined
          ? {}
          : { businessPartnerId: data.businessPartnerId }),
        ...(data.issueDate === undefined ? {} : { issueDate }),
        ...(data.dueDate === undefined ? {} : { dueDate }),
        ...(data.currencyCode === undefined
          ? {}
          : { currencyCode: this.normalizeCurrencyCode(data.currencyCode) }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
        ...(data.lines === undefined
          ? {}
          : {
              lines: data.lines.map((line) =>
                this.toLineInput(workspaceId, line),
              ),
            }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async issue(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (invoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestException("Only draft invoices can be issued");
    }

    if (invoice.lines.length === 0) {
      throw new BadRequestException("An invoice without lines cannot be issued");
    }

    const issued = await this.salesInvoicesRepository.issue(workspaceId, id);

    if (!issued) {
      throw new BadRequestException("Sales invoice state changed");
    }

    return issued;
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (
      invoice.status === SalesInvoiceStatus.PAID ||
      invoice.status === SalesInvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException("Paid or cancelled invoices cannot be cancelled");
    }

    const cancelled = await this.salesInvoicesRepository.cancel(
      workspaceId,
      id,
    );

    if (!cancelled) {
      throw new BadRequestException("Sales invoice state changed");
    }

    return cancelled;
  }

  private async requireInvoice(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines> {
    const invoice = await this.salesInvoicesRepository.findById(
      workspaceId,
      id,
    );

    if (!invoice) {
      throw new NotFoundException(`Sales invoice "${id}" not found`);
    }

    return invoice;
  }

  private async requireDraftInvoice(
    workspaceId: string,
    id: string,
  ): Promise<SalesInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (invoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestException("Only draft invoices can be modified");
    }

    return invoice;
  }

  private async requireBusinessPartner(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const partner = await this.salesInvoicesRepository.findBusinessPartner(
      workspaceId,
      id,
    );

    if (!partner) {
      throw new NotFoundException(`Business partner "${id}" not found`);
    }
  }

  private async validateLineReferences(
    workspaceId: string,
    lines: SalesInvoiceLineDto[],
    salesOrderId?: string,
  ): Promise<void> {
    for (const line of lines) {
      const product = await this.salesInvoicesRepository.findProduct(
        workspaceId,
        line.productId,
      );

      if (!product) {
        throw new NotFoundException(`Product "${line.productId}" not found`);
      }

      if (line.productVariantId !== undefined) {
        const variant = await this.salesInvoicesRepository.findProductVariant(
          workspaceId,
          line.productVariantId,
        );

        if (!variant) {
          throw new NotFoundException(
            `Product variant "${line.productVariantId}" not found`,
          );
        }

        if (variant.productId !== line.productId) {
          throw new BadRequestException(
            "Product variant does not belong to product",
          );
        }
      }

      if (line.salesOrderLineId !== undefined) {
        const orderLine =
          await this.salesInvoicesRepository.findSalesOrderLine(
            workspaceId,
            line.salesOrderLineId,
          );

        if (
          !orderLine ||
          orderLine.productId !== line.productId ||
          orderLine.productVariantId !== (line.productVariantId ?? null) ||
          (salesOrderId !== undefined &&
            orderLine.salesOrderId !== salesOrderId)
        ) {
          throw new BadRequestException(
            "Sales order line does not match invoice line",
          );
        }
      }
    }
  }

  private toLineInput(
    workspaceId: string,
    data: SalesInvoiceLineDto,
  ): SalesInvoiceLineInput {
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
      ...(data.salesOrderLineId === undefined
        ? {}
        : { salesOrderLineId: data.salesOrderLineId }),
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

  private validateDates(issueDate: Date, dueDate?: Date): void {
    if (dueDate && issueDate > dueDate) {
      throw new BadRequestException("Issue date cannot follow due date");
    }
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Sales invoice number is required");
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
    if (error instanceof SalesInvoiceSourceOrderNotFoundError) {
      throw new NotFoundException("Source sales order not found");
    }

    if (error instanceof SalesInvoiceOrderAlreadyInvoicedError) {
      throw new ConflictException("Sales order was already invoiced");
    }

    if (error instanceof SalesInvoiceStateConflictError) {
      throw new BadRequestException("Only draft invoices can be modified");
    }

    throw error;
  }
}
