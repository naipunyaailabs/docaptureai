# 🐳 Docker Compose Full Stack Deployment - Complete

## ✅ Setup Complete!

Your Docapture application is now ready for deployment with Docker Compose. All necessary configuration files have been created.

## 📦 What Was Created

### Core Configuration Files

1. **`docker-compose.yml`** - Development configuration
   - Exposes all ports for local development
   - Hot reload support
   - Easy debugging

2. **`docker-compose.prod.yml`** - Production configuration
   - Nginx reverse proxy with SSL
   - Internal networking (no exposed backend ports)
   - Auto-renewal SSL certificates with Let's Encrypt
   - Production optimizations

3. **`.env.docker`** - Environment variables template
   - Pre-configured with current settings
   - Copy to `.env` and customize

### Docker Images

4. **`docapture-ui/Dockerfile`** - Frontend Docker image
   - Multi-stage build for optimization
   - Next.js standalone output
   - Bun runtime
   - Non-root user for security

5. **`docextract-api/Dockerfile`** - Backend Docker image
   - Bun runtime
   - Health checks included
   - Production-ready

### Nginx Configuration

6. **`nginx/nginx.conf`** - Reverse proxy configuration
   - SSL/TLS termination
   - Rate limiting
   - Security headers
   - Load balancing ready
   - SSE (Server-Sent Events) support

### Helper Files

7. **`.dockerignore`** files - Optimize build context
8. **`start.sh`** / **`start.bat`** - Quick start scripts
9. **`DEPLOYMENT_GUIDE.md`** - Complete deployment documentation
10. **`DOCKER_SETUP.md`** - Quick reference guide

## 🚀 Quick Start

### Option 1: Using Quick Start Script

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

**Development:**
```bash
# 1. Setup environment
cp .env.docker .env

# 2. Start services
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Production:**
```bash
# 1. Setup environment
cp .env.docker .env.production
# Edit .env.production with your domain and secrets

# 2. Generate SSL certificates (first time only)
mkdir -p nginx/ssl
# For self-signed (testing):
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

# 3. Start production services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Access via HTTPS
# https://yourdomain.com
```

## 📋 Deployment Architecture

```
Production Stack:
┌─────────────────────────────────────────┐
│         Internet (Port 80/443)          │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Nginx Proxy   │  ← SSL Termination
         │  + Let's       │  ← Load Balancing
         │    Encrypt     │  ← Rate Limiting
         └───┬────────┬───┘
             │        │
    ┌────────▼──┐  ┌──▼─────────┐
    │ Frontend  │  │  Backend   │
    │ (Next.js) │  │  (Bun API) │
    │ Port 3000 │  │ Port 5000  │
    └───────────┘  └──────┬─────┘
                          │
                   ┌──────▼──────┐
                   │  MongoDB    │
                   │  Port 27017 │
                   └─────────────┘
```

## 🔧 Essential Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# View logs (follow)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f docapture-ui

# Stop all services
docker-compose down

# Restart a service
docker-compose restart docapture-ui

# Rebuild and restart
docker-compose up -d --build
```

### Health Checks

```bash
# Check all services status
docker-compose ps

# Check service health
docker inspect --format='{{.State.Health.Status}}' docapture-ui

# Test endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:5000  # Backend
```

### Database Management

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p <password>

# Backup database
docker-compose exec mongodb mongodump --out /data/backup

# View database logs
docker-compose logs -f mongodb
```

## 🌍 Environment Configuration

### Required Environment Variables

Edit `.env` file with these key values:

```env
# MongoDB (CHANGE THIS!)
MONGODB_PASSWORD=your_secure_password_here

# API Keys (CHANGE THESE!)
API_KEY=your_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# URLs - Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# URLs - Production (update for your domain)
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
# NEXT_PUBLIC_AUTH_API_BASE_URL=https://api.yourdomain.com
# NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🔐 SSL Certificate Setup

### Development (Self-Signed)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Production (Let's Encrypt)

```bash
# Initial certificate request
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos --no-eff-email \
  -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf to use Let's Encrypt:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📊 Monitoring

### View Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Service-specific stats
docker stats docapture-ui docextract-api docapture-mongodb
```

### Log Management

```bash
# View all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service with timestamps
docker-compose logs -f -t docextract-api

# Export logs
docker-compose logs > deployment.log
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Or rebuild specific service
docker-compose up -d --build docapture-ui
```

### Database Backup

```bash
# Create backup directory
mkdir -p backups

# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup
docker cp docapture-mongodb:/data/backup ./backups/mongodb-$(date +%Y%m%d)

# Backup volumes
docker run --rm \
  -v docapture-api-uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz /data
```

### Restore from Backup

```bash
# Restore MongoDB
docker cp ./backups/mongodb-20251014 docapture-mongodb:/data/restore
docker-compose exec mongodb mongorestore /data/restore

# Restore volumes
docker run --rm \
  -v docapture-api-uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads-20251014.tar.gz -C /
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Check configuration
docker-compose config

# View detailed logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port conflicts

```bash
# Check what's using the port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Change port in docker-compose.yml or stop conflicting service
```

### Out of memory/disk space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove unused images
docker image prune -a
```

## 📈 Scaling

```bash
# Scale frontend to 3 instances
docker-compose up -d --scale docapture-ui=3

# Scale backend to 2 instances
docker-compose up -d --scale docextract-api=2

# Nginx will automatically load balance
```

## 🔒 Security Checklist

- [ ] Change default `MONGODB_PASSWORD`
- [ ] Generate strong `API_KEY` (32+ characters)
- [ ] Update `GROQ_API_KEY` with your key
- [ ] Use proper SSL certificates for production
- [ ] Don't expose MongoDB port in production
- [ ] Enable firewall rules
- [ ] Regular security updates: `docker-compose pull`
- [ ] Monitor logs for suspicious activity
- [ ] Implement backup strategy

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Complete deployment guide with all details
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)**: Quick reference for Docker commands
- **[Docker Documentation](https://docs.docker.com/)**: Official Docker docs
- **[Docker Compose Reference](https://docs.docker.com/compose/)**: Compose file reference

## 🎯 Next Steps

1. **Review Configuration**
   - Check `.env` file settings
   - Update domain names for production
   - Set strong passwords and API keys

2. **Test Locally**
   - Start development environment
   - Test all features
   - Check logs for errors

3. **Deploy to Production**
   - Setup SSL certificates
   - Configure domain DNS
   - Deploy with production compose file
   - Monitor for 24 hours

4. **Setup Monitoring**
   - Configure log aggregation
   - Setup health check alerts
   - Plan backup schedule

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend accessible at configured URL
- [ ] Backend API responding
- [ ] Database connection working
- [ ] File uploads functioning
- [ ] Authentication working
- [ ] All services healthy: `docker-compose ps`
- [ ] Logs showing no errors
- [ ] SSL certificate valid (production)
- [ ] Backups configured

## 🆘 Getting Help

If you encounter issues:

1. Check service logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. Check service health: `docker-compose ps`
5. Restart services: `docker-compose restart`

---

**Status**: ✅ Setup Complete  
**Date**: 2025-10-14  
**Version**: 1.0.0

**Ready to deploy!** 🚀

Choose your deployment method above and follow the steps. For detailed information, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
