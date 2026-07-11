import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductAttributeValueType } from "@prisma/client";
import { CreateProductAttributeDto } from "./dto/create-product-attribute.dto";
import { UpdateProductAttributeDto } from "./dto/update-product-attribute.dto";
import {
  ProductAttributeRecord,
  ProductAttributesRepository,
} from "./product-attributes.repository";

@Injectable()
export class ProductAttributesService {
  constructor(
    private readonly productAttributesRepository: ProductAttributesRepository,
  ) {}

  create(
    workspaceId: string,
    data: CreateProductAttributeDto,
  ): Promise<ProductAttributeRecord> {
    return this.productAttributesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
      valueType: data.valueType as ProductAttributeValueType,
    });
  }

  list(workspaceId: string): Promise<ProductAttributeRecord[]> {
    return this.productAttributesRepository.list(workspaceId);
  }

  async getByCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductAttributeRecord> {
    return this.requireProductAttribute(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateProductAttributeDto,
  ): Promise<ProductAttributeRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProductAttribute(workspaceId, normalizedCode);

    return this.productAttributesRepository.update(workspaceId, normalizedCode, {
      ...data,
      valueType: data.valueType as ProductAttributeValueType | undefined,
    });
  }

  async deactivate(
    workspaceId: string,
    code: string,
  ): Promise<ProductAttributeRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProductAttribute(workspaceId, normalizedCode);

    return this.productAttributesRepository.deactivate(
      workspaceId,
      normalizedCode,
    );
  }

  private async requireProductAttribute(
    workspaceId: string,
    code: string,
  ): Promise<ProductAttributeRecord> {
    const normalizedCode = this.normalizeCode(code);
    const productAttribute = await this.productAttributesRepository.getByCode(
      workspaceId,
      normalizedCode,
    );

    if (!productAttribute) {
      throw new NotFoundException(`Product attribute "${code}" not found`);
    }

    return productAttribute;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Product attribute code is required");
    }

    return normalizedCode;
  }
}
