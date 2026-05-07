package pubsub

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
	"github.com/redis/go-redis/v9"
)

type Publisher struct {
	redisClient *redis.Client
	kafkaWriter *kafka.Writer
}

// MetricPayload defines the event sent to Gateway/Frontend (Redis) and ML AI (Kafka)
type MetricPayload struct {
	SimulationID string `json:"simulationId"`
	NodeID       string `json:"nodeId"`
	Timestamp    int64  `json:"timestamp"`
	Latency      int    `json:"latency"`
	Success      bool   `json:"success"`
	StatusCode   int    `json:"statusCode"`
}

var ctx = context.Background()

func NewPublisher(redisUrl, kafkaBrokers string) (*Publisher, error) {
	// Initialize Redis
	var rdb *redis.Client
	if opts, err := redis.ParseURL(redisUrl); err == nil {
		rdb = redis.NewClient(opts)
	} else {
		// Fallback to direct address if it's not a URL
		rdb = redis.NewClient(&redis.Options{
			Addr: redisUrl,
		})
	}

	err := rdb.Ping(ctx).Err()
	if err != nil {
		log.Printf("[Warning] Redis unavailable: %v. Continuing without Redis...", err)
		rdb = nil
	} else {
		log.Println("[Publisher] Connected to Redis")
	}

	// Initialize Kafka (optional failure)
	var writer *kafka.Writer
	
	// Test dial to see if kafka is running
	conn, err := kafka.Dial("tcp", kafkaBrokers)
	if err != nil {
	    log.Printf("[Warning] Kafka Dial failed: %v. Continuing without Kafka...", err)
	} else {
	    conn.Close()
	    writer = &kafka.Writer{
		    Addr:     kafka.TCP(kafkaBrokers),
		    Topic:    "simulation_metrics",
		    Balancer: &kafka.LeastBytes{},
	    }
	    log.Println("[Publisher] Connected to Kafka")
	}

	return &Publisher{
		redisClient: rdb,
		kafkaWriter: writer,
	}, nil
}

func (p *Publisher) PublishMetric(metric MetricPayload) {
	data, _ := json.Marshal(metric)

	// Fast path: Redis Pub/Sub for frontend Gateway
	if p.redisClient != nil {
		channel := fmt.Sprintf("sim:%s:metrics", metric.SimulationID)
		log.Printf("[Publisher] Publishing to Redis: %s", channel)
		p.redisClient.Publish(ctx, channel, data)
	}

	// Durable path: Kafka for the Python AI Engine
	if p.kafkaWriter != nil {
		p.kafkaWriter.WriteMessages(ctx,
			kafka.Message{
				Value: data,
			},
		)
	}
}

func (p *Publisher) Close() {
	if p.redisClient != nil {
		p.redisClient.Close()
	}
	if p.kafkaWriter != nil {
		p.kafkaWriter.Close()
	}
}
