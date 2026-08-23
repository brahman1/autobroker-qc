import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { CopartSyncService } from './copart-sync.service';

@Module({
  providers: [VehiclesService, CopartSyncService],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
