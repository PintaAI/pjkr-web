# Vercel + Neon Serverless Configuration

This document outlines the configuration for deploying the PJKR application on Vercel with Neon PostgreSQL optimized for serverless environments.

## Configuration Summary

### 1. Prisma Schema Configuration
- ✅ **Driver Adapters**: Enabled for Neon serverless driver
- ✅ **Dual URLs**: Configured with `url` (pooled) and `directUrl` (direct)
- ✅ **Connection Pooling**: Optimized for serverless functions

### 2. Environment Variables

#### Required Environment Variables for Vercel
```bash
# Pooled connection for serverless functions
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require&connect_timeout=15&connection_limit=20&pool_timeout=15"

# Direct connection for Prisma migrations (without -pooler)
DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].aws.neon.tech/[dbname]?sslmode=require&connect_timeout=15"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-vercel-domain.vercel.app"

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Connection String Parameters Explained

#### Pooled Connection (DATABASE_URL)
- `connect_timeout=15`: Extended timeout for serverless cold starts
- `connection_limit=20`: Optimal pool size for serverless functions
- `pool_timeout=15`: Query timeout before moving to next in queue
- `-pooler` in hostname: Uses Neon's connection pooling

#### Direct Connection (DIRECT_URL)
- Used exclusively for Prisma migrations
- No pooling parameters needed
- Direct connection to database

### 4. Serverless Optimizations

#### Neon Serverless Driver Benefits
- ✅ **Lower Latency**: Optimized WebSocket connections
- ✅ **Edge Compatibility**: Works in Vercel Edge Functions
- ✅ **Connection Pooling**: Built-in intelligent pooling
- ✅ **Auto-scaling**: Handles serverless scaling patterns

#### Configuration Features
- **WebSocket Constructor**: Uses `ws` package for Node.js environments
- **Fetch Querying**: Enabled for Vercel Edge environments
- **Environment Detection**: Auto-configures based on Vercel environment

### 5. Deployment Steps

#### Step 1: Vercel Project Setup
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings (automatic for Next.js)

#### Step 2: Database Migration
```bash
# Run migrations using direct connection
npx prisma migrate deploy
```

#### Step 3: Deploy
```bash
# Deploy to Vercel
vercel --prod
```

### 6. Troubleshooting

#### Common Issues

**Connection Timeouts**
- Increase `connect_timeout` parameter
- Check Neon compute status (may be in idle state)

**Migration Errors**
- Ensure `DIRECT_URL` is set correctly
- Use Prisma 5.10+ for pooled migrations, or use direct URL

**Edge Function Issues**
- Ensure `poolQueryViaFetch` is enabled
- Check import statements for server-only packages

#### Performance Monitoring
- Monitor connection pool usage in Vercel dashboard
- Check Neon dashboard for connection metrics
- Use Vercel Analytics for function performance

### 7. Best Practices

#### Database Connections
- Always use pooled connections for API routes
- Keep connection pool size reasonable (20-50 connections)
- Monitor and adjust timeouts based on usage patterns

#### Serverless Optimization
- Implement connection reuse across function invocations
- Use environment-specific configurations
- Cache frequently accessed data when possible

#### Security
- Always use SSL connections (`sslmode=require`)
- Keep database credentials in environment variables
- Regularly rotate connection strings

### 8. Monitoring and Alerts

#### Neon Dashboard
- Monitor connection usage
- Track query performance
- Set up alerts for high connection usage

#### Vercel Dashboard
- Monitor function execution times
- Track error rates
- Set up alerts for timeouts

## Resources

- [Neon Prisma Guide](https://neon.com/docs/guides/prisma)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Serverless Best Practices](https://www.prisma.io/docs/guides/deployment/serverless)