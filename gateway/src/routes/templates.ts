import { Router } from 'express';

// Define the same templates on the backend for API access
const templates = [
  {
    id: 'netflix-clone',
    name: 'Netflix Architecture',
    description: 'High-scale video streaming system with CDN caching and event tracking.',
    category: 'Streaming',
    difficulty: 'Advanced',
    nodeCount: 8,
    useCases: ['Video on Demand', 'Content Delivery', 'Event Logging'],
    nodes: [
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-stream', type: 'service', position: { x: 550, y: 50 }, data: { label: 'Video Streaming', nodeType: 'SERVICE', baseLatency: 100, maxConcurrency: 500, errorRate: 0.01, instances: 1 } },
      { id: 'svc-auth', type: 'service', position: { x: 550, y: 200 }, data: { label: 'User Auth', nodeType: 'SERVICE', baseLatency: 50, maxConcurrency: 200, errorRate: 0.01, instances: 1 } },
      { id: 'svc-recs', type: 'service', position: { x: 550, y: 350 }, data: { label: 'Recommendations', nodeType: 'SERVICE', baseLatency: 150, maxConcurrency: 100, errorRate: 0.01, instances: 1 } },
      { id: 'cache-cdn', type: 'cache', position: { x: 800, y: 50 }, data: { label: 'CDN Cache', nodeType: 'CACHE', baseLatency: 2, maxConcurrency: 10000, errorRate: 0.01, instances: 1 } },
      { id: 'db-content', type: 'database', position: { x: 800, y: 200 }, data: { label: 'Content DB', nodeType: 'DATABASE', baseLatency: 20, maxConcurrency: 100, errorRate: 0.01, instances: 1 } },
      { id: 'mq-events', type: 'queue', position: { x: 800, y: 350 }, data: { label: 'View Events MQ', nodeType: 'QUEUE', baseLatency: 5, maxConcurrency: 20000, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-stream', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-auth', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'lb', target: 'svc-recs', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-stream', target: 'cache-cdn', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e6', source: 'svc-auth', target: 'db-content', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e7', source: 'svc-recs', target: 'mq-events', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
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
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-router', type: 'service', position: { x: 550, y: 100 }, data: { label: 'Message Router', nodeType: 'SERVICE', baseLatency: 30, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-presence', type: 'service', position: { x: 550, y: 300 }, data: { label: 'User Presence', nodeType: 'SERVICE', baseLatency: 20, maxConcurrency: 500, errorRate: 0.01, instances: 1 } },
      { id: 'mq-delivery', type: 'queue', position: { x: 800, y: 50 }, data: { label: 'Message Delivery', nodeType: 'QUEUE', baseLatency: 2, maxConcurrency: 50000, errorRate: 0.01, instances: 1 } },
      { id: 'db-chat', type: 'database', position: { x: 800, y: 200 }, data: { label: 'Chat History', nodeType: 'DATABASE', baseLatency: 40, maxConcurrency: 200, errorRate: 0.01, instances: 1 } },
      { id: 'cache-sessions', type: 'cache', position: { x: 800, y: 350 }, data: { label: 'Active Sessions', nodeType: 'CACHE', baseLatency: 1, maxConcurrency: 20000, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-router', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-presence', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'svc-router', target: 'mq-delivery', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-router', target: 'db-chat', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e6', source: 'svc-presence', target: 'cache-sessions', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
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
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-tweet', type: 'service', position: { x: 550, y: 50 }, data: { label: 'Tweet Service', nodeType: 'SERVICE', baseLatency: 40, maxConcurrency: 500, errorRate: 0.01, instances: 1 } },
      { id: 'svc-timeline', type: 'service', position: { x: 550, y: 200 }, data: { label: 'Timeline Service', nodeType: 'SERVICE', baseLatency: 80, maxConcurrency: 300, errorRate: 0.01, instances: 1 } },
      { id: 'svc-search', type: 'service', position: { x: 550, y: 350 }, data: { label: 'Search Service', nodeType: 'SERVICE', baseLatency: 120, maxConcurrency: 200, errorRate: 0.01, instances: 1 } },
      { id: 'cache-timeline', type: 'cache', position: { x: 800, y: 50 }, data: { label: 'Timeline Cache', nodeType: 'CACHE', baseLatency: 2, maxConcurrency: 15000, errorRate: 0.01, instances: 1 } },
      { id: 'db-tweets', type: 'database', position: { x: 800, y: 200 }, data: { label: 'Tweets DB', nodeType: 'DATABASE', baseLatency: 30, maxConcurrency: 150, errorRate: 0.01, instances: 1 } },
      { id: 'mq-notify', type: 'queue', position: { x: 800, y: 350 }, data: { label: 'Notifications MQ', nodeType: 'QUEUE', baseLatency: 5, maxConcurrency: 30000, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-tweet', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-timeline', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'lb', target: 'svc-search', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-timeline', target: 'cache-timeline', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e6', source: 'svc-tweet', target: 'db-tweets', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e7', source: 'svc-tweet', target: 'mq-notify', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
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
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-matching', type: 'service', position: { x: 550, y: 100 }, data: { label: 'Ride Matching', nodeType: 'SERVICE', baseLatency: 150, maxConcurrency: 100, errorRate: 0.01, instances: 1 } },
      { id: 'svc-location', type: 'service', position: { x: 550, y: 300 }, data: { label: 'Driver Location', nodeType: 'SERVICE', baseLatency: 30, maxConcurrency: 2000, errorRate: 0.01, instances: 1 } },
      { id: 'cache-locations', type: 'cache', position: { x: 800, y: 100 }, data: { label: 'Location Cache', nodeType: 'CACHE', baseLatency: 1, maxConcurrency: 50000, errorRate: 0.01, instances: 1 } },
      { id: 'db-trips', type: 'database', position: { x: 800, y: 250 }, data: { label: 'Trips DB', nodeType: 'DATABASE', baseLatency: 50, maxConcurrency: 100, errorRate: 0.01, instances: 1 } },
      { id: 'mq-events', type: 'queue', position: { x: 800, y: 400 }, data: { label: 'Trip Events MQ', nodeType: 'QUEUE', baseLatency: 5, maxConcurrency: 10000, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-matching', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-location', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'svc-location', target: 'cache-locations', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-matching', target: 'db-trips', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e6', source: 'svc-matching', target: 'mq-events', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
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
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-product', type: 'service', position: { x: 550, y: 50 }, data: { label: 'Product Service', nodeType: 'SERVICE', baseLatency: 40, maxConcurrency: 500, errorRate: 0.01, instances: 1 } },
      { id: 'svc-cart', type: 'service', position: { x: 550, y: 200 }, data: { label: 'Cart Service', nodeType: 'SERVICE', baseLatency: 30, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-order', type: 'service', position: { x: 550, y: 350 }, data: { label: 'Order Service', nodeType: 'SERVICE', baseLatency: 100, maxConcurrency: 200, errorRate: 0.01, instances: 1 } },
      { id: 'cache-catalog', type: 'cache', position: { x: 800, y: 50 }, data: { label: 'Product Catalog', nodeType: 'CACHE', baseLatency: 2, maxConcurrency: 10000, errorRate: 0.01, instances: 1 } },
      { id: 'db-orders', type: 'database', position: { x: 800, y: 200 }, data: { label: 'Orders DB', nodeType: 'DATABASE', baseLatency: 40, maxConcurrency: 150, errorRate: 0.01, instances: 1 } },
      { id: 'mq-orders', type: 'queue', position: { x: 800, y: 350 }, data: { label: 'Order Events MQ', nodeType: 'QUEUE', baseLatency: 5, maxConcurrency: 15000, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-product', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-cart', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'lb', target: 'svc-order', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-product', target: 'cache-catalog', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e6', source: 'svc-order', target: 'db-orders', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e7', source: 'svc-order', target: 'mq-orders', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
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
      { id: 'api-gw', type: 'apiGateway', position: { x: 100, y: 200 }, data: { label: 'API Gateway', nodeType: 'API_GATEWAY', baseLatency: 10, maxConcurrency: 1000, errorRate: 0.01, instances: 1 } },
      { id: 'lb', type: 'loadBalancer', position: { x: 300, y: 200 }, data: { label: 'Load Balancer', nodeType: 'LOAD_BALANCER', baseLatency: 5, maxConcurrency: 5000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-redirect', type: 'service', position: { x: 550, y: 100 }, data: { label: 'Redirect Service', nodeType: 'SERVICE', baseLatency: 20, maxConcurrency: 2000, errorRate: 0.01, instances: 1 } },
      { id: 'svc-analytics', type: 'service', position: { x: 550, y: 300 }, data: { label: 'Analytics Service', nodeType: 'SERVICE', baseLatency: 100, maxConcurrency: 500, errorRate: 0.01, instances: 1 } },
      { id: 'cache-hot', type: 'cache', position: { x: 800, y: 100 }, data: { label: 'Hot URLs Cache', nodeType: 'CACHE', baseLatency: 1, maxConcurrency: 50000, errorRate: 0.01, instances: 1 } },
      { id: 'db-urls', type: 'database', position: { x: 800, y: 300 }, data: { label: 'URL Mappings DB', nodeType: 'DATABASE', baseLatency: 30, maxConcurrency: 300, errorRate: 0.01, instances: 1 } },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'lb', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2', source: 'lb', target: 'svc-redirect', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e3', source: 'lb', target: 'svc-analytics', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e4', source: 'svc-redirect', target: 'cache-hot', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e5', source: 'svc-redirect', target: 'db-urls', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
    ],
  },
];

const router = Router();

// GET /api/templates
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: templates.map(({ nodes, edges, ...rest }) => rest),
  });
});

// GET /api/templates/:id
router.get('/:id', (req, res) => {
  const template = templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found',
    });
  }
  res.json({
    success: true,
    data: template,
  });
});

export default router;
