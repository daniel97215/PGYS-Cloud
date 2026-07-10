import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerAddressesRepository } from "../business-partner-addresses.repository";
import { BusinessPartnerAddressesService } from "../business-partner-addresses.service";

describe("BusinessPartnerAddressesService", () => {
  let repository: jest.Mocked<BusinessPartnerAddressesRepository>;
  let service: BusinessPartnerAddressesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const businessPartnerId = "20000000-0000-4000-8000-000000000001";
  const addressId = "30000000-0000-4000-8000-000000000001";
  const address = {
    id: addressId,
    workspaceId,
    businessPartnerId,
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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(address),
      update: jest.fn().mockResolvedValue(address),
      delete: jest.fn().mockResolvedValue(address),
      findByBusinessPartner: jest.fn().mockResolvedValue([address]),
      findById: jest.fn().mockResolvedValue(address),
    } as unknown as jest.Mocked<BusinessPartnerAddressesRepository>;

    service = new BusinessPartnerAddressesService(repository);
  });

  it("creates a business partner address", async () => {
    const result = await service.createAddress(workspaceId, businessPartnerId, {
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
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      businessPartnerId,
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      countryCode: address.countryCode,
      isDefault: address.isDefault,
    });
  });

  it("lists customer business partner addresses", async () => {
    const result = await service.listBusinessPartnerAddresses(workspaceId, businessPartnerId);

    expect(result).toEqual([address]);
    expect(repository.findByBusinessPartner).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
    );
  });

  it("gets a business partner address", async () => {
    const result = await service.getAddress(
      workspaceId,
      businessPartnerId,
      addressId,
    );

    expect(result).toEqual(address);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      addressId,
    );
  });

  it("updates a business partner address", async () => {
    const result = await service.updateAddress(
      workspaceId,
      businessPartnerId,
      addressId,
      {
        city: "Lyon",
      },
    );

    expect(result).toEqual(address);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      addressId,
      {
        city: "Lyon",
      },
    );
  });

  it("deletes a business partner address", async () => {
    const result = await service.deleteAddress(
      workspaceId,
      businessPartnerId,
      addressId,
    );

    expect(result).toEqual(address);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      addressId,
    );
  });

  it("throws NotFoundException when address is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getAddress(workspaceId, businessPartnerId, addressId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
