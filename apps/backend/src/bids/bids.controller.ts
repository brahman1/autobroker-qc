import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Headers } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidQueueService } from './bid-queue.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CreateBidDto } from './dto/create-bid.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles } from '../common/decorators/roles.decorator';

@Controller('bids')
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    private readonly bidQueueService: BidQueueService
  ) {}

  @Post()
  async placeBid(@Request() req, @Headers('x-client-device') deviceId: string | undefined, @Body() body: CreateBidDto) {
    // Utilisation de la file d'attente pour traiter la requête
    return this.bidQueueService.enqueueBid(req.user.id, body.auctionId, body.amount, { ip: req.ip, deviceId });
  }

  @Get('auction/:id')
  getAuctionBids(@Param('id') id: string) {
    return this.bidsService.findByAuction(id);
  }

  @Get('my')
  getMyBids(@Request() req) {
    return this.bidsService.findByUser(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.SUPPORT)
  @Get('fraud-flags')
  flags() { return this.bidsService.fraudFlags(); }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.SUPPORT)
  @Patch('fraud-flags/:id')
  reviewFlag(@Request() req, @Param('id') id: string, @Body('status') status: string) { return this.bidsService.reviewFraudFlag(id, req.user.id, status); }
}
