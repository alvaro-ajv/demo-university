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
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile               # API container configuration
│   └── .gitignore
├── frontend/                     # Angular frontend
│   └── university-dashboard/
│       ├── src/                  # Angular source code
│       ├── Dockerfile           # Frontend container configuration
│       ├── nginx.conf           # Nginx configuration
│       └── package.json
├── k8s/                         # Kubernetes manifests
│   ├── api-deployment.yaml      # API deployment configuration
│   ├── frontend-deployment.yaml # Frontend deployment configuration
│   ├── ingress.yaml            # Load balancer configuration
│   ├── rbac.yaml               # Security and permissions
│   └── fargate.yaml            # Fargate-specific configurations
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions pipeline
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

### Docker Compose (Optional)

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - PORT=8000

  frontend:
    build: ./frontend/university-dashboard
    ports:
      - "80:80"
    depends_on:
      - api
```

Run with: `docker-compose up`

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

### Prerequisites

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
   kubectl apply -f k8s/ingress.yaml

   # Deploy applications
   kubectl apply -f k8s/api-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/rbac.yaml
   kubectl apply -f k8s/fargate.yaml
   ```

3. **Check deployment status**
   ```bash
   kubectl get pods
   kubectl get services
   kubectl describe ingress university-ingress
   ```

### Access the Application

- **API**: Use the LoadBalancer service URL + `/docs` for Swagger UI
- **Frontend**: Use the LoadBalancer service URL
- **Logs**: `kubectl logs -f deployment/university-api`

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
   kubectl logs deployment/university-api
   kubectl describe pod <pod-name>
   ```

2. **Frontend can't reach API**
   - Check service names in environment variables
   - Verify network policies
   - Test with `kubectl port-forward`

3. **Docker build failures**
   - Check Dockerfile syntax
   - Verify base image availability
   - Clear Docker cache: `docker system prune`

4. **GitHub Actions failures**
   - Check secrets configuration
   - Verify branch protection rules
   - Review workflow syntax

### Useful Commands

```bash
# Check cluster info
kubectl cluster-info

# Get pod details
kubectl get pods -o wide

# Port forward for testing
kubectl port-forward service/university-api-service 8000:8000

# Check resource usage
kubectl top pods

# Scale deployments
kubectl scale deployment university-api --replicas=3

# Update deployments
kubectl set image deployment/university-api api=yourusername/university-api:v2
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

**Happy Learning! 🚀**