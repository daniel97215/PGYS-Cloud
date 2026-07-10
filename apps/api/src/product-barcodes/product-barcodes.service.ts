import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductBarcodeDto } from "./dto/create-product-barcode.dto";
import { UpdateProductBarcodeDto } from "./dto/update-product-barcode.dto";
import {
  ProductBarcodeRecord,
  ProductBarcodesRepository,
} from "./product-barcodes.repository";

@Injectable()
export class ProductBarcodesService {
  constructor(
    private readonly productBarcodesRepository: ProductBarcodesRepository,
  ) {}

  create(
    workspaceId: string,
    data: CreateProductBarcodeDto,
  ): Promise<ProductBarcodeRecord> {
    this.validateSingleOwner(data.productId, data.productVariantId);

    return this.productBarcodesRepository.create({
      ...data,
      workspaceId,
      barcode: this.normalizeBarcode(data.barcode),
    });
  }

  listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductBarcodeRecord[]> {
    return this.productBarcodesRepository.listByProduct(workspaceId, productId);
  }

  async getByBarcode(
    workspaceId: string,
    barcode: string,
  ): Promise<ProductBarcodeRecord> {
    return this.requireProductBarcode(workspaceId, barcode);
  }

  async update(
    workspaceId: string,
    barcode: string,
    data: UpdateProductBarcodeDto,
  ): Promise<ProductBarcodeRecord> {
    const normalizedBarcode = this.normalizeBarcode(barcode);
    const existing = await this.requireProductBarcode(
      workspaceId,
      normalizedBarcode,
    );

    this.validateSingleOwner(
      data.productId ?? existing.productId ?? undefined,
      data.productVariantId ?? existing.productVariantId ?? undefined,
    );

    return this.productBarcodesRepository.update(
      workspaceId,
      normalizedBarcode,
      data,
    );
  }

  async delete(workspaceId: string, barcode: string): Promise<ProductBarcodeRecord> {
    const normalizedBarcode = this.normalizeBarcode(barcode);
    await this.requireProductBarcode(workspaceId, normalizedBarcode);

    return this.productBarcodesRepository.delete(workspaceId, normalizedBarcode);
  }

  private async requireProductBarcode(
    workspaceId: string,
    barcode: string,
  ): Promise<ProductBarcodeRecord> {
    const normalizedBarcode = this.normalizeBarcode(barcode);
    const productBarcode = await this.productBarcodesRepository.findByBarcode(
      workspaceId,
      normalizedBarcode,
    );

    if (!productBarcode) {
      throw new NotFoundException(`Product barcode "${barcode}" not found`);
    }

    return productBarcode;
  }

  private validateSingleOwner(
    productId?: string,
    productVariantId?: string,
  ): void {
    if ((productId && productVariantId) || (!productId && !productVariantId)) {
      throw new BadRequestException(
        "Product barcode must reference exactly one product or product variant",
      );
    }
  }

  private normalizeBarcode(barcode: string): string {
    const normalizedBarcode = barcode.trim();

    if (normalizedBarcode.length === 0) {
      throw new BadRequestException("Product barcode is required");
    }

    return normalizedBarcode;
  }
}
