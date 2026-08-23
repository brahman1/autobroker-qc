import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateBidDto {
  @IsUUID()
  auctionId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount: number;
}
