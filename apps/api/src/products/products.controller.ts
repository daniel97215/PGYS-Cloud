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
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiTags("Products")
@Controller("workspaces/:workspaceId/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: "Create a product or service" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ description: "Product created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateProductDto,
  ) {
    return this.productsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace products" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace products" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.productsService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a product by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Product" })
  @ApiNotFoundResponse({ description: "Product not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.productsService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ description: "Product updated" })
  @ApiNotFoundResponse({ description: "Product not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateProductDto,
  ) {
    return this.productsService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Archive a product" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Product archived" })
  @ApiNotFoundResponse({ description: "Product not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async archive(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.productsService.archive(workspaceId, code);
  }
}
