import { PrismaService } from "../../prisma/prisma.service";
import { FEATURE_STATUS_ARCHIVED } from "../features.constants";
import { FeaturesRepository } from "../features.repository";

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
    const count = jest.fn().mockResolvedValue(1);
    const repository = new FeaturesRepository(
      createPrismaMock({ count, findMany }),
    );

    const result = await repository.findPage({ page: 2, pageSize: 10 });

    expect(result).toEqual({
      items: [feature],
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith();
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

  it("finds public features by id and keys", async () => {
    const findUnique = jest.fn().mockResolvedValue(feature);
    const findMany = jest.fn().mockResolvedValue([feature]);
    const repository = new FeaturesRepository(
      createPrismaMock({ findMany, findUnique }),
    );

    await expect(repository.findById(feature.id)).resolves.toEqual(feature);
    await expect(repository.findByKeys([feature.key])).resolves.toEqual([
      feature,
    ]);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: feature.id } });
    expect(findMany).toHaveBeenCalledWith({
      where: { key: { in: [feature.key] } },
      orderBy: { key: "asc" },
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
  count?: jest.Mock;
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    feature: {
      count: methods.count ?? jest.fn(),
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
