import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import {
  WarehouseAddress,
  WarehouseRecord,
  WarehousesRepository,
} from "./warehouses.repository";

@Injectable()
export class WarehousesService {
  constructor(private readonly warehousesRepository: WarehousesRepository) {}

  create(
    workspaceId: string,
    data: CreateWarehouseDto,
  ): Promise<WarehouseRecord> {
    const { address, ...warehouse } = data;

    return this.warehousesRepository.create({
      ...warehouse,
      workspaceId,
      code: this.normalizeCode(data.code),
      ...(address === undefined
        ? {}
        : { address: this.toWarehouseAddress(address) }),
    });
  }

  list(workspaceId: string): Promise<WarehouseRecord[]> {
    return this.warehousesRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<WarehouseRecord> {
    return this.requireWarehouse(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdateWarehouseDto,
  ): Promise<WarehouseRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireWarehouse(workspaceId, normalizedCode);
    const { address, ...warehouse } = data;

    return this.warehousesRepository.update(workspaceId, normalizedCode, {
      ...warehouse,
      ...(address === undefined
        ? {}
        : { address: this.toWarehouseAddress(address) }),
    });
  }

  async deactivate(workspaceId: string, code: string): Promise<WarehouseRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireWarehouse(workspaceId, normalizedCode);

    return this.warehousesRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requireWarehouse(
    workspaceId: string,
    code: string,
  ): Promise<WarehouseRecord> {
    const normalizedCode = this.normalizeCode(code);
    const warehouse = await this.warehousesRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!warehouse) {
      throw new NotFoundException(`Warehouse "${code}" not found`);
    }

    return warehouse;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Warehouse code is required");
    }

    return normalizedCode;
  }

  private toWarehouseAddress(
    address: Record<string, unknown>,
  ): WarehouseAddress {
    return address as WarehouseAddress;
  }
}
