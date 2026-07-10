import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductMediumDto } from "./dto/create-product-medium.dto";
import { UpdateProductMediumDto } from "./dto/update-product-medium.dto";
import {
  ProductMediaRecord,
  ProductMediaRepository,
} from "./product-media.repository";

@Injectable()
export class ProductMediaService {
  constructor(private readonly productMediaRepository: ProductMediaRepository) {}

  create(
    workspaceId: string,
    data: CreateProductMediumDto,
  ): Promise<ProductMediaRecord> {
    this.validateSingleOwner(data.productId, data.productVariantId);

    return this.productMediaRepository.create({
      ...data,
      workspaceId,
    });
  }

  listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductMediaRecord[]> {
    return this.productMediaRepository.listByProduct(workspaceId, productId);
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateProductMediumDto,
  ): Promise<ProductMediaRecord> {
    const existing = await this.requireProductMedia(workspaceId, id);

    this.validateSingleOwner(
      data.productId ?? existing.productId ?? undefined,
      data.productVariantId ?? existing.productVariantId ?? undefined,
    );

    return this.productMediaRepository.update(workspaceId, id, data);
  }

  async delete(workspaceId: string, id: string): Promise<ProductMediaRecord> {
    await this.requireProductMedia(workspaceId, id);

    return this.productMediaRepository.delete(workspaceId, id);
  }

  private async requireProductMedia(
    workspaceId: string,
    id: string,
  ): Promise<ProductMediaRecord> {
    const productMedia = await this.productMediaRepository.findById(
      workspaceId,
      id,
    );

    if (!productMedia) {
      throw new NotFoundException(`Product media "${id}" not found`);
    }

    return productMedia;
  }

  private validateSingleOwner(
    productId?: string,
    productVariantId?: string,
  ): void {
    if ((productId && productVariantId) || (!productId && !productVariantId)) {
      throw new BadRequestException(
        "Product media must reference exactly one product or product variant",
      );
    }
  }
}
