import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerDocumentsRepository } from "../business-partner-documents.repository";
import { BusinessPartnerDocumentsService } from "../business-partner-documents.service";

describe("BusinessPartnerDocumentsService", () => {
  let repository: jest.Mocked<BusinessPartnerDocumentsRepository>;
  let service: BusinessPartnerDocumentsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customerId = "20000000-0000-4000-8000-000000000001";
  const documentId = "30000000-0000-4000-8000-000000000001";
  const document = {
    id: documentId,
    workspaceId,
    customerId,
    name: "Signed contract",
    documentType: "CONTRACT",
    fileName: "contract.pdf",
    mimeType: "application/pdf",
    fileSize: 204800,
    storageKey: "business-partners/documents/contract.pdf",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(document),
      update: jest.fn().mockResolvedValue(document),
      delete: jest.fn().mockResolvedValue(document),
      findByCustomer: jest.fn().mockResolvedValue([document]),
      findById: jest.fn().mockResolvedValue(document),
    } as unknown as jest.Mocked<BusinessPartnerDocumentsRepository>;

    service = new BusinessPartnerDocumentsService(repository);
  });

  it("creates a business partner document", async () => {
    const result = await service.createDocument(workspaceId, customerId, {
      name: document.name,
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
    });

    expect(result).toEqual(document);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      customerId,
      name: document.name,
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
    });
  });

  it("lists customer business partner documents", async () => {
    const result = await service.listCustomerDocuments(workspaceId, customerId);

    expect(result).toEqual([document]);
    expect(repository.findByCustomer).toHaveBeenCalledWith(
      workspaceId,
      customerId,
    );
  });

  it("gets a business partner document", async () => {
    const result = await service.getDocument(
      workspaceId,
      customerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      documentId,
    );
  });

  it("updates a business partner document", async () => {
    const result = await service.updateDocument(
      workspaceId,
      customerId,
      documentId,
      {
        name: "Updated contract",
      },
    );

    expect(result).toEqual(document);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      documentId,
      {
        name: "Updated contract",
      },
    );
  });

  it("deletes a business partner document", async () => {
    const result = await service.deleteDocument(
      workspaceId,
      customerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      customerId,
      documentId,
    );
  });

  it("throws NotFoundException when document is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getDocument(workspaceId, customerId, documentId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
