# Vercel Deployment Checklist

Use this checklist to ensure your SilverCrafts application is ready for deployment.

## Pre-Deployment

- [ ] All code changes committed to Git
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Local build succeeds (`npm run build`)
- [ ] Database schema is up to date
- [ ] Environment variables documented

## Database Setup

- [ ] PostgreSQL database created (Vercel Postgres, Supabase, or other)
- [ ] Database connection string obtained
- [ ] Database migrations ready to run
- [ ] Initial admin user created (or seed script ready)

## Vercel Configuration

- [ ] Vercel account created
- [ ] Project imported from Git repository
- [ ] Environment variables added in Vercel dashboard:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL` (production URL)
  - [ ] `NEXTAUTH_SECRET` (generated secure key)
  - [ ] Optional: Sanity variables (if using)

## Build Configuration

- [ ] `vercel.json` configured correctly
- [ ] `package.json` has `postinstall` script for Prisma
- [ ] Build command includes Prisma generate

## Post-Deployment

- [ ] Database migrations run successfully
- [ ] Application accessible at deployment URL
- [ ] Authentication working
- [ ] Admin panel accessible
- [ ] Products displaying correctly
- [ ] Orders/quotes can be created
- [ ] No console errors in browser
- [ ] No errors in Vercel function logs

## Testing Checklist

- [ ] Homepage loads
- [ ] User registration/login works
- [ ] Product browsing works
- [ ] Add to cart/quote works
- [ ] Order placement works
- [ ] Quote request works
- [ ] Admin dashboard accessible
- [ ] Admin can manage products
- [ ] Admin can manage users
- [ ] Admin can view orders/quotes
- [ ] Images load correctly
- [ ] Responsive design works on mobile

## Security

- [ ] Environment variables not exposed in code
- [ ] `.env` files in `.gitignore`
- [ ] Admin routes protected
- [ ] API routes have proper authentication
- [ ] Database credentials secure

## Performance

- [ ] Images optimized
- [ ] Build output size reasonable
- [ ] No unnecessary dependencies
- [ ] Database queries optimized

## Monitoring (Optional)

- [ ] Error tracking set up (Sentry, etc.)
- [ ] Analytics configured
- [ ] Uptime monitoring

## Documentation

- [ ] README.md updated
- [ ] DEPLOYMENT.md created
- [ ] ENV_SETUP.md created
- [ ] Team members have access

---

## Quick Deploy Commands

```bash
# 1. Test build locally
npm run build

# 2. Deploy to Vercel
vercel

# 3. Deploy to production
vercel --prod

# 4. Run migrations (after deployment)
npx prisma migrate deploy
```

## Troubleshooting

If deployment fails:

1. Check Vercel build logs
2. Verify environment variables
3. Ensure database is accessible
4. Check for TypeScript errors
5. Verify Prisma Client is generated

## Support

For issues, check:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables guide
- Vercel Documentation: https://vercel.com/docs

