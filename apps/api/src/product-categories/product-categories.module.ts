import { Module } from "@nestjs/common";
import { ProductCategoriesController } from "./product-categories.controller";
import { ProductCategoriesRepository } from "./product-categories.repository";
import { ProductCategoriesService } from "./product-categories.service";

@Module({
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesRepository, ProductCategoriesService],
})
export class ProductCategoriesModule {}
