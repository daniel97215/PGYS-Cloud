import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { FeaturesController } from "./features.controller";
import { FeaturesRepository } from "./features.repository";
import { FeaturesService } from "./features.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [FeaturesController],
  providers: [FeaturesRepository, FeaturesService],
})
export class FeaturesModule {}
