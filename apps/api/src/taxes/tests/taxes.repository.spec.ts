import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TaxesRepository } from "../taxes.repository";

describe("TaxesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const tax = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "VAT20",
    name: "VAT 20%",
    rate: new Prisma.Decimal(20),
    isDefault: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a tax through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(tax);
    const repository = new TaxesRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: tax.code,
      name: tax.name,
      rate: tax.rate,
    });

    expect(result).toEqual(tax);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: tax.code,
        name: tax.name,
        rate: tax.rate,
      },
    });
  });

  it("updates a tax through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(tax);
    const repository = new TaxesRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, tax.code, {
      name: "Standard VAT",
    });

    expect(result).toEqual(tax);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tax.code,
        },
      },
      data: { name: "Standard VAT" },
    });
  });

  it("deactivates a tax through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...tax,
      isActive: false,
    });
    const repository = new TaxesRepository(createPrismaMock({ update }));

    const result = await repository.deactivate(workspaceId, tax.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tax.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists taxes for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([tax]);
    const repository = new TaxesRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([tax]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a tax by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(tax);
    const repository = new TaxesRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      tax.code,
    );

    expect(result).toEqual(tax);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tax.code,
        },
      },
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
    tax: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
