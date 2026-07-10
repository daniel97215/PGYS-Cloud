import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUnitDto } from "./dto/create-unit.dto";
import { UpdateUnitDto } from "./dto/update-unit.dto";
import { UnitRecord, UnitsRepository } from "./units.repository";

@Injectable()
export class UnitsService {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  create(workspaceId: string, data: CreateUnitDto): Promise<UnitRecord> {
    return this.unitsRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  list(workspaceId: string): Promise<UnitRecord[]> {
    return this.unitsRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<UnitRecord> {
    return this.requireUnit(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateUnitDto,
  ): Promise<UnitRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireUnit(workspaceId, normalizedCode);

    return this.unitsRepository.update(workspaceId, normalizedCode, data);
  }

  async deactivate(workspaceId: string, code: string): Promise<UnitRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireUnit(workspaceId, normalizedCode);

    return this.unitsRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireUnit(
    workspaceId: string,
    code: string,
  ): Promise<UnitRecord> {
    const normalizedCode = this.normalizeCode(code);
    const unit = await this.unitsRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!unit) {
      throw new NotFoundException(`Unit "${code}" not found`);
    }

    return unit;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Unit code is required");
    }

    return normalizedCode;
  }
}
