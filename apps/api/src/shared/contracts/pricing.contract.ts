import {
  PaginationCriteria,
  PublicPage,
} from "./pagination.contract";

export const PRICING_CONTRACT = Symbol("PRICING_CONTRACT");

export interface PublicPrice {
  id: string;
  offerId: string;
  currency: string;
  amount: string;
  billingPeriod: string;
  validFrom: Date;
  validTo: Date | null;
  status: string;
}

export interface PricingContract {
  findById(id: string): Promise<PublicPrice | null>;
  findActiveByOfferId(offerId: string, at?: Date): Promise<PublicPrice | null>;
  listByOfferId(
    offerId: string,
    pagination?: PaginationCriteria,
  ): Promise<PublicPage<PublicPrice>>;
}
