# Docker Setup for RefinedTech Backend

This Docker setup provides a complete development environment with PostgreSQL database and Laravel application.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (usually included with Docker Desktop)

## Services Included

1. **PostgreSQL Database** (port 5432)
   - Database: `refinedtech`
   - Username: `postgres` 
   - Password: `1234`

2. **Laravel Application** (port 8000)
   - Fully configured with PostgreSQL
   - Auto-migration on startup

3. **pgAdmin** (port 5050) - Optional database management tool
   - Email: `admin@refinedtech.com`
   - Password: `admin123`

## Quick Start

1. **Clone and navigate to backend directory:**
   ```bash
   cd /path/to/RefinedTech/backend
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Laravel API: http://localhost:8000
   - pgAdmin: http://localhost:5050

## Useful Commands

### Start services in background:
```bash
docker-compose up -d
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs app
docker-compose logs postgres
```

### Run Laravel commands:
```bash
# Run migrations
docker-compose exec app php artisan migrate

# Clear cache
docker-compose exec app php artisan cache:clear

# Generate application key
docker-compose exec app php artisan key:generate

# Access Laravel container shell
docker-compose exec app sh
```

### Database Commands:
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d refinedtech

# Backup database
docker-compose exec postgres pg_dump -U postgres refinedtech > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres refinedtech < backup.sql
```

## Environment Configuration

The Docker setup uses environment variables defined in:
- `docker-compose.yml` for service configuration
- `.env.docker` for Laravel-specific settings

Key differences from local development:
- `DB_HOST=postgres` (service name instead of localhost)
- All services run in isolated network

## Troubleshooting

### Database Connection Issues:
1. Ensure PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

### Laravel Application Issues:
1. Check application logs:
   ```bash
   docker-compose logs app
   ```

2. Access container to debug:
   ```bash
   docker-compose exec app sh
   ```

### Reset Everything:
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## Data Persistence

- PostgreSQL data is persisted in Docker volume `postgres_data`
- pgAdmin settings are persisted in Docker volume `pgadmin_data`
- Laravel application files are mounted from host system

## Production Deployment

For production deployment:
1. Update environment variables in `docker-compose.yml`
2. Set `APP_ENV=production` and `APP_DEBUG=false`
3. Use proper SSL certificates
4. Configure reverse proxy (nginx/apache)
5. Set up proper backup strategies