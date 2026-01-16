# OnSite Crash Champions - Deployment Guide

## Production Environment

**VPS IP Address:** `31.220.57.14`
**Domain:** `onsite.jesseprojects.com`
**Application Path:** `/opt/onsite-app`

## Deployment Commands

### Standard Deployment (Frontend/Backend Changes)

```bash
ssh root@31.220.57.14
cd /opt/onsite-app
git pull
docker-compose build
docker-compose up -d
docker-compose ps
```

### Frontend-Only Deployment

```bash
ssh root@31.220.57.14
cd /opt/onsite-app
git pull
docker-compose build frontend
docker-compose up -d frontend
```

### Backend-Only Deployment

```bash
ssh root@31.220.57.14
cd /opt/onsite-app
git pull
docker-compose build backend
docker-compose up -d backend
```

### Database Schema Changes

```bash
ssh root@31.220.57.14
cd /opt/onsite-app

# Backup database first
docker-compose exec postgres pg_dump -U onsite onsite > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply schema changes
docker-compose exec postgres psql -U onsite onsite -f /docker-entrypoint-initdb.d/01-schema-v2.sql
```

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Container Status

```bash
docker-compose ps
```

### Restart Containers

```bash
# All containers
docker-compose restart

# Specific container
docker-compose restart backend
```

## Network Configuration

- **Traefik Network:** `root_default`
- **HTTPS:** Enabled via Traefik with Let's Encrypt
- **Backend Port:** 3000 (internal)
- **Frontend Port:** 80 (internal)

## Environment Variables

Located in `/opt/onsite-app/.env` on VPS:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://onsite.jesseprojects.com`

## Troubleshooting

### Containers not connecting to Traefik

```bash
docker network connect root_default onsite-backend
docker network connect root_default onsite-frontend
docker restart traefik
```

### Database connection issues

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify connection from backend
docker-compose exec backend sh -c 'nc -zv postgres 5432'
```

### Clear and rebuild everything

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Rollback Procedure

```bash
cd /opt/onsite-app
git log --oneline -5  # Find commit to rollback to
git reset --hard <commit-hash>
docker-compose build
docker-compose up -d
```

## Backup Procedures

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U onsite onsite > /opt/backups/onsite_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U onsite onsite < /opt/backups/onsite_YYYYMMDD_HHMMSS.sql
```

### Full Application Backup

```bash
cd /opt
tar -czf onsite-app-backup_$(date +%Y%m%d_%H%M%S).tar.gz onsite-app/
```

## Security Notes

- Demo passwords active until POC approval
- Rate limiting: 5 submissions per IP per location per 15 minutes
- CORS restricted to production domain
- Debug endpoint returns 404 in production
- Environment variables validated at startup
