import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnersRepository } from "../business-partners.repository";
import { BusinessPartnerStatus } from "../enums/business-partner-status.enum";
import { BusinessPartnerType } from "../enums/business-partner-type.enum";

describe("BusinessPartnersRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUST-001",
    type: BusinessPartnerType.CUSTOMER,
    name: "ACME France",
    legalName: "ACME France SAS",
    status: BusinessPartnerStatus.ACTIVE,
    notes: "Strategic customer",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a customer through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(customer);
    const repository = new BusinessPartnersRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      code: customer.code,
      type: BusinessPartnerType.CUSTOMER,
      name: customer.name,
      legalName: customer.legalName,
      notes: customer.notes,
    });

    expect(result).toEqual(customer);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: customer.code,
        type: BusinessPartnerType.CUSTOMER,
        name: customer.name,
        legalName: customer.legalName,
        notes: customer.notes,
      },
    });
  });

  it("updates a customer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(customer);
    const repository = new BusinessPartnersRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, customer.code, {
      name: "ACME Europe",
    });

    expect(result).toEqual(customer);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: customer.code,
        },
      },
      data: { name: "ACME Europe" },
    });
  });

  it("archives a customer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...customer,
      status: BusinessPartnerStatus.ARCHIVED,
    });
    const repository = new BusinessPartnersRepository(createPrismaMock({ update }));

    const result = await repository.archive(workspaceId, customer.code);

    expect(result.status).toBe(BusinessPartnerStatus.ARCHIVED);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: customer.code,
        },
      },
      data: { status: BusinessPartnerStatus.ARCHIVED },
    });
  });

  it("lists customers for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([customer]);
    const repository = new BusinessPartnersRepository(createPrismaMock({ findMany }));

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([customer]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a customer by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(customer);
    const repository = new BusinessPartnersRepository(createPrismaMock({ findUnique }));

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      customer.code,
    );

    expect(result).toEqual(customer);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: customer.code,
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
    businessPartner: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
