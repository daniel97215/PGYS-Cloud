import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateServiceCatalogItemDto } from "./dto/create-service-catalog-item.dto";
import { UpdateServiceCatalogItemDto } from "./dto/update-service-catalog-item.dto";
import {
  ServiceCatalogItemConfigurationSchema,
  ServiceCatalogItemRecord,
  ServiceCatalogRepository,
} from "./service-catalog.repository";

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly repository: ServiceCatalogRepository) {}

  listServices(): Promise<ServiceCatalogItemRecord[]> {
    return this.repository.findAll();
  }

  createService(
    data: CreateServiceCatalogItemDto,
  ): Promise<ServiceCatalogItemRecord> {
    const { configurationSchema, ...catalogItem } = data;

    return this.repository.create({
      ...catalogItem,
      key: this.normalizeKey(data.key),
      ...(configurationSchema === undefined
        ? {}
        : {
            configurationSchema: this.toConfigurationSchema(
              configurationSchema,
            ),
          }),
    });
  }

  async getServiceByKey(key: string): Promise<ServiceCatalogItemRecord> {
    return this.requireServiceCatalogItem(key);
  }

  async updateService(
    key: string,
    data: UpdateServiceCatalogItemDto,
  ): Promise<ServiceCatalogItemRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireServiceCatalogItem(normalizedKey);
    const { configurationSchema, ...catalogItem } = data;

    return this.repository.update(normalizedKey, {
      ...catalogItem,
      ...(configurationSchema === undefined
        ? {}
        : {
            configurationSchema: this.toConfigurationSchema(
              configurationSchema,
            ),
          }),
    });
  }

  async archiveService(key: string): Promise<ServiceCatalogItemRecord> {
    const normalizedKey = this.normalizeKey(key);
    await this.requireServiceCatalogItem(normalizedKey);

    return this.repository.archive(normalizedKey);
  }

  private async requireServiceCatalogItem(
    key: string,
  ): Promise<ServiceCatalogItemRecord> {
    const normalizedKey = this.normalizeKey(key);
    const service = await this.repository.findByKey(normalizedKey);

    if (!service) {
      throw new NotFoundException(`Service catalog item "${key}" not found`);
    }

    return service;
  }

  private normalizeKey(key: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey.length === 0) {
      throw new BadRequestException("Service catalog item key is required");
    }

    return normalizedKey;
  }

  private toConfigurationSchema(
    configurationSchema: Record<string, unknown>,
  ): ServiceCatalogItemConfigurationSchema {
    return configurationSchema as ServiceCatalogItemConfigurationSchema;
  }
}
