import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerSearchRepository } from "../business-partner-search.repository";

describe("BusinessPartnerSearchRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUST-001",
    type: "customer",
    name: "Acme",
    legalName: "Acme SAS",
    status: "active",
    notes: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    addresses: [],
    contacts: [],
    roleAssignments: [],
    tagAssignments: [],
  };

  it("searches business partners through Prisma with filters, pagination and sorting", async () => {
    const findMany = jest.fn().mockResolvedValue([customer]);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new BusinessPartnerSearchRepository(
      createPrismaMock({ findMany, count }),
    );

    const result = await repository.search(workspaceId, {
      code: "CUST-001",
      name: "Acme",
      role: "CUSTOMER",
      tag: "VIP",
      city: "Paris",
      email: "contact@example.com",
      phone: "+33102030405",
      status: "active",
      page: 2,
      pageSize: 10,
      sort: "createdAt",
      order: "desc",
    });

    const where = {
      AND: [
        { workspaceId },
        { code: { contains: "CUST-001", mode: "insensitive" } },
        {
          OR: [
            { name: { contains: "Acme", mode: "insensitive" } },
            { legalName: { contains: "Acme", mode: "insensitive" } },
          ],
        },
        {
          roleAssignments: {
            some: {
              businessPartnerRole: {
                OR: [
                  {
                    code: {
                      equals: "CUSTOMER",
                      mode: "insensitive",
                    },
                  },
                  { name: { contains: "CUSTOMER", mode: "insensitive" } },
                ],
              },
            },
          },
        },
        {
          tagAssignments: {
            some: {
              businessPartnerTag: {
                OR: [
                  {
                    code: {
                      equals: "VIP",
                      mode: "insensitive",
                    },
                  },
                  { name: { contains: "VIP", mode: "insensitive" } },
                ],
              },
            },
          },
        },
        {
          addresses: {
            some: { city: { contains: "Paris", mode: "insensitive" } },
          },
        },
        {
          contacts: {
            some: {
              email: {
                contains: "contact@example.com",
                mode: "insensitive",
              },
            },
          },
        },
        {
          contacts: {
            some: {
              OR: [
                {
                  phone: {
                    contains: "+33102030405",
                    mode: "insensitive",
                  },
                },
                {
                  mobile: {
                    contains: "+33102030405",
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
        { status: "active" },
      ],
    };

    expect(result).toEqual({
      items: [customer],
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(findMany).toHaveBeenCalledWith({
      where,
      include: {
        addresses: true,
        contacts: true,
        roleAssignments: {
          include: {
            businessPartnerRole: true,
          },
        },
        tagAssignments: {
          include: {
            businessPartnerTag: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith({ where });
  });

  it("uses default pagination and sorting", async () => {
    const findMany = jest.fn().mockResolvedValue([customer]);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new BusinessPartnerSearchRepository(
      createPrismaMock({ findMany, count }),
    );

    const result = await repository.search(workspaceId, {});

    expect(result).toEqual({
      items: [customer],
      total: 1,
      page: 1,
      pageSize: 25,
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ workspaceId }] },
        orderBy: [{ name: "asc" }, { code: "asc" }],
        skip: 0,
        take: 25,
      }),
    );
  });

  it("evaluates closed audience criteria with OR within families and AND between them", async () => {
    const findMany = jest.fn().mockResolvedValue([customer]);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new BusinessPartnerSearchRepository(
      createPrismaMock({ findMany, count }),
    );
    const criteria = {
      roleCodes: ["PROSPECT", "CUSTOMER"],
      categoryCodes: ["PRIORITY", "VIP"],
      tagCodes: ["NEWSLETTER", "LOYAL"],
      activeOnly: true,
    };

    const result = await repository.evaluateAudience(workspaceId, criteria, {
      page: 2,
      pageSize: 10,
    });

    const where = {
      AND: [
        { workspaceId },
        {
          roleAssignments: {
            some: {
              workspaceId,
              businessPartnerRole: {
                workspaceId,
                code: { in: criteria.roleCodes },
                isActive: true,
              },
            },
          },
        },
        {
          categoryAssignments: {
            some: {
              workspaceId,
              businessPartnerCategory: {
                workspaceId,
                code: { in: criteria.categoryCodes },
                isActive: true,
              },
            },
          },
        },
        {
          tagAssignments: {
            some: {
              workspaceId,
              businessPartnerTag: {
                workspaceId,
                code: { in: criteria.tagCodes },
                isActive: true,
              },
            },
          },
        },
        { status: "active" },
      ],
    };

    expect(result).toEqual({
      items: [customer],
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: [{ name: "asc" }, { code: "asc" }],
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith({ where });
  });

  it("finds active criterion codes in the workspace", async () => {
    const roleFindMany = jest.fn().mockResolvedValue([{ code: "PROSPECT" }]);
    const categoryFindMany = jest
      .fn()
      .mockResolvedValue([{ code: "PRIORITY" }]);
    const tagFindMany = jest.fn().mockResolvedValue([{ code: "VIP" }]);
    const repository = new BusinessPartnerSearchRepository(
      createPrismaMock({ roleFindMany, categoryFindMany, tagFindMany }),
    );
    const criteria = {
      roleCodes: ["PROSPECT"],
      categoryCodes: ["PRIORITY"],
      tagCodes: ["VIP"],
      activeOnly: true,
    };

    await expect(
      repository.findKnownAudienceCodes(workspaceId, criteria),
    ).resolves.toEqual({
      roleCodes: criteria.roleCodes,
      categoryCodes: criteria.categoryCodes,
      tagCodes: criteria.tagCodes,
    });
    expect(roleFindMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        code: { in: criteria.roleCodes },
        isActive: true,
      },
      select: { code: true },
    });
    expect(categoryFindMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        code: { in: criteria.categoryCodes },
        isActive: true,
      },
      select: { code: true },
    });
    expect(tagFindMany).toHaveBeenCalledWith({
      where: {
        workspaceId,
        code: { in: criteria.tagCodes },
        isActive: true,
      },
      select: { code: true },
    });
  });
});

function createPrismaMock(methods: {
  findMany?: jest.Mock;
  count?: jest.Mock;
  roleFindMany?: jest.Mock;
  categoryFindMany?: jest.Mock;
  tagFindMany?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartner: {
      findMany: methods.findMany ?? jest.fn(),
      count: methods.count ?? jest.fn(),
    },
    businessPartnerRole: {
      findMany: methods.roleFindMany ?? jest.fn(),
    },
    businessPartnerCategory: {
      findMany: methods.categoryFindMany ?? jest.fn(),
    },
    businessPartnerTag: {
      findMany: methods.tagFindMany ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
