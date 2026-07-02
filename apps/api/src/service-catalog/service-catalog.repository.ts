import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const SERVICE_CATALOG_STATUS_ARCHIVED = "archived";

export type ServiceCatalogItemRecord =
  Prisma.ServiceCatalogItemGetPayload<object>;
export type ServiceCatalogItemConfigurationSchema = Prisma.InputJsonObject;

export interface CreateServiceCatalogItemData {
  key: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  status?: string;
  configurationSchema?: ServiceCatalogItemConfigurationSchema;
  icon?: string;
  visibility?: string;
}

export type UpdateServiceCatalogItemData = Omit<
  Partial<CreateServiceCatalogItemData>,
  "key"
>;

@Injectable()
export class ServiceCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ServiceCatalogItemRecord[]> {
    return this.prisma.serviceCatalogItem.findMany({
      orderBy: { key: "asc" },
    });
  }

  findByKey(key: string): Promise<ServiceCatalogItemRecord | null> {
    return this.prisma.serviceCatalogItem.findUnique({
      where: { key },
    });
  }

  create(data: CreateServiceCatalogItemData): Promise<ServiceCatalogItemRecord> {
    return this.prisma.serviceCatalogItem.create({
      data,
    });
  }

  update(
    key: string,
    data: UpdateServiceCatalogItemData,
  ): Promise<ServiceCatalogItemRecord> {
    return this.prisma.serviceCatalogItem.update({
      where: { key },
      data,
    });
  }

  archive(key: string): Promise<ServiceCatalogItemRecord> {
    return this.prisma.serviceCatalogItem.update({
      where: { key },
      data: { status: SERVICE_CATALOG_STATUS_ARCHIVED },
    });
  }
}
