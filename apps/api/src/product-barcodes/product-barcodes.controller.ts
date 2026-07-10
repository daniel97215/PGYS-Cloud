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
import { CreateProductBarcodeDto } from "./dto/create-product-barcode.dto";
import { UpdateProductBarcodeDto } from "./dto/update-product-barcode.dto";
import { ProductBarcodesService } from "./product-barcodes.service";

@ApiTags("Product Barcodes")
@Controller("workspaces/:workspaceId")
export class ProductBarcodesController {
  constructor(private readonly productBarcodesService: ProductBarcodesService) {}

  @ApiOperation({ summary: "Create a product barcode" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateProductBarcodeDto })
  @ApiCreatedResponse({ description: "Product barcode created" })
  @Post("product-barcodes")
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateProductBarcodeDto,
  ) {
    return this.productBarcodesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List product barcodes" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "productId", format: "uuid" })
  @ApiOkResponse({ description: "Product barcodes" })
  @Get("products/:productId/barcodes")
  listByProduct(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("productId", new ParseUUIDPipe({ version: "4" }))
    productId: string,
  ) {
    return this.productBarcodesService.listByProduct(workspaceId, productId);
  }

  @ApiOperation({ summary: "Get a product barcode" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "barcode" })
  @ApiOkResponse({ description: "Product barcode" })
  @ApiNotFoundResponse({ description: "Product barcode not found" })
  @Get("product-barcodes/:barcode")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("barcode") barcode: string,
  ) {
    return this.productBarcodesService.getByBarcode(workspaceId, barcode);
  }

  @ApiOperation({ summary: "Update a product barcode" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "barcode" })
  @ApiBody({ type: UpdateProductBarcodeDto })
  @ApiOkResponse({ description: "Product barcode updated" })
  @ApiNotFoundResponse({ description: "Product barcode not found" })
  @Patch("product-barcodes/:barcode")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("barcode") barcode: string,
    @Body() data: UpdateProductBarcodeDto,
  ) {
    return this.productBarcodesService.update(workspaceId, barcode, data);
  }

  @ApiOperation({ summary: "Delete a product barcode" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "barcode" })
  @ApiNoContentResponse({ description: "Product barcode deleted" })
  @ApiNotFoundResponse({ description: "Product barcode not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("product-barcodes/:barcode")
  async delete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("barcode") barcode: string,
  ): Promise<void> {
    await this.productBarcodesService.delete(workspaceId, barcode);
  }
}
