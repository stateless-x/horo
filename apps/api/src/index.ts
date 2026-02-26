import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { cookie } from '@elysiajs/cookie';
import { config } from './config';
import { auth } from './lib/auth';
import { fortuneRoutes } from './routes/fortune';
import { inviteRoutes } from './routes/invite';

const app = new Elysia()
  .use(cors({
    origin: config.frontend.url,
    credentials: true,
  }))
  .use(cookie())
  .get('/', () => ({
    message: 'Horo API',
    version: '0.1.0',
  }))
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }))
  // Better Auth endpoints - handles /api/auth/*
  .all('/api/auth/*', async ({ request }) => {
    return auth.handler(request);
  })
  .use(fortuneRoutes)
  .use(inviteRoutes)
  .listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
