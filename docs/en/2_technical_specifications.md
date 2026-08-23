# Architecture and Technical Specifications

## 1. Technology Stack

### 1.1 Front-End (Client)
- **Framework:** React 18 with TypeScript.
- **Build Tool:** Vite (fast HMR, optimized builds).
- **Styling:** Tailwind CSS.
- **State Management:** Zustand (lightweight, ideal for Auth and local UI state).
- **Networking:** Axios (REST) and Socket.io-client (WebSockets).
- **Payments:** Stripe Elements (React Stripe.js).

### 1.2 Back-End (Server)
- **Framework:** NestJS (Node.js).
- **Language:** TypeScript.
- **Real-Time:** @nestjs/websockets with Socket.io.
- **Security:** Helmet (HTTP Headers), Throttler (Rate limiting), Bcrypt (Password hashing).
- **Authentication:** Passport-JWT.
- **Payments:** Stripe Node SDK.

### 1.3 Infrastructure (Production-Ready)
- **Database:** PostgreSQL (guarantees ACID integrity). *Note: mocked in-memory for local dev*.
- **Cache / Queue:** Redis. *Note: mocked in-memory (FIFO array) for local dev*.
- **Reverse Proxy:** Nginx.
- **Containerization:** Docker & Docker Compose.

## 2. Monorepo Architecture
The project uses **NPM Workspaces** to share code between the backend and frontend.
- `apps/backend/`: NestJS application.
- `apps/frontend/`: React application.
- `packages/shared-types/`: Shared DTOs, Enums, and Interfaces to guarantee end-to-end type safety.

## 3. Data Model (Core Entities)

- **User:** Stores login info, role (ADMIN/CLIENT), KYC status, and Stripe customer ID (`stripeCustomerId`).
- **Vehicle:** Contains VIN, make, model, SAAQ status (CLEAN/VGA/SCRAP), condition, and images.
- **Auction:** Represents a sale (start time, end time, starting price, current highest bid). Links to a Vehicle.
- **Bid:** Immutable bid history. Links a User, an Auction, an amount, and a timestamp.
- **Deposit:** Tracks Stripe payments. Statuses: `HOLD` (Authorized), `CAPTURED` (Charged), `RELEASED` (Voided/Refunded).

## 4. Real-Time Architecture & Concurrency

### 4.1 WebSockets (Socket.io)
The server maintains "Rooms" by auction ID.
- When a user opens an auction page, they join the room (`join:auction`).
- New bids trigger a `bid:new` event broadcast to all clients in the room.
- The backend emits an `auction:tick` every second with the exact remaining time (prevents local clock desynchronization).

### 4.2 Concurrency Management (Race Conditions)
To prevent two users from placing a bid at the exact same millisecond and corrupting the current price:
1. Bid requests (POST `/bids`) do not modify the DB directly.
2. They are pushed to a queue (Redis in prod, FIFO Array in dev).
3. A Worker processes the queue sequentially (1 by 1 for the same auction).
4. If the bid is lower than the current price (due to a bid processed milliseconds prior), it is rejected (`OUTBID`).

## 5. Security
- **Stateless Authentication:** Signed JWT tokens, valid for 24h.
- **PCI-DSS Compliance:** The backend never touches raw credit card numbers. The frontend uses secure Stripe Elements.
- **Rate Limiting:** 100 requests/minute per IP globally, strict 10 requests/minute on bidding endpoints to block snipe bots.
