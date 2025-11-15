# 🎯 Architecture Changed: Lambda → server.js Forwarding

## What Changed

**Before:** Lambda wrote directly to MongoDB  
**Now:** Lambda forwards data to server.js, server.js writes to MongoDB

---

## 📊 New Architecture

```
Android Device
    ↓ POST data
AWS Lambda (API Gateway)
    ↓ Forward via axios
ngrok Tunnel (https://abc123.ngrok.io)
    ↓ Forward to localhost
server.js (Your Mac - Port 3000)
    ↓ Process & Save
MongoDB Atlas
```

---

## ✅ What You Need to Do

### **1. Install axios (Already Done!)**

```bash
npm install axios  # ✅ Completed
```

### **2. Expose server.js to Internet**

**Option A: Using ngrok (Recommended for Testing)**

```bash
# Terminal 1: Start server
node server.js

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the URL shown:
# https://abc123.ngrok.io
```

**Option B: Deploy to Cloud (For Production)**
- Heroku: `git push heroku main`
- Railway: Connect GitHub repo
- AWS EC2: Upload and run `node server.js`

### **3. Deploy Lambda with SERVER_URL**

```bash
# Set your ngrok/cloud URL
export SERVER_URL=https://abc123.ngrok.io

# Deploy
npm run deploy:dev
```

---

## 🚀 Quick Start Commands

```bash
# 1. Start server.js
node server.js

# 2. In NEW terminal, install ngrok:
brew install ngrok

# 3. Create free account and authenticate:
# Visit: https://dashboard.ngrok.com/signup
ngrok config add-authtoken YOUR_TOKEN

# 4. Start tunnel:
ngrok http 3000

# 5. Copy URL (e.g., https://abc123.ngrok.io)

# 6. In NEW terminal, deploy:
export SERVER_URL=https://abc123.ngrok.io
npm run deploy:dev
```

---

## 📱 Testing

### **Test Lambda → server.js:**

```bash
curl -X POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'
```

**Check server.js logs - you should see:**
```
🩺 Received BP: Result: 120 / 80, BPM : 72
```

### **Test HTML Interface:**

```bash
# Just open browser:
http://localhost:3000

# Everything works normally!
```

---

## 📂 Files Modified

1. **lambda/bp-handler.js** - Now uses axios to forward to server.js
2. **lambda/spo2-handler.js** - Now uses axios to forward to server.js
3. **lambda/temp-handler.js** - Now uses axios to forward to server.js
4. **serverless.yml** - Updated to use SERVER_URL instead of MONGO_URI
5. **package.json** - Added axios dependency

**Files Unchanged:**
- ✅ server.js - No changes needed!
- ✅ public/index.html - Works the same!
- ✅ Android code - Same AWS URLs!

---

## 🎯 Benefits of New Architecture

1. **✅ Single Source of Truth**
   - All database logic stays in server.js
   - No duplicate code between Lambda and server.js

2. **✅ HTML Interface Works Perfectly**
   - Real-time updates via `/api/latest`
   - Tutorial flow works as expected
   - No configuration needed

3. **✅ Android Global Access**
   - Android devices connect via AWS Lambda
   - Lambda forwards to your server.js
   - Works from anywhere in the world

4. **✅ Easy Debugging**
   - All logs in one place (server.js)
   - ngrok dashboard shows all requests
   - Simple to troubleshoot

5. **✅ Flexible Deployment**
   - Can use ngrok for testing
   - Deploy server.js to cloud for production
   - Lambda stays the same

---

## 🔧 Configuration

### **Environment Variables**

**In serverless.yml:**
```yaml
environment:
  SERVER_URL: ${env:SERVER_URL, 'http://localhost:3000'}
```

**When deploying:**
```bash
export SERVER_URL=https://your-public-url.com
npm run deploy:dev
```

**Lambda will forward to:** Whatever URL you set in `SERVER_URL`

---

## 🆘 Troubleshooting

### **Lambda shows: "server.js may be offline"**

1. Check server.js is running: `curl http://localhost:3000/api/latest`
2. Check ngrok is running: `curl https://abc123.ngrok.io/api/latest`
3. Verify SERVER_URL: `serverless info --verbose`
4. Re-deploy: `export SERVER_URL=https://NEW_URL.ngrok.io && npm run deploy:dev`

### **ngrok URL changed after restart**

```bash
# Get new URL from ngrok
ngrok http 3000

# Re-deploy with new URL
export SERVER_URL=https://NEW_URL.ngrok.io
npm run deploy:dev
```

**Fix:** Use ngrok paid plan ($8/month) for static domain

### **HTML interface not working**

**It should work perfectly!** server.js is running locally.

```bash
node server.js
# Open: http://localhost:3000
```

---

## 📊 Comparison

| Feature | Old (Lambda→MongoDB) | New (Lambda→server.js) |
|---------|---------------------|------------------------|
| **Database Write** | Lambda directly | server.js only |
| **HTML Interface** | Needed workarounds | Works perfectly |
| **Real-time Updates** | Not available | ✅ Available |
| **Code Duplication** | Yes (Lambda + server.js) | No (server.js only) |
| **Debugging** | Multiple places | One place |
| **Deployment** | Simple | Requires public URL |

---

## 💰 Costs

| Service | Cost |
|---------|------|
| AWS Lambda | ~$0 (Free tier: 1M requests) |
| AWS API Gateway | ~$0 (Free tier) |
| MongoDB Atlas | $0 (Free tier: 512MB) |
| ngrok Free | $0 (40 connections/min) |
| ngrok Paid | $8/month (static domain) |
| **Total** | **$0-8/month** |

---

## 📖 Full Documentation

- **LAMBDA_FORWARDING_SETUP.md** - Complete setup guide with ngrok
- **HTML_INTERFACE_SETUP.md** - HTML interface configuration
- **DEPLOYMENT_SUCCESS.md** - Previous deployment info
- **AWS_DEPLOYMENT_GUIDE.md** - AWS setup instructions

---

## ✅ Next Steps

1. **Test Locally:**
   ```bash
   node server.js
   # Test HTML: http://localhost:3000
   ```

2. **Setup ngrok:**
   ```bash
   brew install ngrok
   ngrok http 3000
   ```

3. **Deploy Lambda:**
   ```bash
   export SERVER_URL=https://your-ngrok-url.ngrok.io
   npm run deploy:dev
   ```

4. **Test Android:**
   - Android still uses: `https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/`
   - Data flows: Android → Lambda → ngrok → server.js → MongoDB

---

**Perfect architecture! Lambda acts as a global gateway, server.js handles all logic! 🎉**
