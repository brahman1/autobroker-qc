import { Controller, Get, Param, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.auctionsService.findAll(vehicleId);
  }

  @Get('active')
  getActive() {
    return this.auctionsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
  @Post()
  create(@Body() body: any) {
    return this.auctionsService.create(body);
  }
}
