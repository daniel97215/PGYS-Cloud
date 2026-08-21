import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Page,
  PaginationQueryDto,
} from "../common/dto/pagination-query.dto";
import {
  FeaturesContract,
  PublicFeature,
} from "../shared/contracts/features.contract";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { UpdateFeatureDto } from "./dto/update-feature.dto";
import { FeatureRecord, FeaturesRepository } from "./features.repository";

@Injectable()
export class FeaturesService implements FeaturesContract {
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

  listFeatures(
    pagination: PaginationQueryDto = {},
  ): Promise<Page<FeatureRecord>> {
    return this.featuresRepository.findPage(pagination);
  }

  async getFeature(key: string): Promise<FeatureRecord> {
    return this.requireFeature(key);
  }

  findById(id: string): Promise<PublicFeature | null> {
    return this.featuresRepository.findById(id);
  }

  findByKey(key: string): Promise<PublicFeature | null> {
    const normalizedKey = key.trim().toLowerCase();
    return normalizedKey
      ? this.featuresRepository.findByKey(normalizedKey)
      : Promise.resolve(null);
  }

  findByKeys(keys: string[]): Promise<PublicFeature[]> {
    const normalizedKeys = [
      ...new Set(keys.map((key) => key.trim().toLowerCase())),
    ].filter(Boolean);
    return normalizedKeys.length
      ? this.featuresRepository.findByKeys(normalizedKeys)
      : Promise.resolve([]);
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
