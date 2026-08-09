import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesPaymentStatus } from "@prisma/client";
import { AddSalesPaymentAllocationDto } from "./dto/add-sales-payment-allocation.dto";
import { CreateSalesPaymentDto } from "./dto/create-sales-payment.dto";
import {
  SalesPaymentAllocationExceedsBalanceError,
  SalesPaymentAllocationExceedsPaymentError,
  SalesPaymentAllocationMismatchError,
  SalesPaymentAllocationNotFoundError,
  SalesPaymentAllocationReferenceError,
  SalesPaymentInvoiceUpdateRejectedError,
  SalesPaymentRecord,
  SalesPaymentStateConflictError,
  SalesPaymentWithAllocations,
  SalesPaymentsRepository,
} from "./sales-payments.repository";

@Injectable()
export class SalesPaymentsService {
  constructor(
    private readonly salesPaymentsRepository: SalesPaymentsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateSalesPaymentDto,
  ): Promise<SalesPaymentWithAllocations> {
    const partner = await this.salesPaymentsRepository.findBusinessPartner(
      workspaceId,
      data.businessPartnerId,
    );

    if (!partner) {
      throw new NotFoundException(
        `Business partner "${data.businessPartnerId}" not found`,
      );
    }

    const amount = this.toPositiveAmount(data.amount);

    return this.salesPaymentsRepository.create({
      workspaceId,
      number: this.normalizeNumber(data.number),
      businessPartnerId: data.businessPartnerId,
      method: data.method,
      amount,
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
      paymentDate: new Date(data.paymentDate),
      ...(data.externalReference === undefined
        ? {}
        : { externalReference: data.externalReference }),
      ...(data.notes === undefined ? {} : { notes: data.notes }),
    });
  }

  list(workspaceId: string): Promise<SalesPaymentRecord[]> {
    return this.salesPaymentsRepository.findByWorkspace(workspaceId);
  }

  listByInvoice(
    workspaceId: string,
    salesInvoiceId: string,
  ): Promise<SalesPaymentRecord[]> {
    return this.salesPaymentsRepository.findByInvoice(
      workspaceId,
      salesInvoiceId,
    );
  }

  get(
    workspaceId: string,
    salesPaymentId: string,
  ): Promise<SalesPaymentWithAllocations> {
    return this.requirePayment(workspaceId, salesPaymentId);
  }

  async addAllocation(
    workspaceId: string,
    salesPaymentId: string,
    data: AddSalesPaymentAllocationDto,
  ): Promise<SalesPaymentWithAllocations> {
    await this.requireDraftPayment(workspaceId, salesPaymentId);

    try {
      return await this.salesPaymentsRepository.addAllocation({
        workspaceId,
        salesPaymentId,
        salesInvoiceId: data.salesInvoiceId,
        amount: this.toPositiveAmount(data.amount),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async removeAllocation(
    workspaceId: string,
    salesPaymentId: string,
    allocationId: string,
  ): Promise<SalesPaymentWithAllocations> {
    await this.requireDraftPayment(workspaceId, salesPaymentId);

    try {
      return await this.salesPaymentsRepository.removeAllocation(
        workspaceId,
        salesPaymentId,
        allocationId,
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async confirm(
    workspaceId: string,
    salesPaymentId: string,
  ): Promise<SalesPaymentWithAllocations> {
    await this.requireDraftPayment(workspaceId, salesPaymentId);

    try {
      return await this.salesPaymentsRepository.confirm(
        workspaceId,
        salesPaymentId,
      );
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async cancel(
    workspaceId: string,
    salesPaymentId: string,
  ): Promise<SalesPaymentWithAllocations> {
    await this.requireDraftPayment(workspaceId, salesPaymentId);
    const payment = await this.salesPaymentsRepository.cancel(
      workspaceId,
      salesPaymentId,
    );

    if (!payment) {
      throw new BadRequestException("Sales payment state changed");
    }

    return payment;
  }

  private async requirePayment(
    workspaceId: string,
    salesPaymentId: string,
  ): Promise<SalesPaymentWithAllocations> {
    const payment = await this.salesPaymentsRepository.findById(
      workspaceId,
      salesPaymentId,
    );

    if (!payment) {
      throw new NotFoundException(
        `Sales payment "${salesPaymentId}" not found`,
      );
    }

    return payment;
  }

  private async requireDraftPayment(
    workspaceId: string,
    salesPaymentId: string,
  ): Promise<SalesPaymentWithAllocations> {
    const payment = await this.requirePayment(workspaceId, salesPaymentId);

    if (payment.status !== SalesPaymentStatus.DRAFT) {
      throw new BadRequestException("Only draft payments can be modified");
    }

    return payment;
  }

  private toPositiveAmount(value: number): Prisma.Decimal {
    const amount = new Prisma.Decimal(value);

    if (!amount.isFinite() || amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Amount must be positive");
    }

    return amount;
  }

  private normalizeNumber(number: string): string {
    const normalized = number.trim().toUpperCase();

    if (normalized.length === 0) {
      throw new BadRequestException("Sales payment number is required");
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
    if (error instanceof SalesPaymentAllocationNotFoundError) {
      throw new NotFoundException("Sales payment allocation not found");
    }

    if (error instanceof SalesPaymentStateConflictError) {
      throw new BadRequestException("Only draft payments can be modified");
    }

    if (error instanceof SalesPaymentAllocationReferenceError) {
      throw new BadRequestException(
        "Invoice must be payable and match the payment partner and currency",
      );
    }

    if (error instanceof SalesPaymentAllocationExceedsBalanceError) {
      throw new BadRequestException("Allocation exceeds invoice balance");
    }

    if (error instanceof SalesPaymentAllocationExceedsPaymentError) {
      throw new BadRequestException("Allocations exceed payment amount");
    }

    if (error instanceof SalesPaymentAllocationMismatchError) {
      throw new BadRequestException(
        "Allocated total must exactly match payment amount",
      );
    }

    if (error instanceof SalesPaymentInvoiceUpdateRejectedError) {
      throw new BadRequestException("Sales invoice state changed");
    }

    throw error;
  }
}
