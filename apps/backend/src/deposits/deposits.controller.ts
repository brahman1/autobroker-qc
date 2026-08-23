import { Controller, Post, Get, Param, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';

@Controller('deposits')
@UseGuards(JwtAuthGuard)
export class DepositsController {
  constructor(
    private readonly depositsService: DepositsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-intent')
  createIntent(@Request() req) {
    return this.depositsService.createDepositIntent(req.user.id);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Request() req) {
    return this.depositsService.confirmDepositForUser(req.user.id, id);
  }

  @Post(':id/release')
  async release(@Param('id') id: string, @Request() req) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized');
    }
    return this.depositsService.release(id);
  }

  @Get('my')
  getMyDeposits(@Request() req) {
    return this.depositsService.findByUser(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE)
  @Get()
  getAllDeposits() {
    return this.depositsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE)
  @Post(':id/capture')
  capture(@Param('id') id: string) {
    return this.depositsService.capture(id);
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.FINANCE)
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.depositsService.refund(id);
  }
}
