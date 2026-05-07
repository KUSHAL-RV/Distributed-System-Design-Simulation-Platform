import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../lib/api';
import { useSimulationStore, MetricPayload } from '../store/simulationStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://127.0.0.1:4000';

export function useSimulation(designId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { startSimulation, stopSimulation } = useSimulationStore();

  useEffect(() => {
    if (!designId) return;

    let simulationId: string | null = null;

    const initSimulation = async () => {
      try {
        // 1. Start the simulation on the backend to get a Run ID
        const { data } = await api.post(`/api/designs/${designId}/simulate`);
        if (data.success) {
          simulationId = data.data.simulationId;
          
          // 2. Connect to websocket
          socketRef.current = io(WS_URL, {
            withCredentials: true,
            transports: ['websocket'],
          });

          const socket = socketRef.current;

          socket.on('connect', () => {
            console.log(`[WebSocket] Joined simulation: ${simulationId}`);
            socket.emit('join_simulation', { simId: simulationId });
            if (simulationId) startSimulation(simulationId);
            setIsReady(true);
          });

          const metricsBuffer: MetricPayload[] = [];
          
          socket.on('metric', (data: MetricPayload) => {
            metricsBuffer.push(data);
          });

          // Flush buffer every 500ms to avoid UI lag
          const flushInterval = setInterval(() => {
            if (metricsBuffer.length > 0) {
              const batch = [...metricsBuffer];
              metricsBuffer.length = 0;
              useSimulationStore.getState().recordMetricBatch(batch);
            }
          }, 500);

          socket.on('disconnect', () => {
            console.log(`[WebSocket] Disconnected`);
            clearInterval(flushInterval);
            stopSimulation();
            setIsReady(false);
          });
        }
      } catch (err) {
        console.error('[useSimulation] Failed to start simulation:', err);
      }
    };

    initSimulation();

    return () => {
      if (socketRef.current) {
        if (simulationId) socketRef.current.emit('leave_simulation', { simId: simulationId });
        socketRef.current.disconnect();
      }
    };
  }, [designId, startSimulation, stopSimulation]);

  return {
    isActive: isReady && !!socketRef.current?.connected,
  };
}
