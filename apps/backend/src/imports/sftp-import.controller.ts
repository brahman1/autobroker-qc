import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';
import { SftpImportService } from './sftp-import.service';

@Controller('imports/sftp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
export class SftpImportController { constructor(private readonly sftp: SftpImportService) {} @Get('status') status() { return this.sftp.status(); } @Post('sync') sync() { return this.sftp.syncCsv(); } }
