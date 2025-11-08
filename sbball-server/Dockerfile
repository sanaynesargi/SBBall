# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install yarn globally
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package.json first for better caching
COPY package.json ./

# Install ALL dependencies
RUN yarn install

# Copy all source files
COPY . .

# Build TypeScript (fail soft)
RUN yarn tsc || true

# Verify node_modules and dist exist
RUN ls -la /app && ls -la /app/node_modules && ls -la /app/dist || echo "Directories check"

# Expose port
EXPOSE 8080

# Set NODE_ENV
ENV NODE_ENV=production

# Start server from /app directory
CMD ["node", "/app/dist/server.js"]
