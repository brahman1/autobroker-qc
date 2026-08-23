import { Controller, Get, Post, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id/purchase-estimate')
  purchaseEstimate(@Param('id') id: string, @Query('postalCode') postalCode?: string) {
    return this.vehiclesService.purchaseEstimate(id, postalCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
  @Post('import/csv')
  importCsv(@Body('csv') csv: string) {
    return this.vehiclesService.importCsv(csv);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
  @Post()
  create(@Body() body: any) {
    return this.vehiclesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vehiclesService.update(id, body);
  }
}
