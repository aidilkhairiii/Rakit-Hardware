# 🔄 Lambda → Server.js Forwarding Setup

## New Architecture

**Lambda functions now FORWARD data to server.js instead of writing directly to MongoDB!**

```
┌─────────────────────┐
│  Android Devices    │
│  (Global Access)    │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │ AWS Lambda   │ ← API Gateway receives data
    │  (Forward)   │ ← Forwards to server.js
    └──────┬───────┘
           │
           ↓ HTTP POST
    ┌──────────────┐
    │  server.js   │ ← Processes data
    │  (Your Mac   │ ← Writes to MongoDB
    │   or Cloud)  │ ← Provides /api/latest
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  MongoDB     │
    │   Atlas      │
    └──────────────┘
```

**Benefits:**
- ✅ Single source of truth (server.js handles ALL logic)
- ✅ HTML interface works normally
- ✅ Tutorial flow works with real-time updates
- ✅ Android devices can connect from anywhere
- ✅ All data processing logic stays in server.js

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Install Axios**

```bash
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware
npm install axios
```

### **Step 2: Expose server.js to Internet (Using ngrok)**

```bash
# Install ngrok (if not installed)
brew install ngrok

# Or download from: https://ngrok.com/download

# Start server.js on port 3000
node server.js

# In a NEW terminal, expose it:
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the `https://abc123.ngrok.io` URL!**

### **Step 3: Deploy Lambda with ngrok URL**

```bash
# Set the SERVER_URL environment variable
export SERVER_URL=https://abc123.ngrok.io

# Deploy to AWS
npm run deploy:dev
```

---

## 📋 Complete Step-by-Step Guide

### **1️⃣ Prepare Local Environment**

```bash
# Navigate to project
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware

# Install dependencies (includes axios now)
npm install

# Verify server.js works
node server.js
```

You should see:
```
✅ Server running on http://localhost:3000
✅ MongoDB connected
```

### **2️⃣ Install and Setup ngrok**

**Option A: Homebrew (Recommended)**
```bash
brew install ngrok
```

**Option B: Direct Download**
1. Visit: https://ngrok.com/download
2. Download and extract ngrok
3. Move to `/usr/local/bin`:
   ```bash
   sudo mv ~/Downloads/ngrok /usr/local/bin/ngrok
   ```

**Sign up for ngrok (Free):**
```bash
# 1. Create account at: https://dashboard.ngrok.com/signup
# 2. Get auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Authenticate:
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### **3️⃣ Start Both Services**

**Terminal 1: Run server.js**
```bash
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware
node server.js
```

**Terminal 2: Start ngrok tunnel**
```bash
ngrok http 3000
```

**ngrok Output:**
```
ngrok                                                           
                                                                
Session Status                online                            
Account                       your-email@example.com            
Version                       3.5.0                             
Region                        United States (us)                
Latency                       20ms                              
Web Interface                 http://127.0.0.1:4040             
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**✅ Copy the Forwarding URL:** `https://abc123.ngrok.io`

### **4️⃣ Deploy Lambda Functions**

```bash
# Terminal 3: Deploy with your ngrok URL
export SERVER_URL=https://abc123.ngrok.io
npm run deploy:dev
```

**Expected Output:**
```
✔ Service deployed to stack rakit-hardware-api-dev (123s)

endpoints:
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/spo2
  POST - https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/temp
```

---

## 🧪 Testing the Setup

### **Test 1: Send Data from Android (via Lambda)**

```bash
# Test BP endpoint
curl -X POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "BP data forwarded to server.js",
  "serverResponse": {
    "success": true
  }
}
```

**Check server.js logs:**
```
🩺 Received BP: Result: 120 / 80, BPM : 72
```

### **Test 2: Check MongoDB**

```bash
# Query MongoDB to verify data was saved
# (Use MongoDB Compass or mongo shell)
```

### **Test 3: HTML Interface**

```bash
# Open browser:
http://localhost:3000

# Test buttons - data should appear in real-time
```

---

## 🔧 Configuration Details

### **Lambda Environment Variables (serverless.yml)**

```yaml
provider:
  environment:
    SERVER_URL: ${env:SERVER_URL, 'http://localhost:3000'}
```

**This reads from:**
1. `export SERVER_URL=https://abc123.ngrok.io` (highest priority)
2. Falls back to `http://localhost:3000` if not set

### **server.js Configuration**

```javascript
// In server.js - no changes needed!
// Already configured to receive data on:
// - POST /api/data (BP)
// - POST /api/spo2 (SpO₂)
// - POST /api/temp (Temperature)
// - GET /api/latest (Real-time updates)
```

**Current Port:** `3000` (change in server.js if needed)

---

## 🌐 Production Deployment Options

### **Option 1: ngrok (Development/Testing)**

**Pros:**
- ✅ Free tier available
- ✅ Instant setup (1 command)
- ✅ HTTPS included
- ✅ Perfect for testing

**Cons:**
- ❌ URL changes on restart (paid plan fixes this)
- ❌ Not recommended for production
- ❌ 40 connections/minute limit (free tier)

**Cost:** Free (or $8/month for static domain)

### **Option 2: Deploy server.js to Cloud**

**A. AWS EC2 / Lightsail**
```bash
# 1. Create EC2 instance
# 2. Install Node.js
# 3. Upload server.js
# 4. Run: node server.js
# 5. Use public IP: http://12.34.56.78:3000
```

**B. Heroku (Easiest)**
```bash
# 1. Create Heroku app
# 2. Push code: git push heroku main
# 3. URL: https://your-app.herokuapp.com
```

**C. Railway / Render / Fly.io**
- Similar to Heroku
- Free tiers available
- Auto-deployment from GitHub

### **Option 3: Serverless Container (Advanced)**

Deploy server.js as AWS Lambda + API Gateway (same as current Lambda functions but with Express)

---

## 📊 Data Flow Visualization

### **Request Journey:**

```
1. Android App
   POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data
   Body: {"value":"Result: 120 / 80, BPM : 72"}
   
   ↓
   
2. AWS Lambda (bp-handler.js)
   console.log("🩺 Lambda received BP:", latestBP);
   console.log("📤 Forwarding to server.js...");
   
   ↓
   
3. HTTP POST via axios
   POST https://abc123.ngrok.io/api/data
   Body: {"value":"Result: 120 / 80, BPM : 72"}
   
   ↓
   
4. ngrok Tunnel
   Forwards to: http://localhost:3000/api/data
   
   ↓
   
5. server.js (Your Mac)
   app.post("/api/data", async (req, res) => {
     console.log("🩺 Received BP:", req.body.value);
     // Parse data
     // Save to MongoDB
     res.json({ success: true });
   });
   
   ↓
   
6. MongoDB Atlas
   Data saved to `parameters` collection
```

---

## 🆘 Troubleshooting

### **Problem: Lambda can't reach server.js**

**Error:**
```json
{
  "success": true,
  "message": "Lambda received data (server.js may be offline)",
  "warning": "connect ECONNREFUSED"
}
```

**Solutions:**

1. **Check server.js is running:**
   ```bash
   curl http://localhost:3000/api/latest
   ```

2. **Check ngrok is running:**
   ```bash
   curl https://abc123.ngrok.io/api/latest
   ```

3. **Verify SERVER_URL in AWS:**
   ```bash
   serverless info --verbose
   # Check environment variables
   ```

4. **Re-deploy with correct URL:**
   ```bash
   export SERVER_URL=https://abc123.ngrok.io
   npm run deploy:dev
   ```

### **Problem: ngrok URL expired**

**Symptoms:** Lambda can't connect after restarting ngrok

**Solution:**
```bash
# 1. Restart ngrok
ngrok http 3000

# 2. Get NEW URL
# Copy from ngrok output

# 3. Re-deploy Lambda
export SERVER_URL=https://NEW_URL.ngrok.io
npm run deploy:dev
```

**Fix for production:** Upgrade to ngrok paid plan ($8/month) for static domain

### **Problem: Data not saving to MongoDB**

**Check:**

1. **server.js logs:**
   ```bash
   # Should see:
   🩺 Received BP: Result: 120 / 80, BPM : 72
   ✅ Updated BP & SpO₂ for session abc123
   ```

2. **MongoDB connection:**
   ```bash
   # server.js should show:
   ✅ MongoDB connected
   ```

3. **Environment variables:**
   ```bash
   # Check .env file has:
   MONGO_URI=mongodb+srv://user:7766Aidil@rakit.jf0s9dt.mongodb.net/...
   ```

### **Problem: HTML interface not working**

**This setup is PERFECT for HTML interface!**

```bash
# 1. Make sure server.js is running:
node server.js

# 2. Open browser:
http://localhost:3000

# 3. Test buttons - should work normally
# Real-time updates work because /api/latest is in server.js
```

---

## 📱 Android App Configuration

**No changes needed!** Android still uses AWS API Gateway:

```kotlin
private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
```

**Flow:**
```
Android → AWS Lambda → ngrok → server.js → MongoDB
```

---

## 💰 Cost Estimate

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| **AWS Lambda** | 1M requests/month | ~$0.20/million |
| **AWS API Gateway** | 1M requests/month | Free tier |
| **ngrok (Free)** | 1 tunnel, 40 conn/min | $0 |
| **ngrok (Paid)** | Static domain | $8/month |
| **MongoDB Atlas** | 512MB storage | $0 |
| **Total (Free)** | - | **$0/month** |
| **Total (Prod)** | - | **$8-10/month** |

---

## 🎯 Next Steps

### **Development (Now):**

1. ✅ Keep server.js running locally
2. ✅ Use ngrok for public URL
3. ✅ Deploy Lambda to forward data
4. ✅ Test HTML interface
5. ✅ Test Android app

### **Production (Later):**

1. 🚀 Deploy server.js to cloud service (Heroku/Railway)
2. 🚀 Update `SERVER_URL` in serverless.yml
3. 🚀 Re-deploy Lambda functions
4. 🚀 Test from production

---

## 🔍 Monitoring

### **Watch Lambda Logs:**

```bash
# Real-time Lambda logs
serverless logs -f bpHandler --tail

# You should see:
# 🩺 Lambda received BP: Result: 120 / 80, BPM : 72
# 📤 Forwarding to server.js: https://abc123.ngrok.io/api/data
# ✅ Server.js response: { success: true }
```

### **Watch server.js Logs:**

```bash
# Terminal where server.js is running shows:
🩺 Received BP: Result: 120 / 80, BPM : 72
✅ Updated BP & SpO₂ for session abc123
```

### **ngrok Web Dashboard:**

Open: http://127.0.0.1:4040

**Shows:**
- All HTTP requests
- Request/response bodies
- Timing information
- Perfect for debugging!

---

## ✅ Verification Checklist

- [ ] `npm install axios` completed
- [ ] ngrok installed and authenticated
- [ ] server.js running on port 3000
- [ ] ngrok tunnel active (`ngrok http 3000`)
- [ ] `SERVER_URL` environment variable set
- [ ] Lambda functions deployed (`npm run deploy:dev`)
- [ ] Test curl request successful
- [ ] server.js receives data (check logs)
- [ ] MongoDB shows new data
- [ ] HTML interface works
- [ ] Android app connects successfully

---

**You're all set! Lambda now forwards to server.js, giving you the best of both worlds!** 🎉
