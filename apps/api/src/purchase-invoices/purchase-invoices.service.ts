import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchaseInvoiceStatus } from "@prisma/client";
import { CreatePurchaseInvoiceDto } from "./dto/create-purchase-invoice.dto";
import { PurchaseInvoiceLineDto } from "./dto/purchase-invoice-line.dto";
import { SearchPurchaseInvoicesDto } from "./dto/search-purchase-invoices.dto";
import { UpdatePurchaseInvoiceDto } from "./dto/update-purchase-invoice.dto";
import {
  PurchaseInvoiceDuplicateSupplierNumberError,
  PurchaseInvoiceLineInput,
  PurchaseInvoiceRecord,
  PurchaseInvoiceStateConflictError,
  PurchaseInvoiceWithLines,
  PurchaseInvoicesRepository,
} from "./purchase-invoices.repository";

@Injectable()
export class PurchaseInvoicesService {
  constructor(
    private readonly purchaseInvoicesRepository: PurchaseInvoicesRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceWithLines> {
    await this.requireSupplier(workspaceId, data.supplierId);
    await this.validatePurchaseOrder(
      workspaceId,
      data.purchaseOrderId,
      data.supplierId,
    );
    const invoiceDate = new Date(data.invoiceDate);
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    this.validateDates(invoiceDate, dueDate);
    const lines = data.lines ?? [];
    await this.validateLineReferences(
      workspaceId,
      lines,
      data.purchaseOrderId,
    );

    try {
      return await this.purchaseInvoicesRepository.create({
        workspaceId,
        number: this.normalizeCode(data.number),
        supplierInvoiceNumber: this.normalizeCode(
          data.supplierInvoiceNumber,
        ),
        supplierId: data.supplierId,
        ...(data.purchaseOrderId === undefined
          ? {}
          : { purchaseOrderId: data.purchaseOrderId }),
        currencyCode: this.normalizeCode(data.currencyCode),
        invoiceDate,
        ...(dueDate === undefined ? {} : { dueDate }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
        lines: lines.map((line) => this.toLineInput(workspaceId, line)),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(
    workspaceId: string,
    filters: SearchPurchaseInvoicesDto,
  ): Promise<PurchaseInvoiceRecord[]> {
    const invoiceDateFrom = filters.invoiceDateFrom
      ? new Date(filters.invoiceDateFrom)
      : undefined;
    const invoiceDateTo = filters.invoiceDateTo
      ? new Date(filters.invoiceDateTo)
      : undefined;
    this.validateDateRange(invoiceDateFrom, invoiceDateTo);

    return this.purchaseInvoicesRepository.findByWorkspace(workspaceId, {
      ...(filters.supplierId === undefined
        ? {}
        : { supplierId: filters.supplierId }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
      ...(invoiceDateFrom === undefined ? {} : { invoiceDateFrom }),
      ...(invoiceDateTo === undefined ? {} : { invoiceDateTo }),
    });
  }

  get(workspaceId: string, id: string): Promise<PurchaseInvoiceWithLines> {
    return this.requireInvoice(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceWithLines> {
    const invoice = await this.requireDraftInvoice(workspaceId, id);
    const supplierId = data.supplierId ?? invoice.supplierId;
    const purchaseOrderId = data.purchaseOrderId ?? invoice.purchaseOrderId;
    await this.requireSupplier(workspaceId, supplierId);
    await this.validatePurchaseOrder(
      workspaceId,
      purchaseOrderId ?? undefined,
      supplierId,
    );

    const invoiceDate = data.invoiceDate
      ? new Date(data.invoiceDate)
      : invoice.invoiceDate;
    const dueDate = data.dueDate
      ? new Date(data.dueDate)
      : (invoice.dueDate ?? undefined);
    this.validateDates(invoiceDate, dueDate);

    if (data.lines !== undefined) {
      await this.validateLineReferences(
        workspaceId,
        data.lines,
        purchaseOrderId ?? undefined,
      );
    } else if (
      data.supplierId !== undefined ||
      data.purchaseOrderId !== undefined
    ) {
      await this.validateStoredLineReferences(
        workspaceId,
        invoice,
        purchaseOrderId ?? undefined,
      );
    }

    try {
      return await this.purchaseInvoicesRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeCode(data.number) }),
        ...(data.supplierInvoiceNumber === undefined
          ? {}
          : {
              supplierInvoiceNumber: this.normalizeCode(
                data.supplierInvoiceNumber,
              ),
            }),
        ...(data.supplierId === undefined
          ? {}
          : { supplierId: data.supplierId }),
        ...(data.purchaseOrderId === undefined
          ? {}
          : { purchaseOrderId: data.purchaseOrderId }),
        ...(data.currencyCode === undefined
          ? {}
          : { currencyCode: this.normalizeCode(data.currencyCode) }),
        ...(data.invoiceDate === undefined ? {} : { invoiceDate }),
        ...(data.dueDate === undefined ? {} : { dueDate }),
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

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (invoice.status !== PurchaseInvoiceStatus.DRAFT) {
      throw new BadRequestException("Only draft purchase invoices can be confirmed");
    }

    if (invoice.lines.length === 0) {
      throw new BadRequestException(
        "A purchase invoice without lines cannot be confirmed",
      );
    }

    const confirmed = await this.purchaseInvoicesRepository.confirm(
      workspaceId,
      id,
    );

    if (!confirmed) {
      throw new BadRequestException("Purchase invoice state changed");
    }

    return confirmed;
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (
      invoice.status !== PurchaseInvoiceStatus.DRAFT &&
      invoice.status !== PurchaseInvoiceStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        "Only unpaid purchase invoices can be cancelled",
      );
    }

    const cancelled = await this.purchaseInvoicesRepository.cancel(
      workspaceId,
      id,
    );

    if (!cancelled) {
      throw new BadRequestException("Purchase invoice state changed");
    }

    return cancelled;
  }

  private async requireInvoice(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines> {
    const invoice = await this.purchaseInvoicesRepository.findById(
      workspaceId,
      id,
    );

    if (!invoice) {
      throw new NotFoundException(`Purchase invoice "${id}" not found`);
    }

    return invoice;
  }

  private async requireDraftInvoice(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseInvoiceWithLines> {
    const invoice = await this.requireInvoice(workspaceId, id);

    if (invoice.status !== PurchaseInvoiceStatus.DRAFT) {
      throw new BadRequestException(
        "Only draft purchase invoices can be modified",
      );
    }

    return invoice;
  }

  private async requireSupplier(workspaceId: string, id: string) {
    const supplier = await this.purchaseInvoicesRepository.findSupplier(
      workspaceId,
      id,
    );

    if (!supplier) {
      throw new NotFoundException(`Supplier "${id}" not found`);
    }

    return supplier;
  }

  private async validatePurchaseOrder(
    workspaceId: string,
    purchaseOrderId: string | undefined,
    supplierId: string,
  ): Promise<void> {
    if (purchaseOrderId === undefined) {
      return;
    }

    const order = await this.purchaseInvoicesRepository.findPurchaseOrder(
      workspaceId,
      purchaseOrderId,
    );

    if (!order) {
      throw new NotFoundException(
        `Purchase order "${purchaseOrderId}" not found`,
      );
    }

    if (order.supplierId !== supplierId) {
      throw new BadRequestException(
        "Purchase order does not belong to supplier",
      );
    }
  }

  private async validateLineReferences(
    workspaceId: string,
    lines: PurchaseInvoiceLineDto[],
    purchaseOrderId?: string,
  ): Promise<void> {
    for (const line of lines) {
      await this.validateLineReference(workspaceId, line, purchaseOrderId);
    }
  }

  private async validateStoredLineReferences(
    workspaceId: string,
    invoice: PurchaseInvoiceWithLines,
    purchaseOrderId?: string,
  ): Promise<void> {
    for (const line of invoice.lines) {
      await this.validateLineReference(
        workspaceId,
        {
          ...(line.purchaseOrderLineId === null
            ? {}
            : { purchaseOrderLineId: line.purchaseOrderLineId }),
          ...(line.productId === null ? {} : { productId: line.productId }),
          ...(line.productVariantId === null
            ? {}
            : { productVariantId: line.productVariantId }),
          description: line.description,
          quantity: line.quantity.toNumber(),
          unitPrice: line.unitPrice.toNumber(),
          taxRate: line.taxRate.toNumber(),
        },
        purchaseOrderId,
      );
    }
  }

  private async validateLineReference(
    workspaceId: string,
    line: PurchaseInvoiceLineDto,
    purchaseOrderId?: string,
  ): Promise<void> {
    if (line.purchaseOrderLineId !== undefined) {
      if (purchaseOrderId === undefined) {
        throw new BadRequestException(
          "A purchase order line requires a purchase order",
        );
      }

      const orderLine =
        await this.purchaseInvoicesRepository.findPurchaseOrderLine(
          workspaceId,
          line.purchaseOrderLineId,
          purchaseOrderId,
        );

      if (!orderLine) {
        throw new NotFoundException(
          `Purchase order line "${line.purchaseOrderLineId}" not found`,
        );
      }

      if (line.productId !== undefined && line.productId !== orderLine.productId) {
        throw new BadRequestException(
          "Invoice line product does not match purchase order line",
        );
      }

      if (
        line.productVariantId !== undefined &&
        line.productVariantId !== orderLine.productVariantId
      ) {
        throw new BadRequestException(
          "Invoice line variant does not match purchase order line",
        );
      }
    }

    if (line.productId !== undefined) {
      const product = await this.purchaseInvoicesRepository.findProduct(
        workspaceId,
        line.productId,
      );

      if (!product) {
        throw new NotFoundException(`Product "${line.productId}" not found`);
      }
    }

    if (line.productVariantId !== undefined) {
      if (line.productId === undefined) {
        throw new BadRequestException("A product variant requires a product");
      }

      const variant = await this.purchaseInvoicesRepository.findProductVariant(
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
  }

  private toLineInput(
    workspaceId: string,
    line: PurchaseInvoiceLineDto,
  ): PurchaseInvoiceLineInput {
    const quantity = new Prisma.Decimal(line.quantity);
    const unitPrice = new Prisma.Decimal(line.unitPrice);
    const taxRate = new Prisma.Decimal(line.taxRate ?? 0);
    const subtotalAmount = quantity.mul(unitPrice).toDecimalPlaces(4);
    const taxAmount = subtotalAmount
      .mul(taxRate)
      .div(100)
      .toDecimalPlaces(4);

    return {
      workspaceId,
      ...(line.purchaseOrderLineId === undefined
        ? {}
        : { purchaseOrderLineId: line.purchaseOrderLineId }),
      ...(line.productId === undefined ? {} : { productId: line.productId }),
      ...(line.productVariantId === undefined
        ? {}
        : { productVariantId: line.productVariantId }),
      description: line.description,
      quantity,
      unitPrice,
      taxRate,
      subtotalAmount,
      taxAmount,
      totalAmount: subtotalAmount.plus(taxAmount).toDecimalPlaces(4),
    };
  }

  private validateDates(invoiceDate: Date, dueDate?: Date): void {
    if (dueDate !== undefined && dueDate < invoiceDate) {
      throw new BadRequestException("Due date cannot precede invoice date");
    }
  }

  private validateDateRange(from?: Date, to?: Date): void {
    if (from !== undefined && to !== undefined && from > to) {
      throw new BadRequestException(
        "Invoice date start cannot follow invoice date end",
      );
    }
  }

  private normalizeCode(value: string): string {
    return value.trim().toUpperCase();
  }

  private mapMutationError(error: unknown): never {
    if (
      error instanceof PurchaseInvoiceDuplicateSupplierNumberError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    ) {
      throw new ConflictException(
        "Supplier invoice number already exists for this supplier",
      );
    }

    if (error instanceof PurchaseInvoiceStateConflictError) {
      throw new BadRequestException("Purchase invoice state changed");
    }

    throw error;
  }
}
