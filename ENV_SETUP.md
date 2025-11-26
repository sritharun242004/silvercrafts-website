# Environment Variables Setup

Copy this template to create your `.env.local` file for local development, or add these variables in your Vercel project settings for production.

## Required Environment Variables

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or visit: https://generate-secret.vercel.app/32

## Optional Environment Variables

```env
# If using Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"

# Alternative Auth Secret (if not using NEXTAUTH_SECRET)
AUTH_SECRET="your-secret-key-here"
```

## Vercel Deployment

When deploying to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for:
   - **Production**
   - **Preview** (optional, for pull requests)
   - **Development** (optional, for local preview)

### Important Notes

- `NEXTAUTH_URL` should match your deployment URL in production (e.g., `https://your-app.vercel.app`)
- `DATABASE_URL` should use connection pooling for production (Vercel Postgres provides this automatically)
- Never commit `.env.local` or `.env` files to Git (they're already in `.gitignore`)
