import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BILLING_INVOICE_STATUSES,
  BILLING_PERIODS,
  BillingInvoiceStatus,
  BillingPeriod,
} from "./billing.constants";
import { CreateBillingInvoiceDto } from "./dto/create-billing-invoice.dto";
import {
  BillingInvoiceRecord,
  BillingRepository,
  BillingWorkspaceRecord,
} from "./billing.repository";

const ALLOWED_TRANSITIONS: Record<
  BillingInvoiceStatus,
  ReadonlySet<BillingInvoiceStatus>
> = {
  [BILLING_INVOICE_STATUSES.DRAFT]: new Set([
    BILLING_INVOICE_STATUSES.OPEN,
    BILLING_INVOICE_STATUSES.VOID,
  ]),
  [BILLING_INVOICE_STATUSES.OPEN]: new Set([
    BILLING_INVOICE_STATUSES.PAID,
    BILLING_INVOICE_STATUSES.OVERDUE,
    BILLING_INVOICE_STATUSES.VOID,
  ]),
  [BILLING_INVOICE_STATUSES.OVERDUE]: new Set([
    BILLING_INVOICE_STATUSES.PAID,
    BILLING_INVOICE_STATUSES.VOID,
  ]),
  [BILLING_INVOICE_STATUSES.PAID]: new Set(),
  [BILLING_INVOICE_STATUSES.VOID]: new Set(),
};

@Injectable()
export class BillingService {
  constructor(private readonly billingRepository: BillingRepository) {}

  async create(
    workspaceId: string,
    data: CreateBillingInvoiceDto,
  ): Promise<BillingInvoiceRecord> {
    const workspace = await this.requireWorkspace(workspaceId);
    const subscription = await this.billingRepository.findSubscriptionById(
      data.subscriptionId,
    );
    if (!subscription || subscription.workspaceId !== workspaceId) {
      throw new NotFoundException("Subscription not found");
    }
    if (!subscription.price) {
      throw new BadRequestException("Subscription has no billing price");
    }

    const billingPeriod = this.normalizeBillingPeriod(
      subscription.price.billingPeriod,
    );
    const periodStart = new Date(data.periodStart);
    const periodEnd = this.calculatePeriodEnd(periodStart, billingPeriod);
    const dueAt = new Date(data.dueAt);
    if (dueAt <= periodStart) {
      throw new BadRequestException("Due date must be after period start");
    }
    const existing = await this.billingRepository.findByPeriod(
      workspaceId,
      subscription.id,
      periodStart,
      periodEnd,
    );
    if (existing) {
      throw new ConflictException("Invoice already exists for this period");
    }

    const tax = data.taxCode
      ? await this.billingRepository.findTaxByCode(workspaceId, data.taxCode)
      : null;
    if (data.taxCode && (!tax || !tax.isActive)) {
      throw new NotFoundException(`Active tax "${data.taxCode}" not found`);
    }

    const discountRate = data.discountRate ?? 0;
    if (discountRate < 0 || discountRate > 100) {
      throw new BadRequestException("Discount rate must be between 0 and 100");
    }
    const unitPrice = Number(subscription.price.amount);
    const subtotalAmount = this.roundCurrency(unitPrice);
    const discountAmount = this.roundCurrency(
      subtotalAmount * (discountRate / 100),
    );
    const taxableAmount = subtotalAmount - discountAmount;
    const taxRate = tax ? Number(tax.rate) : 0;
    const taxAmount = this.roundCurrency(taxableAmount * (taxRate / 100));
    const totalAmount = this.roundCurrency(taxableAmount + taxAmount);

    return this.billingRepository.create({
      workspaceId,
      subscriptionId: subscription.id,
      billingPeriod,
      periodStart,
      periodEnd,
      subtotalAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      currency: subscription.price.currency,
      billingDetails: this.toBillingDetails(workspace),
      dueAt,
      line: {
        taxId: tax?.id,
        description: `${subscription.offer.name} - ${billingPeriod.toLowerCase()}`,
        quantity: 1,
        unitPrice,
        discountRate,
        taxCode: tax?.code,
        taxName: tax?.name,
        taxRate,
        subtotalAmount,
        discountAmount,
        taxAmount,
        totalAmount,
      },
    });
  }

  list(workspaceId: string): Promise<BillingInvoiceRecord[]> {
    return this.billingRepository.list(workspaceId);
  }

  async get(
    workspaceId: string,
    invoiceId: string,
  ): Promise<BillingInvoiceRecord> {
    const invoice = await this.billingRepository.findById(
      workspaceId,
      invoiceId,
    );
    if (!invoice) {
      throw new NotFoundException("Billing invoice not found");
    }
    return invoice;
  }

  open(workspaceId: string, invoiceId: string) {
    return this.transition(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.OPEN,
    );
  }

  markPaid(workspaceId: string, invoiceId: string) {
    return this.transition(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.PAID,
      new Date(),
    );
  }

  markOverdue(workspaceId: string, invoiceId: string) {
    return this.transition(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.OVERDUE,
    );
  }

  void(workspaceId: string, invoiceId: string) {
    return this.transition(
      workspaceId,
      invoiceId,
      BILLING_INVOICE_STATUSES.VOID,
    );
  }

  private async transition(
    workspaceId: string,
    invoiceId: string,
    target: BillingInvoiceStatus,
    paidAt?: Date,
  ): Promise<BillingInvoiceRecord> {
    const invoice = await this.get(workspaceId, invoiceId);
    if (!ALLOWED_TRANSITIONS[invoice.status].has(target)) {
      throw new ConflictException(
        `Invoice cannot transition from ${invoice.status} to ${target}`,
      );
    }
    const updated = await this.billingRepository.transition(
      workspaceId,
      invoiceId,
      invoice.status,
      target,
      paidAt,
    );
    if (!updated) {
      throw new ConflictException("Billing invoice status changed concurrently");
    }
    return updated;
  }

  private async requireWorkspace(
    workspaceId: string,
  ): Promise<BillingWorkspaceRecord> {
    const workspace = await this.billingRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    return workspace;
  }

  private normalizeBillingPeriod(value: string): BillingPeriod {
    const normalized = value.trim().toUpperCase();
    if (normalized === BILLING_PERIODS.MONTHLY) {
      return BILLING_PERIODS.MONTHLY;
    }
    if (normalized === BILLING_PERIODS.ANNUAL || normalized === "YEARLY") {
      return BILLING_PERIODS.ANNUAL;
    }
    throw new BadRequestException("Billing period must be monthly or annual");
  }

  private calculatePeriodEnd(start: Date, period: BillingPeriod): Date {
    const end = new Date(start);
    if (period === BILLING_PERIODS.MONTHLY) {
      end.setUTCMonth(end.getUTCMonth() + 1);
    } else {
      end.setUTCFullYear(end.getUTCFullYear() + 1);
    }
    return end;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private toBillingDetails(workspace: BillingWorkspaceRecord) {
    return {
      name: workspace.name,
      legalName: workspace.legalName,
      billingEmail: workspace.billingEmail,
      vatNumber: workspace.vatNumber,
      addressLine1: workspace.addressLine1,
      addressLine2: workspace.addressLine2,
      postalCode: workspace.postalCode,
      city: workspace.city,
      country: workspace.country,
    };
  }
}
