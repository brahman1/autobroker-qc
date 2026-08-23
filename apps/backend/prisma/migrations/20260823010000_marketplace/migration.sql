-- Marketplace: account tools, purchase lifecycle, documents and transport.
ALTER TABLE "Vehicle" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'CAR';
ALTER TABLE "Vehicle" ADD COLUMN "auctionProvider" TEXT NOT NULL DEFAULT 'AUTOBROKER_DEMO';
ALTER TABLE "Vehicle" ADD COLUMN "lotNumber" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "titleType" TEXT NOT NULL DEFAULT 'CLEAN';
ALTER TABLE "Vehicle" ADD COLUMN "secondaryDamage" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "description" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "hasKeys" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Vehicle" ADD COLUMN "runAndDrive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Vehicle" ADD COLUMN "buyNowPrice" DOUBLE PRECISION;
ALTER TABLE "Auction" ADD COLUMN "buyNowPrice" DOUBLE PRECISION;

CREATE UNIQUE INDEX "Vehicle_lotNumber_key" ON "Vehicle"("lotNumber");

CREATE TABLE "Watchlist" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Watchlist_userId_vehicleId_key" ON "Watchlist"("userId", "vehicleId");

CREATE TABLE "SavedSearch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "filters" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "payload" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Offer" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "auctionId" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "auctionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
  "winningBid" DOUBLE PRECISION NOT NULL,
  "buyerFee" DOUBLE PRECISION NOT NULL,
  "transportAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxesAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "dueAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "storageUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransportQuote" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "orderId" TEXT,
  "destinationPostalCode" TEXT NOT NULL,
  "serviceLevel" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CAD',
  "status" TEXT NOT NULL DEFAULT 'QUOTED',
  "estimatedPickupAt" TIMESTAMP(3),
  "estimatedDeliveryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportQuote_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransportQuote" ADD CONSTRAINT "TransportQuote_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransportQuote" ADD CONSTRAINT "TransportQuote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
