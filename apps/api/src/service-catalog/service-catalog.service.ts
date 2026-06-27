import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ServiceCatalogRepository,
  ServiceDefinitionRecord,
} from "./service-catalog.repository";

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly repository: ServiceCatalogRepository) {}

  listActiveServices(): Promise<ServiceDefinitionRecord[]> {
    return this.repository.findAllActive();
  }

  async getServiceByCode(code: string): Promise<ServiceDefinitionRecord> {
    const service = await this.repository.findByCode(code);

    if (!service) {
      throw new NotFoundException(`Service definition "${code}" not found`);
    }

    return service;
  }
}
