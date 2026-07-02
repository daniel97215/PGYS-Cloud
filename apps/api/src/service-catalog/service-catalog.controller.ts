import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateServiceCatalogItemDto } from "./dto/create-service-catalog-item.dto";
import { UpdateServiceCatalogItemDto } from "./dto/update-service-catalog-item.dto";
import { ServiceCatalogService } from "./service-catalog.service";

@ApiTags("Service catalog")
@Controller("service-catalog")
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @ApiOperation({ summary: "List service catalog items" })
  @ApiOkResponse({ description: "Service catalog items" })
  @Get()
  findAll() {
    return this.serviceCatalogService.listServices();
  }

  @ApiOperation({ summary: "Create a service catalog item" })
  @ApiBody({ type: CreateServiceCatalogItemDto })
  @ApiCreatedResponse({ description: "Service catalog item created" })
  @Post()
  create(@Body() data: CreateServiceCatalogItemDto) {
    return this.serviceCatalogService.createService(data);
  }

  @ApiOperation({ summary: "Get a service catalog item by key" })
  @ApiParam({ name: "key" })
  @ApiOkResponse({ description: "Service catalog item" })
  @ApiNotFoundResponse({ description: "Service catalog item not found" })
  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.serviceCatalogService.getServiceByKey(key);
  }

  @ApiOperation({ summary: "Update a service catalog item" })
  @ApiParam({ name: "key" })
  @ApiBody({ type: UpdateServiceCatalogItemDto })
  @ApiOkResponse({ description: "Service catalog item updated" })
  @ApiNotFoundResponse({ description: "Service catalog item not found" })
  @Patch(":key")
  update(
    @Param("key") key: string,
    @Body() data: UpdateServiceCatalogItemDto,
  ) {
    return this.serviceCatalogService.updateService(key, data);
  }

  @ApiOperation({ summary: "Archive a service catalog item" })
  @ApiParam({ name: "key" })
  @ApiNoContentResponse({ description: "Service catalog item archived" })
  @ApiNotFoundResponse({ description: "Service catalog item not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":key")
  async archive(@Param("key") key: string): Promise<void> {
    await this.serviceCatalogService.archiveService(key);
  }
}
