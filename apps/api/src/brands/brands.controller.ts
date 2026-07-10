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
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@ApiTags("Brands")
@Controller("workspaces/:workspaceId/brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @ApiOperation({ summary: "Create a brand" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateBrandDto })
  @ApiCreatedResponse({ description: "Brand created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateBrandDto,
  ) {
    return this.brandsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace brands" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace brands" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.brandsService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a brand by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Brand" })
  @ApiNotFoundResponse({ description: "Brand not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.brandsService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a brand" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateBrandDto })
  @ApiOkResponse({ description: "Brand updated" })
  @ApiNotFoundResponse({ description: "Brand not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateBrandDto,
  ) {
    return this.brandsService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a brand" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Brand deactivated" })
  @ApiNotFoundResponse({ description: "Brand not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.brandsService.deactivate(workspaceId, code);
  }
}
