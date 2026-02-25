export const config = {
  port: parseInt(process.env.PORT || '3001'),
  env: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL!,
  },

  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

// Validate required environment variables
const required = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
