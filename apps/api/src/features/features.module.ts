import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { FEATURES_CONTRACT } from "../shared/contracts/features.contract";
import { FeaturesController } from "./features.controller";
import { FeaturesRepository } from "./features.repository";
import { FeaturesService } from "./features.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [FeaturesController],
  providers: [
    FeaturesRepository,
    FeaturesService,
    { provide: FEATURES_CONTRACT, useExisting: FeaturesService },
  ],
  exports: [FEATURES_CONTRACT],
})
export class FeaturesModule {}
