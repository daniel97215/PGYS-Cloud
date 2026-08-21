import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { Page } from "../common/dto/pagination-query.dto";
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

export interface FeaturePagination {
  page?: number;
  pageSize?: number;
}

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

  async findPage(pagination: FeaturePagination): Promise<Page<FeatureRecord>> {
    const page = Math.max(pagination.page ?? 1, 1);
    const pageSize = Math.min(Math.max(pagination.pageSize ?? 25, 1), 100);
    const [items, total] = await Promise.all([
      this.prisma.feature.findMany({
        orderBy: { key: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.feature.count(),
    ]);

    return { items, total, page, pageSize };
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
