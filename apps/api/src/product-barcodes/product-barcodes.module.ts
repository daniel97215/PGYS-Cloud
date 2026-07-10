import { Module } from "@nestjs/common";
import { ProductBarcodesController } from "./product-barcodes.controller";
import { ProductBarcodesRepository } from "./product-barcodes.repository";
import { ProductBarcodesService } from "./product-barcodes.service";

@Module({
  controllers: [ProductBarcodesController],
  providers: [ProductBarcodesRepository, ProductBarcodesService],
})
export class ProductBarcodesModule {}
