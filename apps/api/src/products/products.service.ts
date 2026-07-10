import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus, ProductType } from "@prisma/client";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductRecord, ProductsRepository } from "./products.repository";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  create(workspaceId: string, data: CreateProductDto): Promise<ProductRecord> {
    return this.productsRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
      type: data.type as ProductType,
      status: data.status as ProductStatus | undefined,
    });
  }

  list(workspaceId: string): Promise<ProductRecord[]> {
    return this.productsRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<ProductRecord> {
    return this.requireProduct(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateProductDto,
  ): Promise<ProductRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProduct(workspaceId, normalizedCode);

    return this.productsRepository.update(workspaceId, normalizedCode, {
      ...data,
      type: data.type as ProductType | undefined,
      status: data.status as ProductStatus | undefined,
    });
  }

  async archive(workspaceId: string, code: string): Promise<ProductRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireProduct(workspaceId, normalizedCode);

    return this.productsRepository.archive(workspaceId, normalizedCode);
  }

  private async requireProduct(
    workspaceId: string,
    code: string,
  ): Promise<ProductRecord> {
    const normalizedCode = this.normalizeCode(code);
    const product = await this.productsRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!product) {
      throw new NotFoundException(`Product "${code}" not found`);
    }

    return product;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Product code is required");
    }

    return normalizedCode;
  }
}
