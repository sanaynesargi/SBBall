# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install yarn globally
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package files
COPY package.json ./

# Install ALL dependencies (dev + production)
RUN yarn install --frozen-lockfile || yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn tsc || true

# Remove dev dependencies to reduce image size (optional - comment out if causing issues)
# RUN yarn install --production --ignore-scripts --prefer-offline

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
