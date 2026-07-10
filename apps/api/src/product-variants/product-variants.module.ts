import { Module } from "@nestjs/common";
import { ProductVariantsController } from "./product-variants.controller";
import { ProductVariantsRepository } from "./product-variants.repository";
import { ProductVariantsService } from "./product-variants.service";

@Module({
  controllers: [ProductVariantsController],
  providers: [ProductVariantsRepository, ProductVariantsService],
})
export class ProductVariantsModule {}
