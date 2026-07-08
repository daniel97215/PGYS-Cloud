import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerAddressesRepository } from "../business-partner-addresses.repository";

describe("BusinessPartnerAddressesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customerId = "20000000-0000-4000-8000-000000000001";
  const addressId = "30000000-0000-4000-8000-000000000001";
  const address = {
    id: addressId,
    workspaceId,
    customerId,
    label: "Head office",
    addressLine1: "10 rue de la Paix",
    addressLine2: "Batiment A",
    postalCode: "75002",
    city: "Paris",
    state: "Ile-de-France",
    countryCode: "FR",
    isDefault: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a business partner address through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(address);
    const repository = new BusinessPartnerAddressesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      customerId,
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      countryCode: address.countryCode,
      isDefault: address.isDefault,
    });

    expect(result).toEqual(address);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        customerId,
        label: address.label,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        city: address.city,
        state: address.state,
        countryCode: address.countryCode,
        isDefault: address.isDefault,
      },
    });
  });

  it("updates a business partner address through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(address);
    const repository = new BusinessPartnerAddressesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, customerId, addressId, {
      city: "Lyon",
    });

    expect(result).toEqual(address);
    expect(update).toHaveBeenCalledWith({
      where: {
        id: addressId,
        workspaceId,
        customerId,
      },
      data: { city: "Lyon" },
    });
  });

  it("deletes a business partner address through Prisma", async () => {
    const deleteAddress = jest.fn().mockResolvedValue(address);
    const repository = new BusinessPartnerAddressesRepository(
      createPrismaMock({ delete: deleteAddress }),
    );

    const result = await repository.delete(workspaceId, customerId, addressId);

    expect(result).toEqual(address);
    expect(deleteAddress).toHaveBeenCalledWith({
      where: {
        id: addressId,
        workspaceId,
        customerId,
      },
    });
  });

  it("lists business partner addresses for a customer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([address]);
    const repository = new BusinessPartnerAddressesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByCustomer(workspaceId, customerId);

    expect(result).toEqual([address]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, customerId },
      orderBy: [{ isDefault: "desc" }, { label: "asc" }, { createdAt: "asc" }],
    });
  });

  it("finds a business partner address by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(address);
    const repository = new BusinessPartnerAddressesRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(
      workspaceId,
      customerId,
      addressId,
    );

    expect(result).toEqual(address);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: addressId,
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
    businessPartnerAddress: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
