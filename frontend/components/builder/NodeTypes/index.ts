export { default as ApiGatewayNode } from './ApiGatewayNode';
export { default as LoadBalancerNode } from './LoadBalancerNode';
export { default as ServiceNode } from './ServiceNode';
export { default as DatabaseNode } from './DatabaseNode';
export { default as CacheNode } from './CacheNode';
export { default as QueueNode } from './QueueNode';

import ApiGatewayNode from './ApiGatewayNode';
import LoadBalancerNode from './LoadBalancerNode';
import ServiceNode from './ServiceNode';
import DatabaseNode from './DatabaseNode';
import CacheNode from './CacheNode';
import QueueNode from './QueueNode';

export const nodeTypes = {
  API_GATEWAY: ApiGatewayNode,
  LOAD_BALANCER: LoadBalancerNode,
  SERVICE: ServiceNode,
  DATABASE: DatabaseNode,
  CACHE: CacheNode,
  QUEUE: QueueNode,
};
