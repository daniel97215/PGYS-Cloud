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
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { WarehousesService } from "./warehouses.service";

@ApiTags("Warehouses")
@Controller("workspaces/:workspaceId/warehouses")
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @ApiOperation({ summary: "Create a warehouse" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiCreatedResponse({ description: "Warehouse created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace warehouses" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace warehouses" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.warehousesService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a warehouse by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Warehouse" })
  @ApiNotFoundResponse({ description: "Warehouse not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.warehousesService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a warehouse" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateWarehouseDto })
  @ApiOkResponse({ description: "Warehouse updated" })
  @ApiNotFoundResponse({ description: "Warehouse not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a warehouse" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Warehouse deactivated" })
  @ApiNotFoundResponse({ description: "Warehouse not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.warehousesService.deactivate(workspaceId, code);
  }
}
