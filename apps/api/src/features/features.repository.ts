import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FEATURE_STATUSES, FeatureStatus } from "./features.constants";

export type FeatureRecord = Prisma.FeatureGetPayload<object>;

export interface CreateFeatureData {
  key: string;
  name: string;
  description?: string;
  category?: string;
  status?: FeatureStatus;
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
      data: { status: FEATURE_STATUSES.ARCHIVED },
    });
  }
}
