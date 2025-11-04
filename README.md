# University Workshop: Docker, GitHub Actions & AWS EKS

This is a complete demo application for teaching students how to build, containerize, and deploy applications using modern DevOps practices.

## 🏗️ Architecture

The application consists of:
- **Backend API**: FastAPI (Python) serving student and course data
- **Frontend**: Angular application consuming the API
- **Infrastructure**: Containerized with Docker, deployed on AWS EKS Fargate
- **CI/CD**: GitHub Actions for automated testing and deployment

## 📁 Project Structure

```
demo-app/
├── api/                          # Python FastAPI backend
│   ├── main.py                   # Main API application
│   ├── controllers/              # API controllers (students, courses, stats)
│   ├── models/                   # Data models
│   ├── tests/                    # Unit tests
│   ├── requirements.txt          # Python dependencies
│   ├── pytest.ini              # Test configuration
│   └── Dockerfile               # API container configuration
├── frontend/                     # Angular frontend
│   └── university-dashboard/
│       ├── src/                  # Angular source code
│       │   ├── app/              # Angular components and services
│       │   ├── assets/           # Static assets and configuration
│       │   └── environments/     # Environment configurations
│       ├── Dockerfile           # Frontend container configuration
│       ├── nginx.conf           # Nginx configuration
│       ├── entrypoint.sh        # Container startup script
│       └── package.json
├── k8s/                         # Kubernetes manifests (cloud deployment)
│   ├── api-deployment.yaml      # API deployment configuration
│   ├── frontend-deployment.yaml # Frontend deployment configuration
│   └── reg-secret.yaml         # Registry secret
├── k8s-local/                   # Local Kubernetes manifests
│   ├── api-deployment.yaml      # Local API deployment
│   ├── frontend-deployment.yaml # Local frontend deployment
│   ├── reg-secret.yaml         # Local registry secret
│   └── docker-config.json      # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
├── deploy-k8s.sh               # Kubernetes deployment script
├── metallb.yml                 # MetalLB configuration for local LoadBalancer
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker Desktop
- AWS CLI configured
- kubectl installed

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd demo-app
   ```

2. **Run the API locally**
   ```bash
   cd api
   pip install -r requirements.txt
   python main.py
   ```
   API will be available at http://localhost:8000

3. **Run the Frontend locally**
   ```bash
   cd frontend/university-dashboard
   npm install
   npm start
   ```
   Frontend will be available at http://localhost:4200

## 🐳 Docker Development

### Build and Run with Docker

1. **Build the API container**

   ```bash
   cd api
   docker build -t university-api .
   docker run -p 8000:8000 university-api
   ```

2. **Build the Frontend container**

   ```bash
   cd frontend/university-dashboard
   docker build -t university-frontend .
   docker run -p 80:80 university-frontend
   ```

### Docker Compose (Recommended)

Use the included `docker-compose.yml` file for easy development:

```yaml
version: '3.8'

services:
  api:
    build: 
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend/university-dashboard
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - API_URL=http://localhost:8000
    restart: unless-stopped

networks:
  default:
    name: university-network
```

**Run with Docker Compose:**

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: <http://localhost>
- API: <http://localhost:8000>
- API Documentation: <http://localhost:8000/docs>

## 🔄 CI/CD with GitHub Actions

### Setup Requirements

1. **Create Docker Hub account** and get access token
2. **Create AWS account** and configure EKS cluster
3. **Add GitHub Secrets:**
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key
   - `AWS_REGION`: AWS region (e.g., us-west-2)
   - `EKS_CLUSTER_NAME`: Your EKS cluster name

### Pipeline Stages

The GitHub Actions pipeline includes:

1. **Test API**: Install dependencies and run health checks
2. **Test Frontend**: Install dependencies, lint, and build
3. **Build & Push**: Create Docker images and push to registry
4. **Deploy to EKS**: Deploy to AWS EKS Fargate

## ☸️ AWS EKS Deployment

### EKS Prerequisites

1. **Create EKS Cluster**

   ```bash
   # Using eksctl (recommended)
   eksctl create cluster \
     --name university-workshop \
     --region us-west-2 \
     --fargate
   ```

2. **Configure kubectl**

   ```bash
   aws eks update-kubeconfig --name university-workshop --region us-west-2
   ```

### Automated Deployment

Use the included deployment script for easy Kubernetes deployment:

```bash
# Make the script executable
chmod +x deploy-k8s.sh

# Run the deployment
./deploy-k8s.sh
```

The script will:
- Create the namespace `demo-university`
- Deploy the API service with LoadBalancer
- Wait for the API LoadBalancer to get an external IP
- Update the frontend deployment with the actual API URL
- Deploy the frontend service
- Provide you with the URLs to access both services

### Manual Deployment

1. **Update image references in k8s files**

   ```bash
   # Replace DOCKER_USERNAME with your Docker Hub username
   sed -i 's/DOCKER_USERNAME/yourusername/g' k8s/*.yaml
   # Replace IMAGE_TAG with specific tag or 'latest'
   sed -i 's/IMAGE_TAG/latest/g' k8s/*.yaml
   ```

2. **Deploy to Kubernetes**

   ```bash
   # Create namespace
   kubectl create namespace demo-university

   # Deploy applications
   kubectl apply -f k8s/api-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

3. **Check deployment status**

   ```bash
   kubectl get pods -n demo-university
   kubectl get services -n demo-university
   ```

### Local Kubernetes (Docker Desktop)

For local development with Kubernetes:

```bash
# Enable Kubernetes in Docker Desktop
# Then deploy locally
kubectl apply -f k8s-local/
```

#### Port Forwarding for Local Access

Since local Kubernetes may not have LoadBalancer support, use port forwarding to access the services:

```bash
# Port forward the API service (in one terminal)
kubectl port-forward service/university-api-service 8000:8000 -n demo-university

# Port forward the frontend service (in another terminal)
kubectl port-forward service/university-frontend-service 8080:80 -n demo-university
```

**Access the application locally:**
- **Frontend**: <http://localhost:8080>
- **API**: <http://localhost:8000>
- **API Documentation**: <http://localhost:8000/docs>

**Note**: Keep the port-forward commands running in separate terminals while you access the application.

### Access the Application

- **API**: Use the LoadBalancer service URL + `/docs` for Swagger UI
- **Frontend**: Use the LoadBalancer service URL
- **Logs**: `kubectl logs -f deployment/university-api -n demo-university`

## 🎓 Workshop Steps

### Part 1: Understanding the Application (30 min)

1. Explore the API endpoints:
   - `/students` - CRUD operations for students
   - `/courses` - View courses
   - `/stats` - Application statistics
   - `/docs` - Interactive API documentation

2. Examine the Angular frontend:
   - Components structure
   - Services for API communication
   - Routing configuration

### Part 2: Containerization (45 min)

1. **Dockerfile Analysis**
   - Multi-stage builds for frontend
   - Security best practices (non-root user)
   - Layer optimization

2. **Build and Test Locally**
   - Build both containers
   - Test connectivity between containers
   - Volume mounting for development

### Part 3: CI/CD Pipeline (60 min)

1. **GitHub Actions Workflow**
   - Examine `.github/workflows/ci-cd.yml`
   - Understand testing stages
   - Docker image building and pushing

2. **Setup and Trigger**
   - Configure repository secrets
   - Make a code change and push
   - Monitor pipeline execution

### Part 4: Kubernetes Deployment (90 min)

1. **Kubernetes Concepts**
   - Deployments vs Services
   - ConfigMaps and Secrets
   - Ingress controllers

2. **AWS EKS Fargate**
   - Serverless container execution
   - Pod scaling strategies
   - Cost optimization

3. **Deploy and Monitor**
   - Apply manifests
   - Check pod status
   - Access via LoadBalancer

## 🔧 Troubleshooting

### Common Issues

1. **API not responding**

   ```bash
   kubectl logs deployment/university-api -n demo-university
   kubectl describe pod <pod-name> -n demo-university
   ```

2. **Frontend can't reach API**
   - Check API URL in environment variables
   - For Docker Compose: API should be accessible at `localhost:8000`
   - For Kubernetes: API URL is dynamically set by deployment script
   - Test API connectivity: `curl http://localhost:8000/health`

3. **Docker build failures**
   - Check Dockerfile syntax
   - Verify base image availability
   - Clear Docker cache: `docker system prune`

4. **Kubernetes LoadBalancer timeout**
   - The deployment script now properly waits for deployments instead of services
   - Check if your cluster supports LoadBalancer services
   - For local development, use port forwarding instead of LoadBalancer services
   - For local development, consider using NodePort services

5. **GitHub Actions failures**
   - Check secrets configuration
   - Verify branch protection rules
   - Review workflow syntax

### Useful Commands

```bash
# Docker Compose
docker-compose logs api
docker-compose logs frontend
docker-compose exec api python main.py
docker-compose down && docker-compose up --build

# Kubernetes
kubectl get pods -n demo-university
kubectl get services -n demo-university
kubectl logs -f deployment/university-api -n demo-university
kubectl describe deployment university-api -n demo-university

# Port forwarding for local access
kubectl port-forward service/university-api-service 8000:8000 -n demo-university
kubectl port-forward service/university-frontend-service 8080:80 -n demo-university

# Local testing
curl http://localhost:8000/health
curl http://localhost:8000/students
```

## 🧪 Testing

### API Testing

The API includes comprehensive unit tests:

```bash
# Run tests locally
cd api
pip install -r requirements.txt
python -m pytest

# Run tests with coverage
python -m pytest --cov=. --cov-report=html

# Run tests in Docker
docker-compose exec api python -m pytest
```

### Frontend Testing

The Angular frontend includes unit tests:

```bash
# Run tests locally
cd frontend/university-dashboard
npm install
npm test

# Run tests in CI mode
npm run test -- --watch=false --browsers=ChromeHeadless
```

## 📚 Learning Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Angular Documentation](https://angular.io/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational purposes. Feel free to use and modify for your workshops and learning.

---

## 🎯 Workshop Learning Objectives

By the end of this workshop, students will:

- ✅ Understand containerization with Docker
- ✅ Implement CI/CD pipelines with GitHub Actions
- ✅ Deploy applications to AWS EKS Fargate
- ✅ Use Kubernetes for container orchestration
- ✅ Apply DevOps best practices
- ✅ Debug and troubleshoot containerized applications

## 🚀 Happy Learning
