import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/simulation.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const simProto = protoDescriptor.simulation;

const SIM_ENGINE_URL = process.env.SIM_ENGINE_URL || '127.0.0.1:5000';

export const simulationService = new simProto.SimulationService(
  SIM_ENGINE_URL,
  grpc.credentials.createInsecure()
);

export const grpcClient = {
  startSimulation: (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      simulationService.StartSimulation(payload, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
  stopSimulation: (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      simulationService.StopSimulation(payload, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
  injectFailure: (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      simulationService.InjectFailure(payload, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
  removeFailure: (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      simulationService.RemoveFailure(payload, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
};
