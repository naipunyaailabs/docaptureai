# Docapture Docker Compose Setup - Quick Reference

## 📦 What's Included

This Docker Compose setup provides complete deployment configuration for the Docapture application with the following components:

- **Frontend**: Next.js 15 application (docapture-ui)
- **Backend**: Bun-based API server (docextract-api)
- **Database**: MongoDB 7.0
- **Reverse Proxy**: Nginx (production only)
- **SSL/TLS**: Let's Encrypt support (production)

## 🚀 Quick Start

### Development (Local)

```bash
# 1. Copy environment file
cp .env.docker .env

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Production

```bash
# 1. Create production environment
cp .env.docker .env.production
# Edit .env.production with your domain and secrets

# 2. Generate SSL certificates (or use Let's Encrypt)
# See DEPLOYMENT_GUIDE.md for SSL setup

# 3. Start production services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Access via your domain
# https://yourdomain.com
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development configuration with exposed ports |
| `docker-compose.prod.yml` | Production configuration with Nginx |
| `.env.docker` | Environment variables template |
| `DEPLOYMENT_GUIDE.md` | Complete deployment documentation |
| `start.sh` / `start.bat` | Quick start scripts |
| `nginx/nginx.conf` | Nginx reverse proxy configuration |
| `docapture-ui/Dockerfile` | Frontend Docker image |
| `docextract-api/Dockerfile` | Backend Docker image |

## 🔧 Common Commands

### Start Services
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f docapture-ui
```

### Restart Service
```bash
docker-compose restart docapture-ui
```

### Stop Services
```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Rebuild and Update
```bash
# Rebuild specific service
docker-compose up -d --build docapture-ui

# Rebuild all
docker-compose up -d --build
```

## 🔒 Environment Variables

Key environment variables to configure in `.env`:

```env
# MongoDB
MONGODB_PASSWORD=your_secure_password

# API Keys
API_KEY=your_api_key
GROQ_API_KEY=your_groq_api_key

# URLs (Development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# URLs (Production)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 📊 Service Ports

### Development Mode

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| Frontend | 3000 | 3000 |
| Backend | 5000 | 5000 |
| MongoDB | 27017 | 27017 |

### Production Mode

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| Nginx | 80, 443 | 80, 443 |
| Frontend | 3000 | - (via Nginx) |
| Backend | 5000 | - (via Nginx) |
| MongoDB | 27017 | - (internal only) |

## 🗂️ Persistent Data

All data is stored in Docker volumes:

- `docapture-mongodb-data`: Database files
- `docapture-api-uploads`: Uploaded documents
- `docapture-nginx-logs`: Nginx access and error logs

### Backup Volumes

```bash
# Backup all volumes
docker run --rm -v docapture-mongodb-data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data
```

## 🔍 Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Service Logs
```bash
docker-compose logs -f <service-name>
```

### Restart Failed Service
```bash
docker-compose restart <service-name>
```

### Check Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' <container-name>
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Clean up unused Docker resources
docker system prune -a
```

## 📚 Documentation

For detailed information, see:
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**: Complete deployment guide
- **[Docker Documentation](https://docs.docker.com/)**: Official Docker docs
- **[Docker Compose Reference](https://docs.docker.com/compose/compose-file/)**: Compose file reference

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Review the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Check service health: `docker-compose ps`
4. Restart services: `docker-compose restart`

## ✅ Health Checks

All services include health checks:

- **MongoDB**: Ping database every 10s
- **Backend**: HTTP check on port 5000 every 30s
- **Frontend**: HTTP check on port 3000 every 30s
- **Nginx**: HTTP check on /health endpoint every 30s

## 🔐 Security Notes

- Change all default passwords in `.env`
- Use strong API keys (32+ characters)
- For production, use proper SSL certificates
- MongoDB is not exposed externally in production
- Nginx includes rate limiting and security headers

## 📈 Scaling

Scale services horizontally:

```bash
# Scale frontend to 3 instances
docker-compose up -d --scale docapture-ui=3

# Scale backend to 2 instances
docker-compose up -d --scale docextract-api=2
```

Nginx automatically load balances across scaled instances.

---

**Ready to deploy?** Start with the quick start scripts or dive into the [complete deployment guide](./DEPLOYMENT_GUIDE.md)!
