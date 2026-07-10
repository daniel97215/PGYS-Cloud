import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerDocumentsRepository } from "../business-partner-documents.repository";
import { BusinessPartnerDocumentsService } from "../business-partner-documents.service";

describe("BusinessPartnerDocumentsService", () => {
  let repository: jest.Mocked<BusinessPartnerDocumentsRepository>;
  let service: BusinessPartnerDocumentsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const businessPartnerId = "20000000-0000-4000-8000-000000000001";
  const documentId = "30000000-0000-4000-8000-000000000001";
  const document = {
    id: documentId,
    workspaceId,
    businessPartnerId,
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
      findByBusinessPartner: jest.fn().mockResolvedValue([document]),
      findById: jest.fn().mockResolvedValue(document),
    } as unknown as jest.Mocked<BusinessPartnerDocumentsRepository>;

    service = new BusinessPartnerDocumentsService(repository);
  });

  it("creates a business partner document", async () => {
    const result = await service.createDocument(workspaceId, businessPartnerId, {
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
      businessPartnerId,
      name: document.name,
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
    });
  });

  it("lists customer business partner documents", async () => {
    const result = await service.listBusinessPartnerDocuments(workspaceId, businessPartnerId);

    expect(result).toEqual([document]);
    expect(repository.findByBusinessPartner).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
    );
  });

  it("gets a business partner document", async () => {
    const result = await service.getDocument(
      workspaceId,
      businessPartnerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      documentId,
    );
  });

  it("updates a business partner document", async () => {
    const result = await service.updateDocument(
      workspaceId,
      businessPartnerId,
      documentId,
      {
        name: "Updated contract",
      },
    );

    expect(result).toEqual(document);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      documentId,
      {
        name: "Updated contract",
      },
    );
  });

  it("deletes a business partner document", async () => {
    const result = await service.deleteDocument(
      workspaceId,
      businessPartnerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      documentId,
    );
  });

  it("throws NotFoundException when document is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getDocument(workspaceId, businessPartnerId, documentId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
