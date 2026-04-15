# Deployment Guide

**Version:** 0.0.2  
**Last Updated:** 2026-04-15

This guide covers deploying ClaudeKit Chat to various platforms. The application is built with Astro 6 using SSR mode and requires Node.js >=22.12.0 for native SQLite support.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Database Configuration](#database-configuration)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#option-1-vercel)
  - [Netlify](#option-2-netlify)
  - [Node.js Server](#option-3-nodejs-server-vpsdedicated)
  - [Docker](#option-4-docker-deployment)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

---

## Prerequisites

- Node.js >=22.12.0 (required for native SQLite support)
- npm or yarn
- Git

---

## Environment Setup

### Quick Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
# Required: PUBLIC_FIREPASS_API_KEY
# Optional: DATABASE_URL, other settings
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_FIREPASS_API_KEY` | Fireworks AI API key | `fw_...` |
| `PUBLIC_FIREPASS_MODEL` | Model identifier | `accounts/fireworks/routers/kimi-k2p5-turbo` |
| `PUBLIC_FIREPASS_BASE_URL` | API endpoint | `https://api.fireworks.ai/inference/v1` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite://./data/chat.db` | Database connection string |
| `MAX_SESSIONS` | 100 | Maximum concurrent sessions |
| `MESSAGE_PAGE_SIZE` | 50 | Message pagination size |
| `ENABLE_TOOLS` | true | Enable tool execution |
| `ENABLE_STREAMING` | true | Enable SSE streaming |

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:4321
```

---

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

```
dist/
├── server/
│   └── entry.mjs          # Node.js server entry
├── client/
│   └── _astro/            # Static assets
└── prerendered/           # Static pages
```

### Build Output
```
dist/
├── server/
│   └── entry.mjs          # Node.js server entry
├── client/
│   ├── _astro/            # Static assets
│   └── ...                # Client-side JS/CSS
└── prerendered/           # Static pages (if any)
```

---

## Database Configuration

### Option 1: SQLite (Default - Recommended for Local/Small Deploys)

**Pros:**
- Zero setup required
- Native Node.js support (node:sqlite)
- Single file, easy backup
- No external dependencies

**Cons:**
- Single-node only (no replication)
- Limited concurrency
- Not suitable for high-traffic

**Setup:**
```bash
# Environment variable
DATABASE_URL=sqlite://./data/chat.db

# Create data directory
mkdir -p data

# Database auto-initializes on first run
```

**Production Considerations:**
- Mount data directory as persistent volume
- Regular backups of .db file
- WAL mode enabled for better concurrency

**Docker Volume:**
```yaml
# docker-compose.yml
volumes:
  - ./data:/app/data
```

### Option 2: PostgreSQL (Recommended for Production)

**Pros:**
- Horizontal scaling
- Connection pooling
- ACID compliance
- Backup/restore tools

**Cons:**
- Requires separate database server
- Additional configuration

**Setup:**
```bash
# In .env
DATABASE_URL=postgresql://username:password@hostname:5432/database

# The application uses Drizzle ORM pattern
# Tables auto-create on first run
```

**Migration (if needed in future):**
```bash
# Install Drizzle Kit
npm install -D drizzle-kit

# Run migrations
npx drizzle-kit push:pg
```

### Database Schema
```sql
-- ChatSession table
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  model TEXT
);

-- Message table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  tool_calls TEXT,
  tool_results TEXT,
  is_complete INTEGER,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server/entry.mjs",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "dist/server/entry.mjs" }
  ]
}
```

**Environment Variables:**
Set in Vercel dashboard:
- `PUBLIC_FIREPASS_API_KEY`
- `PUBLIC_FIREPASS_MODEL`
- `PUBLIC_FIREPASS_BASE_URL`
- `DATABASE_URL` (use Vercel Postgres or Neon)

**Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Notes:**
- SQLite not recommended (ephemeral filesystem)
- Use Vercel Postgres or external PostgreSQL
- Serverless functions may have cold starts

### Option 2: Netlify

**Configuration:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist/client"
  functions = "dist/server"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/entry"
  status = 200
```

**Adapter Change:**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  // ...
});
```

**Deploy:**
```bash
# Install adapter
npm install @astrojs/netlify

# Build and deploy
npm run build
netlify deploy --prod
```

**Notes:**
- Requires @astrojs/netlify adapter
- Use Netlify Functions for SSR
- Database limitations similar to Vercel

### Option 3: Node.js Server (VPS/Dedicated)

**Recommended for:**
- Production workloads
- SQLite usage
- Full control over environment

**Setup:**
```bash
# On server
# 1. Install Node.js 22.12.0+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone and build
git clone <repo-url>
cd claudekit-chatbot-astro
npm install
npm run build

# 3. Setup environment
cp .env.example .env
nano .env

# 4. Create data directory for SQLite
mkdir -p data

# 5. Start with PM2
npm install -g pm2
pm2 start dist/server/entry.mjs --name claudekit
pm2 save
pm2 startup
```

**Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Docker Option:**
```dockerfile
# Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  app:
    build: .
    ports:
      - "4321:4321"
    environment:
      - PUBLIC_FIREPASS_API_KEY=${PUBLIC_FIREPASS_API_KEY}
      - DATABASE_URL=sqlite://./data/chat.db
    volumes:
      - ./data:/app/data
```

### Option 4: Docker Deployment

**Build Image:**
```bash
docker build -t claudekit-chatbot .
```

**Run Container:**
```bash
docker run -d \
  -p 4321:4321 \
  -e PUBLIC_FIREPASS_API_KEY=your_key \
  -e DATABASE_URL=sqlite://./data/chat.db \
  -v $(pwd)/data:/app/data \
  --name claudekit \
  claudekit-chatbot
```

**Docker Compose with PostgreSQL:**
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "4321:4321"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/claudekit
      - PUBLIC_FIREPASS_API_KEY=${PUBLIC_FIREPASS_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=claudekit
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Health Checks

### Endpoint
```
GET /api/health
```

### Response
```json
{
  "status": "ok",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "checks": {
    "api": "ok",
    "env.firepassKey": "ok",
    "env.firepassModel": "ok",
    "env.firepassUrl": "ok"
  }
}
```

### Monitoring Setup
```bash
# Curl health check
curl -f http://localhost:4321/api/health || echo "Health check failed"
```

---

## Troubleshooting

### Issue: Database connection fails
**Symptoms:** Sessions not persisting

**Solution:**
```bash
# Check database URL format
# SQLite: sqlite://./data/chat.db
# PostgreSQL: postgresql://user:pass@host:5432/db

# Verify data directory exists (SQLite)
mkdir -p data

# Check permissions
ls -la data/
```

### Issue: Firepass API errors
**Symptoms:** Chat returns errors

**Solution:**
```bash
# Test API connection
curl -X POST http://localhost:4321/api/test-firepass-api-connection

# Verify environment variables
echo $PUBLIC_FIREPASS_API_KEY
echo $PUBLIC_FIREPASS_MODEL
```

### Issue: Build fails
**Symptoms:** npm run build errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install

# Check Node version
node --version  # Should be >=22.12.0

# Run type check
npx astro check
```

### Issue: Port already in use
**Symptoms:** EADDRINUSE error

**Solution:**
```bash
# Find process using port 4321
lsof -i :4321

# Kill process or change port
PORT=3000 npm run preview
```

---

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
ls -lh dist/client/_astro/
```

### Recommended Optimizations
1. **Enable gzip** on reverse proxy
2. **Use CDN** for static assets
3. **Enable caching** for API responses (when appropriate)
4. **Database indexing** (already implemented)

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log viewing
pm2 logs claudekit

# Resource usage
pm2 describe claudekit
```

---

## GitHub Actions CI/CD (Optional)

### Example Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          PUBLIC_FIREPASS_API_KEY: ${{ secrets.FIREPASS_API_KEY }}
```

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables not committed to git (use `.env.example` only)
- [ ] `PUBLIC_FIREPASS_API_KEY` is kept secret
- [ ] DATABASE_URL uses strong password (if using PostgreSQL)
- [ ] HTTPS enabled in production
- [ ] Security headers configured
- [ ] Rate limiting enabled (Phase 4)
- [ ] Input validation active (Phase 4)
- [ ] Regular dependency updates (`npm audit`)
- [ ] Health check endpoint monitored

---

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Environment Setup](#environment-setup)
3. Open an [issue](../../issues) with error details

