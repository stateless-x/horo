// Log startup for debugging Railway deployments
console.log('[CONFIG] Loading configuration...');
console.log('[CONFIG] PORT:', process.env.PORT);
console.log('[CONFIG] NODE_ENV:', process.env.NODE_ENV);
console.log('[CONFIG] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  env: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  oauth: {
    baseUrl: process.env.OAUTH_BASE_URL || 'http://localhost:3001',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    },
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

// Validate required environment variables (non-blocking)
// Store validation errors but don't throw immediately
const required = [
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'GEMINI_API_KEY',
];

export const configErrors: string[] = [];

for (const key of required) {
  if (!process.env[key]) {
    const error = `Missing required environment variable: ${key}`;
    console.error(`[CONFIG ERROR] ${error}`);
    configErrors.push(error);
  }
}

// Warn if there are config errors but don't block startup
if (configErrors.length > 0) {
  console.warn('[CONFIG] Server will start but some features may not work due to missing env vars');
  console.warn('[CONFIG] Missing env vars:', configErrors.join(', '));
}
