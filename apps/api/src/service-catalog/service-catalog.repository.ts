import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ServiceDefinitionRecord = Prisma.ServiceDefinitionGetPayload<object>;

@Injectable()
export class ServiceCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<ServiceDefinitionRecord[]> {
    return this.prisma.serviceDefinition.findMany({
      where: { isActive: true },
    });
  }

  findByCode(code: string): Promise<ServiceDefinitionRecord | null> {
    return this.prisma.serviceDefinition.findUnique({
      where: { code },
    });
  }
}
