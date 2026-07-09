import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerDocumentsRepository } from "../business-partner-documents.repository";

describe("BusinessPartnerDocumentsRepository", () => {
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

  it("creates a business partner document through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(document);
    const repository = new BusinessPartnerDocumentsRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      customerId,
      name: document.name,
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
    });

    expect(result).toEqual(document);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        customerId,
        name: document.name,
        documentType: document.documentType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        storageKey: document.storageKey,
      },
    });
  });

  it("updates a business partner document through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(document);
    const repository = new BusinessPartnerDocumentsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(
      workspaceId,
      customerId,
      documentId,
      {
        name: "Updated contract",
      },
    );

    expect(result).toEqual(document);
    expect(update).toHaveBeenCalledWith({
      where: {
        id: documentId,
        workspaceId,
        customerId,
      },
      data: { name: "Updated contract" },
    });
  });

  it("deletes a business partner document through Prisma", async () => {
    const deleteDocument = jest.fn().mockResolvedValue(document);
    const repository = new BusinessPartnerDocumentsRepository(
      createPrismaMock({ delete: deleteDocument }),
    );

    const result = await repository.delete(
      workspaceId,
      customerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(deleteDocument).toHaveBeenCalledWith({
      where: {
        id: documentId,
        workspaceId,
        customerId,
      },
    });
  });

  it("lists business partner documents for a customer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([document]);
    const repository = new BusinessPartnerDocumentsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByCustomer(workspaceId, customerId);

    expect(result).toEqual([document]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, customerId },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });
  });

  it("finds a business partner document by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(document);
    const repository = new BusinessPartnerDocumentsRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(
      workspaceId,
      customerId,
      documentId,
    );

    expect(result).toEqual(document);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: documentId,
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
    businessPartnerDocument: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
