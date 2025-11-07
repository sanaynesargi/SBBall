# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm install -g typescript
RUN npm run watch || tsc

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
