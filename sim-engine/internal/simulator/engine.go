package simulator

import (
	"context"
	"encoding/json"
	"log"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"

	"livesysdesign/sim-engine/internal/pubsub"
)

type GraphData struct {
	Nodes map[string]*NodeConfig `json:"nodes"`
	Entry string                 `json:"entry"` // ID of the API Gateway
	Edges []Edge                 `json:"edges"`
}

type Edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type Engine struct {
	pub    *pubsub.Publisher
	mu     sync.RWMutex
	active map[string]context.CancelFunc // Map of SimulationID to cancel func
	graphs map[string]*GraphData
}

func NewEngine(pub *pubsub.Publisher) *Engine {
	return &Engine{
		pub:    pub,
		active: make(map[string]context.CancelFunc),
		graphs: make(map[string]*GraphData),
	}
}

func (e *Engine) StartSimulation(simID string, graphJSON []byte, targetRPS int) error {
	var data struct {
		Nodes []struct {
			ID   string                 `json:"id"`
			Type string                 `json:"type"`
			Data map[string]interface{} `json:"data"`
		} `json:"nodes"`
		Edges []struct {
			Source string `json:"source"`
			Target string `json:"target"`
		} `json:"edges"`
	}

	if err := json.Unmarshal(graphJSON, &data); err != nil {
		return err
	}

	// Build Graph Dict
	graph := &GraphData{
		Nodes: make(map[string]*NodeConfig),
	}

	for _, n := range data.Nodes {
		config := &NodeConfig{
			ID:             n.ID,
			NodeType:       n.Type,
			Label:          getString(n.Data, "label", n.Type),
			BaseLatency:    getInt(n.Data, "baseLatency", 50),
			MaxConcurrency: getInt(n.Data, "maxConcurrency", 1000),
			JitterMs:       getInt(n.Data, "jitterMs", 10),
			ErrorRate:      getFloat(n.Data, "errorRate", 0.0),
			Instances:      getInt(n.Data, "instances", 1),
			Algorithm:      getString(n.Data, "algorithm", "ROUND_ROBIN"),
		}

		if config.NodeType == "apiGateway" || graph.Entry == "" {
			graph.Entry = config.ID
		}
		graph.Nodes[config.ID] = config
	}

	// Link edges
	for _, edge := range data.Edges {
		if node, ok := graph.Nodes[edge.Source]; ok {
			node.Targets = append(node.Targets, edge.Target)
		}
	}

	ctx, cancel := context.WithCancel(context.Background())

	e.mu.Lock()
	e.active[simID] = cancel
	e.graphs[simID] = graph
	e.mu.Unlock()

	log.Printf("[Engine] Started simulation %s with %d RPS", simID, targetRPS)

	go e.runLoop(ctx, simID, graph, targetRPS)

	return nil
}

func (e *Engine) StopSimulation(simID string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if cancel, exists := e.active[simID]; exists {
		cancel()
		delete(e.active, simID)
		delete(e.graphs, simID)
		log.Printf("[Engine] Stopped simulation %s", simID)
	}
}

func (e *Engine) runLoop(ctx context.Context, simID string, graph *GraphData, targetRPS int) {
	if graph.Entry == "" {
		log.Printf("[Engine] No API Gateway found for simulation %s. Aborting.", simID)
		return
	}

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Spawn targetRPS requests per second
			for i := 0; i < targetRPS; i++ {
				go e.simulateFlow(simID, graph, graph.Entry)
			}
		}
	}
}

func (e *Engine) simulateFlow(simID string, graph *GraphData, currentNodeID string) {
	node, exists := graph.Nodes[currentNodeID]
	if !exists {
		return
	}

	// 1. Process local node block calculation
	metric := ProcessNodeRequest(node, simID, e.pub)

	// 2. If node fails, drop cascade
	if !metric.Success {
		return
	}

	// 3. Propagation
	if len(node.Targets) == 0 {
		return
	}

	// ─── LOAD BALANCER ROUTING ────────────────────────
	if node.NodeType == "loadBalancer" {
		var selectedTarget string

		switch node.Algorithm {
		case "RANDOM":
			selectedTarget = node.Targets[rand.Intn(len(node.Targets))]

		case "LEAST_CONNECTIONS":
			// Find downstream node with minimum active connections
			minConns := int32(2147483647)
			for _, t := range node.Targets {
				if tNode, ok := graph.Nodes[t]; ok {
					conns := atomic.LoadInt32(&tNode.ActiveConns)
					if conns < minConns {
						minConns = conns
						selectedTarget = t
					}
				}
			}
			if selectedTarget == "" {
				selectedTarget = node.Targets[0]
			}

		case "ROUND_ROBIN":
			fallthrough
		default:
			idx := atomic.AddUint32(&node.rrIndex, 1) % uint32(len(node.Targets))
			selectedTarget = node.Targets[idx]
		}

		// Forward exclusively to the selected target synchronously (or via routine)
		e.simulateFlow(simID, graph, selectedTarget)
		return
	}

	// ─── STANDARD BROADCAST (Fan-Out) ─────────────────
	var wg sync.WaitGroup
	for _, target := range node.Targets {
		wg.Add(1)
		go func(tNode string) {
			defer wg.Done()
			e.simulateFlow(simID, graph, tNode)
		}(target)
	}
	wg.Wait()
}

// --- Helpers ---
func getString(m map[string]interface{}, key, def string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return def
}

func getInt(m map[string]interface{}, key string, def int) int {
	if v, ok := m[key].(float64); ok { // JSON numbers are float64
		return int(v)
	}
	return def
}

func getFloat(m map[string]interface{}, key string, def float64) float64 {
	if v, ok := m[key].(float64); ok {
		return v
	}
	return def
}
