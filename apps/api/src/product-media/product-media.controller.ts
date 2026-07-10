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
import { CreateProductMediumDto } from "./dto/create-product-medium.dto";
import { UpdateProductMediumDto } from "./dto/update-product-medium.dto";
import { ProductMediaService } from "./product-media.service";

@ApiTags("Product Media")
@Controller("workspaces/:workspaceId")
export class ProductMediaController {
  constructor(private readonly productMediaService: ProductMediaService) {}

  @ApiOperation({ summary: "Create product media" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateProductMediumDto })
  @ApiCreatedResponse({ description: "Product media created" })
  @Post("product-media")
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateProductMediumDto,
  ) {
    return this.productMediaService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List product media" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "productId", format: "uuid" })
  @ApiOkResponse({ description: "Product media" })
  @Get("products/:productId/media")
  listByProduct(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("productId", new ParseUUIDPipe({ version: "4" }))
    productId: string,
  ) {
    return this.productMediaService.listByProduct(workspaceId, productId);
  }

  @ApiOperation({ summary: "Update product media" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiBody({ type: UpdateProductMediumDto })
  @ApiOkResponse({ description: "Product media updated" })
  @ApiNotFoundResponse({ description: "Product media not found" })
  @Patch("product-media/:id")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() data: UpdateProductMediumDto,
  ) {
    return this.productMediaService.update(workspaceId, id, data);
  }

  @ApiOperation({ summary: "Delete product media" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Product media deleted" })
  @ApiNotFoundResponse({ description: "Product media not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("product-media/:id")
  async delete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ): Promise<void> {
    await this.productMediaService.delete(workspaceId, id);
  }
}
