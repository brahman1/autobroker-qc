-- Initial PostgreSQL schema generated from prisma/schema.prisma.
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vin" TEXT NOT NULL,
    "saaqStatus" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "primaryDamage" TEXT NOT NULL,
    "images" TEXT[] NOT NULL,
    "estimatedRetailValue" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startingBid" DOUBLE PRECISION NOT NULL,
    "currentBid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "brokerageFee" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "currentWinnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxBidAmount" DOUBLE PRECISION NOT NULL,
    "actualBidAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'cad',
    "status" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
CREATE UNIQUE INDEX "Deposit_stripePaymentIntentId_key" ON "Deposit"("stripePaymentIntentId");

ALTER TABLE "Auction" ADD CONSTRAINT "Auction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_currentWinnerId_fkey" FOREIGN KEY ("currentWinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
