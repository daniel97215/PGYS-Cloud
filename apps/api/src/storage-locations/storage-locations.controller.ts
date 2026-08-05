import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateStorageLocationDto } from "./dto/create-storage-location.dto";
import { UpdateStorageLocationDto } from "./dto/update-storage-location.dto";
import { StorageLocationsService } from "./storage-locations.service";

@ApiTags("Storage Locations")
@Controller("workspaces/:workspaceId/warehouses/:warehouseId/storage-locations")
export class StorageLocationsController {
  constructor(
    private readonly storageLocationsService: StorageLocationsService,
  ) {}

  @ApiOperation({ summary: "Create a storage location" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "warehouseId", format: "uuid" })
  @ApiBody({ type: CreateStorageLocationDto })
  @ApiCreatedResponse({ description: "Storage location created" })
  @ApiNotFoundResponse({ description: "Warehouse not found" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("warehouseId", new ParseUUIDPipe({ version: "4" }))
    warehouseId: string,
    @Body() data: CreateStorageLocationDto,
  ) {
    return this.storageLocationsService.create(workspaceId, warehouseId, data);
  }

  @ApiOperation({ summary: "List warehouse storage locations" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "warehouseId", format: "uuid" })
  @ApiOkResponse({ description: "Warehouse storage locations" })
  @ApiNotFoundResponse({ description: "Warehouse not found" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("warehouseId", new ParseUUIDPipe({ version: "4" }))
    warehouseId: string,
  ) {
    return this.storageLocationsService.listByWarehouse(
      workspaceId,
      warehouseId,
    );
  }

  @ApiOperation({ summary: "Get a storage location by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "warehouseId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Storage location" })
  @ApiNotFoundResponse({
    description: "Warehouse or storage location not found",
  })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("warehouseId", new ParseUUIDPipe({ version: "4" }))
    warehouseId: string,
    @Param("code") code: string,
  ) {
    return this.storageLocationsService.getByCode(
      workspaceId,
      warehouseId,
      code,
    );
  }

  @ApiOperation({ summary: "Update a storage location" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "warehouseId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateStorageLocationDto })
  @ApiOkResponse({ description: "Storage location updated" })
  @ApiNotFoundResponse({
    description: "Warehouse or storage location not found",
  })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("warehouseId", new ParseUUIDPipe({ version: "4" }))
    warehouseId: string,
    @Param("code") code: string,
    @Body() data: UpdateStorageLocationDto,
  ) {
    return this.storageLocationsService.update(
      workspaceId,
      warehouseId,
      code,
      data,
    );
  }

  @ApiOperation({ summary: "Deactivate a storage location" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "warehouseId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Storage location deactivated" })
  @ApiNotFoundResponse({
    description: "Warehouse or storage location not found",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("warehouseId", new ParseUUIDPipe({ version: "4" }))
    warehouseId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.storageLocationsService.deactivate(
      workspaceId,
      warehouseId,
      code,
    );
  }
}
