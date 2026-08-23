export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  role?: string;
}
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  fuelType: string;
  condition: string;
  saaqStatus: 'CLEAN' | 'VGA' | 'SCRAP';
  primaryDamage: string;
  secondaryDamage?: string | null;
  images: string[];
  estimatedRetailValue: number;
  category?: string;
  auctionProvider?: string;
  lotNumber?: string | null;
  titleType?: string;
  description?: string | null;
  hasKeys?: boolean;
  runAndDrive?: boolean;
  buyNowPrice?: number | null;
  location?: string;
  auctions?: Auction[];
}
export interface Auction {
  id: string;
  vehicleId: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  currentBid: number;
  endsAt: string;
  scheduledEndAt?: string;
  bidCount: number;
  vehicle?: Vehicle;
}
export interface Bid {
  id: string;
  actualBidAmount: number;
  amount: number;
  userId: string;
  auctionId: string;
  status: 'WINNING' | 'OUTBID' | 'LOST' | 'WON';
  createdAt: string;
  timestamp: string;
}
export interface Deposit {
  id: string;
  amount: number;
  status: 'HOLD' | 'CAPTURED' | 'RELEASED';
  createdAt: string;
}
