import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateTaxDto } from "./dto/create-tax.dto";
import { UpdateTaxDto } from "./dto/update-tax.dto";
import { TaxRecord, TaxesRepository } from "./taxes.repository";

@Injectable()
export class TaxesService {
  constructor(private readonly taxesRepository: TaxesRepository) {}

  create(workspaceId: string, data: CreateTaxDto): Promise<TaxRecord> {
    return this.taxesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  list(workspaceId: string): Promise<TaxRecord[]> {
    return this.taxesRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<TaxRecord> {
    return this.requireTax(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateTaxDto,
  ): Promise<TaxRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireTax(workspaceId, normalizedCode);

    return this.taxesRepository.update(workspaceId, normalizedCode, data);
  }

  async deactivate(workspaceId: string, code: string): Promise<TaxRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireTax(workspaceId, normalizedCode);

    return this.taxesRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireTax(
    workspaceId: string,
    code: string,
  ): Promise<TaxRecord> {
    const normalizedCode = this.normalizeCode(code);
    const tax = await this.taxesRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!tax) {
      throw new NotFoundException(`Tax "${code}" not found`);
    }

    return tax;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Tax code is required");
    }

    return normalizedCode;
  }
}
