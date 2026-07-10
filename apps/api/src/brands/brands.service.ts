import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BrandsRepository, BrandRecord } from "./brands.repository";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  create(workspaceId: string, data: CreateBrandDto): Promise<BrandRecord> {
    return this.brandsRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  list(workspaceId: string): Promise<BrandRecord[]> {
    return this.brandsRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<BrandRecord> {
    return this.requireBrand(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateBrandDto,
  ): Promise<BrandRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireBrand(workspaceId, normalizedCode);

    return this.brandsRepository.update(workspaceId, normalizedCode, data);
  }

  async deactivate(workspaceId: string, code: string): Promise<BrandRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireBrand(workspaceId, normalizedCode);

    return this.brandsRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireBrand(
    workspaceId: string,
    code: string,
  ): Promise<BrandRecord> {
    const normalizedCode = this.normalizeCode(code);
    const brand = await this.brandsRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!brand) {
      throw new NotFoundException(`Brand "${code}" not found`);
    }

    return brand;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Brand code is required");
    }

    return normalizedCode;
  }
}
