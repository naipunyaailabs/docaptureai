# Use the official Node.js image with Bun runtime
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_AUTH_API_BASE_URL
ARG NEXT_PUBLIC_BACKEND_URL

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Skip static export which is causing issues with auth pages
ENV NEXT_EXPORT=false

# Build the Next.js application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Command to run the application in production mode
CMD ["bun", "next", "start"]