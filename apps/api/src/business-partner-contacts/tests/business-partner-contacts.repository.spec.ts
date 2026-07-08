import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerContactsRepository } from "../business-partner-contacts.repository";

describe("BusinessPartnerContactsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customerId = "20000000-0000-4000-8000-000000000001";
  const contactId = "30000000-0000-4000-8000-000000000001";
  const contact = {
    id: contactId,
    workspaceId,
    customerId,
    firstName: "Marie",
    lastName: "Durand",
    jobTitle: "Chief Financial Officer",
    email: "marie.durand@example.com",
    phone: "+33102030405",
    mobile: "+33601020304",
    isPrimary: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a business partner contact through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(contact);
    const repository = new BusinessPartnerContactsRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      customerId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      jobTitle: contact.jobTitle,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      isPrimary: contact.isPrimary,
      isActive: contact.isActive,
    });

    expect(result).toEqual(contact);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        customerId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        jobTitle: contact.jobTitle,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        isPrimary: contact.isPrimary,
        isActive: contact.isActive,
      },
    });
  });

  it("updates a business partner contact through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(contact);
    const repository = new BusinessPartnerContactsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, customerId, contactId, {
      jobTitle: "Finance Director",
    });

    expect(result).toEqual(contact);
    expect(update).toHaveBeenCalledWith({
      where: {
        id: contactId,
        workspaceId,
        customerId,
      },
      data: { jobTitle: "Finance Director" },
    });
  });

  it("deletes a business partner contact through Prisma", async () => {
    const deleteContact = jest.fn().mockResolvedValue(contact);
    const repository = new BusinessPartnerContactsRepository(
      createPrismaMock({ delete: deleteContact }),
    );

    const result = await repository.delete(workspaceId, customerId, contactId);

    expect(result).toEqual(contact);
    expect(deleteContact).toHaveBeenCalledWith({
      where: {
        id: contactId,
        workspaceId,
        customerId,
      },
    });
  });

  it("lists business partner contacts for a customer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([contact]);
    const repository = new BusinessPartnerContactsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByCustomer(workspaceId, customerId);

    expect(result).toEqual([contact]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, customerId },
      orderBy: [
        { isPrimary: "desc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  });

  it("finds a business partner contact by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(contact);
    const repository = new BusinessPartnerContactsRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(
      workspaceId,
      customerId,
      contactId,
    );

    expect(result).toEqual(contact);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: contactId,
        workspaceId,
        customerId,
      },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  delete?: jest.Mock;
  findMany?: jest.Mock;
  findFirst?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartnerContact: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
