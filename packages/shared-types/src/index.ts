// ============================================================
// AutoBroker QC — Types & Enums Partagés (Front + Back)
// ============================================================

// --------------- ENUMS ---------------

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  BROKER = 'BROKER',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum SaaqStatus {
  CLEAN = 'CLEAN',
  VGA = 'VGA',
  SCRAP = 'SCRAP',
}

export enum AuctionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum BidStatus {
  WINNING = 'WINNING',
  OUTBID = 'OUTBID',
  WON = 'WON',
  LOST = 'LOST',
  ERROR = 'ERROR',
}

export enum DepositStatus {
  PENDING = 'PENDING',
  HOLD = 'HOLD',
  CAPTURED = 'CAPTURED',
  RELEASED = 'RELEASED',
  FAILED = 'FAILED',
}

export enum VehicleCondition {
  RUNS_AND_DRIVES = 'RUNS_AND_DRIVES',
  STARTS_BUT_DAMAGED = 'STARTS_BUT_DAMAGED',
  STATIONARY = 'STATIONARY',
  ENHANCED_VEHICLE = 'ENHANCED_VEHICLE',
}

export enum FuelType {
  ESSENCE = 'ESSENCE',
  DIESEL = 'DIESEL',
  HYBRIDE = 'HYBRIDE',
  ELECTRIQUE = 'ELECTRIQUE',
  AUTRE = 'AUTRE',
}

// --------------- INTERFACES ---------------

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  kycStatus: KycStatus;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  vin: string;
  copartLotId?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color?: string;
  mileage?: number;
  fuelType: FuelType;
  condition: VehicleCondition;
  saaqStatus: SaaqStatus;
  damageDescription?: string;
  primaryDamage?: string;
  secondaryDamage?: string;
  images: string;
  location: string;
  estimatedRetailValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Auction {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  status: AuctionStatus;
  startingBid: number;      // En dollars CAD
  currentBid: number;       // En dollars CAD
  currentWinnerId?: string;
  reservePrice?: number;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  actualEndAt?: Date;
  bidCount: number;
  brokerageFee: number;     // % appliqué sur le bid gagnant
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  maxBidAmount: number;     // Enchère maximale autorisée par le client
  actualBidAmount: number;  // Montant réellement misé chez Copart
  status: BidStatus;
  copartBidId?: string;
  createdAt: Date;
}

export interface Deposit {
  id: string;
  userId: string;
  auctionId?: string;
  stripePaymentIntentId: string;
  amount: number;           // En cents (ex: 60000 = 600$)
  currency: string;         // 'cad'
  status: DepositStatus;
  createdAt: Date;
  updatedAt: Date;
}

// --------------- DTOs (Data Transfer Objects) ---------------

export interface CreateBidDto {
  auctionId: string;
  maxBidAmount: number;
}

export interface CreateDepositDto {
  auctionId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// --------------- WebSocket Events ---------------

export interface WsBidEvent {
  auctionId: string;
  bid: Bid;
  newCurrentBid: number;
  remainingSeconds: number;
}

export interface WsAuctionTickEvent {
  auctionId: string;
  remainingSeconds: number;
  currentBid: number;
  bidCount: number;
}

export interface WsAuctionEndedEvent {
  auctionId: string;
  finalBid: number;
  winnerId?: string;
}

// --------------- Filtres & Pagination ---------------

export interface VehicleFilters {
  saaqStatus?: SaaqStatus;
  condition?: VehicleCondition;
  fuelType?: FuelType;
  minYear?: number;
  maxYear?: number;
  minBid?: number;
  maxBid?: number;
  make?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --------------- Labels Français (UI) ---------------

export const SAAQ_STATUS_LABELS: Record<SaaqStatus, string> = {
  [SaaqStatus.CLEAN]: 'Titre Propre',
  [SaaqStatus.VGA]: 'Véhicule Gravement Accidenté (VGA)',
  [SaaqStatus.SCRAP]: 'Irrécupérable / Ferraille',
};

export const SAAQ_STATUS_COLORS: Record<SaaqStatus, string> = {
  [SaaqStatus.CLEAN]: 'green',
  [SaaqStatus.VGA]: 'yellow',
  [SaaqStatus.SCRAP]: 'red',
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  [AuctionStatus.SCHEDULED]: 'Planifiée',
  [AuctionStatus.LIVE]: 'En cours',
  [AuctionStatus.ENDED]: 'Terminée',
  [AuctionStatus.CANCELLED]: 'Annulée',
};

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  [BidStatus.WINNING]: 'Offre gagnante',
  [BidStatus.OUTBID]: 'Surenchéri',
  [BidStatus.WON]: 'Gagné',
  [BidStatus.LOST]: 'Perdu',
  [BidStatus.ERROR]: 'Erreur',
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FuelType.ESSENCE]: 'Essence',
  [FuelType.DIESEL]: 'Diesel',
  [FuelType.HYBRIDE]: 'Hybride',
  [FuelType.ELECTRIQUE]: 'Électrique',
  [FuelType.AUTRE]: 'Autre',
};

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  [KycStatus.PENDING]: 'En attente de vérification',
  [KycStatus.VERIFIED]: 'Identité vérifiée',
  [KycStatus.REJECTED]: 'Vérification refusée',
};
