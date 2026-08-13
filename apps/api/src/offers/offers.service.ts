import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OFFER_STATUSES, OfferStatus } from "./offers.constants";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OfferRecord, OffersRepository } from "./offers.repository";

@Injectable()
export class OffersService {
  constructor(private readonly offersRepository: OffersRepository) {}

  async createOffer(data: CreateOfferDto): Promise<OfferRecord> {
    if (data.status && data.status !== OFFER_STATUSES.DRAFT) {
      throw new BadRequestException("Offers must be created as draft");
    }
    return this.offersRepository.create({
      ...data,
      key: this.normalizeKey(data.key),
    });
  }

  async updateOffer(key: string, data: UpdateOfferDto): Promise<OfferRecord> {
    const normalizedKey = this.normalizeKey(key);
    const offer = await this.requireOffer(normalizedKey);
    if (data.status && data.status !== offer.status) {
      const { status, ...metadata } = data;
      if (Object.keys(metadata).length > 0) {
        throw new BadRequestException(
          "Offer status transition must be requested separately",
        );
      }
      return this.transition(offer, status);
    }
    await this.ensureMutable(offer);

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
    const offer = await this.requireOffer(normalizedKey);
    if (offer.status === OFFER_STATUSES.ARCHIVED) return offer;
    if (offer.status !== OFFER_STATUSES.ACTIVE) {
      throw new ConflictException("Only an active offer can be archived");
    }

    return this.applyTransition(offer, OFFER_STATUSES.ARCHIVED);
  }

  async activateOffer(key: string): Promise<OfferRecord> {
    const offer = await this.requireOffer(key);
    return this.transition(offer, OFFER_STATUSES.ACTIVE);
  }

  private async transition(
    offer: OfferRecord,
    target: OfferStatus,
  ): Promise<OfferRecord> {
    if (target === OFFER_STATUSES.ACTIVE) {
      if (offer.status !== OFFER_STATUSES.DRAFT) {
        throw new ConflictException("Only a draft offer can be activated");
      }
      if (!(await this.offersRepository.hasActivePrice(offer.id, new Date()))) {
        throw new ConflictException("Offer requires an active price before activation");
      }
      return this.applyTransition(offer, target);
    }
    if (target === OFFER_STATUSES.ARCHIVED) {
      return this.archiveOffer(offer.key);
    }
    throw new ConflictException(
      `Offer cannot transition from ${offer.status} to ${target}`,
    );
  }

  private async applyTransition(
    offer: OfferRecord,
    target: OfferStatus,
  ): Promise<OfferRecord> {
    const updated = await this.offersRepository.transition(
      offer.id,
      offer.status as OfferStatus,
      target,
    );
    if (!updated) {
      throw new ConflictException("Offer status changed concurrently");
    }
    return updated;
  }

  private async ensureMutable(offer: OfferRecord): Promise<void> {
    if (offer.status === OFFER_STATUSES.ARCHIVED) {
      throw new ConflictException("Archived offers are immutable");
    }
    if (await this.offersRepository.hasUsage(offer.id)) {
      throw new ConflictException(
        "Used offers are immutable and must be replaced by a new offer",
      );
    }
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
