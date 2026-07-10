import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ManufacturerRecord,
  ManufacturersRepository,
} from "./manufacturers.repository";
import { CreateManufacturerDto } from "./dto/create-manufacturer.dto";
import { UpdateManufacturerDto } from "./dto/update-manufacturer.dto";

@Injectable()
export class ManufacturersService {
  constructor(
    private readonly manufacturersRepository: ManufacturersRepository,
  ) {}

  create(
    workspaceId: string,
    data: CreateManufacturerDto,
  ): Promise<ManufacturerRecord> {
    return this.manufacturersRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  list(workspaceId: string): Promise<ManufacturerRecord[]> {
    return this.manufacturersRepository.findByWorkspace(workspaceId);
  }

  async getByCode(
    workspaceId: string,
    code: string,
  ): Promise<ManufacturerRecord> {
    return this.requireManufacturer(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateManufacturerDto,
  ): Promise<ManufacturerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireManufacturer(workspaceId, normalizedCode);

    return this.manufacturersRepository.update(workspaceId, normalizedCode, data);
  }

  async deactivate(
    workspaceId: string,
    code: string,
  ): Promise<ManufacturerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireManufacturer(workspaceId, normalizedCode);

    return this.manufacturersRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireManufacturer(
    workspaceId: string,
    code: string,
  ): Promise<ManufacturerRecord> {
    const normalizedCode = this.normalizeCode(code);
    const manufacturer =
      await this.manufacturersRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer "${code}" not found`);
    }

    return manufacturer;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Manufacturer code is required");
    }

    return normalizedCode;
  }
}
