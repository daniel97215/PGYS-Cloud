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
import { CreateProductCategoryDto } from "./dto/create-product-category.dto";
import { UpdateProductCategoryDto } from "./dto/update-product-category.dto";
import { ProductCategoriesService } from "./product-categories.service";

@ApiTags("Product Categories")
@Controller("workspaces/:workspaceId/product-categories")
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @ApiOperation({ summary: "Create a product category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateProductCategoryDto })
  @ApiCreatedResponse({ description: "Product category created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateProductCategoryDto,
  ) {
    return this.productCategoriesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace product categories" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace product categories" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.productCategoriesService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a product category by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Product category" })
  @ApiNotFoundResponse({ description: "Product category not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.productCategoriesService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a product category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateProductCategoryDto })
  @ApiOkResponse({ description: "Product category updated" })
  @ApiNotFoundResponse({ description: "Product category not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a product category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Product category deactivated" })
  @ApiNotFoundResponse({ description: "Product category not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.productCategoriesService.deactivate(workspaceId, code);
  }
}
