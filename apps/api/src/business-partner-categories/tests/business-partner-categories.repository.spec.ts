import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerCategoriesRepository } from "../business-partner-categories.repository";

describe("BusinessPartnerCategoriesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const category = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "GRAND-COMPTE",
    name: "Grand Compte",
    description: "Strategic account category",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const businessPartner = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUST-001",
    type: "organization",
    name: "Acme",
    legalName: null,
    status: "active",
    notes: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const assignment = {
    id: "40000000-0000-4000-8000-000000000001",
    workspaceId,
    businessPartnerId: businessPartner.id,
    businessPartnerCategoryId: category.id,
    assignedAt: new Date("2026-01-02T00:00:00.000Z"),
    businessPartnerCategory: category,
  };

  it("creates a customer category through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(category);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: category.code,
      name: category.name,
      description: category.description,
    });

    expect(result).toEqual(category);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: category.code,
        name: category.name,
        description: category.description,
      },
    });
  });

  it("updates a customer category through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(category);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, category.code, {
      name: "Collectivite",
    });

    expect(result).toEqual(category);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
        },
      },
      data: { name: "Collectivite" },
    });
  });

  it("disables a customer category through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...category,
      isActive: false,
    });
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.disable(workspaceId, category.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists customer categories for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([category]);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([category]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a customer category by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(category);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      category.code,
    );

    expect(result).toEqual(category);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: category.code,
        },
      },
    });
  });

  it("finds a business partner in the workspace", async () => {
    const businessPartnerFindUnique = jest.fn().mockResolvedValue(businessPartner);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ businessPartnerFindUnique }),
    );

    const result = await repository.findBusinessPartnerByCode(
      workspaceId,
      businessPartner.code,
    );

    expect(result).toEqual(businessPartner);
    expect(businessPartnerFindUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: { workspaceId, code: businessPartner.code },
      },
    });
  });

  it("creates a workspace-scoped category assignment", async () => {
    const assignmentCreate = jest.fn().mockResolvedValue(assignment);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ assignmentCreate }),
    );

    const result = await repository.createAssignment({
      workspaceId,
      businessPartnerId: businessPartner.id,
      businessPartnerCategoryId: category.id,
    });

    expect(result).toEqual(assignment);
    expect(assignmentCreate).toHaveBeenCalledWith({
      data: {
        workspaceId,
        businessPartnerId: businessPartner.id,
        businessPartnerCategoryId: category.id,
      },
      include: { businessPartnerCategory: true },
    });
  });

  it("finds an assignment within the workspace", async () => {
    const assignmentFindFirst = jest.fn().mockResolvedValue(assignment);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ assignmentFindFirst }),
    );

    const result = await repository.findAssignment(
      workspaceId,
      businessPartner.id,
      category.id,
    );

    expect(result).toEqual(assignment);
    expect(assignmentFindFirst).toHaveBeenCalledWith({
      where: {
        workspaceId,
        businessPartnerId: businessPartner.id,
        businessPartnerCategoryId: category.id,
      },
      include: { businessPartnerCategory: true },
    });
  });

  it("removes only the workspace-scoped assignment", async () => {
    const assignmentDeleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ assignmentDeleteMany }),
    );

    await expect(
      repository.removeAssignment(workspaceId, businessPartner.id, category.id),
    ).resolves.toBe(true);
    expect(assignmentDeleteMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        businessPartnerId: businessPartner.id,
        businessPartnerCategoryId: category.id,
      },
    });
  });

  it("lists category assignments for a business partner in the workspace", async () => {
    const assignmentFindMany = jest.fn().mockResolvedValue([assignment]);
    const repository = new BusinessPartnerCategoriesRepository(
      createPrismaMock({ assignmentFindMany }),
    );

    const result = await repository.findAssignmentsByBusinessPartner(
      workspaceId,
      businessPartner.id,
    );

    expect(result).toEqual([assignment]);
    expect(assignmentFindMany).toHaveBeenCalledWith({
      where: { workspaceId, businessPartnerId: businessPartner.id },
      include: { businessPartnerCategory: true },
      orderBy: [
        { businessPartnerCategory: { name: "asc" } },
        { businessPartnerCategory: { code: "asc" } },
      ],
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
  businessPartnerFindUnique?: jest.Mock;
  assignmentCreate?: jest.Mock;
  assignmentFindFirst?: jest.Mock;
  assignmentDeleteMany?: jest.Mock;
  assignmentFindMany?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartnerCategory: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
    businessPartner: {
      findUnique: methods.businessPartnerFindUnique ?? jest.fn(),
    },
    businessPartnerCategoryAssignment: {
      create: methods.assignmentCreate ?? jest.fn(),
      findFirst: methods.assignmentFindFirst ?? jest.fn(),
      deleteMany: methods.assignmentDeleteMany ?? jest.fn(),
      findMany: methods.assignmentFindMany ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
