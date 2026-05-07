# 🚀 LiveSysDesign

**LiveSysDesign** is a high-performance, real-time distributed systems simulator. It allows engineers and architects to visually design complex architectures, simulate traffic patterns, and observe system behavior under various conditions, including simulated infrastructure failures.

![LiveSysDesign Dashboard](https://raw.githubusercontent.com/KUSHAL-RV/livesysdesign/main/docs/banner.png)

## 🌟 Key Features

- **Visual Architecture Builder**: Drag-and-drop canvas powered by React Flow to design multi-tier systems.
- **Real-time Telemetry**: Live throughput, latency (P50/P99), and error rate visualization via Redis Pub/Sub and WebSockets.
- **Chaos Engineering Module**: Inject failures (Node Kill, Network Partition, Latency Spikes, Packet Drop) in real-time.
- **Templates Gallery**: Pre-built industry-standard architectures (Netflix, WhatsApp, E-commerce) to jumpstart designs.
- **AI-Powered Insights**: Automated analysis of simulation bottlenecks and failure points.
- **TimeScaleDB Integration**: High-fidelity storage for simulation history and analytical playback.

## 🏗️ Technical Architecture

LiveSysDesign is built as a microservices ecosystem:

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand, React Flow v11.
- **API Gateway**: Node.js & Express. acts as the central orchestrator and WebSocket relay.
- **Simulation Engine**: Go-based high-concurrency engine for traffic generation and node behavior logic.
- **AI Engine**: Python FastAPI service for log analysis and architectural insights.
- **Data Layer**: 
  - **PostgreSQL/TimescaleDB**: Relational data and time-series metrics.
  - **Redis**: Real-time pub/sub and high-speed caching.
  - **Kafka**: Event streaming for asynchronous metric processing.

## 🛠️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Go 1.22+
- Python 3.10+

### Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/livesysdesign.git
   cd livesysdesign
   ```

2. **Run the local startup script**:
   The project includes a convenient batch script to spin up the entire stack:
   ```powershell
   .\start-local.bat
   ```
   This script will:
   - Start core infrastructure (Postgres, Redis, Kafka) via Docker.
   - Initialize the Node.js Gateway.
   - Start the Go Simulation Engine.
   - Launch the Next.js Frontend.
   - Activate the Python AI Engine.

3. **Access the platform**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Gateway API**: [http://localhost:4000](http://localhost:4000)
   - **AI Insights**: [http://localhost:6000](http://localhost:6000)

## 🧪 Simulation Capabilities

- **Traffic Shaping**: Define Target RPS (Requests Per Second) per simulation.
- **Node Configuration**:
  - Base Latency & Jitter
  - Horizontal Scaling (Instances)
  - Load Balancing Algorithms (Round Robin, Random, Least Connections)
  - Concurrency Limits (Max Connections)
- **Failure Injection**:
  - **KILL**: Hard node failure (502 Bad Gateway).
  - **SLOW**: High latency simulation (5x delay).
  - **DROP**: Network packet loss simulation.
  - **PARTITION**: Absolute node isolation.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for the Distributed Systems community.
