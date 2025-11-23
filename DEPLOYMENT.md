# Deployment Guide for SilverCrafts Next.js Application

This guide will help you deploy the SilverCrafts application to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. A PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com))
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Copy the connection string (it will be automatically added as `POSTGRES_URL`)

### Option B: External PostgreSQL Database

1. Set up a PostgreSQL database (e.g., Supabase, Railway, or Neon)
2. Copy your database connection string
3. Format: `postgresql://user:password@host:port/database?schema=public`

## Step 2: Set Up Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Variables

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### Optional Variables (if using Sanity)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js
6. Add your environment variables in the project settings
7. Click "Deploy"

## Step 4: Run Database Migrations

After deployment, you need to run Prisma migrations:

### Option 1: Using Vercel CLI

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Option 2: Using Vercel Postgres

If using Vercel Postgres, migrations run automatically. For external databases:

1. Connect to your database
2. Run migrations manually or use a migration service

### Option 3: Using Prisma Studio (for initial setup)

```bash
npx prisma studio
```

## Step 5: Seed the Database (Optional)

If you need to seed initial data:

```bash
npx prisma db seed
```

Or run the seed script manually:
```bash
npx tsx prisma/seed.ts
```

## Step 6: Verify Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`
2. Test the following:
   - Homepage loads correctly
   - Authentication works
   - Admin panel is accessible (if you have admin credentials)
   - Products are displayed
   - Orders and quotes can be created

## Troubleshooting

### Build Errors

1. **Prisma Client not generated**: Ensure `postinstall` script runs
   - Check `package.json` has `"postinstall": "prisma generate"`

2. **Database connection errors**: 
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from Vercel's IP ranges
   - Ensure SSL is enabled if required

3. **NextAuth errors**:
   - Verify `NEXTAUTH_URL` matches your deployment URL
   - Ensure `NEXTAUTH_SECRET` is set

### Common Issues

1. **Middleware errors**: Check that all routes are properly configured
2. **Image optimization**: Verify image domains in `next.config.ts`
3. **Environment variables**: Ensure all required variables are set in Vercel dashboard

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Admin user created (if needed)
- [ ] Products seeded (if needed)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring set up (optional)

## Updating the Deployment

1. Push changes to your Git repository
2. Vercel will automatically redeploy
3. Or manually trigger deployment from Vercel dashboard

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

