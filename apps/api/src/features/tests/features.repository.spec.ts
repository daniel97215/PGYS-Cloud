import { PrismaService } from "../../prisma/prisma.service";
import {
  FEATURE_STATUS_ARCHIVED,
  FeaturesRepository,
} from "../features.repository";

describe("FeaturesRepository", () => {
  const feature = {
    id: "10000000-0000-4000-8000-000000000001",
    key: "crm.contacts",
    name: "CRM Contacts",
    description: "Manage CRM contacts",
    category: "crm",
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a feature through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(feature);
    const repository = new FeaturesRepository(createPrismaMock({ create }));

    const result = await repository.create({
      key: feature.key,
      name: feature.name,
      description: feature.description,
      category: feature.category,
    });

    expect(result).toEqual(feature);
    expect(create).toHaveBeenCalledWith({
      data: {
        key: feature.key,
        name: feature.name,
        description: feature.description,
        category: feature.category,
      },
    });
  });

  it("updates a feature through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(feature);
    const repository = new FeaturesRepository(createPrismaMock({ update }));

    const result = await repository.update(feature.key, {
      name: "CRM Contacts Pro",
    });

    expect(result).toEqual(feature);
    expect(update).toHaveBeenCalledWith({
      where: { key: feature.key },
      data: { name: "CRM Contacts Pro" },
    });
  });

  it("lists features through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([feature]);
    const repository = new FeaturesRepository(createPrismaMock({ findMany }));

    const result = await repository.findAll();

    expect(result).toEqual([feature]);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
    });
  });

  it("finds a feature by key through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(feature);
    const repository = new FeaturesRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByKey(feature.key);

    expect(result).toEqual(feature);
    expect(findUnique).toHaveBeenCalledWith({
      where: { key: feature.key },
    });
  });

  it("archives a feature through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...feature,
      status: FEATURE_STATUS_ARCHIVED,
    });
    const repository = new FeaturesRepository(createPrismaMock({ update }));

    const result = await repository.archive(feature.key);

    expect(result.status).toBe(FEATURE_STATUS_ARCHIVED);
    expect(update).toHaveBeenCalledWith({
      where: { key: feature.key },
      data: { status: FEATURE_STATUS_ARCHIVED },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    feature: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
