export interface PublicPrice {
  id: string;
  offerId: string;
  currency: string;
  amount: number;
  billingPeriod: string;
  validFrom: Date;
  validTo: Date | null;
  status: string;
}

export interface PricingContract {
  findById(id: string): Promise<PublicPrice | null>;
  findActiveByOfferId(offerId: string, at?: Date): Promise<PublicPrice | null>;
  listByOfferId(offerId: string): Promise<PublicPrice[]>;
}

