import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";
import {
  InventoryItemRecord,
  InventoryItemsRepository,
  StorageLocationReference,
} from "./inventory-items.repository";

@Injectable()
export class InventoryItemsService {
  constructor(
    private readonly inventoryItemsRepository: InventoryItemsRepository,
  ) {}

  async create(
    workspaceId: string,
    data: CreateInventoryItemDto,
  ): Promise<InventoryItemRecord> {
    await this.validateReferences(workspaceId, data);

    const duplicate = await this.inventoryItemsRepository.findDuplicate(
      workspaceId,
      data.storageLocationId,
      data.productId,
      data.productVariantId ?? null,
    );

    if (duplicate) {
      throw new ConflictException(
        "An inventory item already exists for this location and product",
      );
    }

    return this.inventoryItemsRepository.create({
      workspaceId,
      warehouseId: data.warehouseId,
      storageLocationId: data.storageLocationId,
      productId: data.productId,
      ...(data.productVariantId
        ? { productVariantId: data.productVariantId }
        : {}),
    });
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateInventoryItemDto,
  ): Promise<InventoryItemRecord> {
    await this.requireInventoryItem(workspaceId, id);
    return this.inventoryItemsRepository.update(workspaceId, id, data);
  }

  async deactivate(
    workspaceId: string,
    id: string,
  ): Promise<InventoryItemRecord> {
    await this.requireInventoryItem(workspaceId, id);
    return this.inventoryItemsRepository.deactivate(workspaceId, id);
  }

  get(workspaceId: string, id: string): Promise<InventoryItemRecord> {
    return this.requireInventoryItem(workspaceId, id);
  }

  async listByLocation(
    workspaceId: string,
    storageLocationId: string,
  ): Promise<InventoryItemRecord[]> {
    await this.requireStorageLocation(workspaceId, storageLocationId);
    return this.inventoryItemsRepository.findByLocation(
      workspaceId,
      storageLocationId,
    );
  }

  async listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<InventoryItemRecord[]> {
    await this.requireProduct(workspaceId, productId);
    return this.inventoryItemsRepository.findByProduct(workspaceId, productId);
  }

  private async validateReferences(
    workspaceId: string,
    data: CreateInventoryItemDto,
  ): Promise<void> {
    const [warehouseExists, storageLocation, productExists] = await Promise.all([
      this.inventoryItemsRepository.warehouseBelongsToWorkspace(
        workspaceId,
        data.warehouseId,
      ),
      this.inventoryItemsRepository.findStorageLocation(
        workspaceId,
        data.storageLocationId,
      ),
      this.inventoryItemsRepository.productBelongsToWorkspace(
        workspaceId,
        data.productId,
      ),
    ]);

    if (!warehouseExists) {
      throw new NotFoundException(`Warehouse "${data.warehouseId}" not found`);
    }

    if (!storageLocation) {
      throw new NotFoundException(
        `Storage location "${data.storageLocationId}" not found`,
      );
    }

    if (storageLocation.warehouseId !== data.warehouseId) {
      throw new BadRequestException(
        "Storage location does not belong to the specified warehouse",
      );
    }

    if (!productExists) {
      throw new NotFoundException(`Product "${data.productId}" not found`);
    }

    if (data.productVariantId) {
      const variantExists =
        await this.inventoryItemsRepository.productVariantBelongsToProduct(
          workspaceId,
          data.productId,
          data.productVariantId,
        );

      if (!variantExists) {
        throw new NotFoundException(
          `Product variant "${data.productVariantId}" not found for product`,
        );
      }
    }
  }

  private async requireInventoryItem(
    workspaceId: string,
    id: string,
  ): Promise<InventoryItemRecord> {
    const inventoryItem = await this.inventoryItemsRepository.findById(
      workspaceId,
      id,
    );

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item "${id}" not found`);
    }

    return inventoryItem;
  }

  private async requireStorageLocation(
    workspaceId: string,
    storageLocationId: string,
  ): Promise<StorageLocationReference> {
    const storageLocation =
      await this.inventoryItemsRepository.findStorageLocation(
        workspaceId,
        storageLocationId,
      );

    if (!storageLocation) {
      throw new NotFoundException(
        `Storage location "${storageLocationId}" not found`,
      );
    }

    return storageLocation;
  }

  private async requireProduct(
    workspaceId: string,
    productId: string,
  ): Promise<void> {
    const productExists =
      await this.inventoryItemsRepository.productBelongsToWorkspace(
        workspaceId,
        productId,
      );

    if (!productExists) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }
  }
}
