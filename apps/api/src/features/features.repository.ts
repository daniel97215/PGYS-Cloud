import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const FEATURE_STATUS_ARCHIVED = "archived";

export type FeatureRecord = Prisma.FeatureGetPayload<object>;

export interface CreateFeatureData {
  key: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
}

export type UpdateFeatureData = Omit<Partial<CreateFeatureData>, "key">;

@Injectable()
export class FeaturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateFeatureData): Promise<FeatureRecord> {
    return this.prisma.feature.create({ data });
  }

  update(key: string, data: UpdateFeatureData): Promise<FeatureRecord> {
    return this.prisma.feature.update({
      where: { key },
      data,
    });
  }

  findAll(): Promise<FeatureRecord[]> {
    return this.prisma.feature.findMany({
      orderBy: { key: "asc" },
    });
  }

  findByKey(key: string): Promise<FeatureRecord | null> {
    return this.prisma.feature.findUnique({
      where: { key },
    });
  }

  archive(key: string): Promise<FeatureRecord> {
    return this.prisma.feature.update({
      where: { key },
      data: { status: FEATURE_STATUS_ARCHIVED },
    });
  }
}
