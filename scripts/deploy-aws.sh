#!/bin/bash
set -e

CLUSTER_NAME="livesys-cluster"
REGION="us-east-1"
NODE_TYPE="t3.medium"
NODES=3

echo "🚀 Deploying LiveSysDesign to AWS EKS ($REGION)..."

# 1. Create EKS Cluster (using eksctl)
if ! eksctl get cluster --name $CLUSTER_NAME --region $REGION > /dev/null 2>&1; then
    echo "⚙️ Creating EKS Cluster '$CLUSTER_NAME'..."
    eksctl create cluster \
      --name $CLUSTER_NAME \
      --region $REGION \
      --nodegroup-name standard-workers \
      --node-type $NODE_TYPE \
      --nodes $NODES \
      --nodes-min 2 \
      --nodes-max 5 \
      --managed
else
    echo "✅ EKS Cluster '$CLUSTER_NAME' already exists."
fi

# 2. Update kubeconfig
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# 3. Apply Kubernetes Manifests
echo "📦 Applying Infrastructure (Postgres, Redis, Kafka, Zookeeper)..."
kubectl apply -f ../k8s/infrastructure.yaml

echo "⏳ Waiting for infrastructure to initialize..."
kubectl wait --for=condition=ready pod -l app=livesys-postgres --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=livesys-redis --timeout=120s || true

echo "🚀 Applying Microservices..."
kubectl apply -f ../k8s/sim-engine.yaml
kubectl apply -f ../k8s/ai-engine.yaml
kubectl apply -f ../k8s/gateway.yaml
kubectl apply -f ../k8s/frontend.yaml

# 4. Fetch LoadBalancer URL
echo "🎉 Deployment initiated! Fetching Frontend LoadBalancer URL..."
sleep 5
kubectl get svc livesys-frontend

echo "✅ LiveSysDesign AWS Deployment Script Completed!"
