import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}
  @Get('summary') @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE) summary() { return this.monitoring.summary(); }
}
