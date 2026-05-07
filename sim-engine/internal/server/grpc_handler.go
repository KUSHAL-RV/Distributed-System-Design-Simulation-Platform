package server

import (
	"context"

	pb "livesysdesign/sim-engine/api/proto"
	"livesysdesign/sim-engine/internal/simulator"
)

type SimulationServer struct {
	pb.UnimplementedSimulationServiceServer
	engine *simulator.Engine
}

func NewSimulationServer(engine *simulator.Engine) *SimulationServer {
	return &SimulationServer{
		engine: engine,
	}
}

func (s *SimulationServer) StartSimulation(ctx context.Context, req *pb.StartRequest) (*pb.StartResponse, error) {
	err := s.engine.StartSimulation(req.SimulationId, []byte(req.GraphJson), 10) // default 10 RPS for now
	if err != nil {
		return &pb.StartResponse{
			Success: false,
			Message: "Failed to parse simulation graph: " + err.Error(),
		}, nil
	}

	return &pb.StartResponse{
		Success: true,
		Message: "Simulation started successfully",
	}, nil
}

func (s *SimulationServer) StopSimulation(ctx context.Context, req *pb.StopRequest) (*pb.StopResponse, error) {
	s.engine.StopSimulation(req.SimulationId)
	return &pb.StopResponse{
		Success: true,
		Message: "Simulation stopped",
	}, nil
}

func (s *SimulationServer) InjectFailure(ctx context.Context, req *pb.InjectFailureRequest) (*pb.InjectFailureResponse, error) {
	err := s.engine.InjectFailure(req.SimulationId, req.NodeId, req.FailureType)
	if err != nil {
		return &pb.InjectFailureResponse{
			Success: false,
			Message: "Failed to inject failure: " + err.Error(),
		}, nil
	}
	return &pb.InjectFailureResponse{
		Success: true,
		Message: "Failure injected successfully",
	}, nil
}

func (s *SimulationServer) RemoveFailure(ctx context.Context, req *pb.RemoveFailureRequest) (*pb.RemoveFailureResponse, error) {
	err := s.engine.RemoveFailure(req.SimulationId, req.NodeId)
	if err != nil {
		return &pb.RemoveFailureResponse{
			Success: false,
			Message: "Failed to remove failure: " + err.Error(),
		}, nil
	}
	return &pb.RemoveFailureResponse{
		Success: true,
		Message: "Failure removed successfully",
	}, nil
}
