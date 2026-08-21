import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OFFER_STATUSES } from "./offers.constants";
import {
  FEATURES_CONTRACT,
  FeaturesContract,
  PublicFeature,
} from "../shared/contracts/features.contract";
import {
  OFFERS_CONTRACT,
  OffersContract,
  PublicOffer,
} from "../shared/contracts/offers.contract";
import {
  OfferFeatureRecord,
  OfferFeaturesRepository,
} from "./offer-features.repository";

@Injectable()
export class OfferFeaturesService {
  constructor(
    private readonly offerFeaturesRepository: OfferFeaturesRepository,
    @Inject(OFFERS_CONTRACT)
    private readonly offersContract: OffersContract,
    @Inject(FEATURES_CONTRACT)
    private readonly featuresContract: FeaturesContract,
  ) {}

  async addFeatureToOffer(
    offerKey: string,
    featureKey: string,
  ): Promise<OfferFeatureRecord> {
    const offer = await this.requireOffer(offerKey);
    await this.ensureOfferMutable(offer);
    const feature = await this.requireFeature(featureKey);

    return this.offerFeaturesRepository.addFeatureToOffer(
      offer.id,
      feature.id,
    );
  }

  async removeFeatureFromOffer(
    offerKey: string,
    featureKey: string,
  ): Promise<OfferFeatureRecord> {
    const offer = await this.requireOffer(offerKey);
    await this.ensureOfferMutable(offer);
    const feature = await this.requireFeature(featureKey);
    const offerFeature =
      await this.offerFeaturesRepository.findByOfferAndFeature(
        offer.id,
        feature.id,
      );

    if (!offerFeature || !offerFeature.enabled) {
      throw new NotFoundException(
        `Feature "${featureKey}" is not enabled for offer "${offerKey}"`,
      );
    }

    return this.offerFeaturesRepository.removeFeatureFromOffer(
      offer.id,
      feature.id,
    );
  }

  async listFeaturesForOffer(offerKey: string): Promise<OfferFeatureRecord[]> {
    const offer = await this.requireOffer(offerKey);

    return this.offerFeaturesRepository.findFeaturesByOffer(offer.id);
  }

  async listOffersForFeature(featureKey: string): Promise<OfferFeatureRecord[]> {
    const feature = await this.requireFeature(featureKey);

    return this.offerFeaturesRepository.findOffersByFeature(feature.id);
  }

  private async requireOffer(offerKey: string): Promise<PublicOffer> {
    const normalizedKey = this.normalizeKey(offerKey, "Offer key");
    const offer = await this.offersContract.findByKey(normalizedKey);

    if (!offer) {
      throw new NotFoundException(`Offer "${offerKey}" not found`);
    }

    return offer;
  }

  private async requireFeature(featureKey: string): Promise<PublicFeature> {
    const normalizedKey = this.normalizeKey(featureKey, "Feature key");
    const feature = await this.featuresContract.findByKey(normalizedKey);

    if (!feature) {
      throw new NotFoundException(`Feature "${featureKey}" not found`);
    }

    return feature;
  }

  private async ensureOfferMutable(offer: PublicOffer): Promise<void> {
    if (offer.status === OFFER_STATUSES.ARCHIVED) {
      throw new ConflictException("Archived offers are immutable");
    }
    if (await this.offerFeaturesRepository.hasOfferUsage(offer.id)) {
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
}
