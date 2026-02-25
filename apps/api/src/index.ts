import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { cookie } from '@elysiajs/cookie';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { fortuneRoutes } from './routes/fortune';

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
  .use(authRoutes)
  .use(fortuneRoutes)
  .listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
