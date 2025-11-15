# ⚡ Quick Reference Card

## 🚀 Deployment Commands

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production  
npm run deploy:prod

# View deployment info
serverless info

# View logs (real-time)
npm run logs

# Test locally (before deploying)
npm run offline

# Remove deployment
serverless remove
```

---

## 📱 Android API Calls

### Blood Pressure
```kotlin
POST {BASE_URL}/api/data
Body: {"value": "Result: 120 / 80, BPM : 72"}
```

### SpO2
```kotlin
POST {BASE_URL}/api/spo2
Body: {"value": "SpO2 : 98%, BPM : 75"}
```

### Temperature
```kotlin
POST {BASE_URL}/api/temp
Body: {"value": "37.5°C"}
```

---

## 🔍 Debugging

```bash
# View BP handler logs
serverless logs -f bpHandler --tail

# View SpO2 handler logs
serverless logs -f spo2Handler --tail

# View Temperature handler logs
serverless logs -f tempHandler --tail

# Test API endpoints
./test-api.sh YOUR_API_URL
```

---

## 📊 AWS Console URLs

- **Lambda**: https://console.aws.amazon.com/lambda/
- **API Gateway**: https://console.aws.amazon.com/apigateway/
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch/
- **Billing**: https://console.aws.amazon.com/billing/

---

## 💰 Cost Estimates

| Requests/Month | Cost |
|---------------|------|
| 10,000 | ~$0.10 |
| 100,000 | ~$0.35 |
| 1,000,000 | ~$4.00 |

---

## ⚠️ Important Notes

1. **API URL Format**: `https://abc123.execute-api.REGION.amazonaws.com/STAGE/`
2. **Always include `/dev/` or `/prod/` at the end**
3. **CORS is enabled** for all origins (`*`)
4. **MongoDB connection** is cached across invocations
5. **Free tier**: 1M Lambda requests/month

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| "Access Denied" | Check IAM permissions |
| "Cannot connect" | Verify API URL, check CORS |
| "MongoDB timeout" | Allow 0.0.0.0/0 in Atlas |
| "High costs" | Check CloudWatch metrics |

---

## 📞 Quick Links

- **Documentation**: `README.md`
- **Quick Start**: `QUICK_START.md`
- **Detailed Guide**: `AWS_DEPLOYMENT_GUIDE.md`
- **Architecture**: `ARCHITECTURE.md`
- **Android Code**: `ANDROID_INTEGRATION.kt`

---

## 🎯 Workflow

```
1. Code changes → 2. Deploy → 3. Test → 4. Monitor → 5. Repeat
```

---

**Keep this card handy for quick reference! 📌**
