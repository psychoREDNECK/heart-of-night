import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Check for required environment variables in production
function checkRequiredEnvironmentVariables() {
  const requiredVars = ['PORT'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }

  // Check for optional but recommended variables
  const optionalVars = ['DATABASE_URL'];
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  
  if (missingOptional.length > 0) {
    console.info(`Info: Optional environment variables not set: ${missingOptional.join(', ')}`);
    console.info('The application will use in-memory storage for development');
  }

  return missing.length === 0;
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Check environment variables
  const envOk = checkRequiredEnvironmentVariables();
  if (!envOk) {
    console.error('Critical environment variables are missing. Exiting...');
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details for debugging
    console.error(`Error ${status}: ${message}`, {
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(status).json({ 
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    server.close((err) => {
      if (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
      console.log('Server closed successfully');
      process.exit(0);
    });
  };

  // Listen for shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`environment: ${process.env.NODE_ENV}`);
    log(`health check available at /api/health`);
  });
})();
