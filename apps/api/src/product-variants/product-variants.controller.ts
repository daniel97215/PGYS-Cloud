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
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto";
import { ProductVariantsService } from "./product-variants.service";

@ApiTags("Product Variants")
@Controller("workspaces/:workspaceId")
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @ApiOperation({ summary: "Create a product variant" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "productId", format: "uuid" })
  @ApiBody({ type: CreateProductVariantDto })
  @ApiCreatedResponse({ description: "Product variant created" })
  @Post("products/:productId/variants")
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("productId", new ParseUUIDPipe({ version: "4" }))
    productId: string,
    @Body() data: CreateProductVariantDto,
  ) {
    return this.productVariantsService.create(workspaceId, productId, data);
  }

  @ApiOperation({ summary: "List product variants" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "productId", format: "uuid" })
  @ApiOkResponse({ description: "Product variants" })
  @Get("products/:productId/variants")
  findByProduct(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("productId", new ParseUUIDPipe({ version: "4" }))
    productId: string,
  ) {
    return this.productVariantsService.listByProduct(workspaceId, productId);
  }

  @ApiOperation({ summary: "Get a product variant by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Product variant" })
  @ApiNotFoundResponse({ description: "Product variant not found" })
  @Get("product-variants/:code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.productVariantsService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a product variant" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateProductVariantDto })
  @ApiOkResponse({ description: "Product variant updated" })
  @ApiNotFoundResponse({ description: "Product variant not found" })
  @Patch("product-variants/:code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a product variant" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Product variant deactivated" })
  @ApiNotFoundResponse({ description: "Product variant not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("product-variants/:code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.productVariantsService.deactivate(workspaceId, code);
  }
}
