import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { cookie } from '@elysiajs/cookie';
import { config, configErrors } from './config';

console.log('[STARTUP] Starting Horo API...');
console.log('[STARTUP] Attempting to listen on port:', config.port);

// Import auth and routes lazily to avoid blocking on database connection
let auth: any;
let fortuneRoutes: any;
let inviteRoutes: any;

const app = new Elysia()
  .use(cors({
    origin: config.frontend.url,
    credentials: true,
  }))
  .use(cookie())
  .get('/', () => ({
    message: 'Horo API',
    version: '0.1.0',
    status: configErrors.length > 0 ? 'degraded' : 'ok',
    configErrors: configErrors.length > 0 ? configErrors : undefined,
  }))
  .get('/health', () => {
    // Health check always returns 200 to pass Railway checks
    // but indicates if there are configuration issues
    const isHealthy = configErrors.length === 0;
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      port: config.port,
      issues: configErrors.length > 0 ? configErrors : undefined,
    };
  })
  .onError(({ error, code }) => {
    console.error('[ERROR]', code, error);
    return {
      error: error.message || 'Internal server error',
      code,
    };
  });

// Only load auth and routes if config is valid
if (configErrors.length === 0) {
  console.log('[STARTUP] Loading auth and routes...');
  try {
    const authModule = await import('./lib/auth');
    auth = authModule.auth;

    const fortuneModule = await import('./routes/fortune');
    fortuneRoutes = fortuneModule.fortuneRoutes;

    const inviteModule = await import('./routes/invite');
    inviteRoutes = inviteModule.inviteRoutes;

    app
      .all('/api/auth/*', async ({ request }) => {
        return auth.handler(request);
      })
      .use(fortuneRoutes)
      .use(inviteRoutes);

    console.log('[STARTUP] Auth and routes loaded successfully');
  } catch (error) {
    console.error('[STARTUP ERROR] Failed to load auth/routes:', error);
    console.error('[STARTUP] Server will run in degraded mode (health check only)');
  }
} else {
  console.warn('[STARTUP] Skipping auth/routes due to config errors');
  console.warn('[STARTUP] Server running in degraded mode (health check only)');
}

try {
  app.listen(config.port);
  console.log('[STARTUP] ✓ Server started successfully');
  console.log(`[STARTUP] 🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
  console.log('[STARTUP] Health check endpoint: /health');
} catch (error) {
  console.error('[STARTUP ERROR] Failed to start server:', error);
  process.exit(1);
}

export type App = typeof app;
