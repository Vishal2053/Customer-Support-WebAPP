# Deployment Guide

## Local Development

See [QUICKSTART.md](QUICKSTART.md) for local setup.

## Docker Deployment

### Build Images

```bash
# Backend
docker build -t ai-support-backend:latest ./backend

# Frontend
docker build -t ai-support-frontend:latest ./frontend
```

### Run with Docker Compose

```bash
# Create .env file with all credentials
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Cloud Deployment

### AWS Deployment

#### Backend (ECS/Fargate)
1. Push image to ECR
2. Create ECS cluster
3. Create task definition
4. Create service
5. Configure load balancer

#### Frontend (S3 + CloudFront)
1. Build: `npm run build`
2. Upload `dist/` to S3
3. Create CloudFront distribution
4. Point domain to CloudFront

### Heroku Deployment

#### Backend
```bash
# Create Heroku app
heroku create ai-support-backend

# Set environment variables
heroku config:set SUPABASE_URL=...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main
```

#### Frontend
```bash
# Build
npm run build

# Deploy to Netlify
npm run build
netlify deploy --prod --dir=dist
```

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

## Database Deployment

### Supabase (Recommended)
1. Create project at supabase.com
2. Get connection string
3. Run migrations
4. Enable RLS on tables
5. Configure Row Level Security policies

### Manual PostgreSQL

```bash
# Connect to database
psql postgresql://user:password@host:5432/database

# Run schema
\i DATABASE_SCHEMA.md

# Verify
\dt
```

## Environment Configuration

### Production .env (Backend)
```
ENVIRONMENT=production
DEBUG=False
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_production_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_long_random_secret_key
OPENAI_API_KEY=sk-your_key
SERPER_API_KEY=your_key
ALLOWED_ORIGINS=https://yourdomain.com
API_HOST=0.0.0.0
API_PORT=8000
```

### Production .env (Frontend)
```
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## SSL/TLS Certificates

### Using Let's Encrypt with Nginx
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Create certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Monitoring & Logging

### Application Monitoring
- Set up logging aggregation (ELK, Datadog, etc.)
- Monitor API response times
- Track error rates
- Monitor database performance

### Uptime Monitoring
```bash
# Health check endpoint
GET https://api.yourdomain.com/health
```

### Error Tracking
- Use Sentry for error tracking
- Set up alerting
- Create dashboards

## Scaling Considerations

### Database Scaling
- Read replicas for read-heavy workloads
- Replication for high availability
- Connection pooling (PgBouncer)
- Caching layer (Redis)

### Backend Scaling
- Horizontal scaling with load balancer
- Multiple instances/containers
- Auto-scaling based on metrics
- Queue system for async tasks (Celery)

### Frontend Optimization
- CDN for static assets
- Image optimization
- Code splitting
- Lazy loading

## Backup & Disaster Recovery

### Database Backups
```bash
# Manual backup
pg_dump postgresql://... > backup.sql

# Restore
psql postgresql://... < backup.sql

# Automated backups (Supabase)
- Check Supabase dashboard for backup settings
```

### Application Backups
- Version control (GitHub/GitLab)
- Container image registry
- Configuration backups
- Secrets backup (encrypted)

## Security Hardening

### Network Security
- Use VPC/Private networks
- Configure security groups
- Implement WAF rules
- Use HTTPS everywhere

### Application Security
- Enable CORS properly
- Implement rate limiting
- Add request signing
- Validate all inputs
- Use security headers

### Database Security
- Enforce RLS policies
- Encrypt sensitive data
- Use connection strings safely
- Regular security audits
- Backup encryption

## Performance Tuning

### Backend
```bash
# Monitor performance
# - Check slow query logs
# - Monitor resource usage
# - Profile application

# Optimization techniques
# - Database indexing
# - Query optimization
# - Caching layer
# - Connection pooling
```

### Frontend
```bash
# Build optimization
npm run build

# Check bundle size
npm install webpack-bundle-analyzer

# Deployment optimization
# - Enable gzip compression
# - Minify assets
# - Use CDN
# - Browser caching
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker build -t api ./backend
      - run: docker push gcr.io/project/api
```

## Rollback Procedures

### Backend
```bash
# If deployment fails
docker pull previous_image:tag
docker run -e ... previous_image:tag
```

### Frontend
```bash
# Rollback to previous build
# - Revert S3/CDN to previous version
# - Point to previous CloudFront distribution
# - Revert DNS if needed
```

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`, `pip upgrade`
- Review security advisories
- Monitor logs for errors
- Clean up old data
- Backup critical data
- Test disaster recovery

### Downtime-Free Updates
- Blue-green deployment
- Database migrations with backward compatibility
- Feature flags for gradual rollout
- Health checks before removing old instances

## Support & Troubleshooting

### Common Issues

**High latency**
- Check database query performance
- Enable caching
- Use CDN
- Optimize code

**Service unavailable**
- Check instance health
- Review recent deployments
- Check database connection
- Review error logs

**Memory/CPU issues**
- Identify memory leaks
- Optimize queries
- Implement caching
- Scale horizontally

## Helpful Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

For more deployment strategies, see cloud provider documentation.
