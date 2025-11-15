# Architecture Overview

## 🏗️ Current Architecture (Localhost)

```
┌─────────────────┐
│  Android Device │
│   (BP Sensor)   │
└────────┬────────┘
         │ HTTP POST
         │ http://localhost:3000/api/data
         ↓
┌─────────────────┐
│  Express Server │
│  (Your Mac)     │
│  Port: 3000     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MongoDB Atlas  │
│     (Cloud)     │
└─────────────────┘
```

**Limitations:**
- ❌ Only works on same WiFi network
- ❌ Can't access from outside
- ❌ Requires your Mac to be running
- ❌ No scalability

---

## 🚀 New Architecture (AWS API Gateway)

```
┌─────────────────┐
│  Android Device │
│  (Any Location) │
└────────┬────────┘
         │ HTTPS POST
         │ https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/data
         ↓
┌─────────────────────────────────────┐
│         AWS API Gateway             │
│  - Public HTTPS endpoint            │
│  - CORS enabled                     │
│  - Authentication (optional)        │
│  - Rate limiting                    │
└────────┬────────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│          AWS Lambda                │
│  ┌──────────────────────────────┐ │
│  │  bp-handler.js               │ │
│  │  - Parse BP data             │ │
│  │  - Validate format           │ │
│  │  - Save to MongoDB           │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  spo2-handler.js             │ │
│  │  - Parse SpO2 data           │ │
│  │  - Update session            │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  temp-handler.js             │ │
│  │  - Parse temperature         │ │
│  │  - Save to database          │ │
│  └──────────────────────────────┘ │
└────────┬───────────────────────────┘
         │
         ↓
┌─────────────────┐
│  MongoDB Atlas  │
│     (Cloud)     │
│  - Vitals data  │
│  - Sessions     │
└─────────────────┘
```

**Benefits:**
- ✅ Access from anywhere in the world
- ✅ Auto-scaling (handles 1000s of devices)
- ✅ HTTPS (secure connection)
- ✅ 99.9% uptime
- ✅ No server maintenance
- ✅ Pay only for what you use

---

## 📊 Data Flow

### **1. Android Device Sends Blood Pressure**

```
Android App
    ↓ POST Request
{
  "value": "Result: 120 / 80, BPM : 72"
}
    ↓
API Gateway
    ↓ Trigger
Lambda (bp-handler.js)
    ↓ Parse & Extract
systolic: 120
diastolic: 80
heartRate: 72
    ↓ Save
MongoDB (parameters collection)
    ↓ Response
{
  "success": true,
  "message": "BP data received"
}
```

### **2. Android Device Sends SpO2**

```
Android App
    ↓ POST Request
{
  "value": "SpO2 : 98%, BPM : 75"
}
    ↓
API Gateway
    ↓ Trigger
Lambda (spo2-handler.js)
    ↓ Parse & Extract
oxygenLevel: 98
heartRate: 75
    ↓ Update
MongoDB (latest session)
    ↓ Response
{
  "success": true,
  "message": "SpO2 data received"
}
```

### **3. Android Device Sends Temperature**

```
Android App
    ↓ POST Request
{
  "value": "37.5°C"
}
    ↓
API Gateway
    ↓ Trigger
Lambda (temp-handler.js)
    ↓ Parse & Extract
temperature: 37.5
    ↓ Update
MongoDB (latest session)
    ↓ Response
{
  "success": true,
  "message": "Temperature data received"
}
```

---

## 🔐 Security Features

```
┌─────────────────┐
│  Android Device │
└────────┬────────┘
         │ HTTPS (encrypted)
         ↓
┌─────────────────┐
│  API Gateway    │
│  ├─ CORS        │ ← Only allowed origins
│  ├─ Throttling  │ ← Rate limiting (prevent abuse)
│  └─ API Keys    │ ← Optional authentication
└────────┬────────┘
         │ Secure VPC (optional)
         ↓
┌─────────────────┐
│  Lambda         │
│  ├─ IAM Roles   │ ← Minimum permissions
│  └─ Env Vars    │ ← Encrypted credentials
└────────┬────────┘
         │ Connection string (encrypted)
         ↓
┌─────────────────┐
│  MongoDB Atlas  │
│  ├─ IP Whitelist│ ← Optional
│  ├─ User Auth   │ ← Database credentials
│  └─ Encryption  │ ← At rest & in transit
└─────────────────┘
```

---

## 💰 Cost Breakdown

### **Scenario: Hospital with 100 devices**

**Assumptions:**
- 100 Android devices
- 10 readings per day per device
- 30 days per month

**Total Requests:**
```
100 devices × 10 readings × 3 endpoints × 30 days
= 90,000 requests/month
```

**Costs:**
- **API Gateway**: 90,000 requests = $0.32/month
- **Lambda**: 90,000 invocations = $0.02/month
- **Lambda Compute**: ~100ms × 512MB = $0.01/month
- **MongoDB Atlas**: Free tier (up to 512MB)

**Total: ~$0.35/month** (basically free!)

### **Scenario: Multiple Hospitals (1000 devices)**

**Total Requests:**
```
1,000 devices × 10 readings × 3 endpoints × 30 days
= 900,000 requests/month
```

**Costs:**
- **API Gateway**: $3.15/month
- **Lambda**: $0.18/month
- **Lambda Compute**: $0.10/month
- **MongoDB Atlas**: ~$57/month (M10 cluster)

**Total: ~$60/month**

---

## 🚦 Comparison

| Feature | Localhost | AWS API Gateway |
|---------|-----------|-----------------|
| **Accessibility** | Same network only | Global access |
| **Cost** | Free (your Mac) | ~$0.35-60/month |
| **Scalability** | 1-10 devices | Unlimited |
| **Uptime** | When Mac is on | 99.9% |
| **Security** | Local network | HTTPS, IAM, etc |
| **Maintenance** | Manual | Fully managed |
| **Speed** | Fast (local) | ~100-300ms |
| **Setup Time** | 5 minutes | 15 minutes |

---

## 🎯 Decision Matrix

**Use Localhost if:**
- ✅ Single kiosk setup
- ✅ All devices on same WiFi
- ✅ Development/testing phase
- ✅ Budget constraints

**Use AWS API Gateway if:**
- ✅ Multiple locations
- ✅ Remote access needed
- ✅ Production deployment
- ✅ Need high availability
- ✅ 10+ devices

---

## 📈 Migration Path

```
Phase 1: Development (Now)
├─ Use localhost
├─ Build features
└─ Test with dummy data

Phase 2: Local Network (Week 2)
├─ Change to local IP (192.168.x.x)
├─ Test with real devices
└─ Same building access

Phase 3: Cloud Deployment (Week 3)
├─ Deploy to AWS
├─ Test with ngrok first (optional)
└─ Update Android apps

Phase 4: Production (Week 4)
├─ Add authentication
├─ Set up monitoring
├─ Configure alerts
└─ Scale as needed
```

---

**You're now ready to deploy to AWS! 🚀**

Follow the `QUICK_START.md` guide to get started in 15 minutes.
