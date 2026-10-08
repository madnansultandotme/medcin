# Medcin Platform - Deployment Guide

This guide covers deploying the Medcin platform to production on Vercel with Neon PostgreSQL.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account (for code hosting)
- ✅ Vercel account (for hosting) - [vercel.com](https://vercel.com)
- ✅ Neon account (for database) - [neon.tech](https://neon.tech)
- ✅ SMTP email service (Gmail, SendGrid, etc.)
- ✅ Domain name (optional but recommended)

---

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"New Project"**
3. Name it **"medcin-production"**
4. Select region closest to your users:
   - `aws-us-east-2` for USA
   - `aws-ap-southeast-1` for Singapore/SEA
   - `aws-eu-central-1` for Europe
5. PostgreSQL version: **18** (latest)

### 1.2 Get Connection String

1. In project dashboard, click **"Connection Details"**
2. Copy the connection string (starts with `postgresql://`)
3. **Important**: Save this - you'll need it for environment variables

Example:
```
postgresql://neondb_owner:abc123xyz@ep-cool-lab-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 1.3 Run Database Migrations

From your local machine:

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### 1.4 Verify Database

Run test query in Neon SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: `users`, `centers`, `doctors`, `bookings`, etc.

---

## 🔐 Step 2: Set Up Neon Better Auth

### 2.1 Enable Auth

1. In Neon Console, go to your project
2. Navigate to **"Better Auth"** tab
3. Click **"Enable Better Auth"**
4. Configure settings:
   - **Allowed domains**: `yourdomain.com, localhost:3000`
   - **Google OAuth**: Add Google Client ID & Secret (optional)
   - **Email verification**: Enabled

### 2.2 Get Auth URL

1. Copy the **Auth Endpoint URL**
   ```
   https://ep-xxx.region.aws.neon.tech/neondb/auth
   ```
2. Save this for environment variables

### 2.3 Configure OAuth (Optional)

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://ep-xxx.region.aws.neon.tech/neondb/auth/callback/google
   ```
4. Copy Client ID and Client Secret
5. Add to Neon Better Auth settings

---

## 📧 Step 3: Set Up Email Service

### Option A: Gmail (Easiest for Testing)

1. Enable 2-Factor Authentication on Google Account
2. Generate App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Create new app password
   - Copy the 16-character password

Environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### Option B: SendGrid (Production Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender domain

Environment variables:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Option C: AWS SES (Enterprise)

1. Set up AWS SES
2. Verify domain
3. Get SMTP credentials

---

## 🚀 Step 4: Deploy to Vercel

### 4.1 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Ready for production"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/medcin-platform.git
git branch -M main
git push -u origin main
```

### 4.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repo
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`

### 4.3 Add Environment Variables

Click **"Environment Variables"** and add:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require

# Auth
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-xxx.region.aws.neon.tech/neondb/auth

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Important**:
- Set environment scope to **"Production", "Preview", and "Development"**
- Click **"Add"** for each variable
- Values are encrypted by Vercel

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide URL: `https://your-app.vercel.app`

---

## ✅ Step 5: Post-Deployment Verification

### 5.1 Test Authentication

1. Visit `https://your-app.vercel.app/signup/patient`
2. Create a test account
3. Verify email works (check inbox)
4. Login at `/login`
5. Access patient dashboard

### 5.2 Create Admin User

Connect to Neon database and run:

```sql
-- Update your user to ADMIN role
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-admin@email.com';
```

Then login and access `/admin` dashboard.

### 5.3 Test Center Flow

1. Signup as center at `/signup/center`
2. Fill center details
3. Check center gets "PENDING" status
4. Admin approves from admin dashboard
5. Verify approval email sent to center owner

### 5.4 Test Booking Flow

1. Login as patient
2. Search for doctors
3. Create a booking
4. Verify booking confirmation email
5. Check booking appears in dashboards

---

## 🌐 Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to project **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `medcin.health`
4. Vercel provides DNS records

### 6.2 Configure DNS

Add these records to your DNS provider:

**For Root Domain** (`medcin.health`):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW** (`www.medcin.health`):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 Update Environment Variables

After domain is live:
```env
NEXT_PUBLIC_APP_URL=https://medcin.health
```

Redeploy for changes to take effect.

### 6.4 SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. Your site will be HTTPS within minutes.

---

## 🔧 Step 7: Production Configuration

### 7.1 Update Neon Better Auth Domains

In Neon Console → Better Auth → Settings:
```
Allowed domains: medcin.health, www.medcin.health
```

### 7.2 Configure OAuth Redirects

Update OAuth redirect URIs in provider consoles:

**Google OAuth**:
```
https://ep-xxx.neon.tech/neondb/auth/callback/google
```

### 7.3 Database Pooling (Optional)

For high traffic, enable Neon connection pooling:

1. Neon Console → Project Settings → Connection Pooling
2. Enable pooling
3. Use pooled connection string in `DATABASE_URL`

---

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Vercel Analytics

1. Go to project **Analytics** tab
2. Enable **"Web Analytics"**
3. Monitor:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### 8.2 Error Tracking

Check Vercel **Logs** for runtime errors:
- Functions → View logs
- Filter by error level
- Set up Slack/email alerts

### 8.3 Database Monitoring

In Neon Console:
- Monitor **"Metrics"** tab
- Check query performance
- Monitor connection count
- Review slow queries

### 8.4 Email Delivery

Monitor email service:
- Gmail: Check sent folder
- SendGrid: View delivery dashboard
- AWS SES: CloudWatch metrics

---

## 🔄 Step 9: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- **Push to `main`**: Production deployment
- **Pull requests**: Preview deployments
- **Push to `dev` branch**: Development deployment

### Manual Redeploy

From Vercel dashboard:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**

### Rollback

If deployment has issues:
1. Go to **Deployments**
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

---

## 🔐 Step 10: Security Checklist

### Before Going Live

- [ ] All environment variables set correctly
- [ ] Database RLS policies enabled and tested
- [ ] SMTP credentials secured (use app passwords, not account passwords)
- [ ] OAuth redirect URIs configured for production domain
- [ ] CORS policies configured (if using external APIs)
- [ ] Rate limiting enabled on auth endpoints
- [ ] Admin account created and secured (strong password)
- [ ] Test all user flows (patient, center, admin)
- [ ] Verify email notifications working
- [ ] SSL certificate active (HTTPS enforced)
- [ ] Error logging and monitoring configured

### Post-Launch

- [ ] Monitor error logs daily for first week
- [ ] Check email delivery success rate
- [ ] Review database query performance
- [ ] Monitor user signups and bookings
- [ ] Set up backup strategy (Neon has automatic backups)
- [ ] Document admin procedures
- [ ] Create incident response plan

---

## 🆘 Troubleshooting

### Build Fails

**Error**: `Type check failed`
```bash
# Locally run type check
npm run build

# Fix TypeScript errors
# Then commit and push
```

**Error**: `Module not found`
```bash
# Install missing dependencies
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Database Connection Issues

**Error**: `Connection timeout`
- Check `DATABASE_URL` is correct
- Verify SSL mode: `?sslmode=require`
- Test connection from local machine first
- Check Neon compute is not suspended

**Error**: `Too many connections`
- Enable Neon connection pooling
- Reduce connection pool size in code
- Check for connection leaks

### Email Not Sending

**Gmail**: "Invalid credentials"
- Use App Password, not account password
- Enable 2FA first
- Check SMTP_USER is correct email

**SendGrid**: 403 Forbidden
- Verify API key is correct
- Check sender domain is verified
- Review SendGrid activity logs

### Authentication Issues

**Error**: `Unauthorized`
- Check `NEXT_PUBLIC_NEON_AUTH_URL` is correct
- Verify domain is in Better Auth allowed domains
- Clear browser cookies and try again

**OAuth Not Working**:
- Verify OAuth credentials in Neon Console
- Check redirect URI matches exactly
- Test with different browser (incognito)

---

## 📈 Scaling Considerations

### Traffic Growth

**100 users/day** → Vercel Free tier + Neon Free tier ✅

**1,000 users/day** → Vercel Pro ($20/mo) + Neon Pro ($19/mo)
- Enable caching
- Optimize database queries
- Add CDN for static assets

**10,000+ users/day** → Enterprise planning
- Neon dedicated compute
- Redis for session storage
- Load balancing considerations
- Database read replicas

### Database Optimization

As data grows:
1. Add indexes on frequently queried columns
2. Archive old bookings (> 1 year)
3. Optimize slow queries (use EXPLAIN ANALYZE)
4. Consider partitioning large tables

### Email Scaling

SendGrid free tier: **100 emails/day**
- Paid plan: 40,000 emails/month for $15
- AWS SES: $0.10 per 1,000 emails (most cost-effective at scale)

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] Production database seeded with initial data
- [ ] Admin account created
- [ ] Test center approved
- [ ] Test bookings created and confirmed
- [ ] Email templates tested (approval, confirmation, cancellation)
- [ ] All dashboards tested (admin, center, patient)
- [ ] Mobile-responsive design verified
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Performance tested (Lighthouse score > 90)

### Launch Day
- [ ] Final deployment to production
- [ ] Smoke test all critical flows
- [ ] Monitor error logs
- [ ] Announce launch to pilot users
- [ ] Be ready for support requests

### Post-Launch (Week 1)
- [ ] Daily error log review
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Database backup verification
- [ ] Email delivery monitoring

---

## 📞 Support Resources

### Documentation
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Neon**: [neon.tech/docs](https://neon.tech/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Drizzle ORM**: [orm.drizzle.team/docs](https://orm.drizzle.team/docs)

### Community
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join development community
- **Email**: support@medcin.health

---

**🎉 Congratulations! Your Medcin platform is now live!**

*Remember to monitor closely in the first few days and iterate based on user feedback.*
