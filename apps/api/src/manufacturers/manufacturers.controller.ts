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
import { CreateManufacturerDto } from "./dto/create-manufacturer.dto";
import { UpdateManufacturerDto } from "./dto/update-manufacturer.dto";
import { ManufacturersService } from "./manufacturers.service";

@ApiTags("Manufacturers")
@Controller("workspaces/:workspaceId/manufacturers")
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @ApiOperation({ summary: "Create a manufacturer" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateManufacturerDto })
  @ApiCreatedResponse({ description: "Manufacturer created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateManufacturerDto,
  ) {
    return this.manufacturersService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace manufacturers" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace manufacturers" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.manufacturersService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a manufacturer by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Manufacturer" })
  @ApiNotFoundResponse({ description: "Manufacturer not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.manufacturersService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a manufacturer" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateManufacturerDto })
  @ApiOkResponse({ description: "Manufacturer updated" })
  @ApiNotFoundResponse({ description: "Manufacturer not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateManufacturerDto,
  ) {
    return this.manufacturersService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a manufacturer" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Manufacturer deactivated" })
  @ApiNotFoundResponse({ description: "Manufacturer not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.manufacturersService.deactivate(workspaceId, code);
  }
}
