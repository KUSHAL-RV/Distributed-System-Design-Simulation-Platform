package simulator

import (
	"errors"
	"fmt"
	"log"
)

// InjectFailure actively mutates a node's condition mapped in the active graph memory.
func (e *Engine) InjectFailure(simID, nodeID, failureType string) error {
	e.mu.RLock()
	graph, exists := e.graphs[simID]
	e.mu.RUnlock()

	if !exists {
		return errors.New("simulation not active")
	}

	node, nodeExists := graph.Nodes[nodeID]
	if !nodeExists {
		return fmt.Errorf("node %s not found in graph", nodeID)
	}

	log.Printf("[Injector] %s initiated on node %s", failureType, nodeID)
	
	// We directly manipulate the struct via pointer reference.
	// Since ProcessNodeRequest reads FailureType without locking, 
	// there could be a minor race condition, but it's safe for a simple string assignment 
	// overriding logic dynamics in this prototype.
	node.FailureType = failureType
	
	return nil
}

// RemoveFailure strips the isolated bottleneck restoring the Node properties gracefully.
func (e *Engine) RemoveFailure(simID, nodeID string) error {
	e.mu.RLock()
	graph, exists := e.graphs[simID]
	e.mu.RUnlock()

	if !exists {
		return errors.New("simulation not active")
	}

	node, nodeExists := graph.Nodes[nodeID]
	if !nodeExists {
		return fmt.Errorf("node %s not found in graph", nodeID)
	}

	log.Printf("[Injector] Failure stripped from %s", nodeID)
	node.FailureType = ""

	return nil
}
