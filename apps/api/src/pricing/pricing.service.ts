import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePriceDto } from "./dto/create-price.dto";
import { UpdatePriceDto } from "./dto/update-price.dto";
import {
  PriceOfferRecord,
  PriceRecord,
  PricingRepository,
} from "./pricing.repository";

@Injectable()
export class PricingService {
  constructor(private readonly pricingRepository: PricingRepository) {}

  async createPrice(
    offerKey: string,
    data: CreatePriceDto,
  ): Promise<PriceRecord> {
    const offer = await this.requireOffer(offerKey);

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
    await this.requirePrice(normalizedId);

    return this.pricingRepository.update(normalizedId, data);
  }

  async listPricesForOffer(offerKey: string): Promise<PriceRecord[]> {
    const offer = await this.requireOffer(offerKey);

    return this.pricingRepository.findByOffer(offer.id);
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

  async archivePrice(priceId: string): Promise<PriceRecord> {
    const normalizedId = this.normalizeId(priceId, "Price id");
    await this.requirePrice(normalizedId);

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
}
