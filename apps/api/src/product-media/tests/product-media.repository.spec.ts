import { PrismaService } from "../../prisma/prisma.service";
import { ProductMediaRepository } from "../product-media.repository";

describe("ProductMediaRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const productId = "20000000-0000-4000-8000-000000000001";
  const productMedia = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    productId,
    productVariantId: null,
    name: "Main product image",
    mediaType: "IMAGE",
    fileName: "product-main.jpg",
    mimeType: "image/jpeg",
    fileSize: 245760,
    storageKey: "products/PROD-001/main.jpg",
    isPrimary: true,
    sortOrder: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates product media through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(productMedia);
    const repository = new ProductMediaRepository(createPrismaMock({ create }));

    const result = await repository.create({
      workspaceId,
      productId,
      name: productMedia.name,
      mediaType: productMedia.mediaType,
      fileName: productMedia.fileName,
      mimeType: productMedia.mimeType,
      fileSize: productMedia.fileSize,
      storageKey: productMedia.storageKey,
      isPrimary: productMedia.isPrimary,
      sortOrder: productMedia.sortOrder,
    });

    expect(result).toEqual(productMedia);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        productId,
        name: productMedia.name,
        mediaType: productMedia.mediaType,
        fileName: productMedia.fileName,
        mimeType: productMedia.mimeType,
        fileSize: productMedia.fileSize,
        storageKey: productMedia.storageKey,
        isPrimary: productMedia.isPrimary,
        sortOrder: productMedia.sortOrder,
      },
    });
  });

  it("updates product media through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(productMedia);
    const repository = new ProductMediaRepository(createPrismaMock({ update }));

    const result = await repository.update(workspaceId, productMedia.id, {
      name: "Updated media",
    });

    expect(result).toEqual(productMedia);
    expect(update).toHaveBeenCalledWith({
      where: { id: productMedia.id, workspaceId },
      data: { name: "Updated media" },
    });
  });

  it("deletes product media through Prisma", async () => {
    const deleteMock = jest.fn().mockResolvedValue(productMedia);
    const repository = new ProductMediaRepository(
      createPrismaMock({ delete: deleteMock }),
    );

    const result = await repository.delete(workspaceId, productMedia.id);

    expect(result).toEqual(productMedia);
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: productMedia.id, workspaceId },
    });
  });

  it("finds product media by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(productMedia);
    const repository = new ProductMediaRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(workspaceId, productMedia.id);

    expect(result).toEqual(productMedia);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: productMedia.id, workspaceId },
    });
  });

  it("lists product media through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([productMedia]);
    const repository = new ProductMediaRepository(createPrismaMock({ findMany }));

    const result = await repository.listByProduct(workspaceId, productId);

    expect(result).toEqual([productMedia]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, productId },
      orderBy: [
        { isPrimary: "desc" },
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
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
    productMedia: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
