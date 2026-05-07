# 🚪 LiveSysDesign Gateway

The central API and real-time orchestrator for the LiveSysDesign platform.

## 🚀 Responsibilities

- **REST API**: Handles design CRUD, template serving, and simulation lifecycle management.
- **WebSocket Server**: Streams real-time metrics from Redis Pub/Sub to connected frontend clients.
- **gRPC Client**: Communicates with the Go-based Simulation Engine.
- **Authentication**: JWT-based secure access for users.
- **ORM**: Database management via Prisma.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (TimescaleDB)
- **Caching/PubSub**: Redis
- **Communication**: gRPC (Client), Socket.io (Server)
- **Security**: JWT, bcrypt

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## 📁 Key Directories

- `/src/routes`: API endpoint definitions.
- `/src/lib`: Shared clients (Prisma, Redis, gRPC).
- `/src/middleware`: Auth and rate-limiting logic.
- `/proto`: Protobuf definitions for service communication.
