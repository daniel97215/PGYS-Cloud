import { PrismaService } from "../../prisma/prisma.service";
import { ProductBarcodesRepository } from "../product-barcodes.repository";

describe("ProductBarcodesRepository", () => {
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

  it("creates a product barcode through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(productBarcode);
    const repository = new ProductBarcodesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      productId,
      barcode: productBarcode.barcode,
      barcodeType: productBarcode.barcodeType,
      isPrimary: productBarcode.isPrimary,
    });

    expect(result).toEqual(productBarcode);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        productId,
        barcode: productBarcode.barcode,
        barcodeType: productBarcode.barcodeType,
        isPrimary: productBarcode.isPrimary,
      },
    });
  });

  it("updates a product barcode through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(productBarcode);
    const repository = new ProductBarcodesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, productBarcode.barcode, {
      barcodeType: "CODE128",
    });

    expect(result).toEqual(productBarcode);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode: productBarcode.barcode,
        },
      },
      data: { barcodeType: "CODE128" },
    });
  });

  it("deletes a product barcode through Prisma", async () => {
    const deleteMock = jest.fn().mockResolvedValue(productBarcode);
    const repository = new ProductBarcodesRepository(
      createPrismaMock({ delete: deleteMock }),
    );

    const result = await repository.delete(workspaceId, productBarcode.barcode);

    expect(result).toEqual(productBarcode);
    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode: productBarcode.barcode,
        },
      },
    });
  });

  it("finds a product barcode through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(productBarcode);
    const repository = new ProductBarcodesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByBarcode(
      workspaceId,
      productBarcode.barcode,
    );

    expect(result).toEqual(productBarcode);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode: productBarcode.barcode,
        },
      },
    });
  });

  it("lists product barcodes through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([productBarcode]);
    const repository = new ProductBarcodesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.listByProduct(workspaceId, productId);

    expect(result).toEqual([productBarcode]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, productId },
      orderBy: [{ isPrimary: "desc" }, { barcode: "asc" }],
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  delete?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    productBarcode: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
