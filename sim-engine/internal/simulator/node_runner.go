package simulator

import (
	"math/rand"
	"sync/atomic"
	"time"

	"livesysdesign/sim-engine/internal/pubsub"
)

type NodeConfig struct {
	ID             string  `json:"id"`
	NodeType       string  `json:"nodeType"`
	Label          string  `json:"label"`
	BaseLatency    int     `json:"baseLatency"`
	MaxConcurrency int     `json:"maxConcurrency"`
	JitterMs       int     `json:"jitterMs"`
	ErrorRate      float64 `json:"errorRate"`

	// Horizontal Scaling & LB
	Instances      int     `json:"instances"`
	Algorithm      string  `json:"algorithm"`
	ActiveConns    int32   `json:"-"`
	rrIndex        uint32  `json:"-"`

	// Graph routing
	Targets []string `json:"targets"`

	// Dynamic Failure State
	FailureType string // "KILL", "SLOW", "DROP", "PARTITION", ""
}

func ProcessNodeRequest(config *NodeConfig, simID string, pub *pubsub.Publisher) pubsub.MetricPayload {
	startTime := time.Now()

	// Handle PARTITION: Node is completely isolated and unreachable
	if config.FailureType == "PARTITION" {
		metric := pubsub.MetricPayload{
			SimulationID: simID,
			NodeID:       config.ID,
			Timestamp:    time.Now().UnixMilli(),
			Latency:      0,
			Success:      false,
			StatusCode:   503, // Service Unavailable
		}
		go pub.PublishMetric(metric)
		return metric
	}

	// Concurrency Overflow Check (HTTP 429)
	limit := int32(config.MaxConcurrency)
	if config.Instances > 0 {
		limit *= int32(config.Instances)
	} else if limit == 0 {
		limit = 100 // Safe default
	}

	currentConns := atomic.AddInt32(&config.ActiveConns, 1)
	defer atomic.AddInt32(&config.ActiveConns, -1)

	if currentConns > limit {
		// Overflow threshold met
		metric := pubsub.MetricPayload{
			SimulationID: simID,
			NodeID:       config.ID,
			Timestamp:    time.Now().UnixMilli(),
			Latency:      0,
			Success:      false,
			StatusCode:   429, // Too Many Requests
		}
		go pub.PublishMetric(metric)
		return metric
	}

	// 1. Calculate Jitter and Base Latency
	latency := config.BaseLatency
	if config.JitterMs > 0 {
		jitter := rand.Intn(config.JitterMs)
		if rand.Float32() > 0.5 {
			latency += jitter
		} else {
			latency -= jitter
			if latency < 1 {
				latency = 1
			}
		}
	}

	// Dynamic Failure: SLOW
	if config.FailureType == "SLOW" {
		latency *= 5 // 5x latency multiplying penalty
	}

	// 2. Simulate delay
	time.Sleep(time.Duration(latency) * time.Millisecond)

	// 3. Calculate Error Rate Failure
	success := true
	statusCode := 200

	// Handle KILL
	if config.FailureType == "KILL" {
		success = false
		statusCode = 502 // Bad Gateway / Dead
	} else if config.FailureType == "DROP" { // Handle Drop Packets (e.g. 50% arbitrary drop rate)
		if rand.Float32() < 0.5 {
			success = false
			statusCode = 504 // Gateway Timeout
		}
	} else if config.ErrorRate > 0 && rand.Float64() < config.ErrorRate {
		success = false
		statusCode = 500 // Generic failure
	}

	actualLatency := int(time.Since(startTime).Milliseconds())

	metric := pubsub.MetricPayload{
		SimulationID: simID,
		NodeID:       config.ID,
		Timestamp:    time.Now().UnixMilli(),
		Latency:      actualLatency,
		Success:      success,
		StatusCode:   statusCode,
	}

	// 4. Publish metrics asynchronously
	go pub.PublishMetric(metric)

	return metric
}
