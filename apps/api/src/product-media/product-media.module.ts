import { Module } from "@nestjs/common";
import { ProductMediaController } from "./product-media.controller";
import { ProductMediaRepository } from "./product-media.repository";
import { ProductMediaService } from "./product-media.service";

@Module({
  controllers: [ProductMediaController],
  providers: [ProductMediaRepository, ProductMediaService],
})
export class ProductMediaModule {}
