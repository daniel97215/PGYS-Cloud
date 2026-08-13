import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OFFER_STATUSES } from "../offers/offers.constants";
import { PRICE_STATUSES } from "../pricing/pricing.constants";
import {
  CHECKOUT_BILLING_PERIODS,
  CHECKOUT_STATUSES,
  CheckoutBillingPeriod,
} from "./checkout.constants";
import {
  CheckoutRecord,
  CheckoutRepository,
  CheckoutWorkspaceRecord,
} from "./checkout.repository";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@Injectable()
export class CheckoutService {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  async create(
    workspaceId: string,
    data: CreateCheckoutDto,
  ): Promise<CheckoutRecord> {
    await this.requireWorkspace(workspaceId);
    const existing = await this.checkoutRepository.findByIdempotencyKey(
      workspaceId,
      data.idempotencyKey,
    );
    if (existing) {
      if (
        existing.offerId !== data.offerId ||
        existing.priceId !== data.priceId ||
        existing.expiresAt.getTime() !== data.expiresAt.getTime()
      ) {
        throw new ConflictException(
          "Idempotency key is already used by another checkout request",
        );
      }
      return existing;
    }

    const now = new Date();
    if (data.expiresAt <= now) {
      throw new BadRequestException("Checkout expiration must be in the future");
    }
    const price = await this.checkoutRepository.findPrice(
      data.offerId,
      data.priceId,
    );
    if (!price || price.offer.status !== OFFER_STATUSES.ACTIVE) {
      throw new NotFoundException("Active offer and price not found");
    }
    if (
      price.status !== PRICE_STATUSES.ACTIVE ||
      price.validFrom > now ||
      (price.validTo !== null && price.validTo <= now)
    ) {
      throw new NotFoundException("Active offer and price not found");
    }

    const created = await this.checkoutRepository.create({
      workspaceId,
      offerId: price.offerId,
      priceId: price.id,
      idempotencyKey: data.idempotencyKey,
      amount: Number(price.amount),
      currency: price.currency.trim().toUpperCase(),
      billingPeriod: this.normalizeBillingPeriod(price.billingPeriod),
      expiresAt: data.expiresAt,
    });
    if (
      created.offerId !== data.offerId ||
      created.priceId !== data.priceId ||
      created.expiresAt.getTime() !== data.expiresAt.getTime()
    ) {
      throw new ConflictException(
        "Idempotency key is already used by another checkout request",
      );
    }
    return created;
  }

  async list(workspaceId: string): Promise<CheckoutRecord[]> {
    await this.requireWorkspace(workspaceId);
    await this.checkoutRepository.expireOpen(workspaceId, new Date());
    return this.checkoutRepository.list(workspaceId);
  }

  async get(workspaceId: string, checkoutId: string): Promise<CheckoutRecord> {
    await this.checkoutRepository.expireOpen(workspaceId, new Date());
    const checkout = await this.checkoutRepository.findById(
      workspaceId,
      checkoutId,
    );
    if (!checkout) throw new NotFoundException("Checkout not found");
    return checkout;
  }

  async cancel(
    workspaceId: string,
    checkoutId: string,
  ): Promise<CheckoutRecord> {
    const checkout = await this.get(workspaceId, checkoutId);
    if (checkout.status !== CHECKOUT_STATUSES.OPEN) {
      throw new ConflictException(
        `Checkout cannot be cancelled from ${checkout.status}`,
      );
    }
    const cancelled = await this.checkoutRepository.cancel(
      workspaceId,
      checkoutId,
      new Date(),
    );
    if (!cancelled) {
      throw new ConflictException("Checkout status changed concurrently");
    }
    return cancelled;
  }

  async complete(
    workspaceId: string,
    checkoutId: string,
  ): Promise<CheckoutRecord> {
    const workspace = await this.requireWorkspace(workspaceId);
    const checkout = await this.get(workspaceId, checkoutId);
    if (checkout.status === CHECKOUT_STATUSES.COMPLETED) return checkout;
    if (checkout.status !== CHECKOUT_STATUSES.OPEN) {
      throw new ConflictException(
        `Checkout cannot be completed from ${checkout.status}`,
      );
    }
    const duplicate = await this.checkoutRepository.findActiveSubscription(
      workspaceId,
      checkout.offerId,
    );
    if (duplicate) {
      throw new ConflictException(
        "An active subscription already exists for this workspace and offer",
      );
    }

    const completedAt = new Date();
    const periodEnd = this.calculatePeriodEnd(
      completedAt,
      checkout.billingPeriod as CheckoutBillingPeriod,
    );
    const completed = await this.checkoutRepository.complete({
      workspaceId,
      checkoutId,
      offerId: checkout.offerId,
      priceId: checkout.priceId,
      completedAt,
      periodEnd,
      amount: Number(checkout.amount),
      currency: checkout.currency,
      billingPeriod: checkout.billingPeriod as CheckoutBillingPeriod,
      offerName: await this.offerName(checkout.offerId, checkout.priceId),
      billingDetails: this.billingDetails(workspace),
    });
    if (completed) return completed;

    const concurrent = await this.checkoutRepository.findById(
      workspaceId,
      checkoutId,
    );
    if (concurrent?.status === CHECKOUT_STATUSES.COMPLETED) return concurrent;
    throw new ConflictException("Checkout status changed concurrently");
  }

  private async requireWorkspace(
    workspaceId: string,
  ): Promise<CheckoutWorkspaceRecord> {
    const workspace = await this.checkoutRepository.findWorkspaceById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace not found");
    return workspace;
  }

  private async offerName(offerId: string, priceId: string): Promise<string> {
    const price = await this.checkoutRepository.findPrice(offerId, priceId);
    if (!price) throw new NotFoundException("Checkout offer and price not found");
    return price.offer.name;
  }

  private normalizeBillingPeriod(value: string): CheckoutBillingPeriod {
    const normalized = value.trim().toUpperCase();
    if (normalized === CHECKOUT_BILLING_PERIODS.MONTHLY) {
      return CHECKOUT_BILLING_PERIODS.MONTHLY;
    }
    if (normalized === CHECKOUT_BILLING_PERIODS.ANNUAL || normalized === "YEARLY") {
      return CHECKOUT_BILLING_PERIODS.ANNUAL;
    }
    throw new BadRequestException("Billing period must be monthly or annual");
  }

  private calculatePeriodEnd(
    start: Date,
    billingPeriod: CheckoutBillingPeriod,
  ): Date {
    const end = new Date(start);
    if (billingPeriod === CHECKOUT_BILLING_PERIODS.MONTHLY) {
      end.setUTCMonth(end.getUTCMonth() + 1);
    } else {
      end.setUTCFullYear(end.getUTCFullYear() + 1);
    }
    return end;
  }

  private billingDetails(workspace: CheckoutWorkspaceRecord) {
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
