# 🚀 SSP Operations Guide

## 🎯 Quick Commands

### **Health Checks**
```bash
# Quick health check (30 seconds)
./scripts/quick-health-check.sh

# Full monitoring with auto-redeploy (10 minutes)
./scripts/monitor-and-redeploy.sh
```

### **Database Monitoring**
```bash
# Check database health
export SUPABASE_ACCESS_TOKEN=sbp_cbdde3b1f039c215daafcb76ed18f8330279fe68
./supabase projects list --output json

# Check database performance
./supabase inspect db db-stats --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp

# Check table statistics
./supabase inspect db table-stats --db-url "postgresql://postgres:SjqeduVHvbbKPYoz@db.cybsvbhhsepzfoakbqsz.supabase.co:5432/postgres?sslmode=require" --workdir /tmp
```

### **Manual Redeploy**
```bash
# Create trigger file and push
echo "# Manual redeploy $(date)" > manual-redeploy-$(date +%s).txt
git add .
git commit -m "🚀 Manual redeploy triggered"
git push origin main
```

---

## 🚨 Emergency Procedures

### **When "Demo-Modus" Appears**
1. **Quick Check**: `./scripts/quick-health-check.sh`
2. **Check Database**: Verify Supabase connection
3. **Check Environment**: Verify AWS Amplify env vars
4. **Redeploy**: `./scripts/monitor-and-redeploy.sh`

### **When "0 Produkte" Shows**
1. **Check Products API**: `curl -s https://weilesgeht.de/api/products | jq '. | length'`
2. **Check Database**: Verify Product table has data
3. **Check Supabase**: Verify connection and permissions
4. **Redeploy**: If needed

### **When Orders Fail**
1. **Check Orders API**: `curl -s -X POST https://weilesgeht.de/api/orders -H "Content-Type: application/json" -d '{"test": "connection"}'`
2. **Check Database**: Verify Order table structure
3. **Check Authentication**: Verify NextAuth configuration
4. **Redeploy**: If needed

---

## 📊 Monitoring Dashboard

### **Key Metrics**
- **Database Status**: ACTIVE_HEALTHY ✅
- **Cache Hit Rate**: 94% index, 99% table ✅
- **API Response**: All endpoints responding ✅
- **Demo Mode**: Not detected ✅

### **Current Data**
- **Products**: 30 items
- **Users**: 5 accounts
- **Orders**: 9 orders
- **Database Size**: 10 MB (optimal)

---

## 🔧 Troubleshooting Matrix

| Issue | Symptom | Quick Fix | Full Fix |
|-------|---------|-----------|----------|
| Demo Mode | "Demo-Modus" badge | Check env vars | Redeploy |
| No Products | "0 Produkte" | Check API | Check DB + Redeploy |
| Order Fail | "Kostenstelle" error | Check validation | Fix API + Redeploy |
| 500 Error | Internal server error | Check logs | Full diagnosis + Redeploy |
| Slow Response | >5s load time | Check DB performance | Optimize + Redeploy |

---

## 🚀 Deployment Process

### **Automatic (Recommended)**
```bash
./scripts/monitor-and-redeploy.sh
```

### **Manual**
1. Make code changes
2. Commit and push
3. Wait 6 minutes for AWS Amplify
4. Verify with health check

### **Emergency**
1. Create trigger file
2. Push immediately
3. Monitor deployment
4. Verify functionality

---

## 📞 Support Escalation

### **Level 1: Quick Fix**
- Run health check scripts
- Check documentation
- Try manual redeploy

### **Level 2: Deep Dive**
- Check Supabase CLI diagnostics
- Review AWS Amplify logs
- Analyze database performance

### **Level 3: Emergency**
- Contact technical lead
- Escalate to Supabase support
- Consider rollback procedures

---

## 🎯 Success Criteria

### **Healthy System**
- ✅ All APIs responding (200/401)
- ✅ Database ACTIVE_HEALTHY
- ✅ No demo mode detected
- ✅ Products loading (30 items)
- ✅ Orders processing correctly

### **Performance Targets**
- ✅ API response < 2 seconds
- ✅ Database cache hit > 90%
- ✅ No blocking queries
- ✅ Build time < 6 minutes

---

*Last Updated: October 1, 2025*
*Version: 1.0*
