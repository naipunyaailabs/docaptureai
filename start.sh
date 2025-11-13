#!/bin/bash

# Docapture Quick Start Script
# This script helps you quickly deploy the Docapture application

set -e

echo "========================================="
echo "  Docapture Deployment Script"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Press Enter when ready..."
    read
fi

# Ask for deployment type
echo "Select deployment type:"
echo "1) Development (with exposed ports)"
echo "2) Production (with Nginx and SSL)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Development Environment..."
        echo ""
        
        # Build and start services
        docker-compose build
        docker-compose up -d
        
        echo ""
        echo "✅ Development environment started!"
        echo ""
        echo "📍 Access points:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5000"
        echo "   MongoDB:  localhost:27017"
        echo ""
        echo "📊 View logs: docker-compose logs -f"
        echo "🛑 Stop: docker-compose down"
        ;;
    2)
        echo ""
        echo "🏭 Starting Production Environment..."
        echo ""
        
        # Check for SSL certificates
        if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
            echo "⚠️  SSL certificates not found. Generating self-signed certificate..."
            mkdir -p nginx/ssl
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/key.pem \
                -out nginx/ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            echo "✅ Self-signed certificate generated"
            echo "⚠️  For production, replace with proper SSL certificate!"
            echo ""
        fi
        
        # Check for production env file
        if [ ! -f .env.production ]; then
            echo "⚠️  .env.production not found. Using .env"
            ENV_FILE=".env"
        else
            ENV_FILE=".env.production"
        fi
        
        # Build and start production services
        docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE build
        docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d
        
        echo ""
        echo "✅ Production environment started!"
        echo ""
        echo "📍 Access points:"
        echo "   HTTPS: https://localhost"
        echo "   HTTP:  http://localhost (redirects to HTTPS)"
        echo ""
        echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
        echo "🛑 Stop: docker-compose -f docker-compose.prod.yml down"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "  Deployment Complete! 🎉"
echo "========================================="
