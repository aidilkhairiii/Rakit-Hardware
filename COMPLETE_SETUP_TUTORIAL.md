# 🚀 Complete Setup Guide - Tutorial Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HTML Tutorial Interface (localhost:3000)                       │
│  ├─ Blood Pressure Video                                        │
│  ├─ SpO₂ Video                                                  │
│  └─ Temperature Video                                           │
│                                                                 │
│     ↓ Test buttons send to localhost                           │
│     ↓ Real-time polling from /api/latest                       │
│                                                                 │
│  server.js (Your Mac - Port 3000) ← TUTORIAL USES THIS         │
│  ├─ Receives data from HTML interface                          │
│  ├─ Receives data from Lambda (forwarded)                      │
│  ├─ Processes all data                                         │
│  ├─ Writes to MongoDB                                          │
│  └─ Provides /api/latest for real-time updates                 │
│                                                                 │
│     ↓ Saves to database                                        │
│                                                                 │
│  MongoDB Atlas                                                  │
│  └─ Single source of truth                                     │
│                                                                 │
│     ↑ Also receives from                                       │
│                                                                 │
│  ngrok Tunnel (https://abc123.ngrok.io)                        │
│  └─ Exposes localhost:3000 to internet                         │
│                                                                 │
│     ↑ Forwards data from                                       │
│                                                                 │
│  AWS Lambda (API Gateway)                                       │
│  ├─ bp-handler: Forwards BP data                               │
│  ├─ spo2-handler: Forwards SpO₂ data                           │
│  └─ temp-handler: Forwards Temperature data                    │
│                                                                 │
│     ↑ Receives data from                                       │
│                                                                 │
│  Android Devices (Anywhere in the world)                       │
│  └─ Physical hardware sensors                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start (5 Minutes)

### **Option 1: Test Locally (No Deployment Needed)**

**Perfect for trying the HTML tutorial interface!**

```bash
# 1. Navigate to project
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware

# 2. Start server
node server.js

# 3. Open browser
open http://localhost:3000

# 4. Click "Send Test Data" buttons
# Watch the tutorial videos transition automatically!
```

**That's it!** HTML interface works perfectly with just server.js running locally.

---

### **Option 2: Full Setup (Android + Lambda)**

**For global Android device access:**

```bash
# 1. Start server.js
node server.js

# 2. In NEW terminal, start ngrok
ngrok http 3000
# Copy URL: https://abc123.ngrok.io

# 3. In NEW terminal, deploy Lambda
export SERVER_URL=https://abc123.ngrok.io
npm run deploy:dev

# 4. Test from Android
# Use URL: https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/
```

---

## 📋 Detailed Setup Instructions

### **Prerequisites**

- ✅ Node.js installed
- ✅ MongoDB Atlas account (free)
- ✅ AWS account (for Lambda deployment)
- ✅ ngrok account (free) - only for global access

### **Step 1: Install Dependencies**

```bash
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware
npm install
```

**What this installs:**
- express (web server)
- mongoose (MongoDB driver)
- axios (HTTP client for Lambda)
- body-parser (parse request bodies)
- dotenv (environment variables)
- serverless (AWS deployment)

### **Step 2: Configure Environment**

**Create/verify `.env` file:**

```env
MONGO_URI=mongodb+srv://user:7766Aidil@rakit.jf0s9dt.mongodb.net/?retryWrites=true&w=majority&appName=RAKIT
PORT=3000
```

**Test MongoDB connection:**

```bash
node server.js
```

**Expected output:**
```
✅ Server running on http://localhost:3000
✅ MongoDB connected
🤝 Hardware interface ready for iframe embedding
```

---

## 🎓 Using the Tutorial Interface

### **Start the Tutorial**

```bash
# 1. Make sure server is running
node server.js

# 2. Open browser
open http://localhost:3000
```

### **Tutorial Flow**

**Step 1: Blood Pressure**
1. Watch the BP measurement video tutorial
2. Click "Send Test Data" button
3. Data: `Result: 120 / 80, BPM : 72`
4. ✅ Automatically advances to SpO₂

**Step 2: SpO₂ (Oxygen Level)**
1. Watch the SpO₂ measurement video tutorial
2. Click "Send Test Data" button  
3. Data: `SpO2 : 98%, BPM : 75`
4. ✅ Automatically advances to Temperature

**Step 3: Temperature**
1. Watch the temperature measurement video tutorial
2. Click "Send Test Data" button
3. Data: `Temp : 37.5°C`
4. ✅ Shows final summary

**Step 4: Final Results**
- See all measurements together
- Blood Pressure: 120/80
- Heart Rate: 72 BPM
- Oxygen Level: 98%
- Temperature: 37.5°C

### **Real-time Updates**

The interface polls `/api/latest` every second:

```javascript
// Automatic polling in index.html
setInterval(() => {
  fetch('/api/latest')
    .then(res => res.json())
    .then(data => {
      // Update UI with latest data
      // Transition videos automatically
    });
}, 1000);
```

**This is why server.js MUST be running for the tutorial!**

---

## 🌐 Adding Android Device Support

### **Why This Architecture?**

**Problem:** Android devices might not be on same WiFi as your Mac

**Solution:** 
1. Android sends data to AWS Lambda (accessible globally)
2. Lambda forwards data to server.js (via ngrok tunnel)
3. server.js processes and saves to MongoDB
4. HTML interface shows updates in real-time

### **Setup ngrok (5 minutes)**

**1. Install ngrok:**

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

**2. Create free account:**

Visit: https://dashboard.ngrok.com/signup

**3. Get auth token:**

Visit: https://dashboard.ngrok.com/get-started/your-authtoken

**4. Authenticate:**

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**5. Start tunnel:**

```bash
# In a NEW terminal (keep server.js running)
ngrok http 3000
```

**Expected output:**

```
ngrok                                                           
                                                                
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
                                                                
Connections  ttl     opn     rt1     rt5     p50     p90        
             0       0       0.00    0.00    0.00    0.00       
```

**✅ Copy the forwarding URL:** `https://abc123.ngrok.io`

### **Deploy Lambda Functions**

**1. Set SERVER_URL:**

```bash
export SERVER_URL=https://abc123.ngrok.io
```

**2. Deploy:**

```bash
npm run deploy:dev
```

**Expected output:**

```
✔ Service deployed to stack rakit-hardware-api-dev

endpoints:
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/spo2
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/temp
```

**3. Test:**

```bash
curl -X POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'
```

**Check server.js logs:**

```
🩺 Received BP: Result: 120 / 80, BPM : 72
✅ Updated BP & SpO₂ for session abc123
```

---

## 📱 Android App Configuration

**Use this in your Android app:**

```kotlin
object ApiConfig {
    // AWS API Gateway URL (Global Access)
    private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
    
    fun getApiService(): ApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
        
        return retrofit.create(ApiService::class.java)
    }
}

interface ApiService {
    @POST("api/data")
    suspend fun sendBPData(@Body data: Map<String, String>): Response<ApiResponse>
    
    @POST("api/spo2")
    suspend fun sendSpO2Data(@Body data: Map<String, String>): Response<ApiResponse>
    
    @POST("api/temp")
    suspend fun sendTempData(@Body data: Map<String, String>): Response<ApiResponse>
}

data class ApiResponse(
    val success: Boolean,
    val message: String
)
```

**Send data:**

```kotlin
// Blood Pressure
val bpData = mapOf("value" to "Result: 120 / 80, BPM : 72")
val response = ApiConfig.getApiService().sendBPData(bpData)

// SpO₂
val spo2Data = mapOf("value" to "SpO2 : 98%, BPM : 75")
val response = ApiConfig.getApiService().sendSpO2Data(spo2Data)

// Temperature
val tempData = mapOf("value" to "37.5°C")
val response = ApiConfig.getApiService().sendTempData(tempData)
```

---

## 🔍 Monitoring & Debugging

### **Monitor All Three Services**

**Terminal 1: server.js**
```bash
node server.js
```

**Logs:**
```
🩺 Received BP: Result: 120 / 80, BPM : 72
🫁 Received SpO₂: SpO2 : 98%, BPM : 75
🌡️ Received Temperature: 37.5°C
✅ Updated BP & SpO₂ for session abc123
```

**Terminal 2: ngrok**
```bash
ngrok http 3000
```

**View traffic:** http://127.0.0.1:4040

**Terminal 3: Lambda Logs**
```bash
serverless logs -f bpHandler --tail
```

**Logs:**
```
🩺 Lambda received BP: Result: 120 / 80, BPM : 72
📤 Forwarding to server.js: https://abc123.ngrok.io/api/data
✅ Server.js response: { success: true }
```

### **ngrok Web Dashboard**

Open: http://127.0.0.1:4040

**Features:**
- 📊 See all HTTP requests in real-time
- 🔍 Inspect request/response bodies
- ⏱️ View timing information
- 🔄 Replay requests
- 🐛 Perfect for debugging!

---

## 🧪 Testing Scenarios

### **Scenario 1: HTML Tutorial Only**

```bash
# Start server
node server.js

# Open browser
open http://localhost:3000

# Test tutorial flow
# ✅ All features work
# ✅ Real-time updates
# ✅ Video transitions
```

### **Scenario 2: Android → Lambda → server.js**

```bash
# Terminal 1: Start server
node server.js

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Deploy Lambda
export SERVER_URL=https://abc123.ngrok.io
npm run deploy:dev

# Test with curl or Android device
curl -X POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'

# ✅ Data flows: Android → Lambda → ngrok → server.js → MongoDB
```

### **Scenario 3: Both Running Simultaneously**

```bash
# server.js + ngrok + Lambda all running

# Browser: HTML interface at localhost:3000
# Android: Sends to AWS Lambda
# Both write to same MongoDB!

# ✅ Perfect for demonstrations
```

---

## 🆘 Common Issues & Solutions

### **Issue 1: "Cannot connect to MongoDB"**

**Error:**
```
❌ MongoDB connection error: MongooseError
```

**Solutions:**

1. **Check .env file:**
   ```bash
   cat .env
   # Should show MONGO_URI=mongodb+srv://...
   ```

2. **Test connection string:**
   ```bash
   # In mongo shell or MongoDB Compass
   # Use connection string from .env
   ```

3. **Check MongoDB Atlas:**
   - Network Access: Add 0.0.0.0/0 (allow all IPs)
   - Database Access: Check user credentials

### **Issue 2: Lambda can't reach server.js**

**Error in Lambda logs:**
```
❌ Error forwarding to server.js: connect ECONNREFUSED
```

**Solutions:**

1. **Verify server.js is running:**
   ```bash
   curl http://localhost:3000/api/latest
   # Should return JSON
   ```

2. **Verify ngrok is running:**
   ```bash
   curl https://abc123.ngrok.io/api/latest
   # Should return same JSON
   ```

3. **Check SERVER_URL in Lambda:**
   ```bash
   serverless info --verbose
   # Check environment.SERVER_URL
   ```

4. **Re-deploy with correct URL:**
   ```bash
   export SERVER_URL=https://NEW_URL.ngrok.io
   npm run deploy:dev
   ```

### **Issue 3: ngrok URL changed**

**Problem:** ngrok URL changes every restart (free tier)

**Solution 1: Re-deploy Lambda**
```bash
# Get new ngrok URL
ngrok http 3000

# Re-deploy
export SERVER_URL=https://NEW_URL.ngrok.io
npm run deploy:dev
```

**Solution 2: Use ngrok Paid ($8/month)**
```bash
# Get static domain
# Never changes!
```

**Solution 3: Deploy server.js to Cloud**
```bash
# Heroku, Railway, Render, etc.
# Get permanent URL
```

### **Issue 4: HTML interface not updating**

**Problem:** Tutorial doesn't advance automatically

**Check:**

1. **server.js running:**
   ```bash
   curl http://localhost:3000/api/latest
   ```

2. **Browser console (F12):**
   ```
   # Should see polling requests
   GET /api/latest 200 OK
   ```

3. **Test send button:**
   ```javascript
   // Should see in server.js logs:
   🩺 Received BP: Result: 120 / 80, BPM : 72
   ```

---

## 💰 Cost Breakdown

| Component | Free Tier | Typical Usage | Cost |
|-----------|-----------|---------------|------|
| **AWS Lambda** | 1M requests/month | 1000 req/month | $0 |
| **API Gateway** | 1M requests/month | 1000 req/month | $0 |
| **MongoDB Atlas** | 512MB storage | <100MB | $0 |
| **ngrok Free** | 40 conn/min | Light testing | $0 |
| **ngrok Paid** | Static domain | Production | $8/month |
| **Total (Dev)** | - | - | **$0/month** |
| **Total (Prod)** | - | - | **$8/month** |

---

## 🚀 Production Deployment

### **Option 1: Deploy server.js to Heroku**

```bash
# 1. Create Heroku app
heroku create rakit-hardware

# 2. Add MongoDB URI
heroku config:set MONGO_URI=mongodb+srv://...

# 3. Deploy
git push heroku main

# 4. Get URL
heroku info
# URL: https://rakit-hardware.herokuapp.com

# 5. Update Lambda
export SERVER_URL=https://rakit-hardware.herokuapp.com
npm run deploy:dev
```

### **Option 2: Deploy to Railway**

```bash
# 1. Connect GitHub repo to Railway
# 2. Add environment variables
# 3. Deploy automatically
# 4. Get URL: https://rakit-hardware.railway.app
# 5. Update Lambda SERVER_URL
```

### **Option 3: AWS EC2**

```bash
# 1. Create EC2 instance
# 2. Install Node.js
# 3. Upload server.js
# 4. Install PM2: npm install -g pm2
# 5. Run: pm2 start server.js
# 6. Get public IP: http://12.34.56.78:3000
# 7. Update Lambda SERVER_URL
```

---

## ✅ Final Checklist

### **Local Development:**
- [ ] server.js runs successfully
- [ ] MongoDB connects successfully
- [ ] HTML interface opens at localhost:3000
- [ ] Test buttons send data
- [ ] Real-time updates work
- [ ] Tutorial flow transitions automatically

### **Global Access (Optional):**
- [ ] ngrok installed and authenticated
- [ ] ngrok tunnel active (ngrok http 3000)
- [ ] SERVER_URL environment variable set
- [ ] Lambda functions deployed
- [ ] Test curl request works
- [ ] server.js receives Lambda data
- [ ] Android app configured with AWS URL

### **Production (Optional):**
- [ ] server.js deployed to cloud service
- [ ] Permanent URL obtained
- [ ] Lambda re-deployed with production URL
- [ ] Android app tested
- [ ] MongoDB data verified

---

## 📚 Additional Resources

- **LAMBDA_FORWARDING_SETUP.md** - Detailed Lambda setup with ngrok
- **ARCHITECTURE_CHANGE_SUMMARY.md** - Architecture explanation
- **HTML_INTERFACE_SETUP.md** - HTML interface documentation
- **DEPLOYMENT_SUCCESS.md** - AWS deployment results
- **AWS_DEPLOYMENT_GUIDE.md** - AWS configuration guide

---

**Ready to use! Start with just `node server.js` for the tutorial interface! 🎉**
