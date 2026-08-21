import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Page,
  PaginationQueryDto,
} from "../common/dto/pagination-query.dto";
import {
  PricingContract,
  PublicPrice,
} from "../shared/contracts/pricing.contract";
import { OFFER_STATUSES } from "../offers/offers.constants";
import { CreatePriceDto } from "./dto/create-price.dto";
import { UpdatePriceDto } from "./dto/update-price.dto";
import {
  PriceOfferRecord,
  PriceRecord,
  PricingRepository,
} from "./pricing.repository";

@Injectable()
export class PricingService implements PricingContract {
  constructor(private readonly pricingRepository: PricingRepository) {}

  async createPrice(
    offerKey: string,
    data: CreatePriceDto,
  ): Promise<PriceRecord> {
    const offer = await this.requireOffer(offerKey);
    await this.ensureOfferMutable(offer);

    return this.pricingRepository.create({
      ...data,
      offerId: offer.id,
    });
  }

  async updatePrice(
    priceId: string,
    data: UpdatePriceDto,
  ): Promise<PriceRecord> {
    const normalizedId = this.normalizeId(priceId, "Price id");
    const price = await this.requirePrice(normalizedId);
    await this.ensurePriceOfferMutable(price.offerId);

    return this.pricingRepository.update(normalizedId, data);
  }

  async listPricesForOffer(
    offerKey: string,
    pagination: PaginationQueryDto = {},
  ): Promise<Page<PriceRecord>> {
    const offer = await this.requireOffer(offerKey);

    return this.pricingRepository.findPageByOffer(offer.id, pagination);
  }

  async getActivePriceForOffer(offerKey: string): Promise<PriceRecord> {
    const offer = await this.requireOffer(offerKey);
    const price = await this.pricingRepository.findActiveByOffer(offer.id);

    if (!price) {
      throw new NotFoundException(
        `Active price for offer "${offerKey}" not found`,
      );
    }

    return price;
  }

  async findById(id: string): Promise<PublicPrice | null> {
    const price = await this.pricingRepository.findById(id);
    return price ? this.toPublicPrice(price) : null;
  }

  findActiveByOfferId(
    offerId: string,
    at?: Date,
  ): Promise<PublicPrice | null> {
    return this.findActivePublicPrice(offerId, at);
  }

  listByOfferId(
    offerId: string,
    pagination: PaginationQueryDto = {},
  ): Promise<Page<PublicPrice>> {
    return this.findPublicPricePage(offerId, pagination);
  }

  async archivePrice(priceId: string): Promise<PriceRecord> {
    const normalizedId = this.normalizeId(priceId, "Price id");
    const price = await this.requirePrice(normalizedId);
    await this.ensurePriceOfferMutable(price.offerId);

    return this.pricingRepository.archive(normalizedId);
  }

  private async requireOffer(offerKey: string): Promise<PriceOfferRecord> {
    const normalizedKey = this.normalizeKey(offerKey, "Offer key");
    const offer = await this.pricingRepository.findOfferByKey(normalizedKey);

    if (!offer) {
      throw new NotFoundException(`Offer "${offerKey}" not found`);
    }

    return offer;
  }

  private async requirePrice(priceId: string): Promise<PriceRecord> {
    const price = await this.pricingRepository.findById(priceId);

    if (!price) {
      throw new NotFoundException(`Price "${priceId}" not found`);
    }

    return price;
  }

  private async ensurePriceOfferMutable(offerId: string): Promise<void> {
    const offer = await this.pricingRepository.findOfferById(offerId);
    if (!offer) throw new NotFoundException("Offer not found");
    return this.ensureOfferMutable(offer);
  }

  private async ensureOfferMutable(offer: PriceOfferRecord): Promise<void> {
    if (offer.status === OFFER_STATUSES.ARCHIVED) {
      throw new ConflictException("Archived offers are immutable");
    }
    if (await this.pricingRepository.hasOfferUsage(offer.id)) {
      throw new ConflictException(
        "Used offers are immutable and must be replaced by a new offer",
      );
    }
  }

  private normalizeKey(key: string, label: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return normalizedKey;
  }

  private normalizeId(id: string, label: string): string {
    const normalizedId = id.trim();

    if (normalizedId.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return normalizedId;
  }

  private async findActivePublicPrice(
    offerId: string,
    at?: Date,
  ): Promise<PublicPrice | null> {
    const price = await this.pricingRepository.findActiveByOffer(offerId, at);
    return price ? this.toPublicPrice(price) : null;
  }

  private async findPublicPricePage(
    offerId: string,
    pagination: PaginationQueryDto,
  ): Promise<Page<PublicPrice>> {
    const page = await this.pricingRepository.findPageByOffer(
      offerId,
      pagination,
    );
    return {
      ...page,
      items: page.items.map((price) => this.toPublicPrice(price)),
    };
  }

  private toPublicPrice(price: PriceRecord): PublicPrice {
    return {
      id: price.id,
      offerId: price.offerId,
      currency: price.currency,
      amount: price.amount.toString(),
      billingPeriod: price.billingPeriod,
      validFrom: price.validFrom,
      validTo: price.validTo,
      status: price.status,
    };
  }
}
