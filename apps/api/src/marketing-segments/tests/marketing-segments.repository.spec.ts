import { PrismaService } from "../../prisma/prisma.service";
import { MarketingSegmentsRepository } from "../marketing-segments.repository";

describe("MarketingSegmentsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const segment = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "ACTIVE-PROSPECTS",
    name: "Active prospects",
    description: "Prospects in priority categories",
    roleCodes: ["PROSPECT"],
    categoryCodes: ["PRIORITY"],
    tagCodes: ["VIP"],
    activeOnly: true,
    isActive: true,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };

  it("creates a workspace-scoped segment", async () => {
    const create = jest.fn().mockResolvedValue(segment);
    const repository = new MarketingSegmentsRepository(createPrismaMock({ create }));
    const data = {
      workspaceId,
      code: segment.code,
      name: segment.name,
      description: segment.description,
      roleCodes: segment.roleCodes,
      categoryCodes: segment.categoryCodes,
      tagCodes: segment.tagCodes,
      activeOnly: segment.activeOnly,
    };

    await expect(repository.create(data)).resolves.toEqual(segment);
    expect(create).toHaveBeenCalledWith({ data });
  });

  it("updates only a segment from the workspace", async () => {
    const update = jest.fn().mockResolvedValue(segment);
    const repository = new MarketingSegmentsRepository(createPrismaMock({ update }));

    await repository.update(workspaceId, segment.id, { name: "Qualified prospects" });

    expect(update).toHaveBeenCalledWith({
      where: { id: segment.id, workspaceId },
      data: { name: "Qualified prospects" },
    });
  });

  it("deactivates without deleting", async () => {
    const update = jest.fn().mockResolvedValue({ ...segment, isActive: false });
    const repository = new MarketingSegmentsRepository(createPrismaMock({ update }));

    await repository.deactivate(workspaceId, segment.id);

    expect(update).toHaveBeenCalledWith({
      where: { id: segment.id, workspaceId },
      data: { isActive: false },
    });
  });

  it("lists workspace segments deterministically", async () => {
    const findMany = jest.fn().mockResolvedValue([segment]);
    const repository = new MarketingSegmentsRepository(
      createPrismaMock({ findMany }),
    );

    await expect(repository.findByWorkspace(workspaceId)).resolves.toEqual([segment]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a segment by workspace and code", async () => {
    const findUnique = jest.fn().mockResolvedValue(segment);
    const repository = new MarketingSegmentsRepository(
      createPrismaMock({ findUnique }),
    );

    await expect(repository.findByCode(workspaceId, segment.code)).resolves.toEqual(
      segment,
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: { workspaceId_code: { workspaceId, code: segment.code } },
    });
  });

  it("finds a segment by workspace and id for public contracts", async () => {
    const findFirst = jest.fn().mockResolvedValue(segment);
    const repository = new MarketingSegmentsRepository(createPrismaMock({ findFirst }));
    await expect(repository.findById(workspaceId, segment.id)).resolves.toEqual(segment);
    expect(findFirst).toHaveBeenCalledWith({ where: { id: segment.id, workspaceId } });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
  findFirst?: jest.Mock;
}): PrismaService {
  return {
    marketingSegment: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
