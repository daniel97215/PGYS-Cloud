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
import { CreateTaxDto } from "./dto/create-tax.dto";
import { UpdateTaxDto } from "./dto/update-tax.dto";
import { TaxesService } from "./taxes.service";

@ApiTags("Taxes")
@Controller("workspaces/:workspaceId/taxes")
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @ApiOperation({ summary: "Create a tax" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateTaxDto })
  @ApiCreatedResponse({ description: "Tax created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateTaxDto,
  ) {
    return this.taxesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace taxes" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace taxes" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.taxesService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a tax by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Tax" })
  @ApiNotFoundResponse({ description: "Tax not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.taxesService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a tax" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateTaxDto })
  @ApiOkResponse({ description: "Tax updated" })
  @ApiNotFoundResponse({ description: "Tax not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateTaxDto,
  ) {
    return this.taxesService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a tax" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Tax deactivated" })
  @ApiNotFoundResponse({ description: "Tax not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.taxesService.deactivate(workspaceId, code);
  }
}
