# ⚙️ LiveSysDesign Simulation Engine

High-performance, concurrent simulation core written in Go.

## 🚀 Responsibilities

- **Traffic Simulation**: Generates requests across the system graph based on target RPS.
- **Node Logic**: Simulates latency, jitter, concurrency limits, and failure modes for each node type.
- **Metric Emission**: Publishes high-frequency telemetry data to Redis and Kafka.
- **Chaos Injection**: Responds to real-time failure injection requests via gRPC.

## 🛠️ Tech Stack

- **Language**: Go 1.22+
- **Communication**: gRPC (Server), Redis (Pub/Sub), Kafka (Producer)
- **Concurrency**: Goroutines and channels for massive traffic simulation.

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   go mod download
   ```

2. **Run the engine**:
   ```bash
   go run cmd/server/main.go
   ```

## 🧪 Simulation Logic

The engine uses a graph-based traversal algorithm to simulate request flow through the system. Each node in the graph is a virtual "worker" that calculates its own processing time and success/failure status based on its configuration (Base Latency, Instances, Error Rate).

### Failure Modes Supported
- **KILL**: Immediate 502 error return.
- **SLOW**: Latency multiplier applied to simulation.
- **DROP**: Probabilistic packet loss.
- **PARTITION**: Total network isolation for the node.
