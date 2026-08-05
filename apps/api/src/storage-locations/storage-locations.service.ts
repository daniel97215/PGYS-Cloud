import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateStorageLocationDto } from "./dto/create-storage-location.dto";
import { UpdateStorageLocationDto } from "./dto/update-storage-location.dto";
import {
  StorageLocationRecord,
  StorageLocationsRepository,
} from "./storage-locations.repository";

@Injectable()
export class StorageLocationsService {
  constructor(
    private readonly storageLocationsRepository: StorageLocationsRepository,
  ) {}

  async create(
    workspaceId: string,
    warehouseId: string,
    data: CreateStorageLocationDto,
  ): Promise<StorageLocationRecord> {
    await this.requireWarehouse(workspaceId, warehouseId);

    return this.storageLocationsRepository.create({
      ...data,
      workspaceId,
      warehouseId,
      code: this.normalizeCode(data.code),
    });
  }

  async update(
    workspaceId: string,
    warehouseId: string,
    code: string,
    data: UpdateStorageLocationDto,
  ): Promise<StorageLocationRecord> {
    await this.requireWarehouse(workspaceId, warehouseId);
    const normalizedCode = this.normalizeCode(code);
    await this.requireStorageLocation(workspaceId, warehouseId, normalizedCode);

    return this.storageLocationsRepository.update(
      workspaceId,
      warehouseId,
      normalizedCode,
      data,
    );
  }

  async deactivate(
    workspaceId: string,
    warehouseId: string,
    code: string,
  ): Promise<StorageLocationRecord> {
    await this.requireWarehouse(workspaceId, warehouseId);
    const normalizedCode = this.normalizeCode(code);
    await this.requireStorageLocation(workspaceId, warehouseId, normalizedCode);

    return this.storageLocationsRepository.deactivate(
      workspaceId,
      warehouseId,
      normalizedCode,
    );
  }

  async listByWarehouse(
    workspaceId: string,
    warehouseId: string,
  ): Promise<StorageLocationRecord[]> {
    await this.requireWarehouse(workspaceId, warehouseId);
    return this.storageLocationsRepository.findByWarehouse(
      workspaceId,
      warehouseId,
    );
  }

  async getByCode(
    workspaceId: string,
    warehouseId: string,
    code: string,
  ): Promise<StorageLocationRecord> {
    await this.requireWarehouse(workspaceId, warehouseId);
    return this.requireStorageLocation(workspaceId, warehouseId, code);
  }

  private async requireWarehouse(
    workspaceId: string,
    warehouseId: string,
  ): Promise<void> {
    const belongsToWorkspace =
      await this.storageLocationsRepository.warehouseBelongsToWorkspace(
        workspaceId,
        warehouseId,
      );

    if (!belongsToWorkspace) {
      throw new NotFoundException(`Warehouse "${warehouseId}" not found`);
    }
  }

  private async requireStorageLocation(
    workspaceId: string,
    warehouseId: string,
    code: string,
  ): Promise<StorageLocationRecord> {
    const normalizedCode = this.normalizeCode(code);
    const storageLocation =
      await this.storageLocationsRepository.findByWarehouseAndCode(
        workspaceId,
        warehouseId,
        normalizedCode,
      );

    if (!storageLocation) {
      throw new NotFoundException(`Storage location "${code}" not found`);
    }

    return storageLocation;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Storage location code is required");
    }

    return normalizedCode;
  }
}
