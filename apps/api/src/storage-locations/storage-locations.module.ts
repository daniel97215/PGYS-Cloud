import { Module } from "@nestjs/common";
import { StorageLocationsController } from "./storage-locations.controller";
import { StorageLocationsRepository } from "./storage-locations.repository";
import { StorageLocationsService } from "./storage-locations.service";

@Module({
  controllers: [StorageLocationsController],
  providers: [StorageLocationsRepository, StorageLocationsService],
})
export class StorageLocationsModule {}
