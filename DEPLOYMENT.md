# Deployment Guide

## Applied Deployment Fixes

✅ **Server listens on 0.0.0.0** - Already configured correctly
✅ **Health check endpoints** - Added `/api/health` and `/api/ready` endpoints
✅ **Enhanced error handling** - Comprehensive error logging and middleware
✅ **Graceful shutdown** - SIGTERM and SIGINT signal handling
✅ **Environment validation** - Checks for required environment variables
✅ **Production configuration** - Proper environment detection and setup

## Health Check Endpoints

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**: 
```json
{
  "status": "healthy",
  "timestamp": "2025-08-03T03:02:07.466Z",
  "uptime": 3.014767703,
  "environment": "production"
}
```

### Readiness Check
- **Endpoint**: `GET /api/ready`
- **Response**:
```json
{
  "status": "ready",
  "timestamp": "2025-08-03T03:02:07.466Z"
}
```

## Environment Variables

### Required
- `PORT` - Server port (defaults to 5000 if not set)

### Optional
- `DATABASE_URL` - PostgreSQL connection string (falls back to in-memory storage)
- `NODE_ENV` - Environment mode (automatically set to 'production' if not specified)

### AI Service API Keys (Optional)
- `OPENAI_API_KEY` - For OpenAI services
- `ANTHROPIC_API_KEY` - For Anthropic services  
- `MISTRAL_API_KEY` - For Mistral services
- `TOGETHER_API_KEY` - For Together AI services

## Deployment Features

1. **Automatic Environment Detection** - Sets production mode if NODE_ENV is not specified
2. **Graceful Shutdown Handling** - Responds to SIGTERM and SIGINT signals
3. **Error Recovery** - Comprehensive exception handling with logging
4. **Health Monitoring** - Built-in health and readiness endpoints for deployment systems
5. **Resource Validation** - Checks for required environment variables on startup

## Build Process

```bash
npm run build  # Creates production-ready build in dist/
```

## Production Server

The application is configured to work with Replit Deployments out of the box:

- Serves on `0.0.0.0` (required for container environments)
- Uses PORT environment variable (required for Replit)
- Includes health check endpoints for monitoring
- Handles graceful shutdowns properly
- Provides comprehensive error logging

## Testing Deployment

The deployment fixes have been tested and verified:
- Health check endpoint returns proper JSON response in production mode
- Server starts correctly with environment validation
- Graceful shutdown mechanisms are in place
- Error handling is comprehensive and production-ready

Ready for deployment to Replit Deployments.