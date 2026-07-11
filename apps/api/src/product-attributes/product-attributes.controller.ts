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
import { CreateProductAttributeDto } from "./dto/create-product-attribute.dto";
import { UpdateProductAttributeDto } from "./dto/update-product-attribute.dto";
import { ProductAttributesService } from "./product-attributes.service";

@ApiTags("Product Attributes")
@Controller("workspaces/:workspaceId/product-attributes")
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @ApiOperation({ summary: "Create a product attribute" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateProductAttributeDto })
  @ApiCreatedResponse({ description: "Product attribute created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateProductAttributeDto,
  ) {
    return this.productAttributesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List product attributes" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Product attributes" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.productAttributesService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a product attribute by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Product attribute" })
  @ApiNotFoundResponse({ description: "Product attribute not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.productAttributesService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a product attribute" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateProductAttributeDto })
  @ApiOkResponse({ description: "Product attribute updated" })
  @ApiNotFoundResponse({ description: "Product attribute not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateProductAttributeDto,
  ) {
    return this.productAttributesService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a product attribute" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Product attribute deactivated" })
  @ApiNotFoundResponse({ description: "Product attribute not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.productAttributesService.deactivate(workspaceId, code);
  }
}
