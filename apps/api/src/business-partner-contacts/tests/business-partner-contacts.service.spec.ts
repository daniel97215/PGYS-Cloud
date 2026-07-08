import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerContactsRepository } from "../business-partner-contacts.repository";
import { BusinessPartnerContactsService } from "../business-partner-contacts.service";

describe("BusinessPartnerContactsService", () => {
  let repository: jest.Mocked<BusinessPartnerContactsRepository>;
  let service: BusinessPartnerContactsService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(contact),
      update: jest.fn().mockResolvedValue(contact),
      delete: jest.fn().mockResolvedValue(contact),
      findByCustomer: jest.fn().mockResolvedValue([contact]),
      findById: jest.fn().mockResolvedValue(contact),
    } as unknown as jest.Mocked<BusinessPartnerContactsRepository>;

    service = new BusinessPartnerContactsService(repository);
  });

  it("creates a business partner contact", async () => {
    const result = await service.createContact(workspaceId, customerId, {
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
    expect(repository.create).toHaveBeenCalledWith({
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
  });

  it("lists customer business partner contacts", async () => {
    const result = await service.listCustomerContacts(workspaceId, customerId);

    expect(result).toEqual([contact]);
    expect(repository.findByCustomer).toHaveBeenCalledWith(
      workspaceId,
      customerId,
    );
  });

  it("gets a business partner contact", async () => {
    const result = await service.getContact(workspaceId, customerId, contactId);

    expect(result).toEqual(contact);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      contactId,
    );
  });

  it("updates a business partner contact", async () => {
    const result = await service.updateContact(
      workspaceId,
      customerId,
      contactId,
      {
        jobTitle: "Finance Director",
      },
    );

    expect(result).toEqual(contact);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      contactId,
      {
        jobTitle: "Finance Director",
      },
    );
  });

  it("deletes a business partner contact", async () => {
    const result = await service.deleteContact(
      workspaceId,
      customerId,
      contactId,
    );

    expect(result).toEqual(contact);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      contactId,
    );
  });

  it("throws NotFoundException when contact is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getContact(workspaceId, customerId, contactId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
