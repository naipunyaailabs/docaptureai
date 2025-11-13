# Docapture Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- A domain name (docapture.com in this example)
- SSL certificate for your domain

## Environment Configuration

1. Copy `.env.docker` to `.env`:
   ```bash
   cp .env.docker .env
   ```

2. Update the `.env` file with your actual values:
   ```env
   # MongoDB Configuration (update with your MongoDB connection string)
   MONGODB_URI=mongodb://admin:YOUR_REAL_PASSWORD@your-mongodb-host:27017/doc_extractor?authSource=admin&retryWrites=true&w=majority

   # API Configuration (generate secure keys)
   API_KEY=your_secure_api_key_here
   GROQ_API_KEY=your_groq_api_key_here

   # SMTP Configuration (update with your email service details)
   SMTP_HOST=your.smtp.server.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@yourdomain.com
   SMTP_PASS=your_email_password
   SMTP_FROM="Docapture" <your_email@yourdomain.com>
   FRONTEND_URL=https://docapture.com

   # Frontend Configuration
   NEXT_PUBLIC_APP_NAME=docapture Pro
   NEXT_PUBLIC_BASE_URL=https://docapture.com
   NEXT_PUBLIC_API_BASE_URL=https://docapture.com
   NEXT_PUBLIC_AUTH_API_BASE_URL=https://docapture.com
   NEXT_PUBLIC_BACKEND_URL=https://docapture.com
   NEXT_PUBLIC_SUPPORT_EMAIL=support@docapture.com
   NEXT_PUBLIC_MAX_UPLOAD_SIZE=100
   NEXT_PUBLIC_DEFAULT_THEME=system
   ```

## Deployment Steps

1. Build and start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env up -d
   ```

2. Check the logs to ensure services are running:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Troubleshooting CORS Issues

If you're still experiencing CORS issues:

1. Verify that `FRONTEND_URL` in your `.env` file matches your actual domain:
   ```env
   FRONTEND_URL=https://docapture.com
   ```

2. Check that the frontend configuration in `.env` has the correct URLs:
   ```env
   NEXT_PUBLIC_BASE_URL=https://docapture.com
   NEXT_PUBLIC_API_BASE_URL=https://docapture.com
   NEXT_PUBLIC_AUTH_API_BASE_URL=https://docapture.com
   NEXT_PUBLIC_BACKEND_URL=https://docapture.com
   ```

3. Restart the services after making changes:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml --env-file .env up -d
   ```

## SSL Configuration

For production deployment, you should use SSL. You can either:

1. Use a reverse proxy like Nginx with Let's Encrypt, or
2. Configure SSL directly in your Docker Compose setup

Example with Let's Encrypt and Nginx:
1. Install Certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. Generate SSL certificates:
   ```bash
   sudo certbot certonly --standalone -d docapture.com
   ```

3. Update your Docker Compose file to include Nginx with SSL configuration.

## Health Checks

Monitor your services with:
```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs docextract-api
docker-compose -f docker-compose.prod.yml logs docapture-ui
```