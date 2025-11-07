# SBBall Deployment Guide 🚀

This guide will help you deploy SBBall to production using Railway (backend) and Vercel (frontend).

---

## Prerequisites

- GitHub account
- [Railway account](https://railway.app) (free tier available)
- [Vercel account](https://vercel.com) (free tier available)

---

## Step 1: Deploy Backend to Railway

### 1.1 Push Your Code to GitHub

Make sure your latest changes are pushed:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 1.2 Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `SBBall` repository
5. Railway will auto-detect the Dockerfile
6. Click **"Deploy"**

### 1.3 Configure Railway

1. Once deployed, go to your project settings
2. Click **"Generate Domain"** to get a public URL
3. Copy the domain (e.g., `sbball-production.up.railway.app`)
4. The database file (`mydatabase.db`) will persist in the container

### 1.4 Environment Variables (Optional)

If you need any environment variables:
1. Go to project **"Variables"** tab
2. Add:
   - `PORT=8080`
   - `NODE_ENV=production`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `SBBall` repository
4. Vercel will auto-detect Next.js
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `sbball-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2 Set Environment Variables

In the Vercel project settings:
1. Go to **"Settings"** → **"Environment Variables"**
2. Add:
   - **Variable**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-domain.up.railway.app` (from Step 1.3)
   - **Environment**: Production, Preview, Development

### 2.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. You'll get a URL like `sbball.vercel.app`

---

## Step 3: Update CORS in Backend

After deployment, update your backend to allow requests from your Vercel domain:

In `sbball-server/src/server.ts`, update the CORS configuration:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sbball.vercel.app',  // Add your Vercel domain
    'https://sbball-*.vercel.app'  // Allow preview deployments
  ]
}));
```

Push this change and Railway will auto-redeploy.

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Try creating a game
3. Check that stats are saving correctly
4. Test player profiles

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Railway logs for errors
- Verify TypeScript compiled correctly (`dist/` folder exists)
- Check that `PORT` is set to 8080

**Problem**: Database not persisting
- **Solution**: Railway's free tier may reset containers
- Consider upgrading or using a managed database

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend CORS allows your Vercel domain

**Problem**: Build fails
- **Solution**: Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Next.js version compatibility

---

## Alternative: Single Platform Deployment

### Option 1: Railway for Everything

You can deploy both frontend and backend on Railway:

1. Create two separate Railway services
2. One for `sbball-server` (with Dockerfile)
3. One for `sbball-ui` (Railway auto-detects Next.js)

### Option 2: Render

1. Create web service for backend
2. Create static site for frontend
3. Similar process to Railway/Vercel

---

## Database Considerations

### Current Setup (SQLite)

- Database persists in the container
- ⚠️ **Warning**: Railway may reset on redeploys
- Best for testing/development

### Production Recommendation

For production, consider migrating to PostgreSQL:

1. Add a Railway PostgreSQL database
2. Use an ORM like Prisma or TypeORM
3. Migrate your schema
4. Update queries

---

## Monitoring

### Railway

- View logs in Railway dashboard
- Monitor CPU/memory usage
- Set up alerts for downtime

### Vercel

- Analytics available in dashboard
- Check function execution times
- Monitor bandwidth usage

---

## Cost Breakdown

### Free Tier Limits

**Railway:**
- $5 free credit per month
- ~500 hours of usage
- 1GB RAM, 1 vCPU

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions

**Total Cost**: $0/month (within free tiers)

---

## Custom Domain (Optional)

### Railway

1. Go to project settings
2. Add custom domain
3. Update DNS records

### Vercel

1. Go to project settings
2. Add domain
3. Configure DNS (Vercel provides instructions)

---

## Security Recommendations

1. **Environment Variables**: Never commit API keys or secrets
2. **HTTPS**: Both Railway and Vercel provide free SSL
3. **Rate Limiting**: Add rate limiting to your API
4. **Input Validation**: Validate all user inputs
5. **CORS**: Only allow specific domains in production

---

## Updating Your Deployment

### Backend Updates

1. Push changes to GitHub
2. Railway auto-deploys from `main` branch
3. Monitor logs for any errors

### Frontend Updates

1. Push changes to GitHub  
2. Vercel auto-deploys from `main` branch
3. Preview deployments for PRs

---

## Rollback

### Railway

1. Go to deployments
2. Select previous deployment
3. Click "Redeploy"

### Vercel

1. Go to deployments
2. Click on previous deployment
3. Click "Promote to Production"

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Open an issue in your repo

---

**Your SBBall app is now live! 🏀**

Share your deployment URL with friends and start tracking games!
