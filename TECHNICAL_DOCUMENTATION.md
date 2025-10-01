# 🚀 SSP Technical Documentation & Operations Guide

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Health Monitoring](#database-health-monitoring)
3. [Deployment Process](#deployment-process)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [API Endpoints](#api-endpoints)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## 🏗️ System Architecture

### **Tech Stack**
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL (Pro Plan)
- **Authentication**: NextAuth.js
- **Deployment**: AWS Amplify
- **Styling**: Tailwind CSS + Shadcn/ui

### **Database Schema**
```sql
-- Core Tables
User (5 records) - User management
Product (30 records) - Product catalog
Order (9 records) - Order management
OrderItem (16 records) - Order line items
StatusHistory (12 records) - Order status tracking
Approval (2 records) - Approval workflow
Comment (0 records) - Order comments
Asset (0 records) - File attachments
```

### **Current Database Health**
- **Status**: ACTIVE_HEALTHY
- **Size**: 10 MB (optimal)
- **Cache Hit Rate**: 94% index, 99% table
- **Performance**: No blocking queries, no long-running queries

---

## 🔍 Database Health Monitoring

### **Supabase CLI Commands**

#### **Check Project Status**
```bash
export SUPABASE_ACCESS_TOKEN=sbp_cbdde3b1f039c215daafcb76ed18f8330279fe68
./supabase projects list --output json
```

#### **Database Statistics**
```bash
./supabase inspect db db-stats --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp
```

#### **Table Statistics**
```bash
./supabase inspect db table-stats --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp
```

#### **Performance Monitoring**
```bash
# Check for long-running queries
./supabase inspect db long-running-queries --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp

# Check for blocking queries
./supabase inspect db blocking --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp
```

### **Health Check Endpoints**
- **API Health**: `https://weilesgeht.de/api/health`
- **Products API**: `https://weilesgeht.de/api/products`
- **Orders API**: `https://weilesgeht.de/api/orders`

---

## 🚀 Deployment Process

### **AWS Amplify Configuration**
- **App ID**: `d2zig7giatoyll`
- **Domain**: `https://weilesgeht.de`
- **Region**: `eu-central-1`
- **Build Spec**: Custom Next.js configuration

### **Environment Variables**
```bash
AUTH_TRUST_HOST=true
DATABASE_URL=postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require
NEXTAUTH_CSRF_CHECK_ORIGIN=false
NEXTAUTH_DEBUG=true
NEXTAUTH_SECRET=X2m5mE8P3xR7Q1uK9nV4sT6bC0zL5yA8
NEXTAUTH_URL=https://weilesgeht.de
NEXTAUTH_URL_INTERNAL=https://weilesgeht.de
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YnN2Ymhoc2VwemZvYWticXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQzNDYsImV4cCI6MjA3NDg0MDM0Nn0.izE3NIBXDhx30OBknlk_4Ol3ZPLyuXhTzk0c4zrYP-I
NEXT_PUBLIC_SUPABASE_URL=https://cybsvbhhsepzfoakbqsz.supabase.co
```

### **Deployment Steps**
1. **Code Changes**: Commit and push to `main` branch
2. **Build Process**: AWS Amplify automatically builds
3. **Health Check**: Verify all endpoints are working
4. **Database Check**: Confirm Supabase connectivity
5. **User Testing**: Test critical user flows

---

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

#### **"Demo-Modus" Still Showing**
**Symptoms**: Site shows demo mode despite database connection
**Solution**: 
1. Check environment variables in AWS Amplify
2. Verify DATABASE_URL has correct password
3. Test API endpoints directly
4. Check Supabase project status

#### **"0 Produkte" in Catalog**
**Symptoms**: Product catalog shows no items
**Solution**:
1. Check `/api/products` endpoint
2. Verify Supabase connection
3. Check product table in database
4. Review API error logs

#### **"Kostenstelle ist erforderlich" Error**
**Symptoms**: Order submission fails with cost center error
**Solution**:
1. Verify cost center is passed in order data
2. Check client-side validation
3. Review API validation logic
4. Test with different browsers

#### **500 Internal Server Error**
**Symptoms**: API endpoints return 500 errors
**Solution**:
1. Check AWS Amplify build logs
2. Verify environment variables
3. Test database connectivity
4. Review API route implementations

### **Debug Commands**
```bash
# Check live site health
curl -s https://weilesgeht.de/api/health | jq

# Test products API
curl -s https://weilesgeht.de/api/products | jq '. | length'

# Test orders API
curl -s -X POST https://weilesgeht.de/api/orders -H "Content-Type: application/json" -d '{"test": "connection"}' | jq

# Check AWS Amplify status
aws amplify list-jobs --app-id d2zig7giatoyll --branch-name main --max-results 5
```

---

## 🌐 API Endpoints

### **Health & Status**
- `GET /api/health` - System health check
- `GET /api/products` - Product catalog
- `GET /api/orders` - User orders
- `POST /api/orders` - Create order

### **Order Management**
- `GET /api/orders/[id]` - Order details
- `PUT /api/orders/[id]/status` - Update order status
- `POST /api/orders/[id]/comments` - Add comment
- `POST /api/orders/[id]/approve` - Approve/reject order

### **Authentication**
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

---

## ⚙️ Environment Configuration

### **Local Development**
```bash
# .env.local
DATABASE_URL=postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=X2m5mE8P3xR7Q1uK9nV4sT6bC0zL5yA8
NEXT_PUBLIC_SUPABASE_URL=https://cybsvbhhsepzfoakbqsz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YnN2Ymhoc2VwemZvYWticXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQzNDYsImV4cCI6MjA3NDg0MDM0Nn0.izE3NIBXDhx30OBknlk_4Ol3ZPLyuXhTzk0c4zrYP-I
```

### **Production (AWS Amplify)**
All environment variables are configured in AWS Amplify console.

---

## 📊 Monitoring & Alerts

### **Key Metrics to Monitor**
1. **Database Health**: Cache hit rates, query performance
2. **API Response Times**: Health check, products, orders
3. **Error Rates**: 500 errors, failed requests
4. **User Activity**: Orders created, approvals processed

### **Automated Checks**
- Database connectivity every 5 minutes
- API endpoint health every 2 minutes
- Build status monitoring
- Error rate tracking

### **Alert Thresholds**
- Database cache hit rate < 90%
- API response time > 5 seconds
- Error rate > 5%
- Build failures

---

## 🚨 Emergency Procedures

### **Database Issues**
1. Check Supabase project status
2. Verify connection strings
3. Review database logs
4. Test with Supabase CLI

### **Deployment Issues**
1. Check AWS Amplify build logs
2. Verify environment variables
3. Test local build
4. Rollback if necessary

### **Performance Issues**
1. Check database performance metrics
2. Review API response times
3. Analyze error logs
4. Scale resources if needed

---

## 📞 Support Contacts

- **Supabase Support**: Dashboard → Support
- **AWS Amplify Support**: AWS Console → Support
- **Technical Lead**: egbal@waldmann.dev

---

*Last Updated: October 1, 2025*
*Version: 1.0*
