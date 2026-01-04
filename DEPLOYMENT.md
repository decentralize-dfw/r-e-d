# Deployment Guide - C2W2 Virtual Runway Premium Edition

This guide covers deploying your application to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Production build created (`npm run build`)

## Quick Deploy Options

### 1. Netlify (Recommended for Static Sites)

#### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Via Git Integration

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Deploy automatically on git push

#### netlify.toml Configuration

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Vercel

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
vercel --prod
```

#### Via Git Integration

1. Import your repository on Vercel
2. Framework preset will auto-detect Vite
3. Deploy automatically on git push

### 3. GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Important**: Update `vite.config.ts` with your base URL:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
});
```

### 4. AWS S3 + CloudFront

#### Setup S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-bucket-name

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html

# Upload dist folder
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

#### CloudFront Distribution

1. Create CloudFront distribution pointing to S3 bucket
2. Set default root object to `index.html`
3. Configure custom error responses (404 → /index.html)
4. Enable HTTPS
5. Set up custom domain (optional)

### 5. Docker Container

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

Build and run:

```bash
docker build -t c2w2-virtual-runway .
docker run -p 80:80 c2w2-virtual-runway
```

## Environment Variables

Create `.env.production` for production-specific settings:

```env
VITE_API_URL=https://api.production.com
VITE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_CDN_URL=https://cdn.production.com
```

## Performance Optimization

### Enable Compression

Most hosting platforms enable gzip/brotli automatically. Verify with:

```bash
curl -H "Accept-Encoding: gzip" -I https://your-domain.com
```

### CDN Configuration

- Set long cache times for `/assets/*` (1 year)
- Set short cache for `index.html` (no-cache)
- Enable HTTP/2 or HTTP/3
- Use edge locations close to users

### SSL/TLS

Always use HTTPS. Most platforms provide free SSL certificates:
- Netlify: Automatic Let's Encrypt
- Vercel: Automatic
- AWS: Use AWS Certificate Manager
- Cloudflare: Free SSL

## Monitoring

### Error Tracking

Integrate Sentry or similar:

```typescript
// Add to src/main.ts
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
});
```

### Analytics

Add Google Analytics or similar:

```typescript
// src/utils/analytics.ts
export const initAnalytics = () => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GA_ID);
  }
};
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## Post-Deployment Checklist

- [ ] Test all scenes and transitions
- [ ] Verify VR functionality (if applicable)
- [ ] Check performance with Lighthouse
- [ ] Test on multiple devices/browsers
- [ ] Verify all assets load correctly
- [ ] Check console for errors
- [ ] Test loading states
- [ ] Verify analytics tracking
- [ ] Test error boundaries
- [ ] Check security headers

## Rollback Plan

Always tag production deployments:

```bash
git tag v1.0.0
git push origin v1.0.0
```

To rollback:

```bash
git checkout v1.0.0
npm run build
# Deploy previous version
```

## Support

For deployment issues, check:
- Vite documentation: https://vitejs.dev/guide/static-deploy.html
- Platform-specific docs
- GitHub Issues for platform integrations

---

**Ready for Production!** 🚀
