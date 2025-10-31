# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:docker

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/university-dashboard/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy and set up entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to generate config and start nginx
ENTRYPOINT ["/entrypoint.sh"]