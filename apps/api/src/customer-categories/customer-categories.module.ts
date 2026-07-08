import { Module } from "@nestjs/common";
import { CustomerCategoriesController } from "./customer-categories.controller";
import { CustomerCategoriesRepository } from "./customer-categories.repository";
import { CustomerCategoriesService } from "./customer-categories.service";

@Module({
  controllers: [CustomerCategoriesController],
  providers: [CustomerCategoriesRepository, CustomerCategoriesService],
})
export class CustomerCategoriesModule {}
