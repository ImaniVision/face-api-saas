# Production ready Dockerfile for NestJS
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app (and push schema)
CMD ["sh", "-c", "npx drizzle-kit push && npm run start:prod"]
