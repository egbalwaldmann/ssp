# Self-Service Portal MVP

A modern web application for IT equipment and office supplies ordering with automated approval workflows and real-time order tracking.

## 🚀 Features

### User Features
- **Product Catalog** - Browse IT equipment and office supplies with images and descriptions
- **Shopping Cart** - Add items, adjust quantities, and manage your cart
- **Order Submission** - Submit orders with automatic cost center assignment
- **Order Tracking** - Real-time status updates with visual timeline
- **Communication** - Comment system for order-related discussions
- **Order History** - View all your past and current orders

### Agent Features (IT Support / Reception)
- **Dashboard** - Overview of all orders with statistics
- **Order Management** - Process orders through workflow stages
- **Status Updates** - Update order status with notes
- **Queue Management** - View pending, in-review, and active orders

### Approver Features
- **Approval Workflow** - Review and approve/reject orders requiring approval
- **Justification Review** - View requester justifications for special items

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (simulates Azure AD/Entra ID)
- **State Management:** Zustand (for cart)
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form + Zod
- **API:** Next.js API routes (RESTful)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/service_portal?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up the database:**
```bash
# Push the schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed the database with test data
npm run prisma:seed
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Test Accounts

The seed script creates the following test accounts:

| Email | Role | Description |
|-------|------|-------------|
| user@bund.de | Requester | Regular employee - can browse catalog and create orders |
| it@bund.de | IT Agent | IT support - can process and manage orders |
| reception@bund.de | Reception Agent | Reception support - can process orders |
| manager@bund.de | Approver | Department manager - can approve/reject orders |
| admin@bund.de | Admin | System administrator - full access |

**Note:** For MVP demo purposes, you only need to enter the email address to log in (no password required).

## 📋 Order Workflow

### Status Flow

```
NEW → IN_REVIEW → PENDING_APPROVAL (if approval required) → APPROVED → 
ORDERED → IN_TRANSIT → READY_FOR_PICKUP → DELIVERED → COMPLETED
```

Alternative paths:
- `NEW/IN_REVIEW/PENDING_APPROVAL` → `REJECTED`
- Any status → `ON_HOLD` → `IN_REVIEW`
- `APPROVED/ORDERED` → `CANCELLED`

### Approval Requirements

Orders require approval when:
1. Cart contains products marked as requiring approval (e.g., Office Chairs)
2. Special requests are added in the checkout form

## 🗂️ Project Structure

```
app/
├── (portal)/               # Authenticated portal pages
│   ├── layout.tsx          # Portal layout with navigation
│   ├── catalog/            # Product catalog
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order history and details
│   └── dashboard/          # Agent dashboard
├── api/                    # API routes
│   ├── auth/               # NextAuth authentication
│   ├── products/           # Product endpoints
│   └── orders/             # Order endpoints
├── login/                  # Login page
└── layout.tsx              # Root layout

components/
├── ui/                     # shadcn/ui components
└── session-provider.tsx    # Auth session provider

lib/
├── auth.ts                 # NextAuth configuration
├── prisma.ts               # Prisma client
├── utils.ts                # Utility functions
├── workflow.ts             # Order workflow logic
└── store/
    └── cart-store.ts       # Zustand cart store

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seed script
```

## 🎨 Key Components

### Product Catalog
- Grid layout with product cards
- Category filtering
- Search functionality
- Add to cart functionality

### Shopping Cart
- Quantity management
- Special request field
- Justification field (for items requiring approval)
- Order summary with cost center

### Order Tracking
- Visual timeline of status changes
- Order items display
- Communication/comments section
- Order information sidebar

### Agent Dashboard
- Statistics cards (total, new, in review, etc.)
- Pending orders queue
- Status update dialog
- All orders overview

## 🔐 Role-Based Access Control

| Feature | Requester | Agent | Approver | Admin |
|---------|-----------|-------|----------|-------|
| Browse Catalog | ✅ | ✅ | ✅ | ✅ |
| Create Orders | ✅ | ✅ | ✅ | ✅ |
| View Own Orders | ✅ | ✅ | ✅ | ✅ |
| View All Orders | ❌ | ✅ | ❌ | ✅ |
| Update Status | ❌ | ✅ | ❌ | ✅ |
| Approve/Reject | ❌ | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ❌ | ✅ |

## 📊 Database Schema

### Main Models
- **User** - User accounts with roles and departments
- **Product** - Product catalog with categories
- **Order** - Orders with items, status, and workflow
- **OrderItem** - Individual items within orders
- **Comment** - Communication on orders
- **Approval** - Approval requests and decisions
- **StatusHistory** - Audit trail of status changes
- **Asset** - Linked assets for completed orders

### Enums
- **Role** - REQUESTER, IT_AGENT, RECEPTION_AGENT, APPROVER, ADMIN
- **Category** - Product categories (WEBCAM, HEADSET, MOUSE, etc.)
- **OrderStatus** - Order workflow statuses
- **ApprovalStatus** - PENDING, APPROVED, REJECTED

## 🚀 Deployment

### Database Migration
```bash
npx prisma migrate dev --name init
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Update `NEXTAUTH_URL` to your production URL
- Use a strong random string for `NEXTAUTH_SECRET`
- Ensure `DATABASE_URL` points to your production database

## 🔮 Future Enhancements

- [ ] Email notifications via SendGrid/Resend
- [ ] File upload for special requests
- [ ] Product packages/bundles
- [ ] Advanced search with Algolia
- [ ] Analytics dashboard
- [ ] Export orders to CSV
- [ ] Asset management integration
- [ ] Automated inventory tracking
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Integration with real Azure AD/Entra ID

## 📝 Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:seed      # Seed database with test data
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- Check database user permissions

### Authentication Issues
- Clear browser cookies and localStorage
- Verify `NEXTAUTH_SECRET` is set
- Check that seed data was created successfully

### Cart Not Persisting
- Cart uses localStorage - ensure it's not disabled
- Check browser console for errors

## 📄 License

This project is for demonstration purposes only.

## 👨‍💻 Development

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.

For questions or support, please contact your IT department.
# Trigger new build Wed Oct  1 01:40:16 CEST 2025
# Fix database connection Wed Oct  1 01:48:17 CEST 2025
# Force redeploy with hardcoded env vars Wed Oct  1 02:00:24 CEST 2025
