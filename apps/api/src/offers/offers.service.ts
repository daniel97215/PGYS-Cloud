import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OfferRecord, OffersRepository } from "./offers.repository";

@Injectable()
export class OffersService {
  constructor(private readonly offersRepository: OffersRepository) {}

  createOffer(data: CreateOfferDto): Promise<OfferRecord> {
    return this.offersRepository.create({
      ...data,
      key: this.normalizeKey(data.key),
    });
  }

  async updateOffer(key: string, data: UpdateOfferDto): Promise<OfferRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireOffer(normalizedKey);

    return this.offersRepository.update(normalizedKey, data);
  }

  listOffers(): Promise<OfferRecord[]> {
    return this.offersRepository.findAll();
  }

  async getOffer(key: string): Promise<OfferRecord> {
    return this.requireOffer(key);
  }

  async archiveOffer(key: string): Promise<OfferRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireOffer(normalizedKey);

    return this.offersRepository.archive(normalizedKey);
  }

  private async requireOffer(key: string): Promise<OfferRecord> {
    const normalizedKey = this.normalizeKey(key);
    const offer = await this.offersRepository.findByKey(normalizedKey);

    if (!offer) {
      throw new NotFoundException(`Offer "${key}" not found`);
    }

    return offer;
  }

  private normalizeKey(key: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.length === 0) {
      throw new BadRequestException("Offer key is required");
    }

    return normalizedKey;
  }
}
