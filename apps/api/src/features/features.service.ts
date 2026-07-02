import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { UpdateFeatureDto } from "./dto/update-feature.dto";
import { FeatureRecord, FeaturesRepository } from "./features.repository";

@Injectable()
export class FeaturesService {
  constructor(private readonly featuresRepository: FeaturesRepository) {}

  createFeature(data: CreateFeatureDto): Promise<FeatureRecord> {
    return this.featuresRepository.create({
      ...data,
      key: this.normalizeKey(data.key),
    });
  }

  async updateFeature(
    key: string,
    data: UpdateFeatureDto,
  ): Promise<FeatureRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireFeature(normalizedKey);

    return this.featuresRepository.update(normalizedKey, data);
  }

  listFeatures(): Promise<FeatureRecord[]> {
    return this.featuresRepository.findAll();
  }

  async getFeature(key: string): Promise<FeatureRecord> {
    return this.requireFeature(key);
  }

  async archiveFeature(key: string): Promise<FeatureRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireFeature(normalizedKey);

    return this.featuresRepository.archive(normalizedKey);
  }

  private async requireFeature(key: string): Promise<FeatureRecord> {
    const normalizedKey = this.normalizeKey(key);
    const feature = await this.featuresRepository.findByKey(normalizedKey);

    if (!feature) {
      throw new NotFoundException(`Feature "${key}" not found`);
    }

    return feature;
  }

  private normalizeKey(key: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.length === 0) {
      throw new BadRequestException("Feature key is required");
    }

    return normalizedKey;
  }
}
