import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CustomerCategoriesRepository,
  CustomerCategoryRecord,
} from "./customer-categories.repository";
import { CreateCustomerCategoryDto } from "./dto/create-customer-category.dto";
import { UpdateCustomerCategoryDto } from "./dto/update-customer-category.dto";

@Injectable()
export class CustomerCategoriesService {
  constructor(
    private readonly customerCategoriesRepository: CustomerCategoriesRepository,
  ) {}

  createCategory(
    workspaceId: string,
    data: CreateCustomerCategoryDto,
  ): Promise<CustomerCategoryRecord> {
    return this.customerCategoriesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  listWorkspaceCategories(
    workspaceId: string,
  ): Promise<CustomerCategoryRecord[]> {
    return this.customerCategoriesRepository.findByWorkspace(workspaceId);
  }

  async getCategory(
    workspaceId: string,
    code: string,
  ): Promise<CustomerCategoryRecord> {
    return this.requireCategory(workspaceId, code);
  }

  async updateCategory(
    workspaceId: string,
    code: string,
    data: UpdateCustomerCategoryDto,
  ): Promise<CustomerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.customerCategoriesRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async disableCategory(
    workspaceId: string,
    code: string,
  ): Promise<CustomerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.customerCategoriesRepository.disable(workspaceId, normalizedCode);
  }

  private async requireCategory(
    workspaceId: string,
    code: string,
  ): Promise<CustomerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    const category =
      await this.customerCategoriesRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!category) {
      throw new NotFoundException(`Customer category "${code}" not found`);
    }

    return category;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Customer category code is required");
    }

    return normalizedCode;
  }
}
