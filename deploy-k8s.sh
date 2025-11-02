#!/bin/bash

set -e

NAMESPACE="demo-university"
API_SERVICE="university-api-service"
FRONTEND_DEPLOYMENT="university-frontend"

echo "🚀 Deploying University Demo App to Kubernetes..."

# Create namespace if it doesn't exist
echo "📦 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy API first
echo "📦 Deploying API service..."
kubectl apply -f k8s/api-deployment.yaml

# Wait for API deployment to be ready
echo "⏳ Waiting for API deployment to be ready..."
kubectl rollout status deployment/university-api -n $NAMESPACE --timeout=300s

# Get the external IP
echo "🔍 Getting API LoadBalancer external URL..."
EXTERNAL_IP=""
for i in {1..30}; do
  EXTERNAL_IP=$(kubectl get svc $API_SERVICE -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || kubectl get svc $API_SERVICE -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  
  if [ ! -z "$EXTERNAL_IP" ]; then
    echo "✅ API LoadBalancer URL: http://$EXTERNAL_IP:8000"
    break
  fi
  
  echo "⏳ Waiting for external IP... (attempt $i/30)"
  sleep 10
done

if [ -z "$EXTERNAL_IP" ]; then
  echo "❌ Failed to get LoadBalancer external IP after 5 minutes"
  echo "ℹ️  You can check manually with: kubectl get svc $API_SERVICE -n $NAMESPACE"
  exit 1
fi

# Update frontend deployment with the actual API URL
echo "🔧 Updating frontend deployment with API URL..."
sed "s/REPLACE_WITH_API_LOADBALANCER_URL/$EXTERNAL_IP/g" k8s/frontend-deployment.yaml > k8s/frontend-deployment-updated.yaml

# Deploy frontend
echo "📦 Deploying frontend service..."
kubectl apply -f k8s/frontend-deployment-updated.yaml

# Wait for frontend deployment to be ready
echo "⏳ Waiting for frontend deployment to be ready..."
kubectl rollout status deployment/$FRONTEND_DEPLOYMENT -n $NAMESPACE --timeout=300s

# Get frontend URL
FRONTEND_IP=""
for i in {1..30}; do
  FRONTEND_IP=$(kubectl get svc university-frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || kubectl get svc university-frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  
  if [ ! -z "$FRONTEND_IP" ]; then
    echo "✅ Frontend URL: http://$FRONTEND_IP"
    break
  fi
  
  echo "⏳ Waiting for frontend external IP... (attempt $i/30)"
  sleep 10
done

# Test API connectivity
echo "🧪 Testing API connectivity..."
if [ ! -z "$EXTERNAL_IP" ]; then
  if curl -s --max-time 10 "http://$EXTERNAL_IP:8000/health" > /dev/null; then
    echo "✅ API health check passed"
  else
    echo "⚠️  API health check failed - but deployment completed"
  fi
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 API URL: http://$EXTERNAL_IP:8000"
echo "🌐 Frontend URL: http://$FRONTEND_IP"
echo ""
echo "📋 To check status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get services -n $NAMESPACE"
echo ""
echo "🔧 To troubleshoot:"
echo "   kubectl logs -f deployment/$FRONTEND_DEPLOYMENT -n $NAMESPACE"
echo "   kubectl logs -f deployment/university-api -n $NAMESPACE"

# Clean up temporary file
rm -f k8s/frontend-deployment-updated.yaml