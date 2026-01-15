# Kubernetes Deployment Guide

## Overview

This guide explains how to deploy TinyLink to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.24+)
- `kubectl` installed and configured
- Docker image built (`tinylink:latest`)
- Optional: Ingress controller (nginx)

## Architecture

```
┌──────���──────────────────────────────┐
│         Ingress (nginx)             │
│      tinylink. local → Service       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Service (ClusterIP)            │
│         Port 80 → 3000              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Deployment (3 replicas)      │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ Pod1 │  │ Pod2 │  │ Pod3 │      │
│  └──────┘  └──────┘  └──────┘      │
└─────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────┐  ┌─────────▼────────┐
│  ConfigMap   │  │       HPA        │
│   (Config)   │  │  (Auto-scaling)  │
└──────────────┘  └──────────────────┘
```

## Quick Start

### Deploy Everything at Once

```bash
# Apply all manifests
kubectl apply -f k8s/all-in-one.yaml

# Check deployment status
kubectl get all -n tinylink

# Check pods are running
kubectl get pods -n tinylink
```

### Deploy Step by Step

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace. yaml

# 2. Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# 3. Create Deployment
kubectl apply -f k8s/deployment.yaml

# 4. Create Service
kubectl apply -f k8s/service.yaml

# 5. Create Ingress (optional)
kubectl apply -f k8s/ingress.yaml

# 6. Create HPA (optional)
kubectl apply -f k8s/hpa.yaml
```

## Verify Deployment

### Check All Resources

```bash
# View all resources in tinylink namespace
kubectl get all -n tinylink

# Expected output:
# NAME                            READY   STATUS    RESTARTS   AGE
# pod/tinylink-xxx                1/1     Running   0          1m
# pod/tinylink-yyy                1/1     Running   0          1m
# pod/tinylink-zzz                1/1     Running   0          1m
#
# NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# service/tinylink-service   ClusterIP   10.96.100.100   <none>        80/TCP
#
# NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
# deployment.apps/tinylink   3/3     3            3           1m
```

### Check Pod Status

```bash
# List pods
kubectl get pods -n tinylink

# Describe a pod
kubectl describe pod <pod-name> -n tinylink

# View pod logs
kubectl logs <pod-name> -n tinylink

# Follow logs
kubectl logs -f <pod-name> -n tinylink
```

### Check Health

```bash
# Port-forward to access service
kubectl port-forward -n tinylink svc/tinylink-service 8080:80

# Test health endpoint (in another terminal)
curl http://localhost:8080/health
```

## Testing the Application

### Port Forward Method

```bash
# Forward service port to localhost
kubectl port-forward -n tinylink svc/tinylink-service 8080:80

# Test in another terminal
# Shorten URL
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'

# Check health
curl http://localhost:8080/health

# View metrics
curl http://localhost:8080/metrics
```

### Using Ingress (if configured)

```bash
# Add to /etc/hosts
echo "127.0.0.1 tinylink.local" | sudo tee -a /etc/hosts

# Access via browser or curl
curl http://tinylink.local/health
```

## Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment tinylink -n tinylink --replicas=5

# Check scaling
kubectl get pods -n tinylink
```

### Auto-Scaling (HPA)

```bash
# Check HPA status
kubectl get hpa -n tinylink

# Describe HPA
kubectl describe hpa tinylink-hpa -n tinylink

# Watch HPA in action
kubectl get hpa -n tinylink --watch
```

## Configuration

### Update ConfigMap

```bash
# Edit ConfigMap
kubectl edit configmap tinylink-config -n tinylink

# Or apply updated file
kubectl apply -f k8s/configmap.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment tinylink -n tinylink
```

### Update Image

```bash
# Update deployment with new image
kubectl set image deployment/tinylink \
  tinylink=tinylink:v2 \
  -n tinylink

# Check rollout status
kubectl rollout status deployment/tinylink -n tinylink

# Rollback if needed
kubectl rollout undo deployment/tinylink -n tinylink
```

## Resource Management

### View Resource Usage

```bash
# Pod resource usage
kubectl top pods -n tinylink

# Node resource usage
kubectl top nodes
```

### Resource Quotas

The deployment includes:

- **Requests:** 128Mi memory, 100m CPU per pod
- **Limits:** 256Mi memory, 200m CPU per pod
- **HPA:** 2-10 replicas based on 70% CPU / 80% memory

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n tinylink

# Common issues:
# - ImagePullBackOff:  Docker image not found
# - CrashLoopBackOff:  Application crashes on startup
# - Pending: Insufficient resources
```

### Check Logs

```bash
# View logs
kubectl logs <pod-name> -n tinylink

# View previous container logs (if crashed)
kubectl logs <pod-name> -n tinylink --previous

# Stream logs from all pods
kubectl logs -f -l app=tinylink -n tinylink
```

### Health Check Failures

```bash
# Check if health endpoint responds
kubectl exec -it <pod-name> -n tinylink -- curl localhost:3000/health

# Check pod events
kubectl get events -n tinylink --sort-by='. lastTimestamp'
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n tinylink

# Check if pods are ready
kubectl get pods -n tinylink

# Test service from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never \
  -- curl http://tinylink-service. tinylink.svc.cluster.local/health
```

## Cleanup

### Delete Everything

```bash
# Delete all resources
kubectl delete -f k8s/all-in-one.yaml

# Or delete namespace (removes everything)
kubectl delete namespace tinylink
```

### Delete Specific Resources

```bash
# Delete HPA
kubectl delete hpa tinylink-hpa -n tinylink

# Delete Ingress
kubectl delete ingress tinylink-ingress -n tinylink

# Delete Service
kubectl delete service tinylink-service -n tinylink

# Delete Deployment
kubectl delete deployment tinylink -n tinylink
```

## Production Considerations

### Security

- Use Secrets for sensitive data (not ConfigMap)
- Enable RBAC
- Use Network Policies
- Set security contexts

### High Availability

- Run across multiple nodes
- Use Pod Disruption Budgets
- Configure proper resource requests/limits
- Set up monitoring and alerting

### Persistence

- Add PersistentVolumeClaims if needed
- Use external databases (PostgreSQL, Redis)
- Configure backup strategies

### Monitoring

- Deploy Prometheus for metrics
- Set up Grafana dashboards
- Configure alerting rules
- Enable distributed tracing

## Manifest Details

### Namespace

- Isolates TinyLink resources
- Environment label for organization

### ConfigMap

- Stores non-sensitive configuration
- Environment variables for the app

### Deployment

- 3 replicas for high availability
- Rolling update strategy
- Health probes (liveness + readiness)
- Resource limits and requests

### Service

- ClusterIP type (internal access)
- Load balances across pods
- Port 80 → 3000 mapping

### Ingress

- External access via domain
- nginx ingress controller
- Host-based routing

### HPA

- Auto-scales 2-10 replicas
- Based on CPU (70%) and memory (80%)
- Smart scale-up/scale-down policies

## Next Steps

- Set up monitoring (Prometheus + Grafana)
- Add persistent storage
- Configure TLS/SSL certificates
- Implement CI/CD integration
- Set up multi-environment (dev, staging, prod)
