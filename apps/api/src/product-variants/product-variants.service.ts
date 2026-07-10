import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto";
import {
  ProductVariantRecord,
  ProductVariantsRepository,
} from "./product-variants.repository";

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly productVariantsRepository: ProductVariantsRepository,
  ) {}

  create(
    workspaceId: string,
    productId: string,
    data: CreateProductVariantDto,
  ): Promise<ProductVariantRecord> {
    return this.productVariantsRepository.create({
      ...data,
      workspaceId,
      productId,
      code: this.normalizeCode(data.code),
    });
  }

  listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductVariantRecord[]> {
    return this.productVariantsRepository.findByProduct(workspaceId, productId);
  }

  async getByCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductVariantRecord> {
    return this.requireProductVariant(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariantRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProductVariant(workspaceId, normalizedCode);

    return this.productVariantsRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async deactivate(
    workspaceId: string,
    code: string,
  ): Promise<ProductVariantRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProductVariant(workspaceId, normalizedCode);

    return this.productVariantsRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireProductVariant(
    workspaceId: string,
    code: string,
  ): Promise<ProductVariantRecord> {
    const normalizedCode = this.normalizeCode(code);
    const productVariant =
      await this.productVariantsRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!productVariant) {
      throw new NotFoundException(`Product variant "${code}" not found`);
    }

    return productVariant;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Product variant code is required");
    }

    return normalizedCode;
  }
}
