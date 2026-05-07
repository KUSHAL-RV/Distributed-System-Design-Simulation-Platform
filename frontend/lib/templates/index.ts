import { Node, Edge } from '@xyflow/react';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nodeCount: number;
  useCases: string[];
  nodes: Node[];
  edges: Edge[];
}

const createNode = (
  id: string,
  type: string,
  label: string,
  x: number,
  y: number,
  nodeType: string,
  overrides: any = {}
): Node => ({
  id,
  type,
  position: { x, y },
  data: {
    label,
    nodeType,
    baseLatency: overrides.baseLatency || 50,
    maxConcurrency: overrides.maxConcurrency || 100,
    errorRate: 0.01,
    instances: 1,
    ...overrides,
  },
});

const createEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  animated: true,
  style: { stroke: '#8b5cf6', strokeWidth: 2 },
});

export const templates: Template[] = [
  {
    id: 'netflix-clone',
    name: 'Netflix Architecture',
    description: 'High-scale video streaming system with CDN caching and event tracking.',
    category: 'Streaming',
    difficulty: 'Advanced',
    nodeCount: 8,
    useCases: ['Video on Demand', 'Content Delivery', 'Event Logging'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-stream', 'service', 'Video Streaming', 550, 50, 'SERVICE', { baseLatency: 100, maxConcurrency: 500 }),
      createNode('svc-auth', 'service', 'User Auth', 550, 200, 'SERVICE', { baseLatency: 50, maxConcurrency: 200 }),
      createNode('svc-recs', 'service', 'Recommendations', 550, 350, 'SERVICE', { baseLatency: 150, maxConcurrency: 100 }),
      createNode('cache-cdn', 'cache', 'CDN Cache', 800, 50, 'CACHE', { baseLatency: 2, maxConcurrency: 10000 }),
      createNode('db-content', 'database', 'Content DB', 800, 200, 'DATABASE', { baseLatency: 20, maxConcurrency: 100 }),
      createNode('mq-events', 'queue', 'View Events MQ', 800, 350, 'QUEUE', { baseLatency: 5, maxConcurrency: 20000 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-stream'),
      createEdge('e3', 'lb', 'svc-auth'),
      createEdge('e4', 'lb', 'svc-recs'),
      createEdge('e5', 'svc-stream', 'cache-cdn'),
      createEdge('e6', 'svc-auth', 'db-content'),
      createEdge('e7', 'svc-recs', 'mq-events'),
    ],
  },
  {
    id: 'whatsapp-clone',
    name: 'WhatsApp Architecture',
    description: 'Real-time messaging system with session management and delivery queues.',
    category: 'Messaging',
    difficulty: 'Intermediate',
    nodeCount: 7,
    useCases: ['Instant Messaging', 'Presence Tracking', 'Chat History'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-router', 'service', 'Message Router', 550, 100, 'SERVICE', { baseLatency: 30, maxConcurrency: 1000 }),
      createNode('svc-presence', 'service', 'User Presence', 550, 300, 'SERVICE', { baseLatency: 20, maxConcurrency: 500 }),
      createNode('mq-delivery', 'queue', 'Message Delivery', 800, 50, 'QUEUE', { baseLatency: 2, maxConcurrency: 50000 }),
      createNode('db-chat', 'database', 'Chat History', 800, 200, 'DATABASE', { baseLatency: 40, maxConcurrency: 200 }),
      createNode('cache-sessions', 'cache', 'Active Sessions', 800, 350, 'CACHE', { baseLatency: 1, maxConcurrency: 20000 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-router'),
      createEdge('e3', 'lb', 'svc-presence'),
      createEdge('e4', 'svc-router', 'mq-delivery'),
      createEdge('e5', 'svc-router', 'db-chat'),
      createEdge('e6', 'svc-presence', 'cache-sessions'),
    ],
  },
  {
    id: 'twitter-clone',
    name: 'Twitter/X Architecture',
    description: 'Social media platform with high-throughput timeline generation.',
    category: 'Social Media',
    difficulty: 'Advanced',
    nodeCount: 8,
    useCases: ['Feed Generation', 'Real-time Notifications', 'Search'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-tweet', 'service', 'Tweet Service', 550, 50, 'SERVICE', { baseLatency: 40, maxConcurrency: 500 }),
      createNode('svc-timeline', 'service', 'Timeline Service', 550, 200, 'SERVICE', { baseLatency: 80, maxConcurrency: 300 }),
      createNode('svc-search', 'service', 'Search Service', 550, 350, 'SERVICE', { baseLatency: 120, maxConcurrency: 200 }),
      createNode('cache-timeline', 'cache', 'Timeline Cache', 800, 50, 'CACHE', { baseLatency: 2, maxConcurrency: 15000 }),
      createNode('db-tweets', 'database', 'Tweets DB', 800, 200, 'DATABASE', { baseLatency: 30, maxConcurrency: 150 }),
      createNode('mq-notify', 'queue', 'Notifications MQ', 800, 350, 'QUEUE', { baseLatency: 5, maxConcurrency: 30000 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-tweet'),
      createEdge('e3', 'lb', 'svc-timeline'),
      createEdge('e4', 'lb', 'svc-search'),
      createEdge('e5', 'svc-timeline', 'cache-timeline'),
      createEdge('e6', 'svc-tweet', 'db-tweets'),
      createEdge('e7', 'svc-tweet', 'mq-notify'),
    ],
  },
  {
    id: 'uber-clone',
    name: 'Uber Architecture',
    description: 'Location-based service with real-time driver matching and pricing.',
    category: 'Ride Sharing',
    difficulty: 'Advanced',
    nodeCount: 7,
    useCases: ['Driver Dispatch', 'Geospatial Search', 'Dynamic Pricing'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-matching', 'service', 'Ride Matching', 550, 100, 'SERVICE', { baseLatency: 150, maxConcurrency: 100 }),
      createNode('svc-location', 'service', 'Driver Location', 550, 300, 'SERVICE', { baseLatency: 30, maxConcurrency: 2000 }),
      createNode('cache-locations', 'cache', 'Location Cache', 800, 100, 'CACHE', { baseLatency: 1, maxConcurrency: 50000 }),
      createNode('db-trips', 'database', 'Trips DB', 800, 250, 'DATABASE', { baseLatency: 50, maxConcurrency: 100 }),
      createNode('mq-events', 'queue', 'Trip Events MQ', 800, 400, 'QUEUE', { baseLatency: 5, maxConcurrency: 10000 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-matching'),
      createEdge('e3', 'lb', 'svc-location'),
      createEdge('e4', 'svc-location', 'cache-locations'),
      createEdge('e5', 'svc-matching', 'db-trips'),
      createEdge('e6', 'svc-matching', 'mq-events'),
    ],
  },
  {
    id: 'ecommerce-platform',
    name: 'E-Commerce Platform',
    description: 'Modular shopping system with order processing and inventory management.',
    category: 'Retail',
    difficulty: 'Intermediate',
    nodeCount: 8,
    useCases: ['Online Shopping', 'Order Orchestration', 'Inventory Sync'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-product', 'service', 'Product Service', 550, 50, 'SERVICE', { baseLatency: 40, maxConcurrency: 500 }),
      createNode('svc-cart', 'service', 'Cart Service', 550, 200, 'SERVICE', { baseLatency: 30, maxConcurrency: 1000 }),
      createNode('svc-order', 'service', 'Order Service', 550, 350, 'SERVICE', { baseLatency: 100, maxConcurrency: 200 }),
      createNode('cache-catalog', 'cache', 'Product Catalog', 800, 50, 'CACHE', { baseLatency: 2, maxConcurrency: 10000 }),
      createNode('db-orders', 'database', 'Orders DB', 800, 200, 'DATABASE', { baseLatency: 40, maxConcurrency: 150 }),
      createNode('mq-orders', 'queue', 'Order Events MQ', 800, 350, 'QUEUE', { baseLatency: 5, maxConcurrency: 15000 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-product'),
      createEdge('e3', 'lb', 'svc-cart'),
      createEdge('e4', 'lb', 'svc-order'),
      createEdge('e5', 'svc-product', 'cache-catalog'),
      createEdge('e6', 'svc-order', 'db-orders'),
      createEdge('e7', 'svc-order', 'mq-orders'),
    ],
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'High-availability redirection service with hot-URL caching.',
    category: 'Utility',
    difficulty: 'Beginner',
    nodeCount: 6,
    useCases: ['Link Management', 'Traffic Analytics', 'Fast Redirects'],
    nodes: [
      createNode('api-gw', 'apiGateway', 'API Gateway', 100, 200, 'API_GATEWAY', { baseLatency: 10, maxConcurrency: 1000 }),
      createNode('lb', 'loadBalancer', 'Load Balancer', 300, 200, 'LOAD_BALANCER', { baseLatency: 5, maxConcurrency: 5000 }),
      createNode('svc-redirect', 'service', 'Redirect Service', 550, 100, 'SERVICE', { baseLatency: 20, maxConcurrency: 2000 }),
      createNode('svc-analytics', 'service', 'Analytics Service', 550, 300, 'SERVICE', { baseLatency: 100, maxConcurrency: 500 }),
      createNode('cache-hot', 'cache', 'Hot URLs Cache', 800, 100, 'CACHE', { baseLatency: 1, maxConcurrency: 50000 }),
      createNode('db-urls', 'database', 'URL Mappings DB', 800, 300, 'DATABASE', { baseLatency: 30, maxConcurrency: 300 }),
    ],
    edges: [
      createEdge('e1', 'api-gw', 'lb'),
      createEdge('e2', 'lb', 'svc-redirect'),
      createEdge('e3', 'lb', 'svc-analytics'),
      createEdge('e4', 'svc-redirect', 'cache-hot'),
      createEdge('e5', 'svc-redirect', 'db-urls'),
    ],
  },
];
