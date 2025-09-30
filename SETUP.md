# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set up PostgreSQL Database

#### Option A: Local PostgreSQL
Install PostgreSQL and create a database:
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb service_portal
```

#### Option B: Docker (Recommended for Development)
```bash
# Run PostgreSQL in Docker
docker run --name service-portal-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=service_portal \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud Database
Use a free PostgreSQL instance from:
- [Supabase](https://supabase.com) (Recommended)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

### Step 2: Configure Environment

Create `.env.local` file:
```bash
cat > .env.local << 'EOF'
# Database - Update with your actual database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/service_portal?schema=public"

# NextAuth - Generate a random secret with: openssl rand -base64 32
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
EOF
```

### Step 3: Initialize Database

```bash
# Push schema to database
npx prisma db push

# Seed with test data
npm run prisma:seed
```

You should see output like:
```
🌱 Starting seed...
✅ Created users
✅ Created products
🎉 Seed completed successfully!
```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Login

Use any of these test accounts:
- **user@bund.de** - Regular user (Employee)
- **it@bund.de** - IT Agent
- **manager@bund.de** - Approver
- **admin@bund.de** - Admin

Just enter the email - no password needed for MVP demo!

## 🎯 Quick Test Flow

### As a Regular User:
1. Login with `user@bund.de`
2. Browse the catalog
3. Add items to cart
4. Go to cart and submit order
5. View order status in "My Orders"

### As an IT Agent:
1. Login with `it@bund.de`
2. Go to Dashboard
3. See pending orders
4. Click "Update Status" on an order
5. Change status from NEW → IN_REVIEW
6. View order details

### As an Approver:
1. Login with `manager@bund.de`
2. Create an order with a chair (requires approval)
3. Logout and login as `user@bund.de`
4. Create another order with a chair
5. Login back as `manager@bund.de`
6. You'll see approval requests

## 🔧 Common Issues

### Database Connection Error
```
Error: Can't reach database server
```

**Solution:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env.local`
- Test connection: `psql $DATABASE_URL`

### Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Prisma Client Not Generated
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

### Seed Data Already Exists
```
Unique constraint failed on the fields: (`email`)
```

**Solution:** This is normal if you run seed multiple times. The script uses `upsert` so it's safe to run again.

### Missing Environment Variables
```
Error: NEXTAUTH_SECRET is not defined
```

**Solution:** Make sure `.env.local` exists and contains all required variables.

## 🎨 Customization

### Add Your Own Products
Edit `prisma/seed.ts` and add products to the array, then run:
```bash
npm run prisma:seed
```

### Change Status Colors
Edit `lib/workflow.ts` - look for `STATUS_COLORS`

### Modify Approval Rules
Edit `lib/workflow.ts` - look for `requiresApproval` function

### Add New Order Statuses
1. Update `prisma/schema.prisma` - add to `OrderStatus` enum
2. Update `lib/workflow.ts` - add to `ALLOWED_TRANSITIONS`
3. Run `npx prisma db push`

## 📊 Database Management

### View Data in Prisma Studio
```bash
npx prisma studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555)

### Reset Database
```bash
# Warning: This deletes all data!
npx prisma db push --force-reset
npm run prisma:seed
```

### Backup Database
```bash
pg_dump service_portal > backup.sql
```

### Restore Database
```bash
psql service_portal < backup.sql
```

## 🐳 Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: service_portal
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

## 📱 Access from Mobile/Other Devices

1. Find your local IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. Update `.env.local`:
```env
NEXTAUTH_URL="http://YOUR_IP:3000"
```

3. Access from other devices:
```
http://YOUR_IP:3000
```

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker
```bash
# Build
docker build -t service-portal .

# Run
docker run -p 3000:3000 --env-file .env.local service-portal
```

## 💡 Pro Tips

1. **Keep Prisma Studio Open** - Great for debugging data issues
2. **Use Different Browsers** - Test multiple roles simultaneously
3. **Check Console** - React DevTools + Network tab are your friends
4. **Hot Reload** - Just save files, no need to restart server
5. **Database URL** - Never commit `.env.local` to git!

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🆘 Need Help?

1. Check the main [README.md](./README.md)
2. Search existing issues on GitHub
3. Check browser console for errors
4. Review Prisma logs
5. Contact IT support

Happy coding! 🎉

