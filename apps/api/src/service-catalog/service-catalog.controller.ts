import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ServiceCatalogService } from "./service-catalog.service";

@ApiTags("Service catalog")
@Controller("service-catalog")
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @ApiOperation({ summary: "List active service definitions" })
  @ApiOkResponse({ description: "Active service definitions" })
  @Get()
  findAll() {
    return this.serviceCatalogService.listActiveServices();
  }

  @ApiOperation({ summary: "Get a service definition by code" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Service definition" })
  @ApiNotFoundResponse({ description: "Service definition not found" })
  @Get(":code")
  findOne(@Param("code") code: string) {
    return this.serviceCatalogService.getServiceByCode(code);
  }
}
