import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuctionsService } from '../auctions/auctions.service';
import { BidsService } from '../bids/bids.service';
import { Logger, Inject, forwardRef, OnModuleDestroy } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private intervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private auctionsService: AuctionsService,
    @Inject(forwardRef(() => BidsService))
    private bidsService: BidsService,
    private jwtService: JwtService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
    this.startTimer();
  }

  handleConnection(client: Socket) {
    const authorization = client.handshake.headers.authorization;
    const bearerToken = Array.isArray(authorization) ? authorization[0] : authorization;
    const authToken = client.handshake.auth?.token;
    const token = typeof authToken === 'string'
      ? authToken
      : bearerToken?.replace(/^Bearer\s+/i, '');

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(token);
      client.data.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      client.disconnect(true);
      return;
    }

    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('join:auction')
  handleJoinAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.join(`auction_${auctionId}`);
    return { event: 'joined', data: auctionId };
  }

  @SubscribeMessage('bid:place')
  async handleBid(client: Socket, data: { auctionId: string, amount: number }) {
    try {
      const user = client.data.user as { id: string } | undefined;
      if (!user) {
        client.emit('bid:error', { message: 'Authentification requise' });
        return;
      }
      await this.bidsService.create({ ...data, userId: user.id });
    } catch (e) {
      client.emit('bid:error', { message: e.message });
    }
  }

  // --- Chrono Manager ---
  private activeAuctionsTimer: NodeJS.Timeout;
  private cacheRefreshTimer: NodeJS.Timeout;
  private cachedActiveAuctions: any[] = [];

  public updateAuctionCache(auctionId: string, newEndAt: Date) {
    const cached = this.cachedActiveAuctions.find(a => a.id === auctionId);
    if (cached) {
      cached.scheduledEndAt = newEndAt;
    }
  }

  startTimer() {
    this.refreshAuctionCache();

    this.cacheRefreshTimer = setInterval(async () => {
      await this.refreshAuctionCache();
    }, 5000);

    this.activeAuctionsTimer = setInterval(() => {
      for (const auction of this.cachedActiveAuctions) {
        const remainingMs = auction.scheduledEndAt.getTime() - Date.now();
        const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
        
        if (remainingSec <= 0) {
          this.server.to(`auction_${auction.id}`).emit('auction:ended', {
            auctionId: auction.id,
          });
          // Remove from local cache to prevent spamming the event
          this.cachedActiveAuctions = this.cachedActiveAuctions.filter(a => a.id !== auction.id);
        } else {
          this.server.to(`auction_${auction.id}`).emit('auction:tick', {
            auctionId: auction.id,
            remainingSeconds: remainingSec,
          });
        }
      }
    }, 1000);
  }

  private async refreshAuctionCache() {
    try {
      this.cachedActiveAuctions = await this.auctionsService.findActive();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Impossible de rafraîchir les enchères actives : ${message}`);
    }
  }

  onModuleDestroy() {
    if (this.activeAuctionsTimer) {
      clearInterval(this.activeAuctionsTimer);
    }
    if (this.cacheRefreshTimer) {
      clearInterval(this.cacheRefreshTimer);
    }
  }
}
