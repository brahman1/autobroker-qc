import { Injectable, Logger } from '@nestjs/common';
import { BidsService } from './bids.service';

interface BidTask {
  userId: string;
  auctionId: string;
  amount: number;
  riskContext?: { ip?: string; deviceId?: string };
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

@Injectable()
export class BidQueueService {
  private readonly logger = new Logger(BidQueueService.name);
  private queue: BidTask[] = [];
  private processing = false;

  constructor(private bidsService: BidsService) {}

  enqueueBid(userId: string, auctionId: string, amount: number, riskContext?: { ip?: string; deviceId?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ userId, auctionId, amount, riskContext, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        const result = await this.bidsService.create({
          userId: task.userId, 
          auctionId: task.auctionId, 
          amount: task.amount, riskContext: task.riskContext,
        });
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }
    }

    this.processing = false;
  }
}
