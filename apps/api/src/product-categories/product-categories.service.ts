import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductCategoryDto } from "./dto/create-product-category.dto";
import { UpdateProductCategoryDto } from "./dto/update-product-category.dto";
import {
  ProductCategoriesRepository,
  ProductCategoryRecord,
} from "./product-categories.repository";

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly productCategoriesRepository: ProductCategoriesRepository,
  ) {}

  create(
    workspaceId: string,
    data: CreateProductCategoryDto,
  ): Promise<ProductCategoryRecord> {
    return this.productCategoriesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  list(workspaceId: string): Promise<ProductCategoryRecord[]> {
    return this.productCategoriesRepository.findByWorkspace(workspaceId);
  }

  async getByCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductCategoryRecord> {
    return this.requireCategory(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateProductCategoryDto,
  ): Promise<ProductCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.productCategoriesRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async deactivate(
    workspaceId: string,
    code: string,
  ): Promise<ProductCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.productCategoriesRepository.deactivate(
      workspaceId,
      normalizedCode,
    );
  }

  private async requireCategory(
    workspaceId: string,
    code: string,
  ): Promise<ProductCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    const category =
      await this.productCategoriesRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!category) {
      throw new NotFoundException(`Product category "${code}" not found`);
    }

    return category;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Product category code is required");
    }

    return normalizedCode;
  }
}
