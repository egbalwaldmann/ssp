# 🚀 Getting Started

Welcome to the Self-Service Portal! This guide will help you get up and running in minutes.

## Quick Start (3 Steps)

### 1️⃣ Set Up Database

You need a PostgreSQL database. Choose one option:

#### Option A: Docker (Easiest)
```bash
docker run --name service-portal-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=service_portal \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Local PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb service_portal

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb service_portal
```

#### Option C: Cloud (Free Tier)
- [Supabase](https://supabase.com) - Recommended
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

### 2️⃣ Run Quick Start Script

```bash
./quickstart.sh
```

This will:
- Create `.env.local` with a secure secret
- Install dependencies
- Generate Prisma Client
- Offer to set up your database
- Seed test data

**Or do it manually:**
```bash
# Create .env.local (see .env.local.example)
npm install
npx prisma db push
npm run prisma:seed
```

### 3️⃣ Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Test Accounts

Just enter the email (no password needed for demo):

| Email | Role | Use Case |
|-------|------|----------|
| **user@bund.de** | Requester | Browse catalog, create orders |
| **it@bund.de** | IT Agent | Process orders, update status |
| **manager@bund.de** | Approver | Approve/reject orders |
| **admin@bund.de** | Admin | Full access |

## Try These Flows

### 🛒 Create Your First Order
1. Login as `user@bund.de`
2. Browse the catalog
3. Add items to cart (try the office chair - requires approval!)
4. Go to cart and submit order
5. View your order in "My Orders"

### 👨‍💼 Process Orders as Agent
1. Login as `it@bund.de`
2. Go to Dashboard
3. See pending orders
4. Click "Update Status" on an order
5. Change from NEW → IN_REVIEW

### ✅ Approve an Order
1. Login as `user@bund.de`
2. Add an office chair to cart (requires approval)
3. Add justification and submit
4. Logout and login as `manager@bund.de`
5. Go to Dashboard (or check orders)
6. Approve or reject the order

## Project Structure

```
📁 Self-Service Portal
├── 📄 README.md              ← Full documentation
├── 📄 SETUP.md               ← Detailed setup guide
├── 📄 PROJECT_SUMMARY.md     ← Feature overview
├── 📄 GETTING_STARTED.md     ← You are here!
│
├── 📁 app/                   ← Next.js pages and API
│   ├── (portal)/             ← Authenticated portal
│   │   ├── catalog/          ← Product catalog
│   │   ├── cart/             ← Shopping cart
│   │   ├── orders/           ← Order management
│   │   └── dashboard/        ← Agent dashboard
│   └── api/                  ← API routes
│
├── 📁 components/            ← React components
│   └── ui/                   ← shadcn/ui components
│
├── 📁 lib/                   ← Utilities and config
│   ├── auth.ts               ← NextAuth setup
│   ├── prisma.ts             ← Database client
│   ├── workflow.ts           ← Order workflow
│   └── store/                ← Zustand stores
│
├── 📁 prisma/                ← Database
│   ├── schema.prisma         ← Database schema
│   └── seed.ts               ← Test data
│
└── 📁 public/                ← Static files
    └── products/             ← Product images
```

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma studio              # Open database GUI
npx prisma db push             # Push schema changes
npm run prisma:seed            # Add test data
npx prisma generate            # Generate Prisma Client

# Reset everything
npx prisma db push --force-reset  # ⚠️ Deletes all data!
npm run prisma:seed            # Re-add test data
```

## Troubleshooting

### "Can't reach database server"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env.local`

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### "Prisma Client not initialized"
```bash
npx prisma generate
```

### Database already has data
That's fine! The seed script uses `upsert` so you can run it multiple times safely.

## What's Included?

✅ **15 Products** - IT equipment and office supplies
✅ **5 Test Users** - Different roles to test all features
✅ **Full Workflow** - From catalog to order completion
✅ **Real-time Updates** - See changes immediately
✅ **Responsive Design** - Works on mobile and desktop
✅ **Role-Based Access** - Different views for different users

## Need Help?

1. **Check the docs:**
   - [README.md](./README.md) - Complete documentation
   - [SETUP.md](./SETUP.md) - Detailed setup instructions
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Features and architecture

2. **Debug tools:**
   - Browser Console (F12)
   - React DevTools
   - Prisma Studio (`npx prisma studio`)

3. **Common issues:**
   - Database connection → Check `.env.local`
   - Missing data → Run `npm run prisma:seed`
   - Build errors → Delete `.next` and `node_modules`, reinstall

## What's Next?

### Explore the Features
- Browse the catalog with search and filters
- Create orders with different items
- Test the approval workflow
- Try the agent dashboard
- Add comments to orders

### Customize It
- Add your own products (edit `prisma/seed.ts`)
- Change status colors (`lib/workflow.ts`)
- Modify approval rules (`lib/workflow.ts`)
- Add product images (`public/products/`)

### Deploy It
- [Vercel](https://vercel.com) - Easiest (one-click deploy)
- [Railway](https://railway.app) - Includes database
- [Fly.io](https://fly.io) - More control
- Docker - See `SETUP.md` for instructions

## Key Features to Test

### Catalog
- ✅ Search products
- ✅ Filter by category
- ✅ Add to cart
- ✅ Product details

### Cart & Checkout
- ✅ Adjust quantities
- ✅ Remove items
- ✅ Add special requests
- ✅ Submit orders

### Order Tracking
- ✅ Visual timeline
- ✅ Status updates
- ✅ Comments
- ✅ Order details

### Dashboard (Agents Only)
- ✅ Statistics cards
- ✅ Pending orders queue
- ✅ Update status
- ✅ View all orders

### Approvals
- ✅ Items requiring approval
- ✅ Special request approval
- ✅ Approve/reject with comments

## Tips

💡 **Use different browsers** for testing multiple roles simultaneously

💡 **Keep Prisma Studio open** (`npx prisma studio`) for easy data inspection

💡 **Check the console** for API calls and errors

💡 **Hot reload works** - just save files to see changes

💡 **Cart persists** in localStorage between sessions

## Success!

You're all set! 🎉

Start by logging in as `user@bund.de` and exploring the catalog.

---

**Questions?** Check the other docs or open an issue on GitHub.

**Happy ordering!** 🛒

