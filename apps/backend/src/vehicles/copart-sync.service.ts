import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VehiclesService } from './vehicles.service';

@Injectable()
export class CopartSyncService {
  private readonly logger = new Logger(CopartSyncService.name);

  constructor(private vehiclesService: VehiclesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug('Synchronisation avec Copart API (Mock)');
    // Simulation: on pourrait générer aléatoirement un nouveau véhicule ici.
  }
}
