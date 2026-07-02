import { Module } from "@nestjs/common";
import { FeaturesController } from "./features.controller";
import { FeaturesRepository } from "./features.repository";
import { FeaturesService } from "./features.service";

@Module({
  controllers: [FeaturesController],
  providers: [FeaturesRepository, FeaturesService],
})
export class FeaturesModule {}
