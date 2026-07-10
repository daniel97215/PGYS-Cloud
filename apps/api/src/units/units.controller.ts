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
import { CreateUnitDto } from "./dto/create-unit.dto";
import { UpdateUnitDto } from "./dto/update-unit.dto";
import { UnitsService } from "./units.service";

@ApiTags("Units")
@Controller("workspaces/:workspaceId/units")
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ summary: "Create a unit" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateUnitDto })
  @ApiCreatedResponse({ description: "Unit created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateUnitDto,
  ) {
    return this.unitsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace units" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace units" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.unitsService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a unit by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Unit" })
  @ApiNotFoundResponse({ description: "Unit not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.unitsService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a unit" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateUnitDto })
  @ApiOkResponse({ description: "Unit updated" })
  @ApiNotFoundResponse({ description: "Unit not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateUnitDto,
  ) {
    return this.unitsService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a unit" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Unit deactivated" })
  @ApiNotFoundResponse({ description: "Unit not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.unitsService.deactivate(workspaceId, code);
  }
}
