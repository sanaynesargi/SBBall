# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install yarn globally
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package files
COPY package.json ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn tsc

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
