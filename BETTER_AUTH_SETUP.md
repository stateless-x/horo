# Better Auth Setup Guide

The Horo fortune-telling app now uses **Better Auth** instead of Supabase for authentication. This simplifies the architecture and provides better integration with Drizzle ORM.

## Why Better Auth?

- **Simpler Architecture**: No external auth service required
- **Direct Database Integration**: Works seamlessly with Drizzle ORM
- **Automatic Schema Management**: Better Auth handles table creation
- **Built-in Session Handling**: No manual JWT management needed
- **Better TypeScript Support**: Fully typed out of the box
- **Reduced Dependencies**: No Supabase client needed

## Prerequisites

You need OAuth credentials for:
1. **Google OAuth 2.0**
2. **Twitter/X OAuth 2.0**

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Add authorized redirect URIs:
   ```
   http://localhost:3001/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
6. Copy **Client ID** and **Client Secret**

## Step 2: Get X (Twitter) OAuth 2.0 Credentials

**IMPORTANT**: By default, X apps only show OAuth 1.0a credentials (Consumer Key/Secret). You must enable OAuth 2.0 separately.

### Step-by-Step Instructions:

1. Go to [X Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Select your app from the list
3. Look for **"User authentication settings"** section
4. Click **"Set up"** (it will say "User authentication not set up" if you haven't enabled OAuth 2.0)
5. Configure OAuth 2.0 settings:
   - **App permissions**: Select permissions (usually "Read" + "Write" for user data)
   - **Type of App**: Select **"Web App"**
   - **App info**:
     - **Callback URI / Redirect URL**:
       ```
       http://localhost:3001/api/auth/callback/twitter
       ```
       (Add production URL later: `https://your-domain.com/api/auth/callback/twitter`)
     - **Website URL**: Your app's website (can use localhost for development)
   - **Client type**: Select **"Confidential"** (required to get Client Secret)
6. **Save** the settings
7. Go to **"Keys and Tokens"** tab
8. You'll now see **OAuth 2.0** credentials:
   - ✅ **Client ID** → Use this for `TWITTER_CLIENT_ID`
   - ✅ **Client Secret** → Use this for `TWITTER_CLIENT_SECRET`

### What NOT to Use:
- ❌ **Consumer Key** (OAuth 1.0a - ignore this)
- ❌ **Consumer Secret** (OAuth 1.0a - ignore this)
- ❌ **Bearer Token** (App-only auth - ignore this)

**Note**: If you only see Consumer Keys and no Client ID/Secret, you haven't enabled OAuth 2.0 yet. Go back to step 4.

## Step 3: Configure Environment Variables

Create or update `apps/api/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/horo

# OAuth Base URL (where Better Auth is running)
OAUTH_BASE_URL=http://localhost:3001

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# X (Twitter) OAuth 2.0 - Must use OAuth 2.0 credentials, NOT Consumer Keys
TWITTER_CLIENT_ID=your-x-client-id
TWITTER_CLIENT_SECRET=your-x-client-secret

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

## Step 4: Database Setup

Better Auth automatically creates the required tables. Just run migrations:

```bash
cd packages/db
bun run db:generate  # Generate migration files
bun run db:push      # Apply to database
```

Better Auth creates these tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider linkage
- `verification` - Email verification tokens

## Step 5: Start the App

```bash
# From project root
bun dev
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:3000`

## How Authentication Works

### 1. User Flow

1. User completes onboarding (Steps 1-6)
2. User sees teaser result (Step 6) - **Value shown BEFORE auth**
3. User clicks "Sign in with Google" or "Sign in with X" (Step 7)
4. Better Auth redirects to OAuth provider
5. Provider redirects back to `/api/auth/callback/{provider}`
6. Better Auth creates session and redirects to `/dashboard`

### 2. Session Management

Better Auth automatically handles:
- Session creation
- Session cookies (httpOnly, Secure, SameSite)
- Session expiration
- Session refresh

No manual JWT management needed!

### 3. Frontend Usage

```typescript
import { useSession, signIn, signOut } from '@/lib/auth-client';

function MyComponent() {
  const { data: session, isPending } = useSession();

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  // Sign in with Twitter/X
  const handleTwitterSignIn = async () => {
    await signIn.social({
      provider: 'twitter',
      callbackURL: '/dashboard',
    });
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome, {session.user.name}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
          <button onClick={handleTwitterSignIn}>Sign in with X</button>
        </div>
      )}
    </div>
  );
}
```

## Backend API Endpoints

Better Auth provides these endpoints automatically:

- **POST** `/api/auth/sign-in/social` - Initiate OAuth flow
- **GET** `/api/auth/callback/{provider}` - OAuth callback
- **POST** `/api/auth/sign-out` - Sign out
- **GET** `/api/auth/session` - Get current session

## Accessing User in Backend

```typescript
import { auth } from './lib/auth';

// In your Elysia route
app.get('/api/protected', async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Access user data
  const userId = session.user.id;
  const userName = session.user.name;
  const userEmail = session.user.email;

  return { message: `Hello, ${userName}!` };
});
```

## Database Schema

### User Table

```typescript
{
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}
```

### Session Table

```typescript
{
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references('user.id'),
}
```

## Production Deployment

### 1. Update OAuth Redirect URIs

In Google Cloud Console and Twitter Developer Portal, add your production URLs:

```
https://your-domain.com/api/auth/callback/google
https://your-domain.com/api/auth/callback/twitter
```

### 2. Update Environment Variables

```env
OAUTH_BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 3. HTTPS Required

Better Auth requires HTTPS in production for security. Make sure your backend is behind HTTPS.

## Troubleshooting

### OAuth Redirect Mismatch

**Error**: Redirect URI mismatch

**Solution**: Make sure the redirect URI in your OAuth app matches exactly:
```
http://localhost:3001/api/auth/callback/google  # Local
https://api.your-domain.com/api/auth/callback/google  # Production
```

### Session Not Persisting

**Error**: Session cookie not being set

**Solution**: Check CORS configuration:
```typescript
cors({
  origin: config.frontend.url,
  credentials: true,  // This is required!
})
```

### Database Connection Error

**Error**: Can't connect to database

**Solution**: Check `DATABASE_URL` format:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Migration from Supabase

If you're migrating from Supabase:

1. **Export user data** from Supabase
2. **Drop old tables**: `users`, `sessions` (Supabase format)
3. **Run migrations** to create Better Auth tables
4. **Import users** (may need data transformation)

Better Auth uses different table structures, so direct migration may require custom scripts.

## Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [X OAuth 2.0 Setup](https://developer.x.com/en/docs/authentication/oauth-2-0)

## Support

For issues specific to Better Auth integration, check:
- Better Auth Discord server
- GitHub issues
- Project documentation at `/docs`
