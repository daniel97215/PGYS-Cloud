import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchasePaymentStatus } from "@prisma/client";
import { CreatePurchasePaymentDto } from "./dto/create-purchase-payment.dto";
import { SearchPurchasePaymentsDto } from "./dto/search-purchase-payments.dto";
import { UpdatePurchasePaymentDto } from "./dto/update-purchase-payment.dto";
import {
  PurchasePaymentExceedsBalanceError,
  PurchasePaymentInvoiceReferenceError,
  PurchasePaymentInvoiceUpdateRejectedError,
  PurchasePaymentRecord,
  PurchasePaymentStateConflictError,
  PurchasePaymentsRepository,
} from "./purchase-payments.repository";

@Injectable()
export class PurchasePaymentsService {
  constructor(
    private readonly purchasePaymentsRepository: PurchasePaymentsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreatePurchasePaymentDto,
  ): Promise<PurchasePaymentRecord> {
    await this.requireInvoice(workspaceId, data.purchaseInvoiceId);

    try {
      return await this.purchasePaymentsRepository.create({
        workspaceId,
        number: this.normalizeCode(data.number),
        purchaseInvoiceId: data.purchaseInvoiceId,
        amount: this.toPositiveAmount(data.amount),
        currencyCode: this.normalizeCurrencyCode(data.currencyCode),
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(data.paymentDate),
        ...(data.externalReference === undefined
          ? {}
          : { externalReference: data.externalReference }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  list(
    workspaceId: string,
    filters: SearchPurchasePaymentsDto,
  ): Promise<PurchasePaymentRecord[]> {
    const paymentDateFrom = filters.paymentDateFrom
      ? new Date(filters.paymentDateFrom)
      : undefined;
    const paymentDateTo = filters.paymentDateTo
      ? new Date(filters.paymentDateTo)
      : undefined;

    if (
      paymentDateFrom !== undefined &&
      paymentDateTo !== undefined &&
      paymentDateFrom > paymentDateTo
    ) {
      throw new BadRequestException(
        "Payment date start cannot follow payment date end",
      );
    }

    return this.purchasePaymentsRepository.findByWorkspace(workspaceId, {
      ...(filters.purchaseInvoiceId === undefined
        ? {}
        : { purchaseInvoiceId: filters.purchaseInvoiceId }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
      ...(filters.paymentMethod === undefined
        ? {}
        : { paymentMethod: filters.paymentMethod }),
      ...(paymentDateFrom === undefined ? {} : { paymentDateFrom }),
      ...(paymentDateTo === undefined ? {} : { paymentDateTo }),
    });
  }

  get(workspaceId: string, id: string): Promise<PurchasePaymentRecord> {
    return this.requirePayment(workspaceId, id);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdatePurchasePaymentDto,
  ): Promise<PurchasePaymentRecord> {
    await this.requireDraftPayment(workspaceId, id);

    if (data.purchaseInvoiceId !== undefined) {
      await this.requireInvoice(workspaceId, data.purchaseInvoiceId);
    }

    try {
      return await this.purchasePaymentsRepository.update(workspaceId, id, {
        ...(data.number === undefined
          ? {}
          : { number: this.normalizeCode(data.number) }),
        ...(data.purchaseInvoiceId === undefined
          ? {}
          : { purchaseInvoiceId: data.purchaseInvoiceId }),
        ...(data.amount === undefined
          ? {}
          : { amount: this.toPositiveAmount(data.amount) }),
        ...(data.currencyCode === undefined
          ? {}
          : { currencyCode: this.normalizeCurrencyCode(data.currencyCode) }),
        ...(data.paymentMethod === undefined
          ? {}
          : { paymentMethod: data.paymentMethod }),
        ...(data.paymentDate === undefined
          ? {}
          : { paymentDate: new Date(data.paymentDate) }),
        ...(data.externalReference === undefined
          ? {}
          : { externalReference: data.externalReference }),
        ...(data.notes === undefined ? {} : { notes: data.notes }),
      });
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async confirm(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord> {
    await this.requireDraftPayment(workspaceId, id);

    try {
      return await this.purchasePaymentsRepository.confirm(workspaceId, id);
    } catch (error) {
      return this.mapMutationError(error);
    }
  }

  async cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord> {
    await this.requireDraftPayment(workspaceId, id);
    const payment = await this.purchasePaymentsRepository.cancel(
      workspaceId,
      id,
    );

    if (!payment) {
      throw new BadRequestException("Purchase payment state changed");
    }

    return payment;
  }

  private async requirePayment(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord> {
    const payment = await this.purchasePaymentsRepository.findById(
      workspaceId,
      id,
    );

    if (!payment) {
      throw new NotFoundException(`Purchase payment "${id}" not found`);
    }

    return payment;
  }

  private async requireDraftPayment(
    workspaceId: string,
    id: string,
  ): Promise<PurchasePaymentRecord> {
    const payment = await this.requirePayment(workspaceId, id);

    if (payment.status !== PurchasePaymentStatus.DRAFT) {
      throw new BadRequestException(
        "Only draft purchase payments can be modified",
      );
    }

    return payment;
  }

  private async requireInvoice(workspaceId: string, id: string) {
    const invoice = await this.purchasePaymentsRepository.findInvoice(
      workspaceId,
      id,
    );

    if (!invoice) {
      throw new NotFoundException(`Purchase invoice "${id}" not found`);
    }

    return invoice;
  }

  private toPositiveAmount(value: number): Prisma.Decimal {
    const amount = new Prisma.Decimal(value);

    if (!amount.isFinite() || amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Amount must be positive");
    }

    return amount;
  }

  private normalizeCode(value: string): string {
    return value.trim().toUpperCase();
  }

  private normalizeCurrencyCode(value: string): string {
    const currencyCode = this.normalizeCode(value);

    if (currencyCode.length !== 3) {
      throw new BadRequestException("Currency code must use ISO-4217 format");
    }

    return currencyCode;
  }

  private mapMutationError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Purchase payment number already exists in this workspace",
        );
      }

      if (error.code === "P2034") {
        throw new ConflictException(
          "Concurrent payment confirmation conflict; retry the operation",
        );
      }
    }

    if (error instanceof PurchasePaymentStateConflictError) {
      throw new BadRequestException(
        "Only draft purchase payments can be modified",
      );
    }

    if (error instanceof PurchasePaymentInvoiceReferenceError) {
      throw new BadRequestException(
        "Invoice must be payable and match the payment currency",
      );
    }

    if (error instanceof PurchasePaymentExceedsBalanceError) {
      throw new BadRequestException("Payment exceeds invoice balance");
    }

    if (error instanceof PurchasePaymentInvoiceUpdateRejectedError) {
      throw new BadRequestException("Purchase invoice state changed");
    }

    throw error;
  }
}
