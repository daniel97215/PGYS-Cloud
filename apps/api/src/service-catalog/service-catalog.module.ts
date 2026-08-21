import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { ServiceCatalogController } from "./service-catalog.controller";
import { ServiceCatalogRepository } from "./service-catalog.repository";
import { ServiceCatalogService } from "./service-catalog.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [ServiceCatalogController],
  providers: [ServiceCatalogRepository, ServiceCatalogService],
})
export class ServiceCatalogModule {}
