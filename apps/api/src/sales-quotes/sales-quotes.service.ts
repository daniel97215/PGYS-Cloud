import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesQuoteStatus } from "@prisma/client";
import { AddSalesQuoteLineDto } from "./dto/add-sales-quote-line.dto";
import { CreateSalesQuoteDto } from "./dto/create-sales-quote.dto";
import { UpdateSalesQuoteDto } from "./dto/update-sales-quote.dto";
import {
  SalesQuoteLineData,
  SalesQuoteLineNotFoundError,
  SalesQuoteRecord,
  SalesQuoteStateConflictError,
  SalesQuoteWithLines,
  SalesQuotesRepository,
} from "./sales-quotes.repository";

@Injectable()
export class SalesQuotesService {
  constructor(private readonly salesQuotesRepository: SalesQuotesRepository) {}

  async create(
    workspaceId: string,
    data: CreateSalesQuoteDto,
  ): Promise<SalesQuoteWithLines> {
    await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    const issueDate = new Date(data.issueDate);
    const validUntil = data.validUntil
      ? new Date(data.validUntil)
      : undefined;
    this.validateDates(issueDate, validUntil);

    return this.salesQuotesRepository.create({
      workspaceId,
      number: this.normalizeNumber(data.number),
      businessPartnerId: data.businessPartnerId,
      issueDate,
      ...(validUntil === undefined ? {} : { validUntil }),
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
      ...(data.notes === undefined ? {} : { notes: data.notes }),
    });
  }

  list(workspaceId: string): Promise<SalesQuoteRecord[]> {
    return this.salesQuotesRepository.findByWorkspace(workspaceId);
  }

  get(workspaceId: string, id: string): Promise<SalesQuoteWithLines> {
    return this.requireQuote(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateSalesQuoteDto,
  ): Promise<SalesQuoteWithLines> {
    const quote = await this.requireDraftQuote(workspaceId, id);

    if (data.businessPartnerId !== undefined) {
      await this.requireBusinessPartner(workspaceId, data.businessPartnerId);
    }

    const issueDate = data.issueDate
      ? new Date(data.issueDate)
      : quote.issueDate;
    const validUntil = data.validUntil
      ? new Date(data.validUntil)
      : (quote.validUntil ?? undefined);
    this.validateDates(issueDate, validUntil);

    try {
      return await this.salesQuotesRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeNumber(data.number) }),
        ...(data.businessPartnerId === undefined
          ? {}
          : { businessPartnerId: data.businessPartnerId }),
        ...(data.issueDate === undefined ? {} : { issueDate }),
        ...(data.validUntil === undefined ? {} : { validUntil }),
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
    data: AddSalesQuoteLineDto,
  ): Promise<SalesQuoteWithLines> {
    await this.requireDraftQuote(workspaceId, id);
    await this.validateLineReferences(workspaceId, data);

    try {
      return await this.salesQuotesRepository.addLine(
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
    data: AddSalesQuoteLineDto,
  ): Promise<SalesQuoteWithLines> {
    await this.requireDraftQuote(workspaceId, id);
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
      return await this.salesQuotesRepository.updateLine(
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
    await this.requireDraftQuote(workspaceId, id);

    try {
      await this.salesQuotesRepository.removeLine(workspaceId, id, lineId);
    } catch (error) {
      this.mapMutationError(error);
    }
  }

  send(workspaceId: string, id: string): Promise<SalesQuoteWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesQuoteStatus.DRAFT],
      SalesQuoteStatus.SENT,
    );
  }

  accept(workspaceId: string, id: string): Promise<SalesQuoteWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesQuoteStatus.SENT],
      SalesQuoteStatus.ACCEPTED,
    );
  }

  reject(workspaceId: string, id: string): Promise<SalesQuoteWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesQuoteStatus.SENT],
      SalesQuoteStatus.REJECTED,
    );
  }

  cancel(workspaceId: string, id: string): Promise<SalesQuoteWithLines> {
    return this.transition(
      workspaceId,
      id,
      [SalesQuoteStatus.DRAFT, SalesQuoteStatus.SENT],
      SalesQuoteStatus.CANCELLED,
    );
  }

  private async transition(
    workspaceId: string,
    id: string,
    fromStatuses: SalesQuoteStatus[],
    toStatus: SalesQuoteStatus,
  ): Promise<SalesQuoteWithLines> {
    await this.requireQuote(workspaceId, id);
    const quote = await this.salesQuotesRepository.transitionStatus(
      workspaceId,
      id,
      fromStatuses,
      toStatus,
    );

    if (!quote) {
      throw new BadRequestException("Invalid sales quote status transition");
    }

    return quote;
  }

  private async requireQuote(
    workspaceId: string,
    id: string,
  ): Promise<SalesQuoteWithLines> {
    const quote = await this.salesQuotesRepository.findById(workspaceId, id);

    if (!quote) {
      throw new NotFoundException(`Sales quote "${id}" not found`);
    }

    return quote;
  }

  private async requireDraftQuote(
    workspaceId: string,
    id: string,
  ): Promise<SalesQuoteWithLines> {
    const quote = await this.requireQuote(workspaceId, id);

    if (quote.status !== SalesQuoteStatus.DRAFT) {
      throw new BadRequestException("Only draft sales quotes can be modified");
    }

    return quote;
  }

  private async requireBusinessPartner(
    workspaceId: string,
    id: string,
  ): Promise<void> {
    const partner = await this.salesQuotesRepository.findBusinessPartner(
      workspaceId,
      id,
    );

    if (!partner) {
      throw new NotFoundException(`Business partner "${id}" not found`);
    }
  }

  private async validateLineReferences(
    workspaceId: string,
    data: AddSalesQuoteLineDto,
  ): Promise<void> {
    const product = await this.salesQuotesRepository.findProduct(
      workspaceId,
      data.productId,
    );

    if (!product) {
      throw new NotFoundException(`Product "${data.productId}" not found`);
    }

    if (data.productVariantId === undefined) {
      return;
    }

    const variant = await this.salesQuotesRepository.findProductVariant(
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
    salesQuoteId: string,
    data: AddSalesQuoteLineDto,
  ): SalesQuoteLineData {
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
      salesQuoteId,
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

  private validateDates(issueDate: Date, validUntil?: Date): void {
    if (validUntil && validUntil < issueDate) {
      throw new BadRequestException("Valid-until date cannot precede issue date");
    }
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Sales quote number is required");
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
    if (error instanceof SalesQuoteLineNotFoundError) {
      throw new NotFoundException("Sales quote line not found");
    }

    if (error instanceof SalesQuoteStateConflictError) {
      throw new BadRequestException("Only draft sales quotes can be modified");
    }

    throw error;
  }
}
