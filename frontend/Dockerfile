# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the React app for production
# The REACT_APP_API_BASE_URL will be baked in during build time from the environment
# or from the .env file if available during the build context.
# For Docker builds, it's often better to configure this at runtime via Nginx or entrypoint scripts,
# but create-react-app's default .env handling will use it if present when npm run build is executed.
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy static assets from the build stage to Nginx's web root directory
COPY --from=builder /app/build /usr/share/nginx/html

# Optional: Add a custom Nginx configuration for client-side routing
# Create a file named nginx.conf in frontend/ (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default CMD for Nginx is to run Nginx in the foreground, which is what we want.
# CMD ["nginx", "-g", "daemon off;"]
