import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { SftpImportController } from './sftp-import.controller';
import { SftpImportService } from './sftp-import.service';

@Module({ imports: [VehiclesModule], controllers: [SftpImportController], providers: [SftpImportService] })
export class ImportsModule {}
