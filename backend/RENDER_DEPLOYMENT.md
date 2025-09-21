# Render Deployment Guide for RefinedTech Backend

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub with the production-ready Dockerfile.

### 2. Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub account

### 3. Create PostgreSQL Database
1. **Create New PostgreSQL Database**:
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `refinedtech-db`
   - Plan: Free (for testing) or paid plan
   - Save the connection details

### 4. Deploy Web Service
1. **Create New Web Service**:
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository: `RefinedTech`
   - Branch: `features_advanced` (or your main branch)

2. **Configure Service Settings**:
   ```
   Name: refinedtech-backend
   Region: Choose closest to your users
   Branch: features_advanced
   Root Directory: backend
   Runtime: Docker
   Dockerfile Path: Dockerfile.render
   ```

3. **Environment Variables** (Add these in Render dashboard):
   ```
   APP_NAME=RefinedTech
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:P+40YZf+LJtTkJ5NpdSssVFFSIxdVwzCzsBdC3Tsoag=
   APP_URL=https://your-render-app.onrender.com
   
   # Database (from your Render PostgreSQL service)
   DATABASE_URL=[Render will provide this]
   DB_CONNECTION=pgsql
   DB_HOST=[Your Render DB host]
   DB_PORT=5432
   DB_DATABASE=[Your Render DB name]
   DB_USERNAME=[Your Render DB username]
   DB_PASSWORD=[Your Render DB password]
   
   # CORS for Netlify frontend
   FRONTEND_URL=https://refinedtech.netlify.app
   FRONTEND_PRODUCTION_URL=https://refinedtech.netlify.app
   SANCTUM_STATEFUL_DOMAINS=refinedtech.netlify.app
   
   # API Keys
   CLOUDINARY_CLOUD_NAME=dl8agrkhy
   CLOUDINARY_API_KEY=414229663554354
   CLOUDINARY_API_SECRET=Gm8r26s1LniZf4gNhopFo9pYcv4
   GEMINI_API_KEY=AIzaSyDZt46pe6-iwcMkhYlTACBuYPZjjZ-Pry8
   ```

### 5. Update Frontend Configuration
Update your frontend to point to the Render backend URL:

In your frontend `.env` or configuration:
```javascript
const API_BASE = 'https://your-render-app.onrender.com';
```

### 6. Deploy!
Click "Create Web Service" and Render will:
- Build your Docker container
- Deploy automatically
- Provide you with a URL like: `https://refinedtech-backend.onrender.com`

## 🔧 Production Optimizations

### Database Configuration
If using Render's managed PostgreSQL, you'll get a `DATABASE_URL`. You can either:
1. Use `DATABASE_URL` directly
2. Or parse it into individual components

### SSL & Security
- Render provides SSL certificates automatically
- Update `APP_URL` to your Render domain
- Ensure CORS is configured for your Netlify frontend

### Environment Variables You Need
```bash
# Required for Render
PORT=10000  # Render sets this automatically

# Laravel
APP_KEY=base64:P+40YZf+LJtTkJ5NpdSssVFFSIxdVwzCzsBdC3Tsoag=
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-render-app.onrender.com

# Database (from Render PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database
# OR individual components:
DB_CONNECTION=pgsql
DB_HOST=your-render-db-host
DB_PORT=5432
DB_DATABASE=your-render-db-name
DB_USERNAME=your-render-db-user
DB_PASSWORD=your-render-db-password

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=refinedtech.netlify.app
FRONTEND_URL=https://refinedtech.netlify.app

# API Keys (same as before)
CLOUDINARY_CLOUD_NAME=dl8agrkhy
CLOUDINARY_API_KEY=414229663554354
CLOUDINARY_API_SECRET=Gm8r26s1LniZf4gNhopFo9pYcv4
GEMINI_API_KEY=AIzaSyDZt46pe6-iwcMkhYlTACBuYPZjjZ-Pry8
```

## 🔍 Troubleshooting

### Common Issues:
1. **Build Fails**: Check Dockerfile.render path and syntax
2. **Database Connection**: Verify DATABASE_URL or individual DB credentials
3. **CORS Errors**: Ensure SANCTUM_STATEFUL_DOMAINS includes your Netlify domain
4. **502 Errors**: Check if app is binding to correct PORT (Render sets this)

### Logs:
- Check Render dashboard logs for deployment and runtime issues
- Use `php artisan migrate:status` to verify database connection

## 📱 Frontend Updates Needed

Update your frontend environment variables:
```javascript
// In your frontend .env or config
VITE_API_BASE=https://your-render-app.onrender.com
```

And ensure your API calls use the production URL:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-render-app.onrender.com';
```

## ✅ Verification Checklist

- [ ] PostgreSQL database created on Render
- [ ] Web service deployed successfully
- [ ] Environment variables configured
- [ ] Database migrations ran successfully
- [ ] API endpoints accessible from Netlify frontend
- [ ] CORS properly configured
- [ ] SSL certificate active