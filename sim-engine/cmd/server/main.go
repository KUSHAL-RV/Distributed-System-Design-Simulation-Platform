package main

import (
	"log"
	"net"
	"os"

	"google.golang.org/grpc"
	"github.com/joho/godotenv"

	pb "livesysdesign/sim-engine/api/proto"
	"livesysdesign/sim-engine/internal/pubsub"
	"livesysdesign/sim-engine/internal/server"
	"livesysdesign/sim-engine/internal/simulator"
)

func main() {
	godotenv.Load()
	port := os.Getenv("SIM_ENGINE_PORT")
	if port == "" {
		port = "5000"
	}

	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		redisUrl = "127.0.0.1:6379"
	}

	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "127.0.0.1:9092"
	}

	// 1. Initialize Publisher
	pub, err := pubsub.NewPublisher(redisUrl, kafkaBrokers)
	if err != nil {
		log.Fatalf("Failed to initialize publisher: %v", err)
	}
	defer pub.Close()

	// 2. Initialize Engine
	engine := simulator.NewEngine(pub)

	// 3. Initialize gRPC Server Handler
	simServer := server.NewSimulationServer(engine)

	// 4. Start gRPC Listener
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterSimulationServiceServer(grpcServer, simServer)

	log.Printf("🚀 sim-engine listening on gRPC port %s", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
