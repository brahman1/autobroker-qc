# Functional Specifications - AutoBroker QC

## 1. Project Overview
AutoBroker QC is a proxy bidding platform allowing Quebec buyers to participate in closed automotive auctions (dealer-only auctions, like Copart). The platform acts as a legal and financial intermediary.

## 2. Roles and Permissions

### 2.1 Anonymous Visitor
- Browse the vehicle inventory.
- View vehicle details (without bid history).
- Register for an account.

### 2.2 Client (KYC Pending)
- Status `PENDING`.
- Access the dashboard.
- **Restriction:** Cannot make a security deposit or place bids until their identity is verified by an admin.

### 2.3 Client (KYC Verified)
- Status `VERIFIED`.
- Make a security deposit via credit card (Stripe).
- Participate in real-time live auctions.
- Track the status of their bids.

### 2.4 Administrator
- Manage users and approve KYC (Know Your Customer) applications.
- Add/Update vehicles.
- Create and manage auctions.
- Monitor transactions.

## 3. Core Business Workflows

### 3.1 Security Deposit (Hold)
To bid, a client must have an active security deposit (e.g., $600 CAD).
- **Authorization Hold:** The amount is not charged, but authorized/held on the card via Stripe (`PaymentIntent` with `capture_method: 'manual'`).
- **Validity:** Allows the client to bid on one or multiple auctions as long as they haven't won any.

### 3.2 Bidding Process (Proxy Bidding)
- **Real-Time:** Bids are updated instantly for all connected users.
- **Queue (FIFO):** Simultaneous bids are processed in the order they arrive to prevent race conditions.
- **Auction End:** A countdown timer indicates the end. As soon as time runs out, the system determines the winner.

### 3.3 Post-Auction (Settlement)
- **Winner:** If the client wins the auction, the $600 deposit is **captured** (charged) to cover brokerage fees and secure the vehicle.
- **Loser:** If the client loses the auction and has no other active bids, the deposit is **released** (Release), returning the funds to their card limit.

## 4. Business Rules & Compliance (Quebec)
- **SAAQ (Société de l'assurance automobile du Québec):** Vehicles must clearly display their title status:
  - `CLEAN` (Immatriculable/Registerable): Green.
  - `VGA` (Véhicule Gravement Accidenté / Salvage): Yellow, requires inspection.
  - `SCRAP` (Parts only): Red, non-registerable.
- **Bill 96 (Loi 96):** All client-facing UI, error messages, and communications must be exclusively in French.
- **OPC (Office de la protection du consommateur):** Dealer license numbers and legal notices must be displayed in the footer.
