# Developer Onboarding Guide

Welcome to the AutoBroker QC project! This document will guide you through installing, running, and understanding the project.

## 1. System Requirements
- **Node.js**: v20 or higher (v22 recommended).
- **NPM**: v10 or higher.
- **Git**: Installed and configured.
- *(Optional for prod)* **Docker & Docker Compose**.

## 2. Quick Setup

1. **Clone and install dependencies (Monorepo)**
   From the project root, install all dependencies at once using NPM Workspaces:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy the example file to create your local config:
   ```bash
   cp .env.example .env
   ```
   *Note: The root `.env` file is read by the Backend. Stripe test keys are already provided inside to facilitate development.*

3. **Start the project**
   On Windows, use the provided batch script at the root:
   ```cmd
   start.bat
   ```
   *This script will start the backend on port 3001 and the frontend on port 5173.*
   To stop all processes, run: `stop.bat`

## 3. Code Structure

- **Frontend (`apps/frontend/`)**
  - `src/pages/`: Main views mapped to React Router routes.
  - `src/components/`: Reusable components (UI elements, vehicle cards, bidding logic).
  - `src/store/`: Zustand stores for global state (e.g., logged-in user).
  - `src/lib/`: Utilities (Axios Client, WebSocket Client).

- **Backend (`apps/backend/`)**
  - Modular NestJS architecture. Each domain has its own folder (e.g., `src/auctions/`, `src/bids/`).
  - `src/database/`: In local development, the DB is emulated in-memory using JavaScript `Map` objects. An **auto-seed** creates dummy vehicles and auctions on every restart.

- **Shared Types (`packages/shared-types/`)**
  - If you modify an interface (e.g., adding a field to `Vehicle`), do it here.
  - Build the package (`npm run build` in this folder) so that both frontend and backend inherit the changes.

## 4. Standards and Best Practices

- **Strict Typing:** Avoid using `any`. Always use interfaces imported from `@autobroker/shared-types`.
- **Language Rules:** 
  - **Code (Variables, Functions, Commits):** Must be in English.
  - **Client Interface (JSX, Error messages):** Must be in Quebec French (legal requirement).
- **Git Flow:** 
  - Create branches like `feature/feature-name` or `fix/bug-name`.
  - No direct pushes to `main`.

## 5. Local Test Accounts
The in-memory database automatically creates these accounts on startup:
- **Admin:** `admin@autobrokerqc.ca` / `Admin123!`
- **Client (Can bid):** `client@example.com` / `Client123!`
