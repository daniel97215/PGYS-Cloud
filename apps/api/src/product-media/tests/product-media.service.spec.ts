import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductMediaRepository } from "../product-media.repository";
import { ProductMediaService } from "../product-media.service";

describe("ProductMediaService", () => {
  let repository: jest.Mocked<ProductMediaRepository>;
  let service: ProductMediaService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(productMedia),
      update: jest.fn().mockResolvedValue(productMedia),
      delete: jest.fn().mockResolvedValue(productMedia),
      findById: jest.fn().mockResolvedValue(productMedia),
      listByProduct: jest.fn().mockResolvedValue([productMedia]),
    } as unknown as jest.Mocked<ProductMediaRepository>;

    service = new ProductMediaService(repository);
  });

  it("creates product media", async () => {
    const result = await service.create(workspaceId, {
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
    expect(repository.create).toHaveBeenCalledWith({
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
  });

  it("updates product media", async () => {
    const result = await service.update(workspaceId, productMedia.id, {
      name: "Updated media",
    });

    expect(result).toEqual(productMedia);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      productMedia.id,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      productMedia.id,
      { name: "Updated media" },
    );
  });

  it("deletes product media", async () => {
    const result = await service.delete(workspaceId, productMedia.id);

    expect(result).toEqual(productMedia);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      productMedia.id,
    );
    expect(repository.delete).toHaveBeenCalledWith(workspaceId, productMedia.id);
  });

  it("lists product media", async () => {
    const result = await service.listByProduct(workspaceId, productId);

    expect(result).toEqual([productMedia]);
    expect(repository.listByProduct).toHaveBeenCalledWith(workspaceId, productId);
  });

  it("throws NotFoundException when product media is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.update(workspaceId, productMedia.id, { name: "Missing" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when no owner is provided", () => {
    expect(() =>
      service.create(workspaceId, {
        name: productMedia.name,
        mediaType: productMedia.mediaType,
        fileName: productMedia.fileName,
        mimeType: productMedia.mimeType,
        fileSize: productMedia.fileSize,
        storageKey: productMedia.storageKey,
      }),
    ).toThrow(BadRequestException);
  });

  it("throws BadRequestException when both owners are provided", () => {
    expect(() =>
      service.create(workspaceId, {
        productId,
        productVariantId: "40000000-0000-4000-8000-000000000001",
        name: productMedia.name,
        mediaType: productMedia.mediaType,
        fileName: productMedia.fileName,
        mimeType: productMedia.mimeType,
        fileSize: productMedia.fileSize,
        storageKey: productMedia.storageKey,
      }),
    ).toThrow(BadRequestException);
  });
});
