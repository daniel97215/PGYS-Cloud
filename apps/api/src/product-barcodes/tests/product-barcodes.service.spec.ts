import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductBarcodesRepository } from "../product-barcodes.repository";
import { ProductBarcodesService } from "../product-barcodes.service";

describe("ProductBarcodesService", () => {
  let repository: jest.Mocked<ProductBarcodesRepository>;
  let service: ProductBarcodesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const productId = "20000000-0000-4000-8000-000000000001";
  const productBarcode = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    productId,
    productVariantId: null,
    barcode: "3760000000000",
    barcodeType: "EAN13",
    isPrimary: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(productBarcode),
      update: jest.fn().mockResolvedValue(productBarcode),
      delete: jest.fn().mockResolvedValue(productBarcode),
      findByBarcode: jest.fn().mockResolvedValue(productBarcode),
      listByProduct: jest.fn().mockResolvedValue([productBarcode]),
    } as unknown as jest.Mocked<ProductBarcodesRepository>;

    service = new ProductBarcodesService(repository);
  });

  it("creates a product barcode", async () => {
    const result = await service.create(workspaceId, {
      productId,
      barcode: ` ${productBarcode.barcode} `,
      barcodeType: productBarcode.barcodeType,
      isPrimary: productBarcode.isPrimary,
    });

    expect(result).toEqual(productBarcode);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      productId,
      barcode: productBarcode.barcode,
      barcodeType: productBarcode.barcodeType,
      isPrimary: productBarcode.isPrimary,
    });
  });

  it("updates a product barcode", async () => {
    const result = await service.update(workspaceId, productBarcode.barcode, {
      barcodeType: "CODE128",
    });

    expect(result).toEqual(productBarcode);
    expect(repository.findByBarcode).toHaveBeenCalledWith(
      workspaceId,
      productBarcode.barcode,
    );
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      productBarcode.barcode,
      { barcodeType: "CODE128" },
    );
  });

  it("deletes a product barcode", async () => {
    const result = await service.delete(workspaceId, productBarcode.barcode);

    expect(result).toEqual(productBarcode);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      productBarcode.barcode,
    );
  });

  it("gets a product barcode", async () => {
    const result = await service.getByBarcode(workspaceId, productBarcode.barcode);

    expect(result).toEqual(productBarcode);
    expect(repository.findByBarcode).toHaveBeenCalledWith(
      workspaceId,
      productBarcode.barcode,
    );
  });

  it("lists product barcodes", async () => {
    const result = await service.listByProduct(workspaceId, productId);

    expect(result).toEqual([productBarcode]);
    expect(repository.listByProduct).toHaveBeenCalledWith(workspaceId, productId);
  });

  it("throws NotFoundException when product barcode is unknown", async () => {
    repository.findByBarcode.mockResolvedValueOnce(null);

    await expect(
      service.getByBarcode(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when barcode is blank", async () => {
    await expect(service.getByBarcode(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("throws BadRequestException when no owner is provided", () => {
    expect(() =>
      service.create(workspaceId, {
        barcode: productBarcode.barcode,
        barcodeType: productBarcode.barcodeType,
      }),
    ).toThrow(BadRequestException);
  });

  it("throws BadRequestException when both owners are provided", () => {
    expect(() =>
      service.create(workspaceId, {
        productId,
        productVariantId: "40000000-0000-4000-8000-000000000001",
        barcode: productBarcode.barcode,
        barcodeType: productBarcode.barcodeType,
      }),
    ).toThrow(BadRequestException);
  });
});
